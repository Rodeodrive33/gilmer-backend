// src/jobs/backupJob.js
import cron from "node-cron";
import { exec } from "child_process";

/**
 * Start scheduled backups
 * schedule (cron string) default: "0 2 * * *" (02:00 daily)
 */
export function startBackupJob({ schedule = "0 2 * * *" } = {}) {
  cron.schedule(
    schedule,
    () => {
      console.log(`[BackupJob] Running scheduled backup (${schedule})`);
      exec("npm run backup:db", (err, stdout, stderr) => {
        if (err) {
          console.error("[BackupJob] backup failed:", err.message || err);
          return;
        }
        console.log("[BackupJob] backup stdout:", stdout);
        if (stderr) console.warn("[BackupJob] backup stderr:", stderr);
      });
    },
    { timezone: process.env.SCHEDULE_TZ || "Africa/Nairobi" }
  );

  console.log(`[BackupJob] Scheduled backups with cron: ${schedule}`);
}
