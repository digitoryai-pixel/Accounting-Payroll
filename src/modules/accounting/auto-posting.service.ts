import { eventBus } from '../../common/events/event-bus';
import { journalEntryService } from './journal-entry.service';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { DomainEvent, UUID, Money } from '../../common/types';

/**
 * Auto-Posting Service
 * Listens to domain events and automatically creates journal entries.
 * This eliminates manual accounting entries by using event-driven auto-posting.
 */
export class AutoPostingService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    // Sales synced from Digitory PoS
    eventBus.subscribe('SALES_SYNCED', this.handleSalesSynced.bind(this));

    // Purchase synced from Digitory Purchase module
    eventBus.subscribe('PURCHASE_SYNCED', this.handlePurchaseSynced.bind(this));

    // Stock closing synced from Digitory
    eventBus.subscribe('STOCK_CLOSING_SYNCED', this.handleStockClosingSynced.bind(this));

    // COGS calculated
    eventBus.subscribe('COGS_CALCULATED', this.handleCOGSCalculated.bind(this));

    // Tip distribution
    eventBus.subscribe('TIP_DISTRIBUTED', this.handleTipDistributed.bind(this));

    // Service charge distribution
    eventBus.subscribe('SERVICE_CHARGE_DISTRIBUTED', this.handleServiceChargeDistributed.bind(this));

    logger.info('Auto-posting event handlers registered');
  }

  /**
   * When sales data is synced from PoS:
   * DR: Cash/Bank/Receivable → 1110/1120/1200
   * CR: Food Sales → 4100
   * CR: Beverage Sales → 4200
   * CR: Liquor Sales → 4300
   * CR: Service Charge Income → 4400
   * CR: GST Payable → 2300
   */
  private async handleSalesSynced(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const {
      totalSales,
      foodSales,
      beverageSales,
      liquorSales,
      serviceCharge,
      cgst,
      sgst,
      paymentMode,
      date,
    } = event.payload as Record<string, any>;

    const lines: { accountCode: string; debit: Money; credit: Money; outletId?: UUID; description?: string }[] = [];

    // Debit: Cash or Bank based on payment mode
    const accountCode = paymentMode === 'CASH' ? '1110' : '1120';
    const totalReceived = MoneyUtil.sum([
      foodSales || 0, beverageSales || 0, liquorSales || 0,
      serviceCharge || 0, cgst || 0, sgst || 0,
    ]);

    lines.push({
      accountCode,
      debit: totalReceived,
      credit: 0,
      outletId,
      description: `Sales receipt - ${paymentMode}`,
    });

    // Credits
    if (foodSales > 0) {
      lines.push({ accountCode: '4100', debit: 0, credit: foodSales, outletId, description: 'Food sales' });
    }
    if (beverageSales > 0) {
      lines.push({ accountCode: '4200', debit: 0, credit: beverageSales, outletId, description: 'Beverage sales' });
    }
    if (liquorSales > 0) {
      lines.push({ accountCode: '4300', debit: 0, credit: liquorSales, outletId, description: 'Liquor sales' });
    }
    if (serviceCharge > 0) {
      lines.push({ accountCode: '4400', debit: 0, credit: serviceCharge, outletId, description: 'Service charge' });
    }
    if (cgst > 0) {
      lines.push({ accountCode: '2310', debit: 0, credit: cgst, outletId, description: 'CGST collected' });
    }
    if (sgst > 0) {
      lines.push({ accountCode: '2320', debit: 0, credit: sgst, outletId, description: 'SGST collected' });
    }

    await journalEntryService.create({
      organizationId,
      date: date || new Date().toISOString().split('T')[0],
      source: 'SALES',
      sourceReferenceId: event.aggregateId,
      description: `Daily sales - ${date}`,
      lines,
      tags: ['AUTO_POST', 'SALES'],
      autoPost: true,
    }, userId);

    logger.info('Auto-posted sales journal entry', { date, totalReceived });
  }

  /**
   * When purchase is synced:
   * DR: Inventory (Food/Beverage/Liquor) → 1310/1320/1330
   * DR: GST Input Credit → (new account)
   * CR: Accounts Payable / Bank → 2100/1120
   */
  private async handlePurchaseSynced(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const { totalAmount, category, vendorName, invoiceDate, isPaid } = event.payload as Record<string, any>;

    const inventoryAccountMap: Record<string, string> = {
      FOOD: '1310',
      BEVERAGE: '1320',
      LIQUOR: '1330',
      PACKAGING: '1340',
    };

    const lines = [
      {
        accountCode: inventoryAccountMap[category] || '1300',
        debit: totalAmount,
        credit: 0,
        outletId,
        description: `Purchase from ${vendorName} - ${category}`,
      },
      {
        accountCode: isPaid ? '1120' : '2100',
        debit: 0,
        credit: totalAmount,
        outletId,
        description: isPaid ? 'Paid by bank' : `Payable to ${vendorName}`,
      },
    ];

    await journalEntryService.create({
      organizationId,
      date: invoiceDate || new Date().toISOString().split('T')[0],
      source: 'PURCHASE',
      sourceReferenceId: event.aggregateId,
      description: `Purchase - ${vendorName} (${category})`,
      lines,
      tags: ['AUTO_POST', 'PURCHASE'],
      autoPost: true,
    }, userId);

    logger.info('Auto-posted purchase journal entry', { vendorName, totalAmount });
  }

  /**
   * When stock closing is synced from Digitory:
   * This updates inventory values and triggers COGS calculation
   */
  private async handleStockClosingSynced(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const { closingDate, category, closingValue, openingValue, purchases } = event.payload as Record<string, any>;

    // COGS = Opening + Purchases - Closing
    const cogs = MoneyUtil.subtract(
      MoneyUtil.add(openingValue, purchases),
      closingValue
    );

    // Publish COGS event
    await eventBus.publish(
      'COGS_CALCULATED',
      'StockClosing',
      event.aggregateId,
      { closingDate, category, cogs, openingValue, purchases, closingValue, outletId },
      { userId, organizationId, outletId }
    );

    logger.info('Stock closing processed, COGS event published', { category, cogs });
  }

  /**
   * When COGS is calculated:
   * DR: COGS (Food/Beverage/Liquor) → 5100/5200/5300
   * CR: Inventory → 1310/1320/1330
   */
  private async handleCOGSCalculated(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const { closingDate, category, cogs } = event.payload as Record<string, any>;

    if (cogs <= 0) return;

    const cogsAccountMap: Record<string, string> = {
      FOOD: '5100',
      BEVERAGE: '5200',
      LIQUOR: '5300',
      PACKAGING: '5400',
    };

    const inventoryAccountMap: Record<string, string> = {
      FOOD: '1310',
      BEVERAGE: '1320',
      LIQUOR: '1330',
      PACKAGING: '1340',
    };

    const lines = [
      {
        accountCode: cogsAccountMap[category] || '5000',
        debit: cogs,
        credit: 0,
        outletId,
        description: `${category} COGS`,
      },
      {
        accountCode: inventoryAccountMap[category] || '1300',
        debit: 0,
        credit: cogs,
        outletId,
        description: `${category} inventory consumed`,
      },
    ];

    await journalEntryService.create({
      organizationId,
      date: closingDate || new Date().toISOString().split('T')[0],
      source: 'COGS',
      sourceReferenceId: event.aggregateId,
      description: `COGS - ${category} for period ending ${closingDate}`,
      lines,
      tags: ['AUTO_POST', 'COGS', category],
      autoPost: true,
    }, userId);

    logger.info('Auto-posted COGS journal entry', { category, cogs });
  }

  /**
   * When tips are distributed:
   * DR: Tips Expense (or pass-through)
   * CR: Tips Payable → 2260
   */
  private async handleTipDistributed(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const { totalCollected, totalDistributed, periodStart } = event.payload as Record<string, any>;

    if (totalDistributed <= 0) return;

    const lines = [
      {
        accountCode: '1110', // Cash (tips collected)
        debit: totalCollected,
        credit: 0,
        outletId,
        description: 'Tips collected',
      },
      {
        accountCode: '2260', // Tips payable to staff
        debit: 0,
        credit: totalDistributed,
        outletId,
        description: 'Tips payable to staff',
      },
    ];

    // If there's a management cut (collected > distributed)
    const mgmtCut = MoneyUtil.subtract(totalCollected, totalDistributed);
    if (mgmtCut > 0) {
      lines.push({
        accountCode: '4900', // Other income
        debit: 0,
        credit: mgmtCut,
        outletId,
        description: 'Tip management retention',
      });
    }

    await journalEntryService.create({
      organizationId,
      date: periodStart || new Date().toISOString().split('T')[0],
      source: 'TIP_DISTRIBUTION',
      sourceReferenceId: event.aggregateId,
      description: 'Tip distribution',
      lines,
      tags: ['AUTO_POST', 'TIPS'],
      autoPost: true,
    }, userId);

    logger.info('Auto-posted tip distribution journal entry', { totalDistributed });
  }

  /**
   * When service charge is distributed:
   * DR: Service Charge Income → 4400 (reduces income, distributes to staff)
   * CR: Service Charge Payable → 2250
   */
  private async handleServiceChargeDistributed(event: DomainEvent): Promise<void> {
    const { organizationId, userId, outletId } = event.metadata;
    const { totalServiceCharge, periodStart } = event.payload as Record<string, any>;

    if (totalServiceCharge <= 0) return;

    const lines = [
      {
        accountCode: '2250',
        debit: totalServiceCharge,
        credit: 0,
        outletId,
        description: 'Service charge distributed to staff',
      },
      {
        accountCode: '1130',
        debit: 0,
        credit: totalServiceCharge,
        outletId,
        description: 'Service charge paid',
      },
    ];

    await journalEntryService.create({
      organizationId,
      date: periodStart || new Date().toISOString().split('T')[0],
      source: 'SERVICE_CHARGE',
      sourceReferenceId: event.aggregateId,
      description: 'Service charge distribution',
      lines,
      tags: ['AUTO_POST', 'SERVICE_CHARGE'],
      autoPost: true,
    }, userId);

    logger.info('Auto-posted service charge journal entry', { totalServiceCharge });
  }
}

// Singleton - registers event handlers on import
export const autoPostingService = new AutoPostingService();
