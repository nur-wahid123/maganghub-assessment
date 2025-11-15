import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { RoleEnum } from 'src/commons/enums/role.enum';
import { UserUpdateDto } from './dto/user-update.dto';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { UserCreateDto } from './dto/user-create.dto';
import { PermissionGuard } from 'src/commons/guards/permission.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() filter: FilterDto,
  ) {
    return this.userService.findAll(
      pageOptionsDto,
      filter,
    );
  }

  @Get('logs')
  getLogs(
    @Payload() payload: JwtPayload,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.userService.getLogs(Number(payload.sub), pageOptionsDto);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('edit/:id')
  update(
    @Param('id') id: string,
    @Body() body: UserUpdateDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.userService.update(+id, body, +payload.sub);
  }

  @Post('create')
  create(@Body() body: UserCreateDto, @Payload() payload: JwtPayload) {
    return this.userService.create(
      body,
      +payload.sub,
    );
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.userService.remove(+id, payload.sub);
  }
}
