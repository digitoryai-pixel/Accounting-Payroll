import {
  AppError,
  NotFoundError,
  ValidationError,
  PayrollError,
  AccountingError,
  ComplianceError,
  DuplicateError,
  UnauthorizedError,
  ForbiddenError,
} from '../../src/common/errors';

describe('Error classes', () => {
  it('AppError has correct properties', () => {
    const error = new AppError('test error', 400, 'TEST_ERROR');
    expect(error.message).toBe('test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('NotFoundError is 404', () => {
    const error = new NotFoundError('Employee', '123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toContain('123');
  });

  it('ValidationError includes details', () => {
    const error = new ValidationError('Invalid input', { name: ['required'] });
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ name: ['required'] });
  });

  it('PayrollError is 422', () => {
    const error = new PayrollError('Already processed');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('PAYROLL_ERROR');
  });

  it('AccountingError is 422', () => {
    const error = new AccountingError('Unbalanced entry');
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('ACCOUNTING_ERROR');
  });

  it('ComplianceError is 422', () => {
    const error = new ComplianceError('Invalid PAN');
    expect(error.statusCode).toBe(422);
  });

  it('DuplicateError is 409', () => {
    const error = new DuplicateError('Employee', 'code', 'EMP001');
    expect(error.statusCode).toBe(409);
    expect(error.message).toContain('EMP001');
  });

  it('UnauthorizedError is 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
  });

  it('ForbiddenError is 403', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
  });
});
