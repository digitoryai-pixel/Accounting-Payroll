import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate, AccountType } from '../../common/types';

// ============================================================
// LEDGER SERVICE - Tally-equivalent functionality
// Full double-entry ledger with Day Book, Cash Book, Bank Book,
// Balance Sheet, Receivables/Payables, GST Reports
// ============================================================

export interface LedgerEntry {
  date: ISODate;
  entryNumber: string;
  source: string;
  description: string;
  debit: Money;
  credit: Money;
  runningBalance: Money;
  outletName?: string;
  costCenterName?: string;
}

export interface DayBookEntry {
  date: ISODate;
  entryNumber: string;
  source: string;
  description: string;
  accounts: {
    accountCode: string;
    accountName: string;
    debit: Money;
    credit: Money;
  }[];
  totalDebit: Money;
  totalCredit: Money;
}

export interface BalanceSheetSection {
  title: string;
  accounts: {
    code: string;
    name: string;
    balance: Money;
    children?: { code: string; name: string; balance: Money }[];
  }[];
  total: Money;
}

export interface BalanceSheet {
  asOfDate: ISODate;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: Money;
  totalLiabilitiesAndEquity: Money;
  isBalanced: boolean;
}

export interface CashFlowEntry {
  date: ISODate;
  entryNumber: string;
  description: string;
  inflow: Money;
  outflow: Money;
  balance: Money;
  source: string;
}

export interface ReceivablePayableEntry {
  partyName: string;
  invoiceNumber?: string;
  date: ISODate;
  dueDate?: ISODate;
  amount: Money;
  paid: Money;
  outstanding: Money;
  agingDays: number;
  outletName?: string;
}

export interface GSTReport {
  period: string;
  outwardSupplies: {
    taxableValue: Money;
    cgst: Money;
    sgst: Money;
    igst: Money;
    totalTax: Money;
  };
  inwardSupplies: {
    taxableValue: Money;
    cgstCredit: Money;
    sgstCredit: Money;
    igstCredit: Money;
    totalCredit: Money;
  };
  netPayable: {
    cgst: Money;
    sgst: Money;
    igst: Money;
    total: Money;
  };
}

