export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class DuplicateError extends AppError {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} '${value}' already exists`, 409, 'DUPLICATE');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class PayrollError extends AppError {
  constructor(message: string) {
    super(message, 422, 'PAYROLL_ERROR');
  }
}

export class AccountingError extends AppError {
  constructor(message: string) {
    super(message, 422, 'ACCOUNTING_ERROR');
  }
}

export class ComplianceError extends AppError {
  constructor(message: string) {
    super(message, 422, 'COMPLIANCE_ERROR');
  }
}

export class IntegrationError extends AppError {
  constructor(service: string, message: string) {
    super(`Integration error with ${service}: ${message}`, 502, 'INTEGRATION_ERROR');
  }
}
