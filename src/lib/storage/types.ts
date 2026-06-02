import type { DatabaseSchema } from '@/lib/db/types';

export interface Storage {
  read(): DatabaseSchema;
  write(data: DatabaseSchema): void;
}
