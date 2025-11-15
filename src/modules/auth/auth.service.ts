import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserLoginDto } from './dto/login-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { Token } from 'src/commons/types/token.type';
import { UserRepository } from 'src/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './jwt-payload.interface';
import { RoleEnum } from 'src/commons/enums/role.enum';
import { EditProfileDto } from './dto/edit-profile.dto';
import { LoggerService } from '../logger/logger.service';
import { UserRegisterDto } from './dto/register-user.dto';
import { LogTypeEnum } from 'src/commons/enums/log-type.enum';
import HashPassword from 'src/commons/utils/hash-password.util';

@Injectable()
export class AuthService {
  async register(req: UserRegisterDto): Promise<Token> {
    // 1. Check if username/email already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: req.username },
        { email: req.email }
      ],
      select: { id: true, username: true, email: true },
    });

    if (existingUser) {
      if (existingUser.username === req.username) {
        throw new BadRequestException('Username already exists.');
      }
      if (existingUser.email === req.email) {
        throw new BadRequestException('Email already exists.');
      }
    }

    // 2. Check if passwords match
    if (req.password !== req.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    // 3. Hash password
    let passwordHash: string;
    try {
      const bcrypt = await import('bcryptjs');
      passwordHash = await bcrypt.hash(req.password, 10);
    } catch (err) {
      throw new InternalServerErrorException('Could not hash password.');
    }

    // 4. Create user entity
    const user = this.userRepository.create({
      name: req.name,
      username: req.username,
      email: req.email,
      password: passwordHash,
      role: req.role ?? RoleEnum.USER,
      isActive: true,
    });

    // 5. Save user to db
    let savedUser: UserEntity;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to register user.');
    }

    // 6. Log registration
    if (this.loggerService) {
      this.loggerService.crateLog({
        userId: savedUser.id,
        type: LogTypeEnum.USER_REGISTER,
        message: `Account registered: username=${savedUser.username}; email=${savedUser.email}`,
        metadata: { userId: savedUser.id },
      });
    }

    // 7. Create token
    const payload: JwtPayload = {
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    };
    const access_token = await this.getToken(savedUser);
    return access_token;
  }
  

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly hashPassword: HashPassword,
  ) {}
  getUser(payload: JwtPayload) {
    if (payload.sub) {
      return this.userRepository.findOne({
        where: { id: payload.sub },
        select: {
          password: false,
          email: true,
          id: true,
          role: true,
          username: true,
          name: true,
        },
      });
    }
    throw new InternalServerErrorException('Internal server error.');
  }

  async init() {
    // Check if a superadmin user already exists
    const superadminExists = await this.userRepository.findOne({
      where: { role: RoleEnum.SUPERADMIN },
      select: { id: true },
    });

    if (superadminExists) {
      console.log('Superadmin user already exists.');
      return;
    }

    // Create the first superadmin user
    const superadminUser = new UserEntity();
    superadminUser.name = process.env.SUPERADMIN_NAME || 'Super Admin';
    superadminUser.username = process.env.SUPERADMIN_USERNAME || 'superadmin';
    superadminUser.email =
      process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
    superadminUser.role = RoleEnum.SUPERADMIN;
    const password = process.env.SUPERADMIN_PASSWORD || 'pranotocoro12';
    superadminUser.password =
      await this.userRepository.generatePassword(password);

    await this.userRepository.saveSuper(superadminUser);

    console.log('Superadmin user created successfully.');
  }

  async login(dto: UserLoginDto): Promise<Token> {
    const { username } = dto;
    try {
      await this.userRepository.findUserByUsername(username);
      const payload = await this.userRepository.validateUser(dto);

      const token = await this.getToken(payload);
      this.loggerService.crateLog({
        type: LogTypeEnum.LOGIN_ATTEMPT_SUCCESS,
        userId: payload.id,
        metadata: { payload, dto },
        message: 'User Login Successfully',
      });
      return token;
    } catch (error) {
      console.log(error);
      this.loggerService.crateLog({
        type: LogTypeEnum.LOGIN_ATTEMPT_FAILED,
        message: 'User Login Failed',
        metadata: { dto, error },
      });
      throw error;
    }
  }

  async getToken(user: UserEntity): Promise<Token> {
    const payload = {
      username: user.username,
      name: user.name,
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.USER_KEY_SECRET,
      expiresIn: Number(process.env.EXPIRY_TOKEN_TIME) || '2h',
    });

    return { access_token: token, role: user.role };
  }
}
