import 'dotenv/config';

import { DataSource } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { join } from 'path';

const base = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export default new DataSource({
  ...base,
  entities: [Task],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
