export class Result<T, E = Error> {
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null,
    private readonly _isSuccess: boolean,
  ) {}

  static success<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null, true);
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result<never, E>(null, error, false);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess || this._value === null) {
      throw new Error("Cannot get value from a failed result");
    }
    return this._value;
  }

  get error(): E {
    if (this._isSuccess || this._error === null) {
      throw new Error("Cannot get error from a successful result");
    }
    return this._error;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(defaultValue: T): T {
    if (this._isSuccess && this._value !== null) {
      return this._value;
    }
    return defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess && this._value !== null) {
      return Result.success(fn(this._value));
    }
    return Result.failure(this._error as E);
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this._isSuccess && this._value !== null) {
      return onSuccess(this._value);
    }
    return onFailure(this._error as E);
  }
}
