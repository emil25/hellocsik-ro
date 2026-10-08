export const BACKUP_TABLES: string[];
export const DATABASE_BACKUP_SQL: string;
export type DatabaseBackup = {
  format: "hellocsik-database-backup";
  version: 1;
  createdAt: string;
  databaseBytes: number;
  tables: Record<string, Record<string, unknown>[]>;
  sequences: Record<string, { last_value: number; is_called: boolean }>;
};
export function validateDatabaseBackup(backup: unknown): DatabaseBackup;
export function assertEmptyDestination(client: { query: Function }): Promise<void>;
export function restoreDatabaseRows(client: { query: Function }, backup: DatabaseBackup): Promise<void>;
