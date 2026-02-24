import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { PayrollError, NotFoundError } from '../../common/errors';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { salaryStructureService } from '../salary-structure/salary-structure.service';
import { attendanceService } from '../employee/attendance.service';
import { complianceService } from '../compliance/compliance.service';
import { journalEntryService } from '../accounting/journal-entry.service';
import { tipPoolService } from '../restaurant/tip-pool.service';
import { serviceChargeService } from '../restaurant/service-charge.service';
import { incentiveService } from '../restaurant/incentive.service';
import {
  PayrollRun,
  PayrollSlip,
  PayrollSlipComponent,
  UUID,
  Money,
  ISODate,
  PayrollStatus,
  IndianState,
  EmployeeDepartment,
} from '../../common/types';

export interface RunPayrollDto {
  organizationId: UUID;
  outletId?: UUID; // null = all outlets
  month: number;
  year: number;
  periodStart: ISODate;
  periodEnd: ISODate;
  // Optional restaurant-specific inputs
  tipPoolAmount?: Money;
  serviceChargeAmount?: Money;
  salesMetrics?: Record<string, number>; // For incentive calculation
}

export interface PayrollProcessResult {
  payrollRun: PayrollRun;
  slipCount: number;
  totalGross: Money;
  totalDeductions: Money;
  totalNet: Money;
  totalEmployerCost: Money;
}

