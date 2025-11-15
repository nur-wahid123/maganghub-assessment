import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {

  constructor(private readonly datasource: DataSource) {}

  async getData() {
    try {
      // Count number of classes for the given school
      const totalClass = await this.datasource.manager.count('ClassEntity');

      // Count number of students for the given school
      const totalStudent = await this.datasource.manager.count('StudentEntity');

      return {
        totalClass,
        totalStudent,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    }
  }
}
