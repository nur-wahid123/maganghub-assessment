import { Expose } from 'class-transformer';
import { StudentEntity } from 'src/entities/student.entity';

export class StudentResponse extends StudentEntity {
  @Expose({ name: 'total_points' })
  public totalPoints?: number;
}
