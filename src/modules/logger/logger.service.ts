import { Injectable } from '@nestjs/common';
import { LogTypeEnum } from 'src/commons/enums/log-type.enum';
import { LoggerEntity } from 'src/entities/logger.entity';
import { UserEntity } from 'src/entities/user.entity';
import { LoggerRepository } from 'src/repositories/logger.repository';

@Injectable()
export class LoggerService {
  constructor(private readonly loggerRepository: LoggerRepository) {}

  crateLog({
    type,
    message,
    userId,
    metadata,
  }: {
    type: LogTypeEnum;
    userId?: number;
    message: string;
    metadata?: object;
  }) {
    const logger = new LoggerEntity();
    logger.logType = type;
    logger.date = new Date();
    logger.message = message;
    if (userId) {
      const user = new UserEntity();
      user.id = userId;
      logger.user = user;
    }
    if (metadata) {
      logger.metadata = metadata;
    }
    this.loggerRepository.saveLogger(logger);
  }
}
