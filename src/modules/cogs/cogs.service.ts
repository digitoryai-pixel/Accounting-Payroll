import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { MoneyUtil } from '../../common/utils/money';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { COGSEntry, UUID, Money, ISODate, Percentage } from '../../common/types';

export interface COGSSummary {
  outletId: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  categories: {
    category: string;
    openingStock: Money;
    purchases: Money;
    closingStock: Money;
    cogs: Money;
    salesRevenue: Money;
    cogsPercentage: number;
  }[];
  totalCOGS: Money;
  totalRevenue: Money;
  overallCOGSPercentage: number;
}

export interface RecipeCosting {
  recipeId: string;
  recipeName: string;
  ingredients: {
    itemName: string;
    quantity: number;
    unit: string;
    unitCost: Money;
    totalCost: Money;
  }[];
  totalIngredientCost: Money;
  overheadPercentage: Percentage;
  overheadCost: Money;
  totalCost: Money;
  sellingPrice: Money;
  foodCostPercentage: number;
  grossMargin: number;
}

export class COGSService {
  /**
   * Calculate COGS for a period: Opening Stock + Purchases - Closing Stock
   */
  async calculateCOGS(
    organizationId: UUID,
    outletId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate,
    entries: {
      category: 'FOOD' | 'BEVERAGE' | 'LIQUOR' | 'PACKAGING' | 'OTHER';
      openingStock: number; // in rupees
      purchases: number;
      closingStock: number;
      salesRevenue: number;
    }[],
    userId: UUID
  ): Promise<COGSSummary> {
    const db = getDb();
    const result: COGSSummary = {
      outletId,
      periodStart,
      periodEnd,
      categories: [],
      totalCOGS: 0,
      totalRevenue: 0,
      overallCOGSPercentage: 0,
    };

    for (const entry of entries) {
      const openingPaisa = MoneyUtil.toPaisa(entry.openingStock);
      const purchasesPaisa = MoneyUtil.toPaisa(entry.purchases);
      const closingPaisa = MoneyUtil.toPaisa(entry.closingStock);
      const salesPaisa = MoneyUtil.toPaisa(entry.salesRevenue);

      // COGS = Opening + Purchases - Closing
      const cogs = MoneyUtil.subtract(
        MoneyUtil.add(openingPaisa, purchasesPaisa),
        closingPaisa
      );

      const cogsPercentage = salesPaisa > 0
        ? Math.round((cogs / salesPaisa) * 10000) // basis points
        : 0;

      const id = uuidv4();
      await db('cogs_entries').insert({
        id,
        organization_id: organizationId,
        outlet_id: outletId,
        period_start: periodStart,
        period_end: periodEnd,
        opening_stock: openingPaisa,
        purchases: purchasesPaisa,
        closing_stock: closingPaisa,
        cogs,
        sales_revenue: salesPaisa,
        cogs_percentage: cogsPercentage,
        category: entry.category,
        is_active: true,
        created_by: userId,
        updated_by: userId,
      });

      result.categories.push({
        category: entry.category,
        openingStock: openingPaisa,
        purchases: purchasesPaisa,
        closingStock: closingPaisa,
        cogs,
        salesRevenue: salesPaisa,
        cogsPercentage: MoneyUtil.fromBasisPoints(cogsPercentage),
      });

      result.totalCOGS = MoneyUtil.add(result.totalCOGS, cogs);
      result.totalRevenue = MoneyUtil.add(result.totalRevenue, salesPaisa);

      // Trigger auto-posting
      await eventBus.publish(
        'COGS_CALCULATED',
        'COGSEntry',
        id,
        {
          closingDate: periodEnd,
          category: entry.category,
          cogs,
          openingValue: openingPaisa,
          purchases: purchasesPaisa,
          closingValue: closingPaisa,
          outletId,
        },
        { userId, organizationId, outletId }
      );
    }

    result.overallCOGSPercentage = result.totalRevenue > 0
      ? MoneyUtil.fromBasisPoints(Math.round((result.totalCOGS / result.totalRevenue) * 10000))
      : 0;

    logger.info(`COGS calculated for outlet ${outletId}`, {
      totalCOGS: MoneyUtil.formatINR(result.totalCOGS),
      overallPercentage: result.overallCOGSPercentage,
    });

    return result;
  }

  /**
   * Get COGS history for an outlet
   */
  async getCOGSHistory(
    organizationId: UUID,
    outletId: UUID,
    months: number = 12
  ): Promise<COGSEntry[]> {
    const db = getDb();
    const rows = await db('cogs_entries')
      .where({ organization_id: organizationId, outlet_id: outletId, is_active: true })
      .orderBy('period_start', 'desc')
      .limit(months * 5); // Multiple categories per month

    return rows.map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      outletId: r.outlet_id,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      openingStock: parseInt(r.opening_stock),
      purchases: parseInt(r.purchases),
      closingStock: parseInt(r.closing_stock),
      cogs: parseInt(r.cogs),
      salesRevenue: parseInt(r.sales_revenue),
      cogsPercentage: r.cogs_percentage,
      category: r.category,
      journalEntryId: r.journal_entry_id,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      createdBy: r.created_by,
      updatedBy: r.updated_by,
    }));
  }

  /**
   * Recipe-level costing (integration with Digitory Recipe Management)
   */
  async calculateRecipeCost(
    recipe: {
      recipeId: string;
      recipeName: string;
      sellingPrice: number;
      overheadPercentage: number;
      ingredients: {
        itemName: string;
        quantity: number;
        unit: string;
        unitCost: number; // in rupees
      }[];
    }
  ): Promise<RecipeCosting> {
    const ingredients = recipe.ingredients.map((ing) => {
      const totalCost = MoneyUtil.toPaisa(ing.quantity * ing.unitCost);
      return {
        itemName: ing.itemName,
        quantity: ing.quantity,
        unit: ing.unit,
        unitCost: MoneyUtil.toPaisa(ing.unitCost),
        totalCost,
      };
    });

    const totalIngredientCost = MoneyUtil.sum(ingredients.map((i) => i.totalCost));
    const overheadCost = MoneyUtil.percentage(
      totalIngredientCost,
      MoneyUtil.toBasisPoints(recipe.overheadPercentage)
    );
    const totalCost = MoneyUtil.add(totalIngredientCost, overheadCost);
    const sellingPricePaisa = MoneyUtil.toPaisa(recipe.sellingPrice);

    const foodCostPercentage = sellingPricePaisa > 0
      ? MoneyUtil.fromBasisPoints(Math.round((totalCost / sellingPricePaisa) * 10000))
      : 0;

    return {
      recipeId: recipe.recipeId,
      recipeName: recipe.recipeName,
      ingredients,
      totalIngredientCost,
      overheadPercentage: MoneyUtil.toBasisPoints(recipe.overheadPercentage),
      overheadCost,
      totalCost,
      sellingPrice: sellingPricePaisa,
      foodCostPercentage,
      grossMargin: 100 - foodCostPercentage,
    };
  }
}

export const cogsService = new COGSService();
