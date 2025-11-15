import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { Order } from 'src/commons/enums/order.enum';
import { ClassEntity } from 'src/entities/class.entity';
import { StudentEntity } from 'src/entities/student.entity';
import { CreateStudentBatchDto } from 'src/modules/student/dto/create-student.dto';
import { StudentResponse } from 'src/modules/student/dto/student-response.dto';
import { DataSource, In, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';

@Injectable()
export class StudentRepository extends Repository<StudentEntity> {
  findAllStudentSearch(
    query: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<[StudentEntity[], number]> {
    const { search } = query;
    const { page, take, skip } = pageOptionsDto;

    const Qb = this.createQueryBuilder('student')
      .select(['student.id', 'student.name'])
      .where((qb) => {
        if (search) {
          qb.andWhere('LOWER(student.name) LIKE LOWER(:search)', {
            search: `%${search}%`,
          });
        }
      })
      .orderBy('student.name', Order.ASC);
    if (page && take) {
      Qb.skip(skip).take(take);
    }
    return Qb.getManyAndCount();
  }

  async findAllStudent(
    query: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ): Promise<[StudentResponse[], number]> {
    const { search } = query;
    const { take, skip } = pageOptionsDto;

    // Add join to student.school and filter by schoolId
    const countQb = this.createQueryBuilder('student')
      .leftJoin('student.studentClass', 'studentClass')
      .where('student.deleted_at IS NULL')

    if (search) {
      countQb.andWhere('LOWER(student.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    const totalCount = await countQb.getCount();

    const studentIdsSubQuery = this.createQueryBuilder('student')
      .select('student.id', 'student_id')
      .leftJoin('student.studentClass', 'studentClass')
      .where('student.deleted_at IS NULL')

    if (search) {
      studentIdsSubQuery.andWhere('LOWER(student.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    studentIdsSubQuery
      .orderBy('student.id', 'ASC');

    if (
      typeof skip === 'number' &&
      !Number.isNaN(skip) &&
      typeof take === 'number'
    ) {
      studentIdsSubQuery.limit(take).offset(skip);
    }

    const paginatedStudentIds = await studentIdsSubQuery.getRawMany();
    const studentIds = paginatedStudentIds.map((row) => row.student_id);

    if (studentIds.length === 0) {
      return [[], totalCount];
    }

    const dataQb = this.createQueryBuilder('student')
      .leftJoin('student.studentClass', 'studentClass')
      .select([
        'student.id',
        'student.name',
        'student.nationalStudentId',
        'student.schoolStudentId',
        'studentClass.id',
        'studentClass.name',
      ])
      .where('student.id IN (:...studentIds)', { studentIds })
      .addOrderBy('student.id', 'ASC');

    dataQb
      .groupBy('student.id')
      .addGroupBy('student.name')
      .addGroupBy('student.nationalStudentId')
      .addGroupBy('student.schoolStudentId')
      .addGroupBy('studentClass.id')
      .addGroupBy('studentClass.name');

    const rawData = await dataQb.getRawMany();

    const studentMap = new Map<number, StudentResponse>();

    for (const row of rawData) {
      const studentId = row['student_id'];
      if (!studentMap.has(studentId)) {
        const student = new StudentResponse();
        student.id = row['student_id'];
        student.name = row['student_name'];
        student.schoolStudentId = row['student_school_student_id'];
        student.nationalStudentId = row['student_national_student_id'];
        const studentClass = new ClassEntity();
        studentClass.id = row['studentClass_id'];
        studentClass.name = row['studentClass_name'];
        student.studentClass = studentClass;
        studentMap.set(studentId, student);
      }
    }

    const students = Array.from(studentMap.values());

    return [students, totalCount];
  }

  async extractNisn(createStudentDto: CreateStudentBatchDto) {
    const { items } = createStudentDto;
    const nisns: string[] = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      nisns.push(element.nisn);
    }
    const students = await this.find({
      where: { nationalStudentId: In(nisns) },
      select: { id: true, nationalStudentId: true },
    });
    return students;
  }

  async saveStudents(
    userId: number,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    // Only process the first file
    const file = files[0];
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Worksheet not found in Excel file.');
    }

    // Expecting headers: Nama (name), NISN (nationalStudentId), NIS (schoolStudentId), Kelas (studentClass)
    const headerMap: { [key: string]: number } = {};
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      let val = (typeof cell.value === 'string' ? cell.value : (cell.value ? cell.value.toString() : ''));
      val = val.trim().toLowerCase();
      if (val === 'nama') headerMap['name'] = colNumber;
      if (val === 'nisn') headerMap['nationalStudentId'] = colNumber;
      if (val === 'nis') headerMap['schoolStudentId'] = colNumber;
      if (val === 'kelas') headerMap['className'] = colNumber;
    });

    // Minimal check
    if (!headerMap['name'] || !headerMap['nationalStudentId'] || !headerMap['schoolStudentId'] || !headerMap['className']) {
      throw new BadRequestException('Required columns are missing (Nama, NISN, NIS, Kelas)');
    }

    // Extract student data from file
    const extracted: {
      name: string;
      nationalStudentId: string;
      schoolStudentId: string;
      className: string;
    }[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const name = row.getCell(headerMap['name']).value?.toString().trim() ?? '';
      const nationalStudentId = row.getCell(headerMap['nationalStudentId']).value?.toString().trim() ?? '';
      const schoolStudentId = row.getCell(headerMap['schoolStudentId']).value?.toString().trim() ?? '';
      const className = row.getCell(headerMap['className']).value?.toString().trim() ?? '';
      if (name && nationalStudentId && schoolStudentId && className) {
        extracted.push({ name, nationalStudentId, schoolStudentId, className });
      }
    });

    if (extracted.length === 0) {
      throw new BadRequestException("No valid student data found in the file.");
    }

    // Run DB operations in transaction
    const queryRunner = this.datasource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Gather all NISN to check existing
      const nisnList = extracted.map((v) => v.nationalStudentId);
      const existingStudents = await queryRunner.manager.find(StudentEntity, {
        where: { nationalStudentId: In(nisnList) },
        select: ['id', 'nationalStudentId'],
      });

      // Gather unique class names from extracted
      const classNames = Array.from(new Set(extracted.map((e) => e.className)));
      // Find class entities that already exist
      const existingClasses = await queryRunner.manager.find(ClassEntity, {
        where: { name: In(classNames) },
      });

      // Find not existing class names
      const missingClassNames = classNames.filter(
        cName => !existingClasses.find(ec => ec.name === cName)
      );
      // Create new ClassEntities for missing classes
      const newClasses: ClassEntity[] = [];
      for (const cName of missingClassNames) {
        const clz = new ClassEntity();
        clz.name = cName;
        clz.createdBy = userId;
        newClasses.push(clz);
      }
      if (newClasses.length > 0) {
        await queryRunner.manager.save(ClassEntity, newClasses);
        existingClasses.push(...newClasses);
      }

      // For each extracted row, build StudentEntity
      let studentsToSave: StudentEntity[] = [];
      for (const d of extracted) {
        let student = existingStudents.find(es => es.nationalStudentId === d.nationalStudentId);
        if (!student) student = new StudentEntity();
        student.name = d.name;
        student.nationalStudentId = d.nationalStudentId;
        student.schoolStudentId = d.schoolStudentId;
        student.createdBy = userId;
        // Find and set studentClass
        let foundClass = existingClasses.find(clz => clz.name === d.className);
        student.studentClass = foundClass;
        studentsToSave.push(student);
      }

      await queryRunner.manager.save(StudentEntity, studentsToSave);
      await queryRunner.commitTransaction();
      return studentsToSave;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      if (error.response && error.response.statusCode === 400) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  
  async saveStudent(student: StudentEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.manager.save(student);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      if (error.response.statusCode === 400) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
  constructor(private readonly datasource: DataSource) {
    super(StudentEntity, datasource.createEntityManager());
  }
}
