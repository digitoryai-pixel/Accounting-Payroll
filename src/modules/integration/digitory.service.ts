import axios, { AxiosInstance } from 'axios';
import { config } from '../../config';
import { eventBus } from '../../common/events/event-bus';
import { IntegrationError } from '../../common/errors';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate } from '../../common/types';

/**
 * Digitory Integration Service
 * Connects with Digitory's existing modules:
 * - PoS (sales data, service charge, tips)
 * - Inventory (stock levels, consumption)
 * - Recipe Management (recipe costs)
 * - Purchase (vendor invoices, GRNs)
 * - Stock Closing (period-end stock values)
 * - CRM (customer data for analytics)
 * - Prepaid Cards (liability tracking)
 * - Kitchen Display System (production metrics)
 */
export class DigitoryIntegrationService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.digitory.apiBaseUrl,
      headers: {
        'Authorization': `Bearer ${config.digitory.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // ============================
  // PoS Integration
  // ============================

  /**
   * Sync daily sales from Digitory PoS
   * Triggered by webhook or scheduled job
   */
  async syncDailySales(
    outletId: UUID,
    digitoryOutletId: string,
    date: ISODate,
    userId: UUID,
    organizationId: UUID
  ): Promise<void> {
    try {
      const response = await this.client.get(`/pos/outlets/${digitoryOutletId}/sales`, {
        params: { date },
      });

      const salesData = response.data;

      // Publish event for auto-posting
      await eventBus.publish(
        'SALES_SYNCED',
        'PoSSales',
        digitoryOutletId,
        {
          date,
          totalSales: MoneyUtil.toPaisa(salesData.totalSales),
          foodSales: MoneyUtil.toPaisa(salesData.foodSales || 0),
          beverageSales: MoneyUtil.toPaisa(salesData.beverageSales || 0),
          liquorSales: MoneyUtil.toPaisa(salesData.liquorSales || 0),
          serviceCharge: MoneyUtil.toPaisa(salesData.serviceCharge || 0),
          tips: MoneyUtil.toPaisa(salesData.tips || 0),
          cgst: MoneyUtil.toPaisa(salesData.cgst || 0),
          sgst: MoneyUtil.toPaisa(salesData.sgst || 0),
          igst: MoneyUtil.toPaisa(salesData.igst || 0),
          paymentMode: salesData.primaryPaymentMode || 'MIXED',
          covers: salesData.covers || 0,
          averageTicket: salesData.averageTicketSize || 0,
          outletId,
        },
        { userId, organizationId, outletId }
      );

      logger.info(`Daily sales synced from Digitory PoS`, {
        digitoryOutletId,
        date,
        totalSales: salesData.totalSales,
      });
    } catch (error) {
      throw new IntegrationError('Digitory PoS', `Failed to sync sales: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get service charge collected from PoS
   */
  async getServiceChargeCollected(
    digitoryOutletId: string,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<Money> {
    try {
      const response = await this.client.get(`/pos/outlets/${digitoryOutletId}/service-charge`, {
        params: { from: periodStart, to: periodEnd },
      });
      return MoneyUtil.toPaisa(response.data.totalServiceCharge);
    } catch (error) {
      logger.error('Failed to fetch service charge', { error });
      return 0;
    }
  }

  /**
   * Get tips collected from PoS
   */
  async getTipsCollected(
    digitoryOutletId: string,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<Money> {
    try {
      const response = await this.client.get(`/pos/outlets/${digitoryOutletId}/tips`, {
        params: { from: periodStart, to: periodEnd },
      });
      return MoneyUtil.toPaisa(response.data.totalTips);
    } catch (error) {
      logger.error('Failed to fetch tips', { error });
      return 0;
    }
  }

  // ============================
  // Inventory Integration
  // ============================

  /**
   * Sync current stock levels from Digitory Inventory
   */
  async syncStockLevels(
    digitoryOutletId: string,
    date: ISODate
  ): Promise<{ category: string; value: Money }[]> {
    try {
      const response = await this.client.get(`/inventory/outlets/${digitoryOutletId}/stock`, {
        params: { date },
      });

      return (response.data.categories || []).map((cat: any) => ({
        category: cat.category,
        value: MoneyUtil.toPaisa(cat.totalValue),
      }));
    } catch (error) {
      throw new IntegrationError('Digitory Inventory', `Failed to sync stock: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================
  // Purchase Integration
  // ============================

  /**
   * Sync purchase invoices from Digitory Purchase module
   */
  async syncPurchases(
    outletId: UUID,
    digitoryOutletId: string,
    periodStart: ISODate,
    periodEnd: ISODate,
    userId: UUID,
    organizationId: UUID
  ): Promise<void> {
    try {
      const response = await this.client.get(`/purchase/outlets/${digitoryOutletId}/invoices`, {
        params: { from: periodStart, to: periodEnd },
      });

      for (const invoice of response.data.invoices || []) {
        await eventBus.publish(
          'PURCHASE_SYNCED',
          'PurchaseInvoice',
          invoice.id,
          {
            invoiceNumber: invoice.invoiceNumber,
            vendorName: invoice.vendorName,
            invoiceDate: invoice.date,
            totalAmount: MoneyUtil.toPaisa(invoice.totalAmount),
            category: invoice.category || 'FOOD',
            gstAmount: MoneyUtil.toPaisa(invoice.gstAmount || 0),
            isPaid: invoice.isPaid || false,
            outletId,
          },
          { userId, organizationId, outletId }
        );
      }

      logger.info(`Purchases synced from Digitory`, {
        digitoryOutletId,
        invoiceCount: (response.data.invoices || []).length,
      });
    } catch (error) {
      throw new IntegrationError('Digitory Purchase', `Failed to sync purchases: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================
  // Stock Closing Integration
  // ============================

  /**
   * Sync stock closing data for COGS calculation
   */
  async syncStockClosing(
    outletId: UUID,
    digitoryOutletId: string,
    closingDate: ISODate,
    userId: UUID,
    organizationId: UUID
  ): Promise<void> {
    try {
      const response = await this.client.get(`/stock-closing/outlets/${digitoryOutletId}`, {
        params: { date: closingDate },
      });

      for (const entry of response.data.entries || []) {
        await eventBus.publish(
          'STOCK_CLOSING_SYNCED',
          'StockClosing',
          entry.id,
          {
            closingDate,
            category: entry.category,
            openingValue: MoneyUtil.toPaisa(entry.openingValue),
            purchases: MoneyUtil.toPaisa(entry.purchaseValue),
            closingValue: MoneyUtil.toPaisa(entry.closingValue),
            outletId,
          },
          { userId, organizationId, outletId }
        );
      }

      logger.info(`Stock closing synced from Digitory`, { digitoryOutletId, closingDate });
    } catch (error) {
      throw new IntegrationError('Digitory Stock Closing', `Failed to sync: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================
  // Recipe Management Integration
  // ============================

  /**
   * Fetch recipe details for costing
   */
  async getRecipeDetails(recipeId: string): Promise<{
    recipeId: string;
    recipeName: string;
    sellingPrice: number;
    ingredients: {
      itemName: string;
      quantity: number;
      unit: string;
      unitCost: number;
    }[];
  } | null> {
    try {
      const response = await this.client.get(`/recipes/${recipeId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch recipe details', { recipeId, error });
      return null;
    }
  }

  // ============================
  // KDS Integration (Kitchen Metrics)
  // ============================

  /**
   * Get kitchen performance metrics for production incentives
   */
  async getKitchenMetrics(
    digitoryOutletId: string,
    periodStart: ISODate,
    periodEnd: ISODate
  ): Promise<{
    averageTicketTime: number;
    ordersCompleted: number;
    wastagePercentage: number;
    customerRating: number;
  }> {
    try {
      const response = await this.client.get(`/kds/outlets/${digitoryOutletId}/metrics`, {
        params: { from: periodStart, to: periodEnd },
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch kitchen metrics', { error });
      return {
        averageTicketTime: 0,
        ordersCompleted: 0,
        wastagePercentage: 0,
        customerRating: 0,
      };
    }
  }

  // ============================
  // Prepaid Cards Integration
  // ============================

  /**
   * Sync prepaid card liability
   */
  async syncPrepaidCardLiability(
    organizationId: UUID,
    userId: UUID
  ): Promise<Money> {
    try {
      const response = await this.client.get('/prepaid-cards/liability');
      const liability = MoneyUtil.toPaisa(response.data.totalOutstandingLiability);

      logger.info(`Prepaid card liability synced: ${MoneyUtil.formatINR(liability)}`);
      return liability;
    } catch (error) {
      logger.error('Failed to sync prepaid card liability', { error });
      return 0;
    }
  }

  // ============================
  // Attendance Integration
  // ============================

  /**
   * Sync attendance from Digitory POS login timestamps
   */
  async syncPosLoginAttendance(
    digitoryOutletId: string,
    date: ISODate
  ): Promise<{ employeeId: string; loginTime: string; logoutTime: string }[]> {
    try {
      const response = await this.client.get(`/pos/outlets/${digitoryOutletId}/staff-logins`, {
        params: { date },
      });
      return response.data.logins || [];
    } catch (error) {
      logger.error('Failed to sync POS attendance', { error });
      return [];
    }
  }

  // ============================
  // Webhook Handler
  // ============================

  /**
   * Handle incoming webhooks from Digitory
   */
  async handleWebhook(
    eventType: string,
    payload: Record<string, unknown>,
    signature: string
  ): Promise<void> {
    // Verify webhook signature
    // const isValid = this.verifySignature(payload, signature);
    // if (!isValid) throw new UnauthorizedError('Invalid webhook signature');

    switch (eventType) {
      case 'pos.day_closed':
        logger.info('Received day close webhook', { outletId: payload.outletId });
        break;
      case 'purchase.invoice_created':
        logger.info('Received purchase invoice webhook', { invoiceId: payload.invoiceId });
        break;
      case 'inventory.stock_closing_completed':
        logger.info('Received stock closing webhook', { outletId: payload.outletId });
        break;
      case 'prepaid.card_reloaded':
        logger.info('Received prepaid card reload webhook', { cardId: payload.cardId });
        break;
      default:
        logger.warn(`Unknown webhook event type: ${eventType}`);
    }
  }
}

export const digitoryIntegrationService = new DigitoryIntegrationService();