export class LedgerService {
  /**
   * Account Ledger - detailed transaction history for any account
   * (Equivalent to Tally's Ledger view)
   */
  async getAccountLedger(
    organizationId: UUID,
    accountCode: string,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{ accountName: string; accountType: AccountType; openingBalance: Money; entries: LedgerEntry[]; closingBalance: Money }> {
    const db = getDb();

    // Get account
    const account = await db('chart_of_accounts')
      .where({ organization_id: organizationId, code: accountCode })
      .first();

    if (!account) throw new Error(`Account ${accountCode} not found`);

    // Calculate opening balance (all transactions before periodStart)
    const openingData = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .where({
        'journal_entry_lines.account_id': account.id,
        'journal_entries.status': 'POSTED',
      })
      .where('journal_entries.date', '<', periodStart)
      .select(
        db.raw('COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit'),
        db.raw('COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit')
      )
      .first();

    const openingDebit = parseInt(openingData?.total_debit || '0');
    const openingCredit = parseInt(openingData?.total_credit || '0');
    let openingBalance = this.calculateNetBalance(account.type, openingDebit, openingCredit);

    // Get period transactions
    const transactions = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .leftJoin('outlets', 'journal_entry_lines.outlet_id', 'outlets.id')
      .leftJoin('cost_centers', 'journal_entry_lines.cost_center_id', 'cost_centers.id')
      .where({
        'journal_entry_lines.account_id': account.id,
        'journal_entries.status': 'POSTED',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd])
      .orderBy('journal_entries.date', 'asc')
      .orderBy('journal_entries.entry_number', 'asc')
      .select(
        'journal_entries.date',
        'journal_entries.entry_number',
        'journal_entries.source',
        'journal_entries.description',
        'journal_entry_lines.debit',
        'journal_entry_lines.credit',
        'journal_entry_lines.description as line_description',
        'outlets.name as outlet_name',
        'cost_centers.name as cost_center_name'
      );

    let runningBalance = openingBalance;
    const entries: LedgerEntry[] = transactions.map((t: any) => {
      const debit = parseInt(t.debit || '0');
      const credit = parseInt(t.credit || '0');
      const change = this.calculateNetBalance(account.type, debit, credit);
      runningBalance = MoneyUtil.add(runningBalance, change);

      return {
        date: t.date,
        entryNumber: t.entry_number,
        source: t.source,
        description: t.line_description || t.description,
        debit,
        credit,
        runningBalance,
        outletName: t.outlet_name,
        costCenterName: t.cost_center_name,
      };
    });

    return {
      accountName: account.name,
      accountType: account.type,
      openingBalance,
      entries,
      closingBalance: runningBalance,
    };
  }

  /**
   * Day Book - all journal entries for a specific date
   * (Equivalent to Tally's Day Book)
   */
  async getDayBook(
    organizationId: UUID,
    date: ISODate
  ): Promise<DayBookEntry[]> {
    const db = getDb();

    const entries = await db('journal_entries')
      .where({
        organization_id: organizationId,
        date,
        status: 'POSTED',
        is_active: true,
      })
      .orderBy('entry_number');

    const dayBook: DayBookEntry[] = [];

    for (const entry of entries) {
      const lines = await db('journal_entry_lines')
        .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
        .where({ journal_entry_id: entry.id })
        .select(
          'chart_of_accounts.code as account_code',
          'chart_of_accounts.name as account_name',
          'journal_entry_lines.debit',
          'journal_entry_lines.credit'
        );

      dayBook.push({
        date: entry.date,
        entryNumber: entry.entry_number,
        source: entry.source,
        description: entry.description,
        accounts: lines.map((l: any) => ({
          accountCode: l.account_code,
          accountName: l.account_name,
          debit: parseInt(l.debit || '0'),
          credit: parseInt(l.credit || '0'),
        })),
        totalDebit: parseInt(entry.total_debit),
        totalCredit: parseInt(entry.total_credit),
      });
    }

    return dayBook;
  }

  /**
   * Cash Book - all cash transactions
   * (Equivalent to Tally's Cash Book)
   */
  async getCashBook(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{ openingBalance: Money; entries: CashFlowEntry[]; closingBalance: Money; totalInflow: Money; totalOutflow: Money }> {
    return this.getBookForAccount(organizationId, '1110', periodStart, periodEnd);
  }

  /**
   * Bank Book - all bank transactions
   * (Equivalent to Tally's Bank Book)
   */
  async getBankBook(
    organizationId: UUID,
    accountCode: string, // e.g., '1120' for primary bank, '1130' for payroll bank
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{ openingBalance: Money; entries: CashFlowEntry[]; closingBalance: Money; totalInflow: Money; totalOutflow: Money }> {
    return this.getBookForAccount(organizationId, accountCode, periodStart, periodEnd);
  }

  private async getBookForAccount(
    organizationId: UUID,
    accountCode: string,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{ openingBalance: Money; entries: CashFlowEntry[]; closingBalance: Money; totalInflow: Money; totalOutflow: Money }> {
    const ledger = await this.getAccountLedger(organizationId, accountCode, periodStart, periodEnd);

    let totalInflow = 0;
    let totalOutflow = 0;

    const entries: CashFlowEntry[] = ledger.entries.map((e) => {
      const inflow = e.debit; // Debit to cash/bank = inflow
      const outflow = e.credit; // Credit to cash/bank = outflow
      totalInflow = MoneyUtil.add(totalInflow, inflow);
      totalOutflow = MoneyUtil.add(totalOutflow, outflow);

      return {
        date: e.date,
        entryNumber: e.entryNumber,
        description: e.description,
        inflow,
        outflow,
        balance: e.runningBalance,
        source: e.source,
      };
    });

    return {
      openingBalance: ledger.openingBalance,
      entries,
      closingBalance: ledger.closingBalance,
      totalInflow,
      totalOutflow,
    };
  }

  /**
   * Balance Sheet
   * (Equivalent to Tally's Balance Sheet)
   */
  async getBalanceSheet(
    organizationId: UUID,
    asOfDate: ISODate
  ): Promise<BalanceSheet> {
    const db = getDb();

    // Get all account balances as of date
    const balances = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
      })
      .where('journal_entries.date', '<=', asOfDate)
      .groupBy(
        'chart_of_accounts.id',
        'chart_of_accounts.code',
        'chart_of_accounts.name',
        'chart_of_accounts.type',
        'chart_of_accounts.sub_type',
        'chart_of_accounts.parent_account_id'
      )
      .select(
        'chart_of_accounts.id',
        'chart_of_accounts.code',
        'chart_of_accounts.name',
        'chart_of_accounts.type',
        'chart_of_accounts.sub_type',
        'chart_of_accounts.parent_account_id',
        db.raw('COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit'),
        db.raw('COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit')
      )
      .orderBy('chart_of_accounts.code');

    const buildSection = (type: AccountType, title: string): BalanceSheetSection => {
      const accounts = balances
        .filter((b: any) => b.type === type)
        .map((b: any) => {
          const debit = parseInt(b.total_debit || '0');
          const credit = parseInt(b.total_credit || '0');
          const balance = this.calculateNetBalance(type, debit, credit);
          return {
            code: b.code,
            name: b.name,
            balance: Math.abs(balance),
          };
        })
        .filter((a: any) => a.balance !== 0);

      const total = MoneyUtil.sum(accounts.map((a: any) => a.balance));
      return { title, accounts, total };
    };

    // Calculate net income (Revenue - Expenses) for retained earnings
    const revenueAccounts = balances.filter((b: any) => b.type === 'REVENUE');
    const expenseAccounts = balances.filter((b: any) => b.type === 'EXPENSE');

    let totalRevenue = 0;
    for (const r of revenueAccounts) {
      totalRevenue = MoneyUtil.add(totalRevenue,
        parseInt(r.total_credit || '0') - parseInt(r.total_debit || '0'));
    }

    let totalExpenses = 0;
    for (const e of expenseAccounts) {
      totalExpenses = MoneyUtil.add(totalExpenses,
        parseInt(e.total_debit || '0') - parseInt(e.total_credit || '0'));
    }

    const netIncome = MoneyUtil.subtract(totalRevenue, totalExpenses);

    const assets = buildSection('ASSET', 'Assets');
    const liabilities = buildSection('LIABILITY', 'Liabilities');
    const equity = buildSection('EQUITY', 'Equity');

    // Add net income to equity
    if (netIncome !== 0) {
      equity.accounts.push({
        code: 'NET_INCOME',
        name: 'Current Period Net Income',
        balance: Math.abs(netIncome),
      });
      equity.total = MoneyUtil.add(equity.total, Math.abs(netIncome));
    }

    const totalAssets = assets.total;
    const totalLiabilitiesAndEquity = MoneyUtil.add(liabilities.total, equity.total);

    return {
      asOfDate,
      assets,
      liabilities,
      equity,
      totalAssets,
      totalLiabilitiesAndEquity,
      isBalanced: totalAssets === totalLiabilitiesAndEquity,
    };
  }

  /**
   * Accounts Receivable Aging Report
   */
  async getReceivablesAging(
    organizationId: UUID,
    asOfDate: ISODate
  ): Promise<{
    entries: ReceivablePayableEntry[];
    agingBuckets: { bucket: string; amount: Money; count: number }[];
    totalOutstanding: Money;
  }> {
    // Receivables tracked via 1200 account
    const ledger = await this.getAccountLedger(
      organizationId, '1200',
      '1900-01-01', // From beginning
      asOfDate
    );

    // Group by contra-party (from journal description)
    const outstanding = ledger.entries
      .filter((e) => e.runningBalance > 0)
      .map((e) => {
        const today = new Date(asOfDate);
        const entryDate = new Date(e.date);
        const agingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          partyName: e.description,
          date: e.date,
          amount: e.debit,
          paid: e.credit,
          outstanding: MoneyUtil.subtract(e.debit, e.credit),
          agingDays,
          outletName: e.outletName,
        } as ReceivablePayableEntry;
      })
      .filter((e) => e.outstanding > 0);

    // Aging buckets
    const buckets = [
      { bucket: '0-30 days', min: 0, max: 30, amount: 0, count: 0 },
      { bucket: '31-60 days', min: 31, max: 60, amount: 0, count: 0 },
      { bucket: '61-90 days', min: 61, max: 90, amount: 0, count: 0 },
      { bucket: '90+ days', min: 91, max: Infinity, amount: 0, count: 0 },
    ];

    for (const entry of outstanding) {
      for (const bucket of buckets) {
        if (entry.agingDays >= bucket.min && entry.agingDays <= bucket.max) {
          bucket.amount = MoneyUtil.add(bucket.amount, entry.outstanding);
          bucket.count++;
          break;
        }
      }
    }

    return {
      entries: outstanding,
      agingBuckets: buckets.map((b) => ({ bucket: b.bucket, amount: b.amount, count: b.count })),
      totalOutstanding: MoneyUtil.sum(outstanding.map((e) => e.outstanding)),
    };
  }

  /**
   * Accounts Payable Aging Report
   */
  async getPayablesAging(
    organizationId: UUID,
    asOfDate: ISODate
  ): Promise<{
    entries: ReceivablePayableEntry[];
    agingBuckets: { bucket: string; amount: Money; count: number }[];
    totalOutstanding: Money;
  }> {
    const ledger = await this.getAccountLedger(
      organizationId, '2100',
      '1900-01-01',
      asOfDate
    );

    const outstanding = ledger.entries
      .filter((e) => e.runningBalance > 0)
      .map((e) => {
        const today = new Date(asOfDate);
        const entryDate = new Date(e.date);
        const agingDays = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          partyName: e.description,
          date: e.date,
          amount: e.credit,
          paid: e.debit,
          outstanding: MoneyUtil.subtract(e.credit, e.debit),
          agingDays,
          outletName: e.outletName,
        } as ReceivablePayableEntry;
      })
      .filter((e) => e.outstanding > 0);

    const buckets = [
      { bucket: '0-30 days', min: 0, max: 30, amount: 0, count: 0 },
      { bucket: '31-60 days', min: 31, max: 60, amount: 0, count: 0 },
      { bucket: '61-90 days', min: 61, max: 90, amount: 0, count: 0 },
      { bucket: '90+ days', min: 91, max: Infinity, amount: 0, count: 0 },
    ];

    for (const entry of outstanding) {
      for (const bucket of buckets) {
        if (entry.agingDays >= bucket.min && entry.agingDays <= bucket.max) {
          bucket.amount = MoneyUtil.add(bucket.amount, entry.outstanding);
          bucket.count++;
          break;
        }
      }
    }

    return {
      entries: outstanding,
      agingBuckets: buckets.map((b) => ({ bucket: b.bucket, amount: b.amount, count: b.count })),
      totalOutstanding: MoneyUtil.sum(outstanding.map((e) => e.outstanding)),
    };
  }

