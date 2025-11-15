import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { CommonBaseEntity } from './common-base.entity';
import { Exclude } from 'class-transformer';
import { LogTypeEnum } from './../../src/commons/enums/log-type.enum';

@Entity('loggers')
export class LoggerEntity extends CommonBaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public message?: string;

  @Column()
  public date: Date;

  @Column({ type: 'jsonb', nullable: true })
  @Exclude()
  public metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 64 })
  logType: LogTypeEnum | string;

  @ManyToOne(() => UserEntity, (user) => user.logs, { nullable: true })
  public user: UserEntity;
}
