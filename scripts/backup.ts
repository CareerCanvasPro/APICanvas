import { BackupService } from '../src/infrastructure/backup/backup.service';

async function runBackup() {
  const backupService = new BackupService();
  
  try {
    console.log('Starting backup of all tables...');
    const backupArns = await backupService.backupAllTables();
    
    console.log('Backup completed successfully:');
    backupArns.forEach((arn, table) => {
      console.log(`${table}: ${arn}`);
    });
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

runBackup();