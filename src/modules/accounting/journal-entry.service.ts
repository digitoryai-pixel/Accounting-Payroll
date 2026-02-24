import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { NotFoundError, AccountingError, ValidationError } from '../../common/errors';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { chartOfAccountsService } from './chart-of-accounts.service';
import {
  JournalEntry,
  JournalEntryLine,
  JournalEntrySource,
  JournalEntryStatus,
  UUID,
  Money,
  ISODate,
  PaginationParams,
  PaginatedResult,
} from '../../common/types';

export interface CreateJournalEntryDto {
  organizationId: UUID;
  date: ISODate;
  source: JournalEntrySource;
  sourceReferenceId?: UUID;
  description: string;
  lines: {
    accountCode: string;
    debit: Money;
    credit: Money;
    outletId?: UUID;
    costCenterId?: UUID;
    description?: string;
  }[];
  tags?: string[];
  autoPost?: boolean;
}

export class JournalEntryService {
  private async generateEntryNumber(organizationId: UUID): Promise<string> {
    const db = getDb();
    const result = await db('journal_entries')
      .where({ organization_id: organizationId })
      .count('id as count')
      .first();
    const count = parseInt(String(result?.count || '0'), 10);
    const prefix = 'JE';
    return `${prefix}${String(count + 1).padStart(7, '0')}`;
  }

  private getFiscalPeriod(date: ISODate, fyStartMonth: number = 4): { fiscalYear: string; fiscalPeriod: number } {
    const d = new Date(date);
    const month = d.getMonth() + 1; // 1-12
    const year = d.getFullYear();

    let fyStart: number;
    let fyEnd: number;
    if (month >= fyStartMonth) {
      fyStart = year;
      fyEnd = year + 1;
    } else {
      fyStart = year - 1;
      fyEnd = year;
    }

    const fiscalYear = `${fyStart}-${String(fyEnd).slice(2)}`;
    const fiscalPeriod = month >= fyStartMonth
      ? month - fyStartMonth + 1
      : month + (12 - fyStartMonth) + 1;

    return { fiscalYear, fiscalPeriod };
  }

  async create(dto: CreateJournalEntryDto, userId: UUID): Promise<JournalEntry> {
    const db = getDb();

    // Validate double-entry: total debits must equal total credits
    const totalDebit = MoneyUtil.sum(dto.lines.map((l) => l.debit));
    const totalCredit = MoneyUtil.sum(dto.lines.map((l) => l.credit));

    if (totalDebit !== totalCredit) {
      throw new AccountingError(
        `Journal entry is unbalanced. Debits: ${MoneyUtil.formatINR(totalDebit)}, Credits: ${MoneyUtil.formatINR(totalCredit)}`
      );
    }

    if (totalDebit === 0) {
      throw new AccountingError('Journal entry cannot have zero amounts');
    }

    // Validate each line has either debit or credit (not both)
    for (const line of dto.lines) {
      if (line.debit > 0 && line.credit > 0) {
        throw new AccountingError(`Line for account ${line.accountCode} cannot have both debit and credit`);
      }
      if (line.debit === 0 && line.credit === 0) {
        throw new AccountingError(`Line for account ${line.accountCode} must have a debit or credit amount`);
      }
    }

    const entryNumber = await this.generateEntryNumber(dto.organizationId);
    const { fiscalYear, fiscalPeriod } = this.getFiscalPeriod(dto.date);
    const id = uuidv4();

    return db.transaction(async (trx) => {
      // Insert journal entry
      await trx('journal_entries').insert({
        id,
        organization_id: dto.organizationId,
        entry_number: entryNumber,
        date: dto.date,
        source: dto.source,
        source_reference_id: dto.sourceReferenceId,
        description: dto.description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        status: dto.autoPost ? 'POSTED' : 'DRAFT',
        posted_at: dto.autoPost ? new Date() : null,
        posted_by: dto.autoPost ? userId : null,
        fiscal_year: fiscalYear,
        fiscal_period: fiscalPeriod,
        tags: dto.tags,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      });

      // Insert lines and resolve account codes to IDs
      for (const line of dto.lines) {
        const account = await trx('chart_of_accounts')
          .where({ organization_id: dto.organizationId, code: line.accountCode })
          .first();

        if (!account) {
          throw new AccountingError(`Account with code ${line.accountCode} not found`);
        }

        await trx('journal_entry_lines').insert({
          id: uuidv4(),
          journal_entry_id: id,
          account_id: account.id,
          account_code: line.accountCode,
          debit: line.debit,
          credit: line.credit,
          outlet_id: line.outletId,
          cost_center_id: line.costCenterId,
          description: line.description,
        });

        // Update account balance if auto-posting
        if (dto.autoPost) {
          const balanceChange = this.calculateBalanceChange(account.type, line.debit, line.credit);
          await trx('chart_of_accounts')
            .where({ id: account.id })
            .increment('balance', balanceChange);
        }
      }

      if (dto.autoPost) {
        await eventBus.publish(
          'JOURNAL_ENTRY_POSTED',
          'JournalEntry',
          id,
          { entryNumber, source: dto.source, totalDebit, totalCredit },
          { userId, organizationId: dto.organizationId }
        );
      }

      logger.info(`Journal entry created: ${entryNumber}`, {
        id,
        source: dto.source,
        totalDebit: MoneyUtil.formatINR(totalDebit),
      });

      return this.getById(id);
    });
  }

