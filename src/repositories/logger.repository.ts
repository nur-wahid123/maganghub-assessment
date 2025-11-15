import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerEntity } from 'src/entities/logger.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LoggerRepository extends Repository<LoggerEntity> {
  constructor(private readonly datasource: DataSource) {
    super(LoggerEntity, datasource.createEntityManager());
  }

  async saveLogger(logger: LoggerEntity) {
    const qR = this.datasource.createQueryRunner();
    try {
      await qR.connect();
      await qR.startTransaction();
      await qR.manager.save(logger);
      await qR.commitTransaction();
      return logger;
    } catch (error) {
      await qR.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('Internal Server Error');
    } finally {
      await qR.release();
    }
  }
}
