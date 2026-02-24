import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { ComplianceError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { UUID, Money, Percentage, IndianState } from '../../common/types';

// ============================================================
// STATUTORY COMPLIANCE ENGINE - India
// PF, ESI, Professional Tax, TDS
// ============================================================

export interface ComplianceCalculationInput {
  employeeId: UUID;
  organizationId: UUID;
  basicMonthly: Money;
  grossMonthly: Money;
  state: IndianState;
  uan?: string;
  esicNumber?: string;
  pan?: string;
  regime: 'OLD' | 'NEW';
  financialYear: string;
  annualTaxableIncome?: Money;
  section80CDeductions?: Money;
  section80DDeductions?: Money;
  otherDeductions?: Money;
  hraExemption?: Money;
}

export interface ComplianceResult {
  pf: {
    employeeContribution: Money;
    employerEPF: Money;
    employerEPS: Money;
    totalEmployerContribution: Money;
    adminCharges: Money;
    edliCharges: Money;
    pfWages: Money;
    isApplicable: boolean;
  };
  esi: {
    employeeContribution: Money;
    employerContribution: Money;
    esiWages: Money;
    isApplicable: boolean;
  };
  professionalTax: {
    amount: Money;
    state: IndianState;
    isApplicable: boolean;
  };
  tds: {
    monthlyTds: Money;
    annualProjectedTax: Money;
    regime: 'OLD' | 'NEW';
    isApplicable: boolean;
  };
  totalEmployeeDeductions: Money;
  totalEmployerContributions: Money;
}

export class ComplianceService {
  // ---- PF Calculation ----
  async calculatePF(
    organizationId: UUID,
    basicMonthly: Money
  ): Promise<ComplianceResult['pf']> {
    const db = getDb();
    const pfConfig = await db('pf_config')
      .where({ organization_id: organizationId, is_active: true })
      .first();

    if (!pfConfig) {
      return {
        employeeContribution: 0,
        employerEPF: 0,
        employerEPS: 0,
        totalEmployerContribution: 0,
        adminCharges: 0,
        edliCharges: 0,
        pfWages: 0,
        isApplicable: false,
      };
    }

    // PF wages = min(basic, ceiling) unless voluntary above ceiling
    const ceiling = parseInt(pfConfig.wages_ceiling);
    const pfWages = pfConfig.voluntary_above_ceiling
      ? basicMonthly
      : Math.min(basicMonthly, ceiling);

    // Employee PF contribution (12% of PF wages)
    const employeeContribution = MoneyUtil.percentage(pfWages, pfConfig.employee_contribution_rate);

    // Employer EPS (8.33% of PF wages, max ₹15000 base)
    const epsWages = Math.min(pfWages, ceiling);
    const employerEPS = MoneyUtil.percentage(epsWages, pfConfig.eps_rate);

    // Employer EPF (12% - EPS rate = 3.67%)
    const employerEPF = MoneyUtil.subtract(
      MoneyUtil.percentage(pfWages, pfConfig.employer_contribution_rate),
      employerEPS
    );

    // Admin charges (0.50%)
    const adminCharges = MoneyUtil.percentage(pfWages, pfConfig.admin_charges);

    // EDLI charges (0.50%)
    const edliCharges = MoneyUtil.percentage(pfWages, pfConfig.edli_charges);

    const totalEmployerContribution = MoneyUtil.sum([employerEPF, employerEPS, adminCharges, edliCharges]);

    return {
      employeeContribution,
      employerEPF,
      employerEPS,
      totalEmployerContribution,
      adminCharges,
      edliCharges,
      pfWages,
      isApplicable: true,
    };
  }

  // ---- ESI Calculation ----
  async calculateESI(
    organizationId: UUID,
    grossMonthly: Money
  ): Promise<ComplianceResult['esi']> {
    const db = getDb();
    const esiConfig = await db('esi_config')
      .where({ organization_id: organizationId, is_active: true })
      .first();

    if (!esiConfig) {
      return {
        employeeContribution: 0,
        employerContribution: 0,
        esiWages: 0,
        isApplicable: false,
      };
    }

    const ceiling = parseInt(esiConfig.wages_ceiling);

    // ESI is applicable only if gross <= ₹21,000
    if (grossMonthly > ceiling) {
      return {
        employeeContribution: 0,
        employerContribution: 0,
        esiWages: grossMonthly,
        isApplicable: false,
      };
    }

    // Employee: 0.75%, Employer: 3.25%
    const employeeContribution = MoneyUtil.percentage(grossMonthly, esiConfig.employee_contribution_rate);
    const employerContribution = MoneyUtil.percentage(grossMonthly, esiConfig.employer_contribution_rate);

    return {
      employeeContribution,
      employerContribution,
      esiWages: grossMonthly,
      isApplicable: true,
    };
  }

  // ---- Professional Tax ----
  async calculateProfessionalTax(
    state: IndianState,
    grossMonthly: Money
  ): Promise<ComplianceResult['professionalTax']> {
    const db = getDb();

    // Convert to rupees for slab comparison (slabs stored in paisa)
    const slabs = await db('professional_tax_slabs')
      .where({ state, is_active: true, frequency: 'MONTHLY' })
      .orderBy('from_amount', 'asc');

    if (slabs.length === 0) {
      // Fallback: check annual slabs
      return { amount: 0, state, isApplicable: false };
    }

    for (const slab of slabs) {
      const fromAmount = parseInt(slab.from_amount);
      const toAmount = parseInt(slab.to_amount);
      if (grossMonthly >= fromAmount && grossMonthly <= toAmount) {
        return {
          amount: parseInt(slab.tax_amount),
          state,
          isApplicable: true,
        };
      }
    }

    // If gross exceeds all slabs, use the last slab's tax
    if (slabs.length > 0) {
      return {
        amount: parseInt(slabs[slabs.length - 1].tax_amount),
        state,
        isApplicable: true,
      };
    }

    return { amount: 0, state, isApplicable: false };
  }

  // ---- TDS (Income Tax) ----
  async calculateTDS(
    regime: 'OLD' | 'NEW',
    financialYear: string,
    annualTaxableIncome: Money,
    remainingMonths: number = 12
  ): Promise<ComplianceResult['tds']> {
    const db = getDb();

    const slabs = await db('tds_slabs')
      .where({ regime, financial_year: financialYear, is_active: true })
      .orderBy('from_amount', 'asc');

    if (slabs.length === 0) {
      return { monthlyTds: 0, annualProjectedTax: 0, regime, isApplicable: false };
    }

    let annualTax = 0;
    let cessRate = 400; // 4% cess

    for (const slab of slabs) {
      const fromAmount = parseInt(slab.from_amount);
      const toAmount = parseInt(slab.to_amount);
      const rate = slab.rate;
      cessRate = slab.cess_rate;

      if (annualTaxableIncome <= fromAmount) break;

      const taxableInSlab = Math.min(annualTaxableIncome, toAmount) - fromAmount;
      if (taxableInSlab > 0) {
        annualTax = MoneyUtil.add(annualTax, MoneyUtil.percentage(taxableInSlab, rate));
      }
    }

    // Add cess (4% on tax)
    const cess = MoneyUtil.percentage(annualTax, cessRate);
    const totalAnnualTax = MoneyUtil.add(annualTax, cess);

    // Monthly TDS = annual tax / remaining months
    const monthlyTds = remainingMonths > 0
      ? MoneyUtil.divide(totalAnnualTax, remainingMonths)
      : 0;

    return {
      monthlyTds,
      annualProjectedTax: totalAnnualTax,
      regime,
      isApplicable: totalAnnualTax > 0,
    };
  }

  // ---- Combined Compliance Calculation ----
  async calculateAll(input: ComplianceCalculationInput): Promise<ComplianceResult> {
    const [pf, esi, professionalTax, tds] = await Promise.all([
      this.calculatePF(input.organizationId, input.basicMonthly),
      this.calculateESI(input.organizationId, input.grossMonthly),
      this.calculateProfessionalTax(input.state, input.grossMonthly),
      this.calculateTDS(
        input.regime,
        input.financialYear,
        input.annualTaxableIncome || MoneyUtil.multiply(input.grossMonthly, 12)
      ),
    ]);

    const totalEmployeeDeductions = MoneyUtil.sum([
      pf.employeeContribution,
      esi.employeeContribution,
      professionalTax.amount,
      tds.monthlyTds,
    ]);

    const totalEmployerContributions = MoneyUtil.sum([
      pf.totalEmployerContribution,
      esi.employerContribution,
    ]);

    return {
      pf,
      esi,
      professionalTax,
      tds,
      totalEmployeeDeductions,
      totalEmployerContributions,
    };
  }

  // ---- Seed Default Slabs ----
  async seedDefaultSlabs(organizationId: UUID): Promise<void> {
    const db = getDb();

    // Seed PF config
    const existingPF = await db('pf_config').where({ organization_id: organizationId }).first();
    if (!existingPF) {
      await db('pf_config').insert({
        id: require('uuid').v4(),
        organization_id: organizationId,
        employee_contribution_rate: 1200,
        employer_contribution_rate: 1200,
        eps_rate: 833,
        epf_rate: 367,
        admin_charges: 50,
        edli_charges: 50,
        wages_ceiling: 1500000, // ₹15,000
        voluntary_above_ceiling: false,
        effective_from: '2024-04-01',
        is_active: true,
      });
    }

    // Seed ESI config
    const existingESI = await db('esi_config').where({ organization_id: organizationId }).first();
    if (!existingESI) {
      await db('esi_config').insert({
        id: require('uuid').v4(),
        organization_id: organizationId,
        employee_contribution_rate: 75,
        employer_contribution_rate: 325,
        wages_ceiling: 2100000, // ₹21,000
        effective_from: '2024-04-01',
        is_active: true,
      });
    }

    // Seed Professional Tax for Maharashtra
    const existingPT = await db('professional_tax_slabs').where({ state: 'MH' }).first();
    if (!existingPT) {
      const ptSlabs = [
        { state: 'MH', from_amount: 0, to_amount: 750000, tax_amount: 0, frequency: 'MONTHLY' },
        { state: 'MH', from_amount: 750001, to_amount: 1000000, tax_amount: 17500, frequency: 'MONTHLY' },
        { state: 'MH', from_amount: 1000001, to_amount: 99999999999, tax_amount: 20000, frequency: 'MONTHLY' },
        // Karnataka
        { state: 'KA', from_amount: 0, to_amount: 1500000, tax_amount: 0, frequency: 'MONTHLY' },
        { state: 'KA', from_amount: 1500001, to_amount: 99999999999, tax_amount: 20000, frequency: 'MONTHLY' },
        // Delhi (no PT)
        // Tamil Nadu
        { state: 'TN', from_amount: 0, to_amount: 2100000, tax_amount: 0, frequency: 'MONTHLY' },
        { state: 'TN', from_amount: 2100001, to_amount: 3000000, tax_amount: 13500, frequency: 'MONTHLY' },
        { state: 'TN', from_amount: 3000001, to_amount: 4500000, tax_amount: 22500, frequency: 'MONTHLY' },
        { state: 'TN', from_amount: 4500001, to_amount: 6000000, tax_amount: 37500, frequency: 'MONTHLY' },
        { state: 'TN', from_amount: 6000001, to_amount: 99999999999, tax_amount: 50000, frequency: 'MONTHLY' },
      ];

      for (const slab of ptSlabs) {
        await db('professional_tax_slabs').insert({
          id: require('uuid').v4(),
          ...slab,
          is_active: true,
        });
      }
    }

    // Seed TDS slabs for FY 2024-25 (New Regime)
    const existingTDS = await db('tds_slabs').where({ financial_year: '2024-25' }).first();
    if (!existingTDS) {
      const tdsSlabs = [
        // New Regime FY 2024-25
        { regime: 'NEW', financial_year: '2024-25', from_amount: 0, to_amount: 30000000, rate: 0, cess_rate: 400 },
        { regime: 'NEW', financial_year: '2024-25', from_amount: 30000001, to_amount: 70000000, rate: 500, cess_rate: 400 },
        { regime: 'NEW', financial_year: '2024-25', from_amount: 70000001, to_amount: 100000000, rate: 1000, cess_rate: 400 },
        { regime: 'NEW', financial_year: '2024-25', from_amount: 100000001, to_amount: 120000000, rate: 1500, cess_rate: 400 },
        { regime: 'NEW', financial_year: '2024-25', from_amount: 120000001, to_amount: 150000000, rate: 2000, cess_rate: 400 },
        { regime: 'NEW', financial_year: '2024-25', from_amount: 150000001, to_amount: 99999999999, rate: 3000, cess_rate: 400 },
        // Old Regime FY 2024-25
        { regime: 'OLD', financial_year: '2024-25', from_amount: 0, to_amount: 25000000, rate: 0, cess_rate: 400 },
        { regime: 'OLD', financial_year: '2024-25', from_amount: 25000001, to_amount: 50000000, rate: 500, cess_rate: 400 },
        { regime: 'OLD', financial_year: '2024-25', from_amount: 50000001, to_amount: 100000000, rate: 2000, cess_rate: 400 },
        { regime: 'OLD', financial_year: '2024-25', from_amount: 100000001, to_amount: 99999999999, rate: 3000, cess_rate: 400 },
      ];

      for (const slab of tdsSlabs) {
        await db('tds_slabs').insert({
          id: require('uuid').v4(),
          ...slab,
          is_active: true,
        });
      }
    }

    logger.info(`Default compliance slabs seeded for organization ${organizationId}`);
  }
}

export const complianceService = new ComplianceService();
