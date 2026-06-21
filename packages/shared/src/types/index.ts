export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Timestamp = string;

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SortOrder = "asc" | "desc";

export interface SortParams {
  sortBy: string;
  order: SortOrder;
}

export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<Nullable<T>>;
  findAll(params?: PaginationParams & Partial<SortParams>): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
