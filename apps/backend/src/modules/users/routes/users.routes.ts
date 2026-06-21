import { type NextFunction, type Request, type Response, Router } from "express";
import { getPool } from "../../../db/pool";
import { UserRepository } from "../repositories/users.repository";
import { UserService } from "../services/users.service";

const repository = new UserRepository(getPool());
const service = new UserService(repository);

export const userRoutes = Router();

userRoutes.post("/", async (req: Request, res: Response, next: NextFunction) => {
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

userRoutes.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getAll();
    if (result.isFailure) {
      res.status(result.error.statusCode).json(result.error.toJSON());
      return;
    }
    res.json({ data: result.value.map((u) => u.toJSON()) });
  } catch (err) {
    next(err);
  }
});

userRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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

userRoutes.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
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

userRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
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
