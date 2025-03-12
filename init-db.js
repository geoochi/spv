import sqlite3 from 'sqlite3'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

if (fs.existsSync(process.env.DB_PATH)) {
  fs.rmSync(process.env.DB_PATH)
}

const db = new sqlite3.Database(process.env.DB_PATH)

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  fingerprint PRIMARY KEY NOT NULL,
  hash TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`)

db.close()
