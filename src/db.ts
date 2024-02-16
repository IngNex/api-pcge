/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'

dotenv.config()

const ENTITIES_DIR = path.join(__dirname, '/**/*.entity{.ts,.js}')

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '0'),
  username: process.env.DB_USERNAME ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? '',
  entities: [ENTITIES_DIR],
  synchronize: true
})

export const AppDataSourceSqlLite = new DataSource({
  type: 'better-sqlite3',
  database: './main.sqlite',
  synchronize: true,
  entities: [ENTITIES_DIR]
})

export default AppDataSourceSqlLite
