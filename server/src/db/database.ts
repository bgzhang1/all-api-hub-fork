import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DB_PATH || path.join(__dirname, "../../data/app.db")

// Ensure data directory exists
import fs from "fs"
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL")

// Initialize database schema
export async function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      site_url TEXT NOT NULL,
      site_type TEXT NOT NULL,
      access_token TEXT,
      cookies TEXT,
      quota REAL,
      used REAL,
      income REAL,
      recharge_ratio REAL,
      health_status TEXT,
      last_refresh_at INTEGER,
      auto_refresh_enabled INTEGER DEFAULT 1,
      tags TEXT,
      data TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS account_tokens (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key TEXT NOT NULL,
      status TEXT,
      quota REAL,
      used REAL,
      data TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INTEGER PRIMARY KEY,
      language TEXT,
      theme TEXT,
      auto_refresh_interval INTEGER,
      auto_refresh_enabled INTEGER,
      preferences_data TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS usage_history (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      account_id TEXT NOT NULL,
      token_id TEXT,
      model TEXT,
      request_time INTEGER NOT NULL,
      tokens_used INTEGER,
      cost REAL,
      latency INTEGER,
      data TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_account_tokens_account_id ON account_tokens(account_id);
    CREATE INDEX IF NOT EXISTS idx_usage_history_user_id ON usage_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_history_account_id ON usage_history(account_id);
    CREATE INDEX IF NOT EXISTS idx_usage_history_request_time ON usage_history(request_time);
  `)

  // Create default admin user if no users exist
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number
  }
  if (userCount.count === 0) {
    const bcrypt = await import("bcryptjs")
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123"
    const passwordHash = await bcrypt.hash(defaultPassword, 10)
    const now = Date.now()

    db.prepare(
      `INSERT INTO users (username, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?)`,
    ).run("admin", passwordHash, now, now)

    console.log(
      "Created default admin user. Username: admin, Password:",
      defaultPassword,
    )
  }
}

export default db
