import "dotenv/config";

import { AppError } from "@ai-boilerplate/shared";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { runMigrations } from "./db/migrate";
import { closePool } from "./db/pool";
import { exampleRoutes } from "./modules/example/routes/example.routes";
import { userRoutes } from "./modules/users/routes/users.routes";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/examples", exampleRoutes);
app.use("/api/users", userRoutes);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
  });
});

async function start(): Promise<void> {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Backend server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

start();

export default app;
