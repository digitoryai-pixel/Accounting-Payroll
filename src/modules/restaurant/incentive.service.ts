import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { NotFoundError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate, IncentiveRule, EmployeeDepartment } from '../../common/types';

export interface IncentiveCalculationResult {
  outletId: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  rules: {
    ruleId: UUID;
    ruleName: string;
    targetType: string;
    targetValue: number;
    actualValue: number;
    achieved: boolean;
    eligibleEmployees: {
      employeeId: UUID;
      name: string;
      incentiveAmount: Money;
    }[];
  }[];
  totalIncentives: Money;
}

export class IncentiveService {
  async createRule(
    rule: {
      name: string;
      organizationId: UUID;
      outletId?: UUID;
      targetType: 'SALES_AMOUNT' | 'COVERS' | 'AVERAGE_TICKET' | 'FOOD_COST_PCT' | 'REVIEW_RATING';
      targetValue: number;
      incentiveType: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_EXCESS';
      incentiveValue: number;
      applicableDepartments: EmployeeDepartment[];
      applicableDesignations?: string[];
      periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    },
    userId: UUID
  ): Promise<IncentiveRule> {
    const db = getDb();
    const id = uuidv4();

    await db('incentive_rules').insert({
      id,
      name: rule.name,
      organization_id: rule.organizationId,
      outlet_id: rule.outletId,
      target_type: rule.targetType,
      target_value: rule.targetValue,
      incentive_type: rule.incentiveType,
      incentive_value: rule.incentiveValue,
      applicable_departments: rule.applicableDepartments,
      applicable_designations: rule.applicableDesignations || [],
      period_type: rule.periodType,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    return this.getRule(id);
  }

  async getRule(id: UUID): Promise<IncentiveRule> {
    const db = getDb();
    const row = await db('incentive_rules').where({ id }).first();
    if (!row) throw new NotFoundError('IncentiveRule', id);
    return this.mapRule(row);
  }

  async listRules(organizationId: UUID, outletId?: UUID): Promise<IncentiveRule[]> {
    const db = getDb();
    let query = db('incentive_rules')
      .where({ organization_id: organizationId, is_active: true });
    if (outletId) {
      query = query.where((builder) => {
        builder.where({ outlet_id: outletId }).orWhereNull('outlet_id');
      });
    }
    const rows = await query;
    return rows.map((r: any) => this.mapRule(r));
  }

  /**
   * Calculate incentives based on actual performance metrics.
   * Actual values would come from Digitory POS integration (sales, covers, etc.)
   */
  async calculateIncentives(
    outletId: UUID,
    organizationId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate,
    actualMetrics: Record<string, number> // e.g., { SALES_AMOUNT: 500000, COVERS: 1200 }
  ): Promise<IncentiveCalculationResult> {
    const db = getDb();

    const rules = await this.listRules(organizationId, outletId);
    const employees = await db('employees')
      .where({ primary_outlet_id: outletId, is_active: true });

    const result: IncentiveCalculationResult = {
      outletId,
      periodStart,
      periodEnd,
      rules: [],
      totalIncentives: 0,
    };

    for (const rule of rules) {
      const actualValue = actualMetrics[rule.targetType] || 0;
      const achieved = rule.targetType === 'FOOD_COST_PCT'
        ? actualValue <= rule.targetValue // Lower food cost is better
        : actualValue >= rule.targetValue;

      const eligibleEmployees: IncentiveCalculationResult['rules'][0]['eligibleEmployees'] = [];

      if (achieved) {
        // Filter eligible employees
        const eligible = employees.filter((emp: any) => {
          const deptMatch = rule.applicableDepartments.includes(emp.department);
          const desigMatch = !rule.applicableDesignations?.length ||
            rule.applicableDesignations.includes(emp.designation);
          return deptMatch && desigMatch;
        });

        for (const emp of eligible) {
          let incentiveAmount: Money = 0;

          if (rule.incentiveType === 'FIXED_AMOUNT') {
            incentiveAmount = MoneyUtil.toPaisa(rule.incentiveValue);
          } else if (rule.incentiveType === 'PERCENTAGE_OF_EXCESS') {
            const excess = actualValue - rule.targetValue;
            if (excess > 0) {
              incentiveAmount = MoneyUtil.percentage(
                MoneyUtil.toPaisa(excess),
                MoneyUtil.toBasisPoints(rule.incentiveValue)
              );
              // Split equally among eligible
              incentiveAmount = MoneyUtil.divide(incentiveAmount, eligible.length);
            }
          }

          eligibleEmployees.push({
            employeeId: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            incentiveAmount,
          });

          result.totalIncentives = MoneyUtil.add(result.totalIncentives, incentiveAmount);
        }
      }

      result.rules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        targetType: rule.targetType,
        targetValue: rule.targetValue,
        actualValue,
        achieved,
        eligibleEmployees,
      });
    }

    logger.info(`Incentives calculated for outlet ${outletId}`, {
      rulesEvaluated: rules.length,
      totalIncentives: result.totalIncentives,
    });

    return result;
  }

  private mapRule(row: any): IncentiveRule {
    return {
      id: row.id,
      name: row.name,
      organizationId: row.organization_id,
      outletId: row.outlet_id,
      targetType: row.target_type,
      targetValue: parseFloat(row.target_value),
      incentiveType: row.incentive_type,
      incentiveValue: parseFloat(row.incentive_value),
      applicableDepartments: row.applicable_departments,
      applicableDesignations: row.applicable_designations,
      periodType: row.period_type,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const incentiveService = new IncentiveService();
