import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { NotFoundError, DuplicateError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { ChartOfAccount, UUID, AccountType, AccountSubType } from '../../common/types';

export interface CreateAccountDto {
  organizationId: UUID;
  code: string;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  parentAccountId?: UUID;
  isSystemAccount?: boolean;
  isBankAccount?: boolean;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  costCenterId?: UUID;
  description?: string;
}

export class ChartOfAccountsService {
  async create(dto: CreateAccountDto, userId: UUID): Promise<ChartOfAccount> {
    const db = getDb();

    // Check for duplicate code
    const existing = await db('chart_of_accounts')
      .where({ organization_id: dto.organizationId, code: dto.code })
      .first();
    if (existing) {
      throw new DuplicateError('Account', 'code', dto.code);
    }

    const id = uuidv4();
    await db('chart_of_accounts').insert({
      id,
      organization_id: dto.organizationId,
      code: dto.code,
      name: dto.name,
      type: dto.type,
      sub_type: dto.subType,
      parent_account_id: dto.parentAccountId,
      is_system_account: dto.isSystemAccount || false,
      is_bank_account: dto.isBankAccount || false,
      bank_details: dto.bankDetails ? JSON.stringify(dto.bankDetails) : null,
      balance: 0,
      cost_center_id: dto.costCenterId,
      description: dto.description,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    return this.getById(id);
  }

  async getById(id: UUID): Promise<ChartOfAccount> {
    const db = getDb();
    const row = await db('chart_of_accounts').where({ id }).first();
    if (!row) throw new NotFoundError('Account', id);
    return this.mapAccount(row);
  }

  async getByCode(organizationId: UUID, code: string): Promise<ChartOfAccount> {
    const db = getDb();
    const row = await db('chart_of_accounts')
      .where({ organization_id: organizationId, code })
      .first();
    if (!row) throw new NotFoundError('Account', code);
    return this.mapAccount(row);
  }

  async list(organizationId: UUID, type?: AccountType): Promise<ChartOfAccount[]> {
    const db = getDb();
    let query = db('chart_of_accounts')
      .where({ organization_id: organizationId, is_active: true });
    if (type) query = query.where({ type });
    const rows = await query.orderBy('code');
    return rows.map((r: any) => this.mapAccount(r));
  }

  async getTree(organizationId: UUID): Promise<(ChartOfAccount & { children: ChartOfAccount[] })[]> {
    const allAccounts = await this.list(organizationId);
    const accountMap = new Map<UUID, ChartOfAccount & { children: ChartOfAccount[] }>();

    // First pass: create map entries
    for (const account of allAccounts) {
      accountMap.set(account.id, { ...account, children: [] });
    }

    // Second pass: build tree
    const roots: (ChartOfAccount & { children: ChartOfAccount[] })[] = [];
    for (const account of accountMap.values()) {
      if (account.parentAccountId && accountMap.has(account.parentAccountId)) {
        accountMap.get(account.parentAccountId)!.children.push(account);
      } else {
        roots.push(account);
      }
    }

    return roots;
  }

  async updateBalance(accountId: UUID, amount: number): Promise<void> {
    const db = getDb();
    await db('chart_of_accounts')
      .where({ id: accountId })
      .increment('balance', amount);
  }

  /**
   * Seed the default restaurant chart of accounts
   */
  async seedDefaultAccounts(organizationId: UUID, userId: UUID): Promise<void> {
    const accounts: CreateAccountDto[] = [
      // ASSETS
      { organizationId, code: '1000', name: 'Assets', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1100', name: 'Cash & Bank', type: 'ASSET', subType: 'BANK', isSystemAccount: true },
      { organizationId, code: '1110', name: 'Cash on Hand', type: 'ASSET', subType: 'CASH', isSystemAccount: true },
      { organizationId, code: '1120', name: 'Primary Bank Account', type: 'ASSET', subType: 'BANK', isSystemAccount: true, isBankAccount: true },
      { organizationId, code: '1130', name: 'Payroll Bank Account', type: 'ASSET', subType: 'BANK', isSystemAccount: true, isBankAccount: true },
      { organizationId, code: '1200', name: 'Accounts Receivable', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1300', name: 'Inventory', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1310', name: 'Food Inventory', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1320', name: 'Beverage Inventory', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1330', name: 'Liquor Inventory', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1340', name: 'Packaging Inventory', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1400', name: 'Prepaid Expenses', type: 'ASSET', subType: 'CURRENT_ASSET', isSystemAccount: true },
      { organizationId, code: '1500', name: 'Fixed Assets', type: 'ASSET', subType: 'FIXED_ASSET', isSystemAccount: true },
      { organizationId, code: '1510', name: 'Kitchen Equipment', type: 'ASSET', subType: 'FIXED_ASSET', isSystemAccount: true },
      { organizationId, code: '1520', name: 'Furniture & Fixtures', type: 'ASSET', subType: 'FIXED_ASSET', isSystemAccount: true },

      // LIABILITIES
      { organizationId, code: '2000', name: 'Liabilities', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2100', name: 'Accounts Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2200', name: 'Salary Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2210', name: 'PF Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2220', name: 'ESI Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2230', name: 'TDS Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2240', name: 'Professional Tax Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2250', name: 'Service Charge Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2260', name: 'Tips Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2300', name: 'GST Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2310', name: 'CGST Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2320', name: 'SGST Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2330', name: 'IGST Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2400', name: 'Prepaid Card Liability', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isSystemAccount: true },
      { organizationId, code: '2500', name: 'Long-term Liabilities', type: 'LIABILITY', subType: 'LONG_TERM_LIABILITY', isSystemAccount: true },

      // EQUITY
      { organizationId, code: '3000', name: 'Equity', type: 'EQUITY', subType: 'SHARE_CAPITAL', isSystemAccount: true },
      { organizationId, code: '3100', name: 'Share Capital', type: 'EQUITY', subType: 'SHARE_CAPITAL', isSystemAccount: true },
      { organizationId, code: '3200', name: 'Retained Earnings', type: 'EQUITY', subType: 'RETAINED_EARNINGS', isSystemAccount: true },

      // REVENUE
      { organizationId, code: '4000', name: 'Revenue', type: 'REVENUE', subType: 'SALES_REVENUE', isSystemAccount: true },
      { organizationId, code: '4100', name: 'Food Sales', type: 'REVENUE', subType: 'SALES_REVENUE', isSystemAccount: true },
      { organizationId, code: '4200', name: 'Beverage Sales', type: 'REVENUE', subType: 'SALES_REVENUE', isSystemAccount: true },
      { organizationId, code: '4300', name: 'Liquor Sales', type: 'REVENUE', subType: 'SALES_REVENUE', isSystemAccount: true },
      { organizationId, code: '4400', name: 'Service Charge Income', type: 'REVENUE', subType: 'OTHER_INCOME', isSystemAccount: true },
      { organizationId, code: '4500', name: 'Delivery Income', type: 'REVENUE', subType: 'OTHER_INCOME', isSystemAccount: true },
      { organizationId, code: '4600', name: 'Prepaid Card Income', type: 'REVENUE', subType: 'OTHER_INCOME', isSystemAccount: true },
      { organizationId, code: '4900', name: 'Other Income', type: 'REVENUE', subType: 'OTHER_INCOME', isSystemAccount: true },

      // COST OF GOODS SOLD
      { organizationId, code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', subType: 'COST_OF_GOODS', isSystemAccount: true },
      { organizationId, code: '5100', name: 'Food COGS', type: 'EXPENSE', subType: 'COST_OF_GOODS', isSystemAccount: true },
      { organizationId, code: '5200', name: 'Beverage COGS', type: 'EXPENSE', subType: 'COST_OF_GOODS', isSystemAccount: true },
      { organizationId, code: '5300', name: 'Liquor COGS', type: 'EXPENSE', subType: 'COST_OF_GOODS', isSystemAccount: true },
      { organizationId, code: '5400', name: 'Packaging COGS', type: 'EXPENSE', subType: 'COST_OF_GOODS', isSystemAccount: true },

      // PAYROLL EXPENSE
      { organizationId, code: '6000', name: 'Payroll Expenses', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6100', name: 'Salary Expense - Kitchen', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6200', name: 'Salary Expense - Service', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6300', name: 'Salary Expense - Bar', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6400', name: 'Salary Expense - Management', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6500', name: 'Salary Expense - Central Kitchen', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6600', name: 'Employer PF Contribution', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6700', name: 'Employer ESI Contribution', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6800', name: 'Overtime Expense', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },
      { organizationId, code: '6900', name: 'Incentive Expense', type: 'EXPENSE', subType: 'PAYROLL_EXPENSE', isSystemAccount: true },

      // OPERATING EXPENSES
      { organizationId, code: '7000', name: 'Operating Expenses', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7100', name: 'Rent Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7200', name: 'Utilities', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7300', name: 'Marketing & Advertising', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7400', name: 'Repairs & Maintenance', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7500', name: 'Depreciation', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7600', name: 'Insurance', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7700', name: 'Licenses & Fees', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },
      { organizationId, code: '7800', name: 'Technology Expense', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', isSystemAccount: true },

      // ADMIN EXPENSES
      { organizationId, code: '8000', name: 'Administrative Expenses', type: 'EXPENSE', subType: 'ADMIN_EXPENSE', isSystemAccount: true },
      { organizationId, code: '8100', name: 'Office Supplies', type: 'EXPENSE', subType: 'ADMIN_EXPENSE', isSystemAccount: true },
      { organizationId, code: '8200', name: 'Professional Fees', type: 'EXPENSE', subType: 'ADMIN_EXPENSE', isSystemAccount: true },
      { organizationId, code: '8300', name: 'Bank Charges', type: 'EXPENSE', subType: 'ADMIN_EXPENSE', isSystemAccount: true },
      { organizationId, code: '8400', name: 'Interest Expense', type: 'EXPENSE', subType: 'ADMIN_EXPENSE', isSystemAccount: true },
    ];

    for (const account of accounts) {
      try {
        await this.create(account, userId);
      } catch (error) {
        // Skip duplicates
        if (error instanceof DuplicateError) continue;
        throw error;
      }
    }

    logger.info(`Default chart of accounts seeded for organization ${organizationId}`);
  }

  private mapAccount(row: any): ChartOfAccount {
    return {
      id: row.id,
      organizationId: row.organization_id,
      code: row.code,
      name: row.name,
      type: row.type,
      subType: row.sub_type,
      parentAccountId: row.parent_account_id,
      isSystemAccount: row.is_system_account,
      isBankAccount: row.is_bank_account,
      bankDetails: row.bank_details
        ? (typeof row.bank_details === 'string' ? JSON.parse(row.bank_details) : row.bank_details)
        : undefined,
      balance: parseInt(row.balance || '0'),
      costCenterId: row.cost_center_id,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const chartOfAccountsService = new ChartOfAccountsService();
