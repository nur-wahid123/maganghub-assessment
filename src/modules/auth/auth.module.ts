import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import HashPassword from 'src/commons/utils/hash-password.util';
import { JwtStrategy } from './jwt.strategy';
import { LoggerService } from '../logger/logger.service';
import { LoggerRepository } from 'src/repositories/logger.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    HashPassword,
    JwtStrategy,
    LoggerService,
    LoggerRepository,
  ],
  imports: [
    JwtModule.register({
      secret: process.env.USER_KEY_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
  ],
})
export class AuthModule {}
