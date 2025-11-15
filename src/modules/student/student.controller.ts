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
import { StudentService } from './student.service';
import {
  CreateStudentDto,
} from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { Payload } from 'src/commons/decorators/payload.decorator';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { PageOptionsDto } from 'src/commons/dto/page-option.dto';
import { PermissionGuard } from 'src/commons/guards/permission.guard';
import { SetRole } from 'src/commons/decorators/role.decorator';
import { RoleEnum } from 'src/commons/enums/role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as ExcelJS from 'exceljs'
import { Response } from 'express';
//TODO implement saas feature to this controller and all of it's dependant
@Controller('student')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  create(
    @Body() createStudentDto: CreateStudentDto,
    @Payload() payload: JwtPayload,
  ) {
    return this.studentService.create(
      +payload.sub,
      createStudentDto,
    );
  }

  @Post('create-batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  createBatch(
    @UploadedFiles() files: Express.Multer.File[],
    @Payload() payload: JwtPayload,
  ) {
    return this.studentService.createBatch(
      +payload.sub,
      files,
    );
  }

  @Get('template')
  async downloadTemplate(@Res() res:Response) {
    // NOTE: ExcelJS import should be added in your module/service, as per your environment.
    // const ExcelJS = require('exceljs'); // Suggested import for runtime environment

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Template Input Siswa");

    worksheet.columns = [
      { header: "Nama", width: 40 },
      { header: "NISN", width: 20 },
      { header: "NIS", width: 8 },
      { header: "Kelas", width: 8 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.protection = { locked: true }; // Lock the header cells
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Template Input Siswa.xlsx"',
      'Content-Length': Buffer.byteLength(buffer),
    });

    return res.end(buffer);
  }

  @Get('list')
  findAll(
    @Query() query: FilterDto,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.studentService.findAll(
      query,
      pageOptionsDto,
    );
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Patch('update/:id')
  @SetRole(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(
      +id,
      updateStudentDto,
    );
  }

  @Delete('delete/:id')
  @SetRole(RoleEnum.ADMIN, RoleEnum.SUPERADMIN)
  remove(@Param('id') id: string, @Payload() payload: JwtPayload) {
    return this.studentService.remove(
      id,
      +payload.sub,
    );
  }
}
