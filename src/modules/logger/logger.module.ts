import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerRepository } from 'src/repositories/logger.repository';
import { LoggerController } from './logger.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [LoggerService, LoggerRepository, JwtService],
  controllers: [LoggerController],
})
export class LoggerModule {}
