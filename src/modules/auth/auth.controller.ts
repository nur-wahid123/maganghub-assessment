import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Token } from 'src/commons/types/token.type';
import { UserLoginDto } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/commons/guards/permission.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from './jwt-payload.interface';
import { UserRegisterDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() req: UserRegisterDto): Promise<Token> {
    return this.authService.register(req);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: UserLoginDto): Promise<Token> {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Payload() payload: JwtPayload) {
    return this.authService.getUser(payload);
  }
}
