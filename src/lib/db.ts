// src/lib/db.ts
import mysql, {
  PoolOptions,
  Pool,
  PoolConnection,
  RowDataPacket,
  OkPacket,
  FieldPacket,
} from 'mysql2/promise';

class Database {
  private pool: Pool;

  constructor() {
    const options: PoolOptions = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    this.pool = mysql.createPool(options);
  }

  async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  /**
   * Execute a query and return the results as an array of the specified type
   * @param sql SQL query to execute
   * @param values Parameters to use in the query
   * @returns Promise containing array of results and field data
   */
  async query<T extends RowDataPacket>(
    sql: string,
    values?: unknown[]
  ): Promise<[T[], FieldPacket[]]> {
    try {
      const [rows, fields] = await this.pool.query<T[]>(sql, values);
      return [rows, fields];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute an insert, update, or delete query
   * @param sql SQL query to execute
   * @param values Parameters to use in the query
   * @returns Result with affectedRows, insertId, etc.
   */
  async execute(
    sql: string,
    values?: unknown[]
  ): Promise<[OkPacket, FieldPacket[]]> {
    try {
      const [result, fields] = await this.pool.execute(sql, values);
      return [result as OkPacket, fields];
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }
}

export const db = new Database();
