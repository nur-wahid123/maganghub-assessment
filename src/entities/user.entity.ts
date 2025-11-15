import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { RoleEnum } from './../commons/enums/role.enum';
import { Exclude, Expose } from 'class-transformer';
import { LoggerEntity } from './logger.entity';

@Entity('users')
export class UserEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ type: 'boolean', default: true })
  @Expose({ name: 'is_active' })
  public isActive: boolean = true;

  @Column()
  public name?: string;

  @Column({ unique: true, nullable: false })
  public username?: string;

  @Column({ nullable: false })
  @Exclude()
  public password?: string;

  @Column({ nullable: false, unique: true })
  public email?: string;

  @Column({ type: 'enum', enum: RoleEnum })
  public role?: RoleEnum;

  @OneToMany(() => LoggerEntity, (logger) => logger.user)
  public logs: LoggerEntity[];
}
