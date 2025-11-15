import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { LogTypeEnum } from 'src/commons/enums/log-type.enum';
import { ClassEntity } from 'src/entities/class.entity';
import { LoggerService } from 'src/modules/logger/logger.service';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ClassRepository extends Repository<ClassEntity> {
  findAll(filter: FilterDto, pageOptionsDto: PageOptionsDto) {
    const { page, skip, take, order } = pageOptionsDto;
    const qB = this.datasource
      .createQueryBuilder(ClassEntity, 'class')
      .leftJoin('class.students', 'students')
      .select([
        'class.id',
        'class.name',
        'students.id',
        'students.schoolStudentId',
        'students.nationalStudentId',
        'students.name',
      ])
      .where((qb) => {
        const { search } = filter;
        if (search) {
          qb.andWhere('(lower(class.name) LIKE lower(:search))', {
            search: `%${search}%`,
          });
        }
      });

    if (page && take) {
      qB.skip(skip).take(take);
    }
    qB.orderBy('class.id', order);
    return qB.getManyAndCount();
  }

  async saveClass(newClass: ClassEntity, type: 'update' | 'delete') {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.save(newClass);
      await queryRunner.commitTransaction();
      switch (type) {
        case 'update':
          this.loggerService.crateLog({
            type: LogTypeEnum.UPDATE_CLASS,
            userId: newClass.createdBy,
            metadata: { newClass },
            message: 'Update Class Success',
          });
          break;
        case 'delete':
          this.loggerService.crateLog({
            type: LogTypeEnum.DELETE_CLASS,
            userId: newClass.createdBy,
            metadata: { newClass },
            message: 'Delete Class Success',
          });
          break;
      }
      return newClass;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }

  constructor(
    private readonly datasource: DataSource,
    private readonly loggerService: LoggerService,
  ) {
    super(ClassEntity, datasource.createEntityManager());
  }

  async saveClassCreate(newClass: ClassEntity) {
    const queryRunner = this.datasource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.manager.save(newClass);
      await queryRunner.commitTransaction();
      this.loggerService.crateLog({
        type: LogTypeEnum.CREATE_CLASS_SUCCESS,
        userId: newClass.createdBy,
        metadata: { newClass },
        message: 'Create Class Success',
      });
      return newClass;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      this.loggerService.crateLog({
        type: LogTypeEnum.CREATE_CLASS_FAILED,
        userId: newClass.createdBy,
        metadata: { newClass },
        message: 'Create Class Failed',
      });
      throw new InternalServerErrorException('internal server error');
    } finally {
      await queryRunner.release();
    }
  }
}
