declare module "node-pg-migrate" {
  interface RunMigration {
    name: string;
    path: string;
    timestamp: number;
  }

  interface RunnerOption {
    databaseUrl: string;
    migrationsTable?: string;
    dir: string;
    direction: "up" | "down";
    migrationsSchema?: string;
    count?: number;
  }

  export function runner(options: RunnerOption): Promise<RunMigration[]>;
}
