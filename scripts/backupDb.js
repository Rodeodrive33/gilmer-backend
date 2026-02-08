#!/usr/bin/env node
// src/scripts/backupDb.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const OUT_DIR = process.env.BACKUP_DIR || path.join(__dirname, "../../backups");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const dbUrl = process.env.DATABASE_URL;

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { env: process.env }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

async function fallbackExportCsv() {
  console.log("Fallback: CSV export via psql (if available)...");
  const tables = ["tenant", "unit", "property", "invoice", "payment", "externalTransaction", "notification"];
  for (const table of tables) {
    const out = path.join(OUT_DIR, `${table}-${timestamp}.csv`);
    try {
      const cmd = `psql "${dbUrl}" -c "\\copy ${table} to '${out}' csv header"`;
      await runCmd(cmd);
      console.log(`Exported ${table} -> ${out}`);
    } catch (e) {
      console.warn(`Failed to export ${table} via psql: ${e?.stderr || e?.err?.message || e}`);
    }
  }
}

async function main() {
  try {
    if (!dbUrl) throw new Error("DATABASE_URL not set in .env");
    const dumpFile = path.join(OUT_DIR, `db-backup-${timestamp}.sql`);
    const cmd = `pg_dump "${dbUrl}" -f "${dumpFile}"`;
    console.log("Running:", cmd);
    await runCmd(cmd);
    console.log("✅ Backup saved to:", dumpFile);
    process.exit(0);
  } catch (err) {
    console.warn("pg_dump failed or not available:", err?.err?.message || err);
    console.log("Attempting fallback CSV exports...");
    await fallbackExportCsv();
    console.log("Fallback exports complete.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Backup script error:", e);
  process.exit(1);
});

// npx ts-node scripts/backupDb.ts