const { createClient } = require('@libsql/client');

class JobsRepository {
  constructor() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not configured.');
    }

    this.db = createClient({
      url,
      authToken,
    });

    this.ready = this.initialize();
  }

  async initialize() {
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL
      )
    `);
  }

  async findAll() {
    await this.ready;

    const result = await this.db.execute(
      'SELECT * FROM jobs ORDER BY createdAt DESC, id DESC',
    );

    return result.rows.map((row) => this.normalizeJob(row));
  }

  async create({ title, type }) {
    await this.ready;

    const createdAt = new Date().toISOString();

    const result = await this.db.execute({
      sql: `
        INSERT INTO jobs (title, type, status, createdAt)
        VALUES (?, ?, ?, ?)
      `,
      args: [title, type, 'pending', createdAt],
    });

    return this.findById(Number(result.lastInsertRowid));
  }

  async findById(id) {
    await this.ready;

    const result = await this.db.execute({
      sql: 'SELECT * FROM jobs WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return this.normalizeJob(result.rows[0]);
  }

  async updateStatusIfAllowed(id, currentStatus, nextStatus) {
    await this.ready;

    const result = await this.db.execute({
      sql: `
        UPDATE jobs
        SET status = ?
        WHERE id = ? AND status = ?
      `,
      args: [nextStatus, id, currentStatus],
    });

    if (Number(result.rowsAffected) !== 1) {
      return null;
    }

    return this.findById(id);
  }

  async delete(id) {
    await this.ready;

    const result = await this.db.execute({
      sql: 'DELETE FROM jobs WHERE id = ?',
      args: [id],
    });

    return Number(result.rowsAffected) === 1;
  }

  normalizeJob(row) {
    return {
      id: Number(row.id),
      title: String(row.title),
      type: String(row.type),
      status: String(row.status),
      createdAt: String(row.createdAt),
    };
  }
}

module.exports = { JobsRepository };
