import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate } from '../../common/types';

export interface PayrollSummaryByOutlet {
  outletId: UUID;
  outletName: string;
  employeeCount: number;
  totalGross: Money;
  totalDeductions: Money;
  totalNet: Money;
  totalEmployerCost: Money;
  payrollToRevenue?: number; // percentage
}

export interface EmployeeProductivityReport {
  employeeId: UUID;
  employeeName: string;
  department: string;
  designation: string;
  outletName: string;
  monthlySalary: Money;
  salesContribution?: Money;
  revenuePerEmployee?: Money;
  costToRevenueRatio?: number;
  overtimeHours: number;
  attendanceRate: number;
}

export interface PayrollVarianceReport {
  month: number;
  year: number;
  currentPeriod: Money;
  previousPeriod: Money;
  variance: Money;
  variancePercentage: number;
  newHires: number;
  exits: number;
  overtimeIncrease: Money;
}

export class ReportingService {
  /**
   * Payroll summary by outlet
   */
  async getPayrollSummaryByOutlet(
    organizationId: UUID,
    month: number,
    year: number
  ): Promise<PayrollSummaryByOutlet[]> {
    const db = getDb();

    const results = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .join('outlets', 'payroll_slips.outlet_id', 'outlets.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
      })
      .whereNot('payroll_runs.status', 'REVERSED')
      .groupBy('payroll_slips.outlet_id', 'outlets.name')
      .select(
        'payroll_slips.outlet_id',
        'outlets.name as outlet_name',
        db.raw('COUNT(payroll_slips.id) as employee_count'),
        db.raw('SUM(payroll_slips.total_earnings) as total_gross'),
        db.raw('SUM(payroll_slips.total_deductions) as total_deductions'),
        db.raw('SUM(payroll_slips.net_payable) as total_net'),
        db.raw('SUM(payroll_slips.total_employer_cost) as total_employer_cost')
      );

