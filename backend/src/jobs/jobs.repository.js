const Database = require('better-sqlite3');
const path = require('path');

class JobsRepository {
  constructor() {
    const databasePath = path.join(__dirname, '../../data/jobs.sqlite');
    this.db = new Database(databasePath);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL
      );
    `);
  }

  findAll() {
    return this.db.prepare('SELECT * FROM jobs ORDER BY createdAt DESC, id DESC').all();
  }

  create({ title, type }) {
    const createdAt = new Date().toISOString();
    const result = this.db
      .prepare('INSERT INTO jobs (title, type, status, createdAt) VALUES (?, ?, ?, ?)')
      .run(title, type, 'pending', createdAt);

    return this.findById(Number(result.lastInsertRowid));
  }

  findById(id) {
    return this.db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  }

  updateStatusIfAllowed(id, currentStatus, nextStatus) {
    const result = this.db
      .prepare('UPDATE jobs SET status = ? WHERE id = ? AND status = ?')
      .run(nextStatus, id, currentStatus);

    return result.changes === 1 ? this.findById(id) : null;
  }

  delete(id) {
    return this.db.prepare('DELETE FROM jobs WHERE id = ?').run(id).changes === 1;
  }
}

module.exports = { JobsRepository };