export class PayrollEngineService {
  /**
   * Main payroll calculation engine
   * Steps:
   * 1. Fetch eligible employees
   * 2. For each employee: attendance → salary calc → compliance → restaurant extras
   * 3. Generate payroll slips
   * 4. Summarize payroll run
   */
  async calculatePayroll(dto: RunPayrollDto, userId: UUID): Promise<PayrollProcessResult> {
    const db = getDb();

    // Auto-derive period dates from month/year if not provided
    const periodStart = dto.periodStart || `${dto.year}-${String(dto.month).padStart(2, '0')}-01`;
    const lastDay = new Date(dto.year, dto.month, 0).getDate();
    const periodEnd = dto.periodEnd || `${dto.year}-${String(dto.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Check for existing payroll run
    const existing = await db('payroll_runs')
      .where({
        organization_id: dto.organizationId,
        month: dto.month,
        year: dto.year,
        is_active: true,
      })
      .whereIn('status', ['CALCULATED', 'REVIEWED', 'APPROVED', 'PROCESSED', 'PAID'])
      .first();

    if (existing && !dto.outletId) {
      throw new PayrollError(`Payroll for ${dto.month}/${dto.year} already exists with status ${existing.status}`);
    }

    const payrollRunId = uuidv4();

    // Create payroll run
    await db('payroll_runs').insert({
      id: payrollRunId,
      organization_id: dto.organizationId,
      outlet_id: dto.outletId,
      period_type: 'MONTHLY',
      period_start: periodStart,
      period_end: periodEnd,
      month: dto.month,
      year: dto.year,
      status: 'DRAFT',
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    // Fetch employees
    let empQuery = db('employees')
      .where({ organization_id: dto.organizationId, is_active: true });
    if (dto.outletId) {
      empQuery = empQuery.where({ primary_outlet_id: dto.outletId });
    }
    const employees = await empQuery;

    if (employees.length === 0) {
      throw new PayrollError('No active employees found for payroll processing');
    }

    // Pre-fetch tip and service charge distributions
    let tipDistributions: Map<string, Money> = new Map();
    let scDistributions: Map<string, Money> = new Map();

    // Calculate per-employee payroll
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalEmployerCost = 0;
    let slipCount = 0;

    for (const emp of employees) {
      try {
        const slip = await this.calculateEmployeePayroll(
          payrollRunId,
          emp,
          dto,
          tipDistributions,
          scDistributions,
          userId
        );

        totalGross = MoneyUtil.add(totalGross, slip.totalEarnings);
        totalDeductions = MoneyUtil.add(totalDeductions, slip.totalDeductions);
        totalNet = MoneyUtil.add(totalNet, slip.netPayable);
        totalEmployerCost = MoneyUtil.add(totalEmployerCost, slip.totalEmployerCost);
        slipCount++;
      } catch (error) {
        logger.error(`Payroll calculation failed for employee ${emp.employee_code}`, {
          employeeId: emp.id,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue processing other employees
      }
    }

    // Update payroll run
    await db('payroll_runs').where({ id: payrollRunId }).update({
      status: 'CALCULATED',
      total_gross: totalGross,
      total_deductions: totalDeductions,
      total_net: totalNet,
      total_employer_cost: totalEmployerCost,
      employee_count: slipCount,
      updated_by: userId,
    });

    await eventBus.publish(
      'PAYROLL_CALCULATED',
      'PayrollRun',
      payrollRunId,
      {
        month: dto.month,
        year: dto.year,
        employeeCount: slipCount,
        totalGross,
        totalNet,
      },
      { userId, organizationId: dto.organizationId, outletId: dto.outletId }
    );

    const payrollRun = await this.getPayrollRun(payrollRunId);

    logger.info(`Payroll calculated: ${dto.month}/${dto.year}`, {
      payrollRunId,
      employees: slipCount,
      totalNet: MoneyUtil.formatINR(totalNet),
    });

    return { payrollRun, slipCount, totalGross, totalDeductions, totalNet, totalEmployerCost };
  }

  private async calculateEmployeePayroll(
    payrollRunId: UUID,
    emp: any,
    dto: RunPayrollDto,
    tipDistributions: Map<string, Money>,
    scDistributions: Map<string, Money>,
    userId: UUID
  ): Promise<PayrollSlip> {
    const db = getDb();

    // 1. Get salary structure
    const structure = await salaryStructureService.getActiveStructure(emp.id);
    if (!structure) {
      throw new PayrollError(`No active salary structure for employee ${emp.employee_code}`);
    }

    // 2. Get attendance summary
    const attendance = await attendanceService.getMonthlySummary(emp.id, dto.month, dto.year);
    const totalDaysInMonth = attendance.totalDays;
    const paidDays = attendance.paidDays;

    // 3. Calculate earnings
    const earnings: PayrollSlipComponent[] = [];
    let totalEarnings = 0;

    // Get component details
    const components = await db('employee_salary_components')
      .join('salary_components', 'employee_salary_components.component_id', 'salary_components.id')
      .where({ 'employee_salary_components.structure_id': structure.id })
      .select('salary_components.*', 'employee_salary_components.monthly_amount', 'employee_salary_components.annual_amount');

    for (const comp of components) {
      if (comp.type !== 'EARNING') continue;

      let amount = parseInt(comp.monthly_amount);

      // Pro-rata based on attendance
      if (comp.is_pro_rata) {
        amount = MoneyUtil.proRata(amount, paidDays, totalDaysInMonth);
      }

      earnings.push({
        componentId: comp.id,
        componentCode: comp.code,
        componentName: comp.name,
        type: 'EARNING',
        calculatedAmount: amount,
      });

      totalEarnings = MoneyUtil.add(totalEarnings, amount);
    }

    // 4. Calculate overtime pay (if applicable)
    if (attendance.totalOvertimeHours > 0 && emp.pay_type !== 'MONTHLY_FIXED') {
      const hourlyRate = MoneyUtil.divide(structure.basicMonthly, 208); // ~26 days * 8 hours
      const overtimePay = MoneyUtil.multiply(hourlyRate, attendance.totalOvertimeHours * 2); // 2x rate

      earnings.push({
        componentId: 'OVERTIME',
        componentCode: 'OT',
        componentName: 'Overtime Pay',
        type: 'EARNING',
        calculatedAmount: overtimePay,
      });

      totalEarnings = MoneyUtil.add(totalEarnings, overtimePay);
    }

    // 5. Get employee state for compliance
    const empAddress = typeof emp.address === 'string' ? JSON.parse(emp.address) : emp.address;
    const state: IndianState = empAddress?.state || 'MH';

    // 6. Calculate basic for compliance (pro-rated)
    const basicProRated = MoneyUtil.proRata(structure.basicMonthly, paidDays, totalDaysInMonth);
    const grossProRated = MoneyUtil.proRata(structure.grossMonthly, paidDays, totalDaysInMonth);

    // 7. Compliance calculations
    const compliance = await complianceService.calculateAll({
      employeeId: emp.id,
      organizationId: dto.organizationId,
      basicMonthly: basicProRated,
      grossMonthly: grossProRated,
      state,
      uan: emp.uan,
      esicNumber: emp.esic_number,
      pan: emp.pan,
      regime: 'NEW', // Default to new regime
      financialYear: '2024-25',
    });

    // 8. Build deductions
    const deductions: PayrollSlipComponent[] = [];
    let totalDeductions = 0;

    if (compliance.pf.isApplicable) {
      deductions.push({
        componentId: 'PF_EE',
        componentCode: 'PF_EE',
        componentName: 'Employee PF',
        type: 'DEDUCTION',
        calculatedAmount: compliance.pf.employeeContribution,
      });
      totalDeductions = MoneyUtil.add(totalDeductions, compliance.pf.employeeContribution);
    }

    if (compliance.esi.isApplicable) {
      deductions.push({
        componentId: 'ESI_EE',
        componentCode: 'ESI_EE',
        componentName: 'Employee ESI',
        type: 'DEDUCTION',
        calculatedAmount: compliance.esi.employeeContribution,
      });
      totalDeductions = MoneyUtil.add(totalDeductions, compliance.esi.employeeContribution);
    }

    if (compliance.professionalTax.isApplicable) {
      deductions.push({
        componentId: 'PT',
        componentCode: 'PT',
        componentName: 'Professional Tax',
        type: 'DEDUCTION',
        calculatedAmount: compliance.professionalTax.amount,
      });
      totalDeductions = MoneyUtil.add(totalDeductions, compliance.professionalTax.amount);
    }

    if (compliance.tds.isApplicable) {
      deductions.push({
        componentId: 'TDS',
        componentCode: 'TDS',
        componentName: 'TDS (Income Tax)',
        type: 'DEDUCTION',
        calculatedAmount: compliance.tds.monthlyTds,
      });
      totalDeductions = MoneyUtil.add(totalDeductions, compliance.tds.monthlyTds);
    }

    // Add template deduction components
    for (const comp of components) {
      if (comp.type !== 'DEDUCTION') continue;
      if (['PF_EE', 'ESI_EE', 'PT', 'TDS'].includes(comp.code)) continue; // Already handled

      let amount = parseInt(comp.monthly_amount);
      if (comp.is_pro_rata) {
        amount = MoneyUtil.proRata(amount, paidDays, totalDaysInMonth);
      }

      deductions.push({
        componentId: comp.id,
        componentCode: comp.code,
        componentName: comp.name,
        type: 'DEDUCTION',
        calculatedAmount: amount,
      });
      totalDeductions = MoneyUtil.add(totalDeductions, amount);
    }

    // 9. Employer contributions
    const employerContributions: PayrollSlipComponent[] = [];
    let totalEmployerCost = 0;

    if (compliance.pf.isApplicable) {
      employerContributions.push({
        componentId: 'PF_ER',
        componentCode: 'PF_ER',
        componentName: 'Employer PF',
        type: 'EMPLOYER_CONTRIBUTION',
        calculatedAmount: compliance.pf.totalEmployerContribution,
      });
      totalEmployerCost = MoneyUtil.add(totalEmployerCost, compliance.pf.totalEmployerContribution);
    }

    if (compliance.esi.isApplicable) {
      employerContributions.push({
        componentId: 'ESI_ER',
        componentCode: 'ESI_ER',
        componentName: 'Employer ESI',
        type: 'EMPLOYER_CONTRIBUTION',
        calculatedAmount: compliance.esi.employerContribution,
      });
      totalEmployerCost = MoneyUtil.add(totalEmployerCost, compliance.esi.employerContribution);
    }

    // 10. Restaurant-specific: tips, service charge, incentives
    const tipsReceived = tipDistributions.get(emp.id) || 0;
    const serviceChargeShare = scDistributions.get(emp.id) || 0;
    const incentiveAmount = 0; // Calculated separately

    // Net payable
    const netPayable = MoneyUtil.subtract(
      MoneyUtil.add(MoneyUtil.add(totalEarnings, tipsReceived), serviceChargeShare),
      totalDeductions
    );

    // Insert payroll slip
    const slipId = uuidv4();
    await db('payroll_slips').insert({
      id: slipId,
      payroll_run_id: payrollRunId,
      employee_id: emp.id,
      outlet_id: emp.primary_outlet_id,
      period_start: `${dto.year}-${String(dto.month).padStart(2, '0')}-01`,
      period_end: `${dto.year}-${String(dto.month).padStart(2, '0')}-${String(new Date(dto.year, dto.month, 0).getDate()).padStart(2, '0')}`,
      working_days: totalDaysInMonth,
      present_days: attendance.presentDays,
      paid_days: paidDays,
      leave_days: attendance.leaveDays,
      overtime_hours: attendance.totalOvertimeHours,
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_payable: netPayable,
      total_employer_cost: totalEmployerCost,
      tips_received: tipsReceived,
      service_charge_share: serviceChargeShare,
      incentive_amount: incentiveAmount,
      status: 'CALCULATED',
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    // Insert slip components
    const systemComponentCodes = ['PF_EE', 'ESI_EE', 'PT', 'TDS', 'PF_ER', 'ESI_ER', 'OT'];
    const allComponents = [...earnings, ...deductions, ...employerContributions];
    for (const comp of allComponents) {
      const isSystemComponent = systemComponentCodes.includes(comp.componentCode);
      await db('payroll_slip_components').insert({
        id: uuidv4(),
        payroll_slip_id: slipId,
        component_id: isSystemComponent ? null : comp.componentId,
        component_code: comp.componentCode,
        component_name: comp.componentName,
        type: comp.type,
        calculated_amount: comp.calculatedAmount,
      });
    }

    return {
      id: slipId,
      payrollRunId,
      employeeId: emp.id,
      outletId: emp.primary_outlet_id,
      periodStart: dto.periodStart,
      periodEnd: dto.periodEnd,
      workingDays: totalDaysInMonth,
      presentDays: attendance.presentDays,
      paidDays,
      leaveDays: attendance.leaveDays,
      overtimeHours: attendance.totalOvertimeHours,
      earnings,
      totalEarnings,
      deductions,
      totalDeductions,
      netPayable,
      employerContributions,
      totalEmployerCost,
      tipsReceived,
      serviceChargeShare,
      incentiveAmount,
      status: 'CALCULATED' as PayrollStatus,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId,
      updatedBy: userId,
    };
  }

  /**
   * Approve payroll run
   */
  async approvePayroll(payrollRunId: UUID, userId: UUID): Promise<PayrollRun> {
    const db = getDb();
    const run = await this.getPayrollRun(payrollRunId);

    if (run.status !== 'CALCULATED' && run.status !== 'REVIEWED') {
      throw new PayrollError(`Cannot approve payroll with status ${run.status}`);
    }

    await db('payroll_runs').where({ id: payrollRunId }).update({
      status: 'APPROVED',
      approved_at: new Date(),
      approved_by: userId,
      updated_by: userId,
    });

    await db('payroll_slips')
      .where({ payroll_run_id: payrollRunId })
      .update({ status: 'APPROVED' });

    await eventBus.publish(
      'PAYROLL_APPROVED',
      'PayrollRun',
      payrollRunId,
      { month: run.month, year: run.year, totalNet: run.totalNet },
      { userId, organizationId: run.organizationId }
    );

    return this.getPayrollRun(payrollRunId);
  }

  /**
   * Process payroll = post accounting entries + generate bank file
   */
  async processPayroll(payrollRunId: UUID, userId: UUID): Promise<PayrollRun> {
    const db = getDb();
    const run = await this.getPayrollRun(payrollRunId);

    if (run.status !== 'APPROVED') {
      throw new PayrollError(`Cannot process payroll with status ${run.status}. Must be APPROVED first.`);
    }

    // Get all slips for this run
    const slips = await db('payroll_slips')
      .where({ payroll_run_id: payrollRunId })
      .select('*');

    // Get slip components grouped by outlet
    const outletTotals = new Map<string, {
      outletId: UUID;
      grossSalary: Money;
      pfEmployee: Money;
      pfEmployer: Money;
      esiEmployee: Money;
      esiEmployer: Money;
      tds: Money;
      pt: Money;
      netPayable: Money;
    }>();

    for (const slip of slips) {
      const outletId = slip.outlet_id;
      if (!outletTotals.has(outletId)) {
        outletTotals.set(outletId, {
          outletId,
          grossSalary: 0,
          pfEmployee: 0,
          pfEmployer: 0,
          esiEmployee: 0,
          esiEmployer: 0,
          tds: 0,
          pt: 0,
          netPayable: 0,
        });
      }

      const totals = outletTotals.get(outletId)!;
      totals.grossSalary = MoneyUtil.add(totals.grossSalary, parseInt(slip.total_earnings));
      totals.netPayable = MoneyUtil.add(totals.netPayable, parseInt(slip.net_payable));

      // Get components for this slip
      const components = await db('payroll_slip_components')
        .where({ payroll_slip_id: slip.id });

      for (const comp of components) {
        const amount = parseInt(comp.calculated_amount);
        switch (comp.component_code) {
          case 'PF_EE': totals.pfEmployee = MoneyUtil.add(totals.pfEmployee, amount); break;
          case 'PF_ER': totals.pfEmployer = MoneyUtil.add(totals.pfEmployer, amount); break;
          case 'ESI_EE': totals.esiEmployee = MoneyUtil.add(totals.esiEmployee, amount); break;
          case 'ESI_ER': totals.esiEmployer = MoneyUtil.add(totals.esiEmployer, amount); break;
          case 'TDS': totals.tds = MoneyUtil.add(totals.tds, amount); break;
          case 'PT': totals.pt = MoneyUtil.add(totals.pt, amount); break;
        }
      }
    }

    // AUTO-POST ACCOUNTING ENTRIES
    // For each outlet, create journal entry:
    // DR: Salary Expense (by department) → 6xxx
    // DR: Employer PF Contribution → 6600
    // DR: Employer ESI Contribution → 6700
    // CR: PF Payable → 2210
    // CR: ESI Payable → 2220
    // CR: TDS Payable → 2230
    // CR: Professional Tax Payable → 2240
    // CR: Salary Payable / Bank → 2200 or 1130
    const journalLines: {
      accountCode: string;
      debit: Money;
      credit: Money;
      outletId?: UUID;
      description?: string;
    }[] = [];

    let grandTotalGross = 0;
    let grandTotalPfEe = 0;
    let grandTotalPfEr = 0;
    let grandTotalEsiEe = 0;
    let grandTotalEsiEr = 0;
    let grandTotalTds = 0;
    let grandTotalPt = 0;
    let grandTotalNet = 0;

    for (const [, totals] of outletTotals) {
      grandTotalGross = MoneyUtil.add(grandTotalGross, totals.grossSalary);
      grandTotalPfEe = MoneyUtil.add(grandTotalPfEe, totals.pfEmployee);
      grandTotalPfEr = MoneyUtil.add(grandTotalPfEr, totals.pfEmployer);
      grandTotalEsiEe = MoneyUtil.add(grandTotalEsiEe, totals.esiEmployee);
      grandTotalEsiEr = MoneyUtil.add(grandTotalEsiEr, totals.esiEmployer);
      grandTotalTds = MoneyUtil.add(grandTotalTds, totals.tds);
      grandTotalPt = MoneyUtil.add(grandTotalPt, totals.pt);
      grandTotalNet = MoneyUtil.add(grandTotalNet, totals.netPayable);
    }

    // Debit: Salary Expense
    if (grandTotalGross > 0) {
      journalLines.push({
        accountCode: '6000',
        debit: grandTotalGross,
        credit: 0,
        description: `Salary expense for ${run.month}/${run.year}`,
      });
    }

    // Debit: Employer PF
    if (grandTotalPfEr > 0) {
      journalLines.push({
        accountCode: '6600',
        debit: grandTotalPfEr,
        credit: 0,
        description: 'Employer PF contribution',
      });
    }

    // Debit: Employer ESI
    if (grandTotalEsiEr > 0) {
      journalLines.push({
        accountCode: '6700',
        debit: grandTotalEsiEr,
        credit: 0,
        description: 'Employer ESI contribution',
      });
    }

    // Credit: PF Payable (employee + employer)
    const totalPf = MoneyUtil.add(grandTotalPfEe, grandTotalPfEr);
    if (totalPf > 0) {
      journalLines.push({
        accountCode: '2210',
        debit: 0,
        credit: totalPf,
        description: 'PF payable (employee + employer)',
      });
    }

    // Credit: ESI Payable
    const totalEsi = MoneyUtil.add(grandTotalEsiEe, grandTotalEsiEr);
    if (totalEsi > 0) {
      journalLines.push({
        accountCode: '2220',
        debit: 0,
        credit: totalEsi,
        description: 'ESI payable (employee + employer)',
      });
    }

    // Credit: TDS Payable
    if (grandTotalTds > 0) {
      journalLines.push({
        accountCode: '2230',
        debit: 0,
        credit: grandTotalTds,
        description: 'TDS payable',
      });
    }

    // Credit: PT Payable
    if (grandTotalPt > 0) {
      journalLines.push({
        accountCode: '2240',
        debit: 0,
        credit: grandTotalPt,
        description: 'Professional tax payable',
      });
    }

    // Credit: Bank (net payable)
    if (grandTotalNet > 0) {
      journalLines.push({
        accountCode: '1130',
        debit: 0,
        credit: grandTotalNet,
        description: 'Net salary paid via bank',
      });
    }

    // Create and auto-post journal entry
    const journalEntry = await journalEntryService.create({
      organizationId: run.organizationId,
      date: run.periodEnd,
      source: 'PAYROLL',
      sourceReferenceId: payrollRunId,
      description: `Payroll for ${run.month}/${run.year} - ${run.employeeCount} employees`,
      lines: journalLines,
      tags: ['PAYROLL', `${run.month}-${run.year}`],
      autoPost: true,
    }, userId);

    // Update payroll run
    await db('payroll_runs').where({ id: payrollRunId }).update({
      status: 'PROCESSED',
      processed_at: new Date(),
      processed_by: userId,
      journal_entry_id: journalEntry.id,
      updated_by: userId,
    });

    await db('payroll_slips')
      .where({ payroll_run_id: payrollRunId })
      .update({ status: 'PROCESSED' });

    await eventBus.publish(
      'PAYROLL_PROCESSED',
      'PayrollRun',
      payrollRunId,
      {
        journalEntryId: journalEntry.id,
        totalNet: grandTotalNet,
        employeeCount: slips.length,
      },
      { userId, organizationId: run.organizationId }
    );

    logger.info(`Payroll processed with auto-accounting: ${run.month}/${run.year}`, {
      payrollRunId,
      journalEntryId: journalEntry.id,
      totalNet: MoneyUtil.formatINR(grandTotalNet),
    });

    return this.getPayrollRun(payrollRunId);
  }

  /**
   * Generate bank payout file (CSV format for NEFT/RTGS)
   */
  async generateBankFile(payrollRunId: UUID): Promise<string> {
    const db = getDb();
    const run = await this.getPayrollRun(payrollRunId);

    if (run.status !== 'PROCESSED' && run.status !== 'PAID') {
      throw new PayrollError('Payroll must be processed before generating bank file');
    }

    const slips = await db('payroll_slips')
      .join('employees', 'payroll_slips.employee_id', 'employees.id')
      .where({ 'payroll_slips.payroll_run_id': payrollRunId })
      .select(
        'employees.employee_code',
        'employees.first_name',
        'employees.last_name',
        'employees.bank_account_encrypted',
        'employees.bank_ifsc',
        'employees.bank_name',
        'payroll_slips.net_payable'
      );

    // Generate CSV
    const lines = ['Payment_Seq,Employee_Code,Employee_Name,Bank_Name,IFSC,Account_Number,Amount,Payment_Mode'];
    let seq = 1;
    for (const slip of slips) {
      lines.push([
        seq++,
        slip.employee_code,
        `${slip.first_name} ${slip.last_name}`,
        slip.bank_name || '',
        slip.bank_ifsc || '',
        slip.bank_account_encrypted || '',
        MoneyUtil.toRupees(parseInt(slip.net_payable)),
        'NEFT',
      ].join(','));
    }

    const csvContent = lines.join('\n');

    await eventBus.publish(
      'BANK_FILE_GENERATED',
      'PayrollRun',
      payrollRunId,
      { employeeCount: slips.length },
      { userId: run.createdBy, organizationId: run.organizationId }
    );

    return csvContent;
  }

  async getPayrollRun(id: UUID): Promise<PayrollRun> {
    const db = getDb();
    const row = await db('payroll_runs').where({ id }).first();
    if (!row) throw new NotFoundError('PayrollRun', id);
    return this.mapPayrollRun(row);
  }

  async getPayrollSlips(payrollRunId: UUID): Promise<PayrollSlip[]> {
    const db = getDb();
    const slips = await db('payroll_slips')
      .where({ payroll_run_id: payrollRunId })
      .orderBy('employee_id');

    const result: PayrollSlip[] = [];
    for (const slip of slips) {
      const components = await db('payroll_slip_components')
        .where({ payroll_slip_id: slip.id });

      result.push(this.mapPayrollSlip(slip, components));
    }

    return result;
  }

  async getEmployeePayslip(employeeId: UUID, month: number, year: number): Promise<PayrollSlip | null> {
    const db = getDb();
    const slip = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .where({
        'payroll_slips.employee_id': employeeId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
      })
      .select('payroll_slips.*')
      .first();

    if (!slip) return null;

    const components = await db('payroll_slip_components')
      .where({ payroll_slip_id: slip.id });

    return this.mapPayrollSlip(slip, components);
  }

  private mapPayrollRun(row: any): PayrollRun {
    return {
      id: row.id,
      organizationId: row.organization_id,
      outletId: row.outlet_id,
      periodType: row.period_type,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      month: row.month,
      year: row.year,
      status: row.status,
      totalGross: parseInt(row.total_gross || '0'),
      totalDeductions: parseInt(row.total_deductions || '0'),
      totalNet: parseInt(row.total_net || '0'),
      totalEmployerCost: parseInt(row.total_employer_cost || '0'),
      employeeCount: row.employee_count,
      processedAt: row.processed_at,
      processedBy: row.processed_by,
      approvedAt: row.approved_at,
      approvedBy: row.approved_by,
      journalEntryId: row.journal_entry_id,
      bankPayoutFileUrl: row.bank_payout_file_url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private mapPayrollSlip(row: any, components: any[]): PayrollSlip {
    const earnings = components.filter((c: any) => c.type === 'EARNING').map(this.mapSlipComponent);
    const deductions = components.filter((c: any) => c.type === 'DEDUCTION').map(this.mapSlipComponent);
    const employerContributions = components.filter((c: any) => c.type === 'EMPLOYER_CONTRIBUTION').map(this.mapSlipComponent);

    return {
      id: row.id,
      payrollRunId: row.payroll_run_id,
      employeeId: row.employee_id,
      outletId: row.outlet_id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      workingDays: row.working_days,
      presentDays: row.present_days,
      paidDays: parseFloat(row.paid_days),
      leaveDays: row.leave_days,
      overtimeHours: parseFloat(row.overtime_hours || '0'),
      earnings,
      totalEarnings: parseInt(row.total_earnings || '0'),
      deductions,
      totalDeductions: parseInt(row.total_deductions || '0'),
      netPayable: parseInt(row.net_payable || '0'),
      employerContributions,
      totalEmployerCost: parseInt(row.total_employer_cost || '0'),
      tipsReceived: parseInt(row.tips_received || '0'),
      serviceChargeShare: parseInt(row.service_charge_share || '0'),
      incentiveAmount: parseInt(row.incentive_amount || '0'),
      status: row.status,
      payslipPdfUrl: row.payslip_pdf_url,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  private mapSlipComponent(row: any): PayrollSlipComponent {
    return {
      componentId: row.component_id,
      componentCode: row.component_code,
      componentName: row.component_name,
      type: row.type,
      calculatedAmount: parseInt(row.calculated_amount || '0'),
      remarks: row.remarks,
    };
  }
}

export const payrollEngineService = new PayrollEngineService();
