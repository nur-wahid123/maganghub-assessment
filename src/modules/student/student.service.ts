import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateStudentDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity } from 'src/entities/student.entity';
import { StudentRepository } from 'src/repositories/student.repository';
import { ClassEntity } from 'src/entities/class.entity';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';
import { instanceToPlain } from 'class-transformer';
import { LoggerService } from '../logger/logger.service';
import { LogTypeEnum } from 'src/commons/enums/log-type.enum';

@Injectable()
export class StudentService {

  async findAll(query: FilterDto, pageOptionsDto: PageOptionsDto) {
    const [data, itemCount] = await this.studentRepository.findAllStudent(
      query,
      pageOptionsDto,
    );

    const meta = new PageMetaDto({ pageOptionsDto, itemCount });

    const pageDto = new PageDto(data, meta);
    const transformed = instanceToPlain(pageDto);
    return transformed;
  }

  async createBatch(userId: number, files: Express.Multer.File[]) {
    this.studentRepository.saveStudents(userId, files);
    return 'processed' 
  }

  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly loggerService: LoggerService,
  ) {}

  async create(userId: number, createStudentDto: CreateStudentDto) {
    const { className, name, nis, nisn } = createStudentDto;
    let student: StudentEntity = await this.studentRepository.findOne({
      where: { nationalStudentId: nisn },
    });
    if (!student) {
      student = new StudentEntity();
    }
    const classEntity = await this.studentRepository.manager.findOne(
      ClassEntity,
      { where: { name: className } },
    );
    if (!classEntity) {
      throw new NotFoundException('class not found');
    }
    student.studentClass = classEntity;
    student.createdBy = userId;
    student.name = name;
    student.nationalStudentId = nisn;
    student.schoolStudentId = nis;
    this.loggerService.crateLog({
      type: LogTypeEnum.CREATE_STUDENT_SUCCESS,
      userId,
      metadata: { createStudentDto },
      message: 'Student Create',
    });
    await this.studentRepository.saveStudent(student);
    return student;
  }

  async findOne(id: string) {
    const data = await this.studentRepository.findOne({
      where: { nationalStudentId: id },
      relations: {
        studentClass: true,
      },
      select: {
        id: true,
        name: true,
        studentClass: {
          id: true,
          name: true,
        },
        nationalStudentId: true,
        schoolStudentId: true,
      },
    });
    if (!data) {
      throw new NotFoundException('student not found');
    }
    const transformed = instanceToPlain(data);
    return transformed;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentRepository.findOne({
      where: { id: id, },
      relations: { studentClass: true },
    });
    if (!student) {
      throw new NotFoundException('student not found');
    }

    if (updateStudentDto.name !== undefined) {
      student.name = updateStudentDto.name;
    }
    if (updateStudentDto.nis !== undefined) {
      student.schoolStudentId = updateStudentDto.nis;
    }
    if (updateStudentDto.nisn !== undefined) {
      student.nationalStudentId = updateStudentDto.nisn;
    }
    if (updateStudentDto.className !== undefined) {
      const classEntity = await this.studentRepository.manager.findOne(
        ClassEntity,
        {
          where: { name: updateStudentDto.className },
        },
      );
      if (!classEntity) {
        throw new NotFoundException('class not found');
      }
      student.studentClass = classEntity;
    }
    await this.studentRepository.saveStudent(student);
    return student;
  }

  async remove(id: string, userId: number) {
    const data = await this.studentRepository.findOne({
      where: { nationalStudentId: id },
      relations: { studentClass: true },
      select: {
        id: true,
        deletedBy: true,
        deletedAt: true,
        studentClass: {
          id: true,
        },
      },
    });
    if (!data) {
      throw new NotFoundException('student not found');
    }
    // Prevent deletion if student has violations
    data.deletedAt = new Date();
    data.deletedBy = userId;

    this.loggerService.crateLog({
      type: LogTypeEnum.DELETE_STUDENT,
      userId,
      metadata: { id },
      message: 'Student Delete',
    });
    return this.studentRepository.saveStudent(data);
  }
}