    return results.map((r: any) => ({
      outletId: r.outlet_id,
      outletName: r.outlet_name,
      employeeCount: parseInt(r.employee_count),
      totalGross: parseInt(r.total_gross || '0'),
      totalDeductions: parseInt(r.total_deductions || '0'),
      totalNet: parseInt(r.total_net || '0'),
      totalEmployerCost: parseInt(r.total_employer_cost || '0'),
    }));
  }

  /**
   * Payroll % to revenue report
   */
  async getPayrollToRevenueReport(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{
    outlets: {
      outletId: UUID;
      outletName: string;
      payrollCost: Money;
      revenue: Money;
      payrollPercentage: number;
    }[];
    overall: { payrollCost: Money; revenue: Money; payrollPercentage: number };
  }> {
    const db = getDb();

    // Get payroll cost by outlet
    const payrollData = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .join('outlets', 'payroll_slips.outlet_id', 'outlets.id')
      .where({ 'payroll_runs.organization_id': organizationId })
      .whereNot('payroll_runs.status', 'REVERSED')
      .whereBetween('payroll_runs.period_start', [periodStart, periodEnd])
      .groupBy('payroll_slips.outlet_id', 'outlets.name')
      .select(
        'payroll_slips.outlet_id',
        'outlets.name as outlet_name',
        db.raw('SUM(payroll_slips.total_earnings + payroll_slips.total_employer_cost) as payroll_cost')
      );

    // Get revenue by outlet from journal entries
    const revenueData = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
        'chart_of_accounts.type': 'REVENUE',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd])
      .groupBy('journal_entry_lines.outlet_id')
      .select(
        'journal_entry_lines.outlet_id',
        db.raw('SUM(journal_entry_lines.credit - journal_entry_lines.debit) as revenue')
      );

    const revenueMap = new Map<string, number>();
    for (const r of revenueData) {
      if (r.outlet_id) revenueMap.set(r.outlet_id, parseInt(r.revenue || '0'));
    }

    let totalPayroll = 0;
    let totalRevenue = 0;

    const outlets = payrollData.map((p: any) => {
      const payrollCost = parseInt(p.payroll_cost || '0');
      const revenue = revenueMap.get(p.outlet_id) || 0;
      const payrollPercentage = revenue > 0
        ? MoneyUtil.fromBasisPoints(Math.round((payrollCost / revenue) * 10000))
        : 0;

      totalPayroll = MoneyUtil.add(totalPayroll, payrollCost);
      totalRevenue = MoneyUtil.add(totalRevenue, revenue);

      return {
        outletId: p.outlet_id,
        outletName: p.outlet_name,
        payrollCost,
        revenue,
        payrollPercentage,
      };
    });

    return {
      outlets,
      overall: {
        payrollCost: totalPayroll,
        revenue: totalRevenue,
        payrollPercentage: totalRevenue > 0
          ? MoneyUtil.fromBasisPoints(Math.round((totalPayroll / totalRevenue) * 10000))
          : 0,
      },
    };
  }

  /**
   * Staff productivity vs payroll cost
   */
  async getStaffProductivityReport(
    organizationId: UUID,
    month: number,
    year: number
  ): Promise<EmployeeProductivityReport[]> {
    const db = getDb();

    const data = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .join('employees', 'payroll_slips.employee_id', 'employees.id')
      .join('outlets', 'payroll_slips.outlet_id', 'outlets.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
      })
      .whereNot('payroll_runs.status', 'REVERSED')
      .select(
        'employees.id as employee_id',
        db.raw("employees.first_name || ' ' || employees.last_name as employee_name"),
        'employees.department',
        'employees.designation',
        'outlets.name as outlet_name',
        'payroll_slips.total_earnings as monthly_salary',
        'payroll_slips.overtime_hours',
        'payroll_slips.working_days',
        'payroll_slips.present_days'
      );

    return data.map((d: any) => ({
      employeeId: d.employee_id,
      employeeName: d.employee_name,
      department: d.department,
      designation: d.designation,
      outletName: d.outlet_name,
      monthlySalary: parseInt(d.monthly_salary || '0'),
      overtimeHours: parseFloat(d.overtime_hours || '0'),
      attendanceRate: d.working_days > 0
        ? Math.round((d.present_days / d.working_days) * 100)
        : 0,
    }));
  }

  /**
   * Payroll variance analysis (month over month)
   */
  async getPayrollVarianceReport(
    organizationId: UUID,
    month: number,
    year: number
  ): Promise<PayrollVarianceReport> {
    const db = getDb();

    // Current period
    const currentRun = await db('payroll_runs')
      .where({ organization_id: organizationId, month, year })
      .whereNot('status', 'REVERSED')
      .first();

    // Previous period
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousRun = await db('payroll_runs')
      .where({ organization_id: organizationId, month: prevMonth, year: prevYear })
      .whereNot('status', 'REVERSED')
      .first();

    const currentPeriod = parseInt(currentRun?.total_net || '0');
    const previousPeriod = parseInt(previousRun?.total_net || '0');
    const variance = MoneyUtil.subtract(currentPeriod, previousPeriod);
    const variancePercentage = previousPeriod > 0
      ? MoneyUtil.fromBasisPoints(Math.round((variance / previousPeriod) * 10000))
      : 0;

    // Count new hires and exits this month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const newHires = await db('employees')
      .where({ organization_id: organizationId })
      .whereBetween('date_of_joining', [startDate, endDate])
      .count('id as count')
      .first();

    const exits = await db('employees')
      .where({ organization_id: organizationId })
      .whereBetween('date_of_exit', [startDate, endDate])
      .count('id as count')
      .first();

    // Overtime increase
    const currentOT = await db('payroll_slip_components')
      .join('payroll_slips', 'payroll_slip_components.payroll_slip_id', 'payroll_slips.id')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
        'payroll_slip_components.component_code': 'OT',
      })
      .sum('payroll_slip_components.calculated_amount as total')
      .first();

    const previousOT = await db('payroll_slip_components')
      .join('payroll_slips', 'payroll_slip_components.payroll_slip_id', 'payroll_slips.id')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': prevMonth,
        'payroll_runs.year': prevYear,
        'payroll_slip_components.component_code': 'OT',
      })
      .sum('payroll_slip_components.calculated_amount as total')
      .first();

    const overtimeIncrease = MoneyUtil.subtract(
      parseInt(currentOT?.total || '0'),
      parseInt(previousOT?.total || '0')
    );

    return {
      month,
      year,
      currentPeriod,
      previousPeriod,
      variance,
      variancePercentage,
      newHires: parseInt(String(newHires?.count || '0')),
      exits: parseInt(String(exits?.count || '0')),
      overtimeIncrease,
    };
  }

  /**
   * Overtime analytics
   */
  async getOvertimeAnalytics(
    organizationId: UUID,
    month: number,
    year: number
  ): Promise<{
    totalOvertimeHours: number;
    totalOvertimeCost: Money;
    byDepartment: { department: string; hours: number; cost: Money }[];
    byOutlet: { outletId: UUID; outletName: string; hours: number; cost: Money }[];
    topEmployees: { employeeId: UUID; name: string; hours: number; cost: Money }[];
  }> {
    const db = getDb();

    const data = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .join('employees', 'payroll_slips.employee_id', 'employees.id')
      .join('outlets', 'payroll_slips.outlet_id', 'outlets.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
      })
      .where('payroll_slips.overtime_hours', '>', 0)
      .select(
        'employees.id as employee_id',
        db.raw("employees.first_name || ' ' || employees.last_name as employee_name"),
        'employees.department',
        'payroll_slips.outlet_id',
        'outlets.name as outlet_name',
        'payroll_slips.overtime_hours'
      );

    // Get OT cost components
    const otCosts = await db('payroll_slip_components')
      .join('payroll_slips', 'payroll_slip_components.payroll_slip_id', 'payroll_slips.id')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
        'payroll_slip_components.component_code': 'OT',
      })
      .select('payroll_slips.employee_id', 'payroll_slip_components.calculated_amount');

    const costMap = new Map<string, number>();
    for (const c of otCosts) {
      costMap.set(c.employee_id, parseInt(c.calculated_amount || '0'));
    }

    let totalOvertimeHours = 0;
    let totalOvertimeCost = 0;
    const deptMap = new Map<string, { hours: number; cost: number }>();
    const outletMap = new Map<string, { outletName: string; hours: number; cost: number }>();

    const employees: { employeeId: UUID; name: string; hours: number; cost: Money }[] = [];

    for (const d of data) {
      const hours = parseFloat(d.overtime_hours);
      const cost = costMap.get(d.employee_id) || 0;
      totalOvertimeHours += hours;
      totalOvertimeCost = MoneyUtil.add(totalOvertimeCost, cost);

      // By department
      const dept = deptMap.get(d.department) || { hours: 0, cost: 0 };
      dept.hours += hours;
      dept.cost = MoneyUtil.add(dept.cost, cost);
      deptMap.set(d.department, dept);

      // By outlet
      const outlet = outletMap.get(d.outlet_id) || { outletName: d.outlet_name, hours: 0, cost: 0 };
      outlet.hours += hours;
      outlet.cost = MoneyUtil.add(outlet.cost, cost);
      outletMap.set(d.outlet_id, outlet);

      employees.push({
        employeeId: d.employee_id,
        name: d.employee_name,
        hours,
        cost,
      });
    }

    // Sort employees by hours desc, take top 10
    employees.sort((a, b) => b.hours - a.hours);

    return {
      totalOvertimeHours,
      totalOvertimeCost,
      byDepartment: Array.from(deptMap.entries()).map(([department, v]) => ({
        department,
        hours: v.hours,
        cost: v.cost,
      })),
      byOutlet: Array.from(outletMap.entries()).map(([outletId, v]) => ({
        outletId,
        outletName: v.outletName,
        hours: v.hours,
        cost: v.cost,
      })),
      topEmployees: employees.slice(0, 10),
    };
  }

  /**
   * Salary register (statutory format)
   */
  async getSalaryRegister(
    organizationId: UUID,
    month: number,
    year: number
  ): Promise<any[]> {
    const db = getDb();

    const slips = await db('payroll_slips')
      .join('payroll_runs', 'payroll_slips.payroll_run_id', 'payroll_runs.id')
      .join('employees', 'payroll_slips.employee_id', 'employees.id')
      .join('outlets', 'payroll_slips.outlet_id', 'outlets.id')
      .where({
        'payroll_runs.organization_id': organizationId,
        'payroll_runs.month': month,
        'payroll_runs.year': year,
      })
      .whereNot('payroll_runs.status', 'REVERSED')
      .select(
        'employees.employee_code',
        db.raw("employees.first_name || ' ' || employees.last_name as employee_name"),
        'employees.department',
        'employees.designation',
        'employees.uan',
        'employees.esic_number',
        'employees.pan',
        'outlets.name as outlet_name',
        'payroll_slips.*'
      )
      .orderBy('employees.employee_code');

    const register = [];
    for (const slip of slips) {
      const components = await db('payroll_slip_components')
        .where({ payroll_slip_id: slip.id });

      const componentMap: Record<string, number> = {};
      for (const c of components) {
        componentMap[c.component_code] = parseInt(c.calculated_amount || '0');
      }

      register.push({
        employeeCode: slip.employee_code,
        employeeName: slip.employee_name,
        department: slip.department,
        designation: slip.designation,
        outletName: slip.outlet_name,
        uan: slip.uan,
        esicNumber: slip.esic_number,
        pan: slip.pan,
        workingDays: slip.working_days,
        presentDays: slip.present_days,
        paidDays: parseFloat(slip.paid_days),
        basic: componentMap['BASIC'] || 0,
        hra: componentMap['HRA'] || 0,
        specialAllowance: componentMap['SPECIAL'] || 0,
        overtimePay: componentMap['OT'] || 0,
        totalEarnings: parseInt(slip.total_earnings),
        pfEmployee: componentMap['PF_EE'] || 0,
        esiEmployee: componentMap['ESI_EE'] || 0,
        professionalTax: componentMap['PT'] || 0,
        tds: componentMap['TDS'] || 0,
        totalDeductions: parseInt(slip.total_deductions),
        netPayable: parseInt(slip.net_payable),
        pfEmployer: componentMap['PF_ER'] || 0,
        esiEmployer: componentMap['ESI_ER'] || 0,
        tips: parseInt(slip.tips_received || '0'),
        serviceCharge: parseInt(slip.service_charge_share || '0'),
        incentive: parseInt(slip.incentive_amount || '0'),
      });
    }

    return register;
  }
}

export const reportingService = new ReportingService();
