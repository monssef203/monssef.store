/**
 * Custom error classes for the API
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with id "${identifier}" not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class OutOfStockError extends AppError {
  constructor(productName: string, requested: number, available: number) {
    super(
      `${productName}: requested ${requested}, only ${available} available`,
      409,
      "OUT_OF_STOCK"
    );
    this.name = "OutOfStockError";
  }
}

export class PaymentRequiredError extends AppError {
  constructor(message = "Payment required") {
    super(message, 402, "PAYMENT_REQUIRED");
    this.name = "PaymentRequiredError";
  }
}
