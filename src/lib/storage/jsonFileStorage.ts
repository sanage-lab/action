import fs from 'fs';
import path from 'path';
import type { DatabaseSchema } from '@/lib/db/types';
import type { Storage } from './types';

const DB_FILE_PATH = path.join(process.cwd(), 'action-db.json');

export const DEFAULT_SEED_DATA: DatabaseSchema = {
  entities: [],
  tasks: [],
  routines: [],
  history_logs: [],
};

export class JsonFileStorage implements Storage {
  read(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_SEED_DATA, null, 2), 'utf-8');
        return { ...DEFAULT_SEED_DATA };
      }
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    } catch (error) {
      console.error('Failed to read database file, returning empty schema:', error);
      return { ...DEFAULT_SEED_DATA };
    }
  }

  write(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write database file:', error);
      throw error;
    }
  }
}

/** Singleton for app-wide JSON persistence (swap for D1Storage later). */
let storageInstance: Storage | null = null;

export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = new JsonFileStorage();
  }
  return storageInstance;
}
