import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { NotFoundError, ValidationError, DuplicateError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import {
  Employee,
  EmployeeOutletMapping,
  UUID,
  PaginationParams,
  PaginatedResult,
  EmployeeDepartment,
  EmploymentType,
  PayType,
  AttendanceSource,
} from '../../common/types';

// ---------- DTOs ----------
export interface CreateEmployeeDto {
  organizationId: UUID;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  emergencyContact?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: 'IN';
  };
  department: EmployeeDepartment;
  designation: string;
  employmentType: EmploymentType;
  payType: PayType;
  dateOfJoining: string;
  pan?: string;
  aadhaar?: string;
  uan?: string;
  esicNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  primaryOutletId: UUID;
  salaryTemplateId?: UUID;
  attendanceSource?: AttendanceSource;
  shiftPatternId?: UUID;
  outletMappings?: {
    outletId: UUID;
    isPrimary: boolean;
    allocationPercentage: number;
    effectiveFrom: string;
  }[];
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  dateOfExit?: string;
  exitReason?: string;
  isActive?: boolean;
}

export interface EmployeeFilter {
  organizationId: UUID;
  outletId?: UUID;
  department?: EmployeeDepartment;
  employmentType?: EmploymentType;
  isActive?: boolean;
  search?: string;
}

// ---------- Service ----------
export class EmployeeService {
  private async generateEmployeeCode(organizationId: UUID): Promise<string> {
    const db = getDb();
    const result = await db('employees')
      .where({ organization_id: organizationId })
      .count('id as count')
      .first();
    const count = parseInt(String(result?.count || '0'), 10);
    return `EMP${String(count + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateEmployeeDto, userId: UUID): Promise<Employee> {
    const db = getDb();
    const employeeCode = await this.generateEmployeeCode(dto.organizationId);

    // Validate outlet exists
    const outlet = await db('outlets').where({ id: dto.primaryOutletId }).first();
    if (!outlet) {
      throw new NotFoundError('Outlet', dto.primaryOutletId);
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    return db.transaction(async (trx) => {
      // Insert employee
      await trx('employees').insert({
        id,
        employee_code: employeeCode,
        organization_id: dto.organizationId,
        first_name: dto.firstName,
        last_name: dto.lastName,
        date_of_birth: dto.dateOfBirth,
        gender: dto.gender,
        phone: dto.phone,
        email: dto.email,
        emergency_contact: dto.emergencyContact,
        address: JSON.stringify(dto.address),
        department: dto.department,
        designation: dto.designation,
        employment_type: dto.employmentType,
        pay_type: dto.payType,
        date_of_joining: dto.dateOfJoining,
        pan: dto.pan,
        aadhaar_encrypted: dto.aadhaar, // TODO: encrypt with pgcrypto
        uan: dto.uan,
        esic_number: dto.esicNumber,
        bank_account_encrypted: dto.bankAccountNumber, // TODO: encrypt
        bank_ifsc: dto.bankIfsc,
        bank_name: dto.bankName,
        primary_outlet_id: dto.primaryOutletId,
        salary_template_id: dto.salaryTemplateId,
        attendance_source: dto.attendanceSource || 'MANUAL',
        shift_pattern_id: dto.shiftPatternId,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      });

      // Insert primary outlet mapping
      await trx('employee_outlet_mappings').insert({
        id: uuidv4(),
        employee_id: id,
        outlet_id: dto.primaryOutletId,
        is_primary: true,
        allocation_percentage: 10000, // 100%
        effective_from: dto.dateOfJoining,
      });

      // Insert additional outlet mappings
      if (dto.outletMappings) {
        for (const mapping of dto.outletMappings) {
          if (mapping.outletId !== dto.primaryOutletId) {
            await trx('employee_outlet_mappings').insert({
              id: uuidv4(),
              employee_id: id,
              outlet_id: mapping.outletId,
              is_primary: false,
              allocation_percentage: mapping.allocationPercentage,
              effective_from: mapping.effectiveFrom,
            });
          }
        }
      }

      // Publish event
      await eventBus.publish(
        'EMPLOYEE_CREATED',
        'Employee',
        id,
        { employeeCode, department: dto.department, outletId: dto.primaryOutletId },
        { userId, organizationId: dto.organizationId, outletId: dto.primaryOutletId }
      );

      logger.info(`Employee created: ${employeeCode}`, { id, employeeCode });
      return this.getById(id, dto.organizationId);
    });
  }

  async getById(id: UUID, organizationId: UUID): Promise<Employee> {
    const db = getDb();
    const employee = await db('employees')
      .where({ id, organization_id: organizationId })
      .first();

    if (!employee) {
      throw new NotFoundError('Employee', id);
    }

    const outletMappings = await db('employee_outlet_mappings')
      .where({ employee_id: id });

    return this.mapToEmployee(employee, outletMappings);
  }

  async list(
    filter: EmployeeFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Employee>> {
    const db = getDb();
    let query = db('employees').where({ organization_id: filter.organizationId });

    if (filter.outletId) {
      query = query.where({ primary_outlet_id: filter.outletId });
    }
    if (filter.department) {
      query = query.where({ department: filter.department });
    }
    if (filter.employmentType) {
      query = query.where({ employment_type: filter.employmentType });
    }
    if (filter.isActive !== undefined) {
      query = query.where({ is_active: filter.isActive });
    }
    if (filter.search) {
      query = query.where((builder) => {
        builder
          .whereILike('first_name', `%${filter.search}%`)
          .orWhereILike('last_name', `%${filter.search}%`)
          .orWhereILike('employee_code', `%${filter.search}%`);
      });
    }

    const countResult = await query.clone().count('id as total').first();
    const total = parseInt(String(countResult?.total || '0'), 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const employees = await query
      .orderBy(pagination.sortBy || 'created_at', pagination.sortOrder || 'desc')
      .limit(pagination.limit)
      .offset(offset);

    const employeeIds = employees.map((e: any) => e.id);
    const allMappings = await db('employee_outlet_mappings')
      .whereIn('employee_id', employeeIds);

    const data = employees.map((emp: any) => {
      const mappings = allMappings.filter((m: any) => m.employee_id === emp.id);
      return this.mapToEmployee(emp, mappings);
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async update(id: UUID, organizationId: UUID, dto: UpdateEmployeeDto, userId: UUID): Promise<Employee> {
    const db = getDb();
    const existing = await this.getById(id, organizationId);

    const updateData: Record<string, unknown> = { updated_by: userId, updated_at: new Date() };
    if (dto.firstName) updateData.first_name = dto.firstName;
    if (dto.lastName) updateData.last_name = dto.lastName;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.department) updateData.department = dto.department;
    if (dto.designation) updateData.designation = dto.designation;
    if (dto.employmentType) updateData.employment_type = dto.employmentType;
    if (dto.payType) updateData.pay_type = dto.payType;
    if (dto.address) updateData.address = JSON.stringify(dto.address);
    if (dto.primaryOutletId) updateData.primary_outlet_id = dto.primaryOutletId;
    if (dto.salaryTemplateId) updateData.salary_template_id = dto.salaryTemplateId;
    if (dto.attendanceSource) updateData.attendance_source = dto.attendanceSource;
    if (dto.shiftPatternId) updateData.shift_pattern_id = dto.shiftPatternId;
    if (dto.bankIfsc) updateData.bank_ifsc = dto.bankIfsc;
    if (dto.bankName) updateData.bank_name = dto.bankName;
    if (dto.bankAccountNumber) updateData.bank_account_encrypted = dto.bankAccountNumber;
    if (dto.pan) updateData.pan = dto.pan;
    if (dto.uan) updateData.uan = dto.uan;
    if (dto.esicNumber) updateData.esic_number = dto.esicNumber;
    if (dto.dateOfExit) updateData.date_of_exit = dto.dateOfExit;
    if (dto.exitReason) updateData.exit_reason = dto.exitReason;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await db('employees').where({ id }).update(updateData);

    await eventBus.publish(
      'EMPLOYEE_UPDATED',
      'Employee',
      id,
      { changes: Object.keys(updateData) },
      { userId, organizationId }
    );

    return this.getById(id, organizationId);
  }

  async updateOutletMappings(
    employeeId: UUID,
    organizationId: UUID,
    mappings: { outletId: UUID; isPrimary: boolean; allocationPercentage: number; effectiveFrom: string }[],
    userId: UUID
  ): Promise<EmployeeOutletMapping[]> {
    const db = getDb();
    await this.getById(employeeId, organizationId);

    // Validate total allocation doesn't exceed 100%
    const totalAllocation = mappings.reduce((sum, m) => sum + m.allocationPercentage, 0);
    if (totalAllocation > 10000) {
      throw new ValidationError('Total outlet allocation cannot exceed 100%');
    }

    return db.transaction(async (trx) => {
      // Soft-close existing mappings
      await trx('employee_outlet_mappings')
        .where({ employee_id: employeeId })
        .whereNull('effective_to')
        .update({ effective_to: new Date().toISOString().split('T')[0] });

      // Insert new mappings
      const newMappings = mappings.map((m) => ({
        id: uuidv4(),
        employee_id: employeeId,
        outlet_id: m.outletId,
        is_primary: m.isPrimary,
        allocation_percentage: m.allocationPercentage,
        effective_from: m.effectiveFrom,
      }));

      await trx('employee_outlet_mappings').insert(newMappings);

      // Update primary outlet on employee
      const primary = mappings.find((m) => m.isPrimary);
      if (primary) {
        await trx('employees')
          .where({ id: employeeId })
          .update({ primary_outlet_id: primary.outletId, updated_by: userId });
      }

      return newMappings.map((m) => ({
        employeeId: m.employee_id,
        outletId: m.outlet_id,
        isPrimary: m.is_primary,
        allocationPercentage: m.allocation_percentage,
        effectiveFrom: m.effective_from,
      })) as EmployeeOutletMapping[];
    });
  }

  async getByOutlet(outletId: UUID, organizationId: UUID): Promise<Employee[]> {
    const db = getDb();
    const employees = await db('employees')
      .where({ organization_id: organizationId, primary_outlet_id: outletId, is_active: true });

    const employeeIds = employees.map((e: any) => e.id);
    const allMappings = await db('employee_outlet_mappings')
      .whereIn('employee_id', employeeIds);

    return employees.map((emp: any) => {
      const mappings = allMappings.filter((m: any) => m.employee_id === emp.id);
      return this.mapToEmployee(emp, mappings);
    });
  }

  async exitEmployee(id: UUID, organizationId: UUID, exitDate: string, exitReason: string, userId: UUID): Promise<Employee> {
    const db = getDb();
    await this.getById(id, organizationId);

    await db('employees').where({ id }).update({
      date_of_exit: exitDate,
      exit_reason: exitReason,
      is_active: false,
      updated_by: userId,
      updated_at: new Date(),
    });

    await eventBus.publish(
      'EMPLOYEE_EXITED',
      'Employee',
      id,
      { exitDate, exitReason },
      { userId, organizationId }
    );

    return this.getById(id, organizationId);
  }

  private mapToEmployee(row: any, mappings: any[]): Employee {
    return {
      id: row.id,
      employeeCode: row.employee_code,
      organizationId: row.organization_id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      phone: row.phone,
      email: row.email,
      emergencyContact: row.emergency_contact,
      address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
      department: row.department,
      designation: row.designation,
      employmentType: row.employment_type,
      payType: row.pay_type,
      dateOfJoining: row.date_of_joining,
      dateOfExit: row.date_of_exit,
      exitReason: row.exit_reason,
      pan: row.pan,
      aadhaar: row.aadhaar_encrypted ? '****' : undefined,
      uan: row.uan,
      esicNumber: row.esic_number,
      bankAccountNumber: row.bank_account_encrypted ? '****' : undefined,
      bankIfsc: row.bank_ifsc,
      bankName: row.bank_name,
      primaryOutletId: row.primary_outlet_id,
      salaryTemplateId: row.salary_template_id,
      attendanceSource: row.attendance_source,
      shiftPatternId: row.shift_pattern_id,
      outletMappings: mappings.map((m: any) => ({
        employeeId: m.employee_id,
        outletId: m.outlet_id,
        isPrimary: m.is_primary,
        allocationPercentage: m.allocation_percentage,
        effectiveFrom: m.effective_from,
        effectiveTo: m.effective_to,
      })),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const employeeService = new EmployeeService();
