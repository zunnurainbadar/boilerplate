import { Result, AppError, NotFoundError, ValidationError } from "@ai-boilerplate/shared";
import { Example } from "../models/example.model";
import { ExampleRepository } from "../repositories/example.repository";

export class ExampleService {
  constructor(private readonly repository: ExampleRepository) {}

  async create(data: { name: string; description: string }): Promise<Result<Example, AppError>> {
    if (!data.name?.trim()) {
      return Result.failure(new ValidationError("Name is required"));
    }
    if (!data.description?.trim()) {
      return Result.failure(new ValidationError("Description is required"));
    }

    const example = Example.create({
      name: data.name.trim(),
      description: data.description.trim(),
    });

    const saved = await this.repository.save(example);
    return Result.success(saved);
  }

  async getById(id: string): Promise<Result<Example, AppError>> {
    const example = await this.repository.findById(id);
    if (!example) {
      return Result.failure(new NotFoundError("Example", id));
    }
    return Result.success(example);
  }

  async getAll(): Promise<Result<Example[], AppError>> {
    const examples = await this.repository.findAll();
    return Result.success(examples);
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Result<Example, AppError>> {
    const exampleResult = await this.getById(id);
    if (exampleResult.isFailure) {
      return Result.failure(exampleResult.error);
    }

    const example = exampleResult.value;

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return Result.failure(new ValidationError("Name cannot be empty"));
      }
      example.updateName(data.name.trim());
    }

    if (data.description !== undefined) {
      if (!data.description.trim()) {
        return Result.failure(new ValidationError("Description cannot be empty"));
      }
      example.updateDescription(data.description.trim());
    }

    const saved = await this.repository.save(example);
    return Result.success(saved);
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    return this.repository.delete(id);
  }
}
