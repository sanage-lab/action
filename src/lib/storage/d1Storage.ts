import type { DatabaseSchema } from '@/lib/db/types';
import type { Storage } from './types';

/**
 * Placeholder for Cloudflare D1. Implement when deploying to Workers.
 * Until then, use JsonFileStorage via getStorage().
 */
export class D1Storage implements Storage {
  read(): DatabaseSchema {
    throw new Error('D1Storage is not configured. Use JsonFileStorage for local development.');
  }

  write(_data: DatabaseSchema): void {
    throw new Error('D1Storage is not configured. Use JsonFileStorage for local development.');
  }
}
