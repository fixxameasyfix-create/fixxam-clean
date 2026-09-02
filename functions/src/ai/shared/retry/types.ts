export interface AIValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AIRetryOptions {
  maxAttempts?: number;
}

export interface AIRetryResult<T> {
  result: T;
  attempts: number;
  validation: AIValidationResult;
}

export interface AIEngineOptions<T> {
  execute: () => Promise<T>;
  validate: (
    result: T,
  ) => AIValidationResult;
  fallback: () => T;
  maxAttempts?: number;
}