import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const dbPath = path.join(__dirname, "../data/users.db");

const dataDir = path.dirname(dbPath);  //ensures the database is avalible
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);  //open the database

//creates database if it doesnt exist
db.prepare(`  
  CREATE TABLE IF NOT EXISTS users (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT,
    points INTEGER DEFAULT 0
  )
`).run();

export default db;