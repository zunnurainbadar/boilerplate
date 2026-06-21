import type { BaseEntity } from "@ai-boilerplate/shared";

export interface ExampleDTO extends BaseEntity {
  name: string;
  description: string;
}

const BASE_URL = "/api/examples";

export class ExampleApi {
  async getAll(): Promise<ExampleDTO[]> {
    const res = await fetch(BASE_URL);
    if (!res.ok) {
      throw new Error("Failed to fetch examples");
    }
    const json = await res.json();
    return json.data;
  }

  async getById(id: string): Promise<ExampleDTO> {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error("Failed to fetch example");
    }
    const json = await res.json();
    return json.data;
  }

  async create(data: { name: string; description: string }): Promise<ExampleDTO> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to create example");
    }
    const json = await res.json();
    return json.data;
  }

  async update(id: string, data: Partial<{ name: string; description: string }>): Promise<ExampleDTO> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error("Failed to update example");
    }
    const json = await res.json();
    return json.data;
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error("Failed to delete example");
    }
  }
}
