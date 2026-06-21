import type { BaseEntity, Timestamp } from "@ai-boilerplate/shared";

export interface ExampleProps {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class Example implements BaseEntity {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  private constructor(props: ExampleProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<ExampleProps, "id" | "createdAt" | "updatedAt">): Example {
    const now = new Date().toISOString();
    return new Example({
      id: crypto.randomUUID(),
      name: props.name,
      description: props.description,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ExampleProps): Example {
    return new Example(props);
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date().toISOString();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): ExampleProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
