import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate, ProfitAndLoss } from '../../common/types';

export class PnLService {
  /**
   * Generate P&L statement for an organization or specific outlet
   */
  async generatePnL(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate,
    outletId?: UUID
  ): Promise<ProfitAndLoss> {
    const db = getDb();

    // Get all posted journal entry lines for the period
    let query = db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd]);

    if (outletId) {
      query = query.where('journal_entry_lines.outlet_id', outletId);
    }

    const entries = await query.select(
      'chart_of_accounts.code',
      'chart_of_accounts.name',
      'chart_of_accounts.type',
      'chart_of_accounts.sub_type',
      db.raw('SUM(journal_entry_lines.debit) as total_debit'),
      db.raw('SUM(journal_entry_lines.credit) as total_credit')
    ).groupBy('chart_of_accounts.code', 'chart_of_accounts.name', 'chart_of_accounts.type', 'chart_of_accounts.sub_type');

    // Build P&L from aggregated accounts
    const getBalance = (code: string): Money => {
      const entry = entries.find((e: any) => e.code === code);
      if (!entry) return 0;
      const type = entry.type;
      // Revenue: credit normal, Expense: debit normal
      if (type === 'REVENUE') return parseInt(entry.total_credit || '0') - parseInt(entry.total_debit || '0');
      if (type === 'EXPENSE') return parseInt(entry.total_debit || '0') - parseInt(entry.total_credit || '0');
      return 0;
    };

    const getSubTypeBalance = (subType: string, isRevenue: boolean): Money => {
      const matching = entries.filter((e: any) => e.sub_type === subType);
      return matching.reduce((sum: number, e: any) => {
        if (isRevenue) return sum + (parseInt(e.total_credit || '0') - parseInt(e.total_debit || '0'));
        return sum + (parseInt(e.total_debit || '0') - parseInt(e.total_credit || '0'));
      }, 0);
    };

    // Revenue
    const foodSales = getBalance('4100');
    const beverageSales = getBalance('4200');
    const liquorSales = getBalance('4300');
    const serviceCharge = getBalance('4400');
    const otherIncome = MoneyUtil.add(
      getBalance('4500'),
      MoneyUtil.add(getBalance('4600'), getBalance('4900'))
    );
    const totalRevenue = MoneyUtil.sum([foodSales, beverageSales, liquorSales, serviceCharge, otherIncome]);

    // COGS
    const foodCOGS = getBalance('5100');
    const beverageCOGS = getBalance('5200');
    const liquorCOGS = getBalance('5300');
    const totalCOGS = MoneyUtil.sum([foodCOGS, beverageCOGS, liquorCOGS, getBalance('5400')]);

    // Gross Profit
    const grossProfit = MoneyUtil.subtract(totalRevenue, totalCOGS);
    const grossMargin = totalRevenue > 0
      ? Math.round((grossProfit / totalRevenue) * 10000)
      : 0;

    // Payroll (6xxx)
    const payrollCost = getSubTypeBalance('PAYROLL_EXPENSE', false);

    // Operating expenses (7xxx)
    const rent = getBalance('7100');
    const utilities = getBalance('7200');
    const marketing = getBalance('7300');
    const repairs = getBalance('7400');
    const depreciation = getBalance('7500');
    const insurance = getBalance('7600');
    const licensesFees = getBalance('7700');
    const technology = getBalance('7800');
    const otherExpenses = getSubTypeBalance('ADMIN_EXPENSE', false);
    const totalOperatingExpenses = MoneyUtil.sum([
      payrollCost, rent, utilities, marketing, repairs,
      depreciation, insurance, licensesFees, technology, otherExpenses,
    ]);

    // Operating Profit
    const operatingProfit = MoneyUtil.subtract(grossProfit, totalOperatingExpenses);
    const operatingMargin = totalRevenue > 0
      ? Math.round((operatingProfit / totalRevenue) * 10000)
      : 0;

    // Other expenses
    const interestExpense = getBalance('8400');
    const taxes = 0; // Income tax handled separately
    const totalOtherExpenses = MoneyUtil.add(interestExpense, taxes);

    // Net Profit
    const netProfit = MoneyUtil.subtract(operatingProfit, totalOtherExpenses);
    const netMargin = totalRevenue > 0
      ? Math.round((netProfit / totalRevenue) * 10000)
      : 0;

    // Key restaurant ratios
    const foodCostPct = (foodSales > 0)
      ? Math.round((foodCOGS / foodSales) * 10000) : 0;
    const bevCostPct = (beverageSales > 0)
      ? Math.round((beverageCOGS / beverageSales) * 10000) : 0;
    const laborCostPct = (totalRevenue > 0)
      ? Math.round((payrollCost / totalRevenue) * 10000) : 0;
    const primeCostPct = (totalRevenue > 0)
      ? Math.round(((totalCOGS + payrollCost) / totalRevenue) * 10000) : 0;
    const occupancyCostPct = (totalRevenue > 0)
      ? Math.round((rent / totalRevenue) * 10000) : 0;

    // Get employee count for revenue per employee
    let empQuery = db('employees')
      .where({ organization_id: organizationId, is_active: true });
    if (outletId) empQuery = empQuery.where({ primary_outlet_id: outletId });
    const empCount = await empQuery.count('id as count').first();
    const employeeCount = parseInt(String(empCount?.count || '1'), 10) || 1;

    const revenuePerEmployee = MoneyUtil.divide(totalRevenue, employeeCount);

    const pnl: ProfitAndLoss = {
      organizationId,
      outletId,
      periodStart,
      periodEnd,
      revenue: {
        foodSales,
        beverageSales,
        liquorSales,
        serviceCharge,
        otherIncome,
        totalRevenue,
      },
      costOfGoodsSold: {
        foodCOGS,
        beverageCOGS,
        liquorCOGS,
        totalCOGS,
      },
      grossProfit,
      grossMargin,
      operatingExpenses: {
        payrollCost,
        rent,
        utilities,
        marketing,
        repairs,
        depreciation,
        insurance,
        licensesFees,
        technology,
        otherExpenses,
        totalOperatingExpenses,
      },
      operatingProfit,
      operatingMargin,
      otherExpenses: {
        interestExpense,
        taxes,
        totalOtherExpenses,
      },
      netProfit,
      netMargin,
      ratios: {
        foodCostPercentage: foodCostPct,
        beverageCostPercentage: bevCostPct,
        laborCostPercentage: laborCostPct,
        primeCostPercentage: primeCostPct,
        occupancyCostPercentage: occupancyCostPct,
        revenuePerEmployee,
        coversPerDay: 0, // Requires POS integration
        averageTicketSize: 0, // Requires POS integration
      },
    };

    logger.info(`P&L generated`, {
      periodStart,
      periodEnd,
      outletId,
      netProfit: MoneyUtil.formatINR(netProfit),
    });

    return pnl;
  }

  /**
   * Consolidated P&L across all outlets
   */
  async generateConsolidatedPnL(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{
    consolidated: ProfitAndLoss;
    byOutlet: { outletId: UUID; outletName: string; pnl: ProfitAndLoss }[];
  }> {
    const db = getDb();

    // Get all outlets
    const outlets = await db('outlets')
      .where({ organization_id: organizationId, is_active: true });

    const byOutlet: { outletId: UUID; outletName: string; pnl: ProfitAndLoss }[] = [];

    for (const outlet of outlets) {
      const pnl = await this.generatePnL(organizationId, periodStart, periodEnd, outlet.id);
      byOutlet.push({
        outletId: outlet.id,
        outletName: outlet.name,
        pnl,
      });
    }

    // Generate consolidated (no outlet filter)
    const consolidated = await this.generatePnL(organizationId, periodStart, periodEnd);

    logger.info(`Consolidated P&L generated`, {
      outletCount: outlets.length,
      netProfit: MoneyUtil.formatINR(consolidated.netProfit),
    });

    return { consolidated, byOutlet };
  }
}

export const pnlService = new PnLService();
