import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',

  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // url: process.env.DB_URL

  synchronize: process.env.NODE_ENV === 'development',
}));