  /**
   * GST Summary Report (GSTR-3B style)
   */
  async getGSTReport(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<GSTReport> {
    const db = getDb();

    // Outward supplies (Sales GST - accounts 2310, 2320, 2330)
    const gstCollected = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd])
      .whereIn('journal_entry_lines.account_code', ['2310', '2320', '2330'])
      .groupBy('journal_entry_lines.account_code')
      .select(
        'journal_entry_lines.account_code',
        db.raw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as amount')
      );

    const gstMap: Record<string, number> = {};
    for (const g of gstCollected) {
      gstMap[g.account_code] = parseInt(g.amount || '0');
    }

    // Get total sales revenue
    const salesData = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
        'chart_of_accounts.type': 'REVENUE',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd])
      .select(
        db.raw('COALESCE(SUM(journal_entry_lines.credit - journal_entry_lines.debit), 0) as total_sales')
      )
      .first();

    const totalSales = parseInt(salesData?.total_sales || '0');
    const cgstCollected = gstMap['2310'] || 0;
    const sgstCollected = gstMap['2320'] || 0;
    const igstCollected = gstMap['2330'] || 0;
    const totalTaxCollected = MoneyUtil.sum([cgstCollected, sgstCollected, igstCollected]);

    // For now, input tax credit is 0 (would come from purchase invoices)
    const cgstCredit = 0;
    const sgstCredit = 0;
    const igstCredit = 0;
    const totalCredit = 0;

    return {
      period: `${periodStart} to ${periodEnd}`,
      outwardSupplies: {
        taxableValue: totalSales,
        cgst: cgstCollected,
        sgst: sgstCollected,
        igst: igstCollected,
        totalTax: totalTaxCollected,
      },
      inwardSupplies: {
        taxableValue: 0,
        cgstCredit,
        sgstCredit,
        igstCredit,
        totalCredit,
      },
      netPayable: {
        cgst: MoneyUtil.subtract(cgstCollected, cgstCredit),
        sgst: MoneyUtil.subtract(sgstCollected, sgstCredit),
        igst: MoneyUtil.subtract(igstCollected, igstCredit),
        total: MoneyUtil.subtract(totalTaxCollected, totalCredit),
      },
    };
  }

  /**
   * Account Group Summary (like Tally's Group Summary)
   */
  async getGroupSummary(
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{
    groups: {
      type: AccountType;
      subType: string;
      accountCount: number;
      totalDebit: Money;
      totalCredit: Money;
      netBalance: Money;
    }[];
  }> {
    const db = getDb();

    const results = await db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({
        'journal_entries.organization_id': organizationId,
        'journal_entries.status': 'POSTED',
      })
      .whereBetween('journal_entries.date', [periodStart, periodEnd])
      .groupBy('chart_of_accounts.type', 'chart_of_accounts.sub_type')
      .select(
        'chart_of_accounts.type',
        'chart_of_accounts.sub_type',
        db.raw('COUNT(DISTINCT chart_of_accounts.id) as account_count'),
        db.raw('COALESCE(SUM(journal_entry_lines.debit), 0) as total_debit'),
        db.raw('COALESCE(SUM(journal_entry_lines.credit), 0) as total_credit')
      )
      .orderBy('chart_of_accounts.type');

    const groups = results.map((r: any) => {
      const totalDebit = parseInt(r.total_debit || '0');
      const totalCredit = parseInt(r.total_credit || '0');
      return {
        type: r.type,
        subType: r.sub_type,
        accountCount: parseInt(r.account_count),
        totalDebit,
        totalCredit,
        netBalance: this.calculateNetBalance(r.type, totalDebit, totalCredit),
      };
    });

    return { groups };
  }

  private calculateNetBalance(type: AccountType, debit: Money, credit: Money): Money {
    switch (type) {
      case 'ASSET':
      case 'EXPENSE':
        return debit - credit;
      case 'LIABILITY':
      case 'EQUITY':
      case 'REVENUE':
        return credit - debit;
      default:
        return debit - credit;
    }
  }
}

export const ledgerService = new LedgerService();
