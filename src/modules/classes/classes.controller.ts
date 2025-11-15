import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PermissionGuard } from 'src/commons/guards/permission.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Controller('classes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  //TODO: add saas functionality
  @Post('create')
  create(
    @Body() createClassDto: CreateClassDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.classesService.create(+payload.sub, createClassDto);
  }

  @Get('list')
  findAll(@Query() query: FilterDto, @Query() pageOptionsDto: PageOptionsDto) {
    return this.classesService.findAll(query, pageOptionsDto);
  }

  @Get('template')
async downloadTemplate(@Res() res: Response) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template Input Kelas');

  worksheet.columns = [{ header: 'Nama', width: 40 }];
  worksheet.getRow(1).eachCell((cell) => {
    cell.protection = { locked: true };
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="Template Input Kelas.xlsx"'
  );

  // Write directly to stream -> No buffer -> No double headers
  await workbook.xlsx.write(res);
  res.end();
}
    

  @Post('create-batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  createBatch(
    @UploadedFiles() files: Express.Multer.File[],
    @Payload() payload: JwtPayload,
  ) {
    this.classesService.createBatch(Number(+payload.sub), files);
    return 'processed' 
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.classesService.update(+id, updateClassDto, +payload.sub);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.classesService.remove(+id, +payload.sub);
  }
}
