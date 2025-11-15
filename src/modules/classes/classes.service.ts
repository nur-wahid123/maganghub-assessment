import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassRepository } from 'src/repositories/classes.repository';
import { ClassEntity } from 'src/entities/class.entity';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PageMetaDto } from 'src/commons/dto/page-meta.dto';
import { PageDto } from 'src/commons/dto/page.dto';
import { instanceToPlain } from 'class-transformer';
import * as ExcelJS from 'exceljs'

@Injectable()
export class ClassesService {
  async createBatch(userId: number, files: Express.Multer.File[]) {
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }

    const file = files[0];

    const workbook = new ExcelJS.Workbook();
    const buffer = file.buffer as unknown as ArrayBuffer;
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('Worksheet not found in Excel file.');
    }

    const classEntities: ClassEntity[] = [];

    worksheet.eachRow((row, rowNumber) => {
      // Skip the header row
      if (rowNumber === 1) return;

      const nameCell = row.getCell(1)?.value;
      if (typeof nameCell === 'string' && nameCell.trim() !== '') {
        const classEntity = new ClassEntity();
        classEntity.name = nameCell.trim();
        classEntity.createdBy = userId;
        classEntities.push(classEntity);
      }
    });

    if (classEntities.length === 0) {
      throw new BadRequestException('No valid class names found in the file.');
    }

    const results = [];
    for (const classEntity of classEntities) {
      // Save class in repository, skip if duplicate
      const exists = await this.classRepository.findOne({
        where: { name: classEntity.name }
      });
      if (!exists) {
        const saved = await this.classRepository.saveClassCreate(classEntity);
        results.push(saved);
      }
    }

    return results;
  }

  async findAll(
    query: FilterDto,
    pageOptionsDto: PageOptionsDto,
  ) {
    const [data, itemCount] = await this.classRepository.findAll(
      query,
      pageOptionsDto,
    );
    const meta = new PageMetaDto({ pageOptionsDto, itemCount });
    const pagedto = new PageDto(data, meta);
    const transformed = instanceToPlain(pagedto);
    return transformed;
  }

  async create(
    userId: number,
    createClassDto: CreateClassDto,
  ) {
    const { name } = createClassDto;
    const classes = await this.classRepository.findOne({
      where: { name },
    });
    if (classes) {
      throw new BadRequestException(['the class already exists']);
    }
    const newClass = new ClassEntity();
    newClass.name = name;
    newClass.createdBy = userId;
    await this.classRepository.saveClassCreate(newClass);
    return newClass;
  }

  constructor(
    private readonly classRepository: ClassRepository,
  ) {}

  async findOne(id: number) {
    const data = await this.classRepository.findOne({
      where: { id },
      relations: { students: true },
      select: {
        id: true,
        name: true,
        students: {
          id: true,
        },
      },
    });
    if (!data) {
      throw new NotFoundException('class not found');
    }
    const transformed = instanceToPlain(data);
    return transformed;
  }

  async update(
    id: number,
    updateClassDto: UpdateClassDto,
    userId: number,
  ) {
    const { name } = updateClassDto;
    const newDt = new ClassEntity();
    newDt.id = id;
    newDt.name = name;
    newDt.updatedBy = userId;
    return this.classRepository.saveClass(newDt, 'update');
  }

  async remove(id: number, userId: number) {
    const newDt = new ClassEntity();
    newDt.id = id;
    newDt.deletedAt = new Date();
    newDt.deletedBy = userId;
    return this.classRepository.saveClass(newDt, 'delete');
  }
}
