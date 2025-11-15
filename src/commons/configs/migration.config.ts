import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';

config({
  path: `${__dirname}/../../../.env`,
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/../../entities/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../../../migration/**/*{.js,.ts}`],
  namingStrategy: new SnakeNamingStrategy(),
});
