import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { NotFoundError, ValidationError } from '../../common/errors';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import {
  SalaryComponent,
  SalaryTemplate,
  EmployeeSalaryStructure,
  UUID,
  SalaryComponentType,
  CalculationBasis,
  EmployeeDepartment,
  PayType,
  Money,
} from '../../common/types';

// ---------- DTOs ----------
export interface CreateSalaryComponentDto {
  organizationId: UUID;
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationBasis: CalculationBasis;
  value: number;
  formula?: string;
  isStatutory: boolean;
  isTaxable: boolean;
  isProRata: boolean;
  maxLimit?: number;
  accountCode?: string;
  displayOrder?: number;
}

export interface CreateSalaryTemplateDto {
  name: string;
  description: string;
  organizationId: UUID;
  applicableDepartments: EmployeeDepartment[];
  applicableDesignations?: string[];
  payType: PayType;
  components: {
    componentId: UUID;
    overrideValue?: number;
    overrideFormula?: string;
  }[];
}

export interface AssignSalaryStructureDto {
  employeeId: UUID;
  templateId: UUID;
  ctcAnnual: number; // in rupees
  effectiveFrom: string;
}

// ---------- Service ----------
export class SalaryStructureService {
  // ---- Salary Components ----
  async createComponent(dto: CreateSalaryComponentDto, userId: UUID): Promise<SalaryComponent> {
    const db = getDb();
    const id = uuidv4();

    await db('salary_components').insert({
      id,
      organization_id: dto.organizationId,
      code: dto.code,
      name: dto.name,
      type: dto.type,
      calculation_basis: dto.calculationBasis,
      value: dto.value,
      formula: dto.formula,
      is_statutory: dto.isStatutory,
      is_taxable: dto.isTaxable,
      is_pro_rata: dto.isProRata,
      max_limit: dto.maxLimit ? MoneyUtil.toPaisa(dto.maxLimit) : null,
      account_code: dto.accountCode,
      display_order: dto.displayOrder || 0,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    return this.getComponent(id);
  }

  async getComponent(id: UUID): Promise<SalaryComponent> {
    const db = getDb();
    const row = await db('salary_components').where({ id }).first();
    if (!row) throw new NotFoundError('SalaryComponent', id);
    return this.mapComponent(row);
  }

  async listComponents(organizationId: UUID): Promise<SalaryComponent[]> {
    const db = getDb();
    const rows = await db('salary_components')
      .where({ organization_id: organizationId, is_active: true })
      .orderBy('display_order');
    return rows.map((r: any) => this.mapComponent(r));
  }

  // ---- Salary Templates ----
  async createTemplate(dto: CreateSalaryTemplateDto, userId: UUID): Promise<SalaryTemplate> {
    const db = getDb();
    const id = uuidv4();

    return db.transaction(async (trx) => {
      await trx('salary_templates').insert({
        id,
        name: dto.name,
        description: dto.description,
        organization_id: dto.organizationId,
        applicable_departments: dto.applicableDepartments,
        applicable_designations: dto.applicableDesignations || [],
        pay_type: dto.payType,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      });

      for (const comp of dto.components) {
        await trx('salary_template_components').insert({
          id: uuidv4(),
          template_id: id,
          component_id: comp.componentId,
          override_value: comp.overrideValue,
          override_formula: comp.overrideFormula,
        });
      }

      return this.getTemplate(id);
    });
  }

  async getTemplate(id: UUID): Promise<SalaryTemplate> {
    const db = getDb();
    const row = await db('salary_templates').where({ id }).first();
    if (!row) throw new NotFoundError('SalaryTemplate', id);

    const components = await db('salary_template_components')
      .join('salary_components', 'salary_template_components.component_id', 'salary_components.id')
      .where({ 'salary_template_components.template_id': id })
      .select('salary_template_components.*', 'salary_components.code as comp_code', 'salary_components.name as comp_name');

    return this.mapTemplate(row, components);
  }

  async listTemplates(organizationId: UUID): Promise<SalaryTemplate[]> {
    const db = getDb();
    const rows = await db('salary_templates')
      .where({ organization_id: organizationId, is_active: true });

    const templates: SalaryTemplate[] = [];
    for (const row of rows) {
      const components = await db('salary_template_components')
        .where({ template_id: row.id });
      templates.push(this.mapTemplate(row, components));
    }
    return templates;
  }

  // ---- Employee Salary Structure ----
  async assignStructure(dto: AssignSalaryStructureDto, userId: UUID): Promise<EmployeeSalaryStructure> {
    const db = getDb();

    // Get template with components
    const template = await this.getTemplate(dto.templateId);
    const components = await db('salary_template_components')
      .join('salary_components', 'salary_template_components.component_id', 'salary_components.id')
      .where({ 'salary_template_components.template_id': dto.templateId })
      .select('salary_components.*', 'salary_template_components.override_value', 'salary_template_components.override_formula');

    // Get employee
    const employee = await db('employees').where({ id: dto.employeeId }).first();
    if (!employee) throw new NotFoundError('Employee', dto.employeeId);

    const ctcPaisa = MoneyUtil.toPaisa(dto.ctcAnnual);
    const ctcMonthly = MoneyUtil.divide(ctcPaisa, 12);

    // Calculate component-wise breakdown
    const calculated = this.calculateComponents(components, ctcPaisa, ctcMonthly);

    const structureId = uuidv4();

    return db.transaction(async (trx) => {
      // Close existing active structure
      await trx('employee_salary_structures')
        .where({ employee_id: dto.employeeId, is_active: true })
        .update({
          is_active: false,
          effective_to: dto.effectiveFrom,
          updated_by: userId,
        });

      await trx('employee_salary_structures').insert({
        id: structureId,
        employee_id: dto.employeeId,
        template_id: dto.templateId,
        ctc_annual: ctcPaisa,
        gross_monthly: calculated.grossMonthly,
        basic_monthly: calculated.basicMonthly,
        effective_from: dto.effectiveFrom,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      });

      for (const comp of calculated.components) {
        await trx('employee_salary_components').insert({
          id: uuidv4(),
          structure_id: structureId,
          component_id: comp.componentId,
          monthly_amount: comp.monthlyAmount,
          annual_amount: comp.annualAmount,
        });
      }

      // Update employee salary_template_id
      await trx('employees')
        .where({ id: dto.employeeId })
        .update({ salary_template_id: dto.templateId, updated_by: userId });

      await eventBus.publish(
        'SALARY_STRUCTURE_CREATED',
        'EmployeeSalaryStructure',
        structureId,
        { employeeId: dto.employeeId, ctcAnnual: dto.ctcAnnual },
        { userId, organizationId: employee.organization_id }
      );

      logger.info(`Salary structure assigned to employee ${dto.employeeId}`, { structureId });
      return this.getStructure(structureId);
    });
  }

  async getStructure(id: UUID): Promise<EmployeeSalaryStructure> {
    const db = getDb();
    const row = await db('employee_salary_structures').where({ id }).first();
    if (!row) throw new NotFoundError('EmployeeSalaryStructure', id);

    const components = await db('employee_salary_components')
      .join('salary_components', 'employee_salary_components.component_id', 'salary_components.id')
      .where({ 'employee_salary_components.structure_id': id })
      .select('employee_salary_components.*', 'salary_components.code', 'salary_components.name', 'salary_components.type');

    return this.mapStructure(row, components);
  }

  async getActiveStructure(employeeId: UUID): Promise<EmployeeSalaryStructure | null> {
    const db = getDb();
    const row = await db('employee_salary_structures')
      .where({ employee_id: employeeId, is_active: true })
      .first();

    if (!row) return null;
    return this.getStructure(row.id);
  }

  // ---- Calculation Engine ----
  private calculateComponents(
    components: any[],
    ctcAnnual: Money,
    ctcMonthly: Money
  ): {
    grossMonthly: Money;
    basicMonthly: Money;
    components: { componentId: UUID; monthlyAmount: Money; annualAmount: Money }[];
  } {
    const result: { componentId: UUID; monthlyAmount: Money; annualAmount: Money }[] = [];
    let basicMonthly = 0;
    let grossMonthly = 0;

    // First pass: find basic (usually ~40-50% of CTC)
    const basicComp = components.find((c: any) => c.code === 'BASIC');
    if (basicComp) {
      if (basicComp.calculation_basis === 'PERCENTAGE_OF_CTC') {
        const rate = basicComp.override_value || basicComp.value;
        basicMonthly = MoneyUtil.percentage(ctcMonthly, MoneyUtil.toBasisPoints(rate));
      } else if (basicComp.calculation_basis === 'FIXED') {
        basicMonthly = MoneyUtil.toPaisa(basicComp.override_value || basicComp.value);
      } else {
        basicMonthly = MoneyUtil.percentage(ctcMonthly, 4000); // Default 40%
      }
    } else {
      basicMonthly = MoneyUtil.percentage(ctcMonthly, 4000);
    }

    // Second pass: calculate all components
    for (const comp of components) {
      let monthlyAmount: Money = 0;
      const value = comp.override_value || comp.value;

      switch (comp.calculation_basis) {
        case 'FIXED':
          monthlyAmount = MoneyUtil.toPaisa(value);
          break;
        case 'PERCENTAGE_OF_BASIC':
          monthlyAmount = MoneyUtil.percentage(basicMonthly, MoneyUtil.toBasisPoints(value));
          break;
        case 'PERCENTAGE_OF_GROSS':
          // Gross not known yet, use CTC monthly as approximation
          monthlyAmount = MoneyUtil.percentage(ctcMonthly, MoneyUtil.toBasisPoints(value));
          break;
        case 'PERCENTAGE_OF_CTC':
          monthlyAmount = MoneyUtil.percentage(ctcMonthly, MoneyUtil.toBasisPoints(value));
          break;
        default:
          monthlyAmount = MoneyUtil.toPaisa(value);
      }

      // Apply max limit
      if (comp.max_limit && monthlyAmount > parseInt(comp.max_limit)) {
        monthlyAmount = parseInt(comp.max_limit);
      }

      if (comp.type === 'EARNING') {
        grossMonthly = MoneyUtil.add(grossMonthly, monthlyAmount);
      }

      result.push({
        componentId: comp.id,
        monthlyAmount,
        annualAmount: MoneyUtil.multiply(monthlyAmount, 12),
      });
    }

    return { grossMonthly, basicMonthly, components: result };
  }

  private mapComponent(row: any): SalaryComponent {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      type: row.type,
      calculationBasis: row.calculation_basis,
      value: parseFloat(row.value),
      formula: row.formula,
      isStatutory: row.is_statutory,
      isTaxable: row.is_taxable,
      isProRata: row.is_pro_rata,
      maxLimit: row.max_limit ? parseInt(row.max_limit) : undefined,
      accountCode: row.account_code,
      displayOrder: row.display_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private mapTemplate(row: any, components: any[]): SalaryTemplate {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      organizationId: row.organization_id,
      applicableDepartments: row.applicable_departments,
      applicableDesignations: row.applicable_designations || [],
      payType: row.pay_type,
      components: components.map((c: any) => ({
        templateId: row.id,
        componentId: c.component_id || c.id,
        overrideValue: c.override_value ? parseFloat(c.override_value) : undefined,
        overrideFormula: c.override_formula,
      })),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private mapStructure(row: any, components: any[]): EmployeeSalaryStructure {
    return {
      id: row.id,
      employeeId: row.employee_id,
      templateId: row.template_id,
      ctcAnnual: parseInt(row.ctc_annual),
      grossMonthly: parseInt(row.gross_monthly),
      basicMonthly: parseInt(row.basic_monthly),
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      components: components.map((c: any) => ({
        structureId: row.id,
        componentId: c.component_id,
        monthlyAmount: parseInt(c.monthly_amount),
        annualAmount: parseInt(c.annual_amount),
        overrideValue: c.override_value ? parseFloat(c.override_value) : undefined,
      })),
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const salaryStructureService = new SalaryStructureService();