  async getById(id: UUID): Promise<JournalEntry> {
    const db = getDb();
    const row = await db('journal_entries').where({ id }).first();
    if (!row) throw new NotFoundError('JournalEntry', id);

    const lines = await db('journal_entry_lines')
      .where({ journal_entry_id: id })
      .orderBy('debit', 'desc'); // debits first

    return this.mapEntry(row, lines);
  }

  async list(
    organizationId: UUID,
    filters: {
      source?: JournalEntrySource;
      status?: JournalEntryStatus;
      dateFrom?: ISODate;
      dateTo?: ISODate;
      fiscalYear?: string;
    },
    pagination: PaginationParams
  ): Promise<PaginatedResult<JournalEntry>> {
    const db = getDb();
    let query = db('journal_entries')
      .where({ organization_id: organizationId, is_active: true });

    if (filters.source) query = query.where({ source: filters.source });
    if (filters.status) query = query.where({ status: filters.status });
    if (filters.dateFrom) query = query.where('date', '>=', filters.dateFrom);
    if (filters.dateTo) query = query.where('date', '<=', filters.dateTo);
    if (filters.fiscalYear) query = query.where({ fiscal_year: filters.fiscalYear });

    const countResult = await query.clone().count('id as total').first();
    const total = parseInt(String(countResult?.total || '0'), 10);
    const offset = (pagination.page - 1) * pagination.limit;

    const entries = await query
      .orderBy(pagination.sortBy || 'date', pagination.sortOrder || 'desc')
      .limit(pagination.limit)
      .offset(offset);

    const data: JournalEntry[] = [];
    for (const entry of entries) {
      const lines = await db('journal_entry_lines')
        .where({ journal_entry_id: entry.id });
      data.push(this.mapEntry(entry, lines));
    }

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async post(id: UUID, userId: UUID): Promise<JournalEntry> {
    const db = getDb();
    const entry = await this.getById(id);

    if (entry.status !== 'DRAFT') {
      throw new AccountingError(`Cannot post journal entry with status ${entry.status}`);
    }

    return db.transaction(async (trx) => {
      await trx('journal_entries')
        .where({ id })
        .update({ status: 'POSTED', posted_at: new Date(), posted_by: userId });

      // Update account balances
      for (const line of entry.lines) {
        const account = await trx('chart_of_accounts')
          .where({ id: line.accountId })
          .first();
        const balanceChange = this.calculateBalanceChange(account.type, line.debit, line.credit);
        await trx('chart_of_accounts')
          .where({ id: line.accountId })
          .increment('balance', balanceChange);
      }

      await eventBus.publish(
        'JOURNAL_ENTRY_POSTED',
        'JournalEntry',
        id,
        { entryNumber: entry.entryNumber, totalDebit: entry.totalDebit },
        { userId, organizationId: entry.organizationId }
      );

      return this.getById(id);
    });
  }

  async reverse(id: UUID, userId: UUID, reason: string): Promise<JournalEntry> {
    const db = getDb();
    const original = await this.getById(id);

    if (original.status !== 'POSTED') {
      throw new AccountingError('Can only reverse posted journal entries');
    }

    // Create reversal entry (swap debits and credits)
    const reversalLines = original.lines.map((line) => ({
      accountCode: line.accountCode,
      debit: line.credit,
      credit: line.debit,
      outletId: line.outletId,
      costCenterId: line.costCenterId,
      description: `Reversal: ${line.description || ''}`,
    }));

    const reversalEntry = await this.create({
      organizationId: original.organizationId,
      date: new Date().toISOString().split('T')[0],
      source: original.source,
      sourceReferenceId: original.sourceReferenceId,
      description: `Reversal of ${original.entryNumber}: ${reason}`,
      lines: reversalLines,
      tags: ['REVERSAL'],
      autoPost: true,
    }, userId);

    // Mark original as reversed
    await db('journal_entries')
      .where({ id })
      .update({ status: 'REVERSED' });

    await eventBus.publish(
      'JOURNAL_ENTRY_REVERSED',
      'JournalEntry',
      id,
      { originalEntryNumber: original.entryNumber, reversalId: reversalEntry.id },
      { userId, organizationId: original.organizationId }
    );

    return reversalEntry;
  }

  /**
   * Get trial balance for an organization
   */
  async getTrialBalance(
    organizationId: UUID,
    asOfDate?: ISODate
  ): Promise<{ accounts: { code: string; name: string; type: string; debit: Money; credit: Money }[]; totalDebit: Money; totalCredit: Money }> {
    const db = getDb();
    let query = db('journal_entry_lines')
      .join('journal_entries', 'journal_entry_lines.journal_entry_id', 'journal_entries.id')
      .join('chart_of_accounts', 'journal_entry_lines.account_id', 'chart_of_accounts.id')
      .where({ 'journal_entries.organization_id': organizationId, 'journal_entries.status': 'POSTED' });

    if (asOfDate) {
      query = query.where('journal_entries.date', '<=', asOfDate);
    }

    const results = await query
      .groupBy('chart_of_accounts.code', 'chart_of_accounts.name', 'chart_of_accounts.type')
      .select(
        'chart_of_accounts.code',
        'chart_of_accounts.name',
        'chart_of_accounts.type',
        db.raw('SUM(journal_entry_lines.debit) as total_debit'),
        db.raw('SUM(journal_entry_lines.credit) as total_credit')
      )
      .orderBy('chart_of_accounts.code');

    const accounts = results.map((r: any) => ({
      code: r.code,
      name: r.name,
      type: r.type,
      debit: parseInt(r.total_debit || '0'),
      credit: parseInt(r.total_credit || '0'),
    }));

    return {
      accounts,
      totalDebit: MoneyUtil.sum(accounts.map((a) => a.debit)),
      totalCredit: MoneyUtil.sum(accounts.map((a) => a.credit)),
    };
  }

  /**
   * For assets and expenses: debit increases, credit decreases
   * For liabilities, equity, revenue: credit increases, debit decreases
   */
  private calculateBalanceChange(accountType: string, debit: Money, credit: Money): number {
    switch (accountType) {
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

  private mapEntry(row: any, lines: any[]): JournalEntry {
    return {
      id: row.id,
      organizationId: row.organization_id,
      entryNumber: row.entry_number,
      date: row.date,
      source: row.source,
      sourceReferenceId: row.source_reference_id,
      description: row.description,
      lines: lines.map((l: any) => ({
        id: l.id,
        journalEntryId: l.journal_entry_id,
        accountId: l.account_id,
        accountCode: l.account_code,
        debit: parseInt(l.debit || '0'),
        credit: parseInt(l.credit || '0'),
        outletId: l.outlet_id,
        costCenterId: l.cost_center_id,
        description: l.description,
      })),
      totalDebit: parseInt(row.total_debit || '0'),
      totalCredit: parseInt(row.total_credit || '0'),
      status: row.status,
      postedAt: row.posted_at,
      postedBy: row.posted_by,
      reversalOfId: row.reversal_of_id,
      fiscalYear: row.fiscal_year,
      fiscalPeriod: row.fiscal_period,
      tags: row.tags,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const journalEntryService = new JournalEntryService();
