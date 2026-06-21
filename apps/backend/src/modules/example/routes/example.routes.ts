import { Request, Response, NextFunction, Router } from "express";
import { ExampleService } from "../services/example.service";
import { ExampleRepository } from "../repositories/example.repository";
import { getPool } from "../../../db/pool";

const repository = new ExampleRepository(getPool());
const service = new ExampleService(repository);

export const exampleRoutes = Router();

exampleRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.create(req.body);
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.status(201).json({ data: result.value.toJSON() });
  } catch (err) {
    next(err);
  }
});

exampleRoutes.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAll();
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.json({ data: result.value.map((e) => e.toJSON()) });
  } catch (err) {
    next(err);
  }
});

exampleRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getById(req.params.id);
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.json({ data: result.value.toJSON() });
  } catch (err) {
    next(err);
  }
});

exampleRoutes.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.update(req.params.id, req.body);
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.json({ data: result.value.toJSON() });
  } catch (err) {
    next(err);
  }
});

exampleRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.delete(req.params.id);
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
