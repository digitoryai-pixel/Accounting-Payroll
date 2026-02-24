import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { NotFoundError, ValidationError } from '../../common/errors';
import { MoneyUtil } from '../../common/utils/money';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate, EmployeeDepartment, TipPoolConfig } from '../../common/types';

export interface TipDistributionResult {
  totalCollected: Money;
  totalDistributed: Money;
  distributions: {
    employeeId: UUID;
    employeeName: string;
    department: EmployeeDepartment;
    designation: string;
    share: Money;
    hoursWorked?: number;
    weight?: number;
  }[];
}

export class TipPoolService {
  async createConfig(
    outletId: UUID,
    config: {
      name: string;
      poolingMethod: 'EQUAL' | 'HOURS_BASED' | 'ROLE_WEIGHTED' | 'POINT_SYSTEM';
      eligibleDepartments: EmployeeDepartment[];
      roleWeights?: Record<string, number>;
      managementCut?: number;
      kitchenShare?: number;
      serviceShare?: number;
    },
    userId: UUID
  ): Promise<TipPoolConfig> {
    const db = getDb();
    const id = uuidv4();

    await db('tip_pool_configs').insert({
      id,
      outlet_id: outletId,
      name: config.name,
      pooling_method: config.poolingMethod,
      eligible_departments: config.eligibleDepartments,
      role_weights: config.roleWeights ? JSON.stringify(config.roleWeights) : null,
      management_cut: config.managementCut,
      kitchen_share: config.kitchenShare,
      service_share: config.serviceShare,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    return this.getConfig(id);
  }

  async getConfig(id: UUID): Promise<TipPoolConfig> {
    const db = getDb();
    const row = await db('tip_pool_configs').where({ id }).first();
    if (!row) throw new NotFoundError('TipPoolConfig', id);
    return {
      id: row.id,
      outletId: row.outlet_id,
      name: row.name,
      poolingMethod: row.pooling_method,
      eligibleDepartments: row.eligible_departments,
      roleWeights: row.role_weights ? (typeof row.role_weights === 'string' ? JSON.parse(row.role_weights) : row.role_weights) : undefined,
      managementCut: row.management_cut,
      kitchenShare: row.kitchen_share,
      serviceShare: row.service_share,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  async getActiveConfig(outletId: UUID): Promise<TipPoolConfig | null> {
    const db = getDb();
    const row = await db('tip_pool_configs')
      .where({ outlet_id: outletId, is_active: true })
      .first();
    if (!row) return null;
    return this.getConfig(row.id);
  }

  /**
   * Distribute tips for a given period at an outlet
   */
  async distributeTips(
    outletId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate,
    totalTipsCollected: Money,
    userId: UUID,
    organizationId: UUID
  ): Promise<TipDistributionResult> {
    const db = getDb();

    const config = await this.getActiveConfig(outletId);
    if (!config) {
      throw new ValidationError('No active tip pool configuration found for this outlet');
    }

    // Get eligible employees
    const employees = await db('employees')
      .where({ primary_outlet_id: outletId, is_active: true })
      .whereIn('department', config.eligibleDepartments);

    if (employees.length === 0) {
      throw new ValidationError('No eligible employees found for tip distribution');
    }

    // Get attendance data for the period
    const attendance = await db('attendance_records')
      .whereIn('employee_id', employees.map((e: any) => e.id))
      .whereBetween('date', [periodStart, periodEnd])
      .where({ status: 'PRESENT' });

    // Build hours map
    const hoursMap = new Map<string, number>();
    for (const record of attendance) {
      const current = hoursMap.get(record.employee_id) || 0;
      hoursMap.set(record.employee_id, current + parseFloat(record.hours_worked || '8'));
    }

    let distributable = totalTipsCollected;

    // Deduct management cut if applicable
    if (config.managementCut) {
      const mgmtAmount = MoneyUtil.percentage(totalTipsCollected, config.managementCut);
      distributable = MoneyUtil.subtract(distributable, mgmtAmount);
    }

    // Calculate per-employee share based on pooling method
    const distributions: TipDistributionResult['distributions'] = [];

    switch (config.poolingMethod) {
      case 'EQUAL': {
        const perPerson = MoneyUtil.divide(distributable, employees.length);
        for (const emp of employees) {
          distributions.push({
            employeeId: emp.id,
            employeeName: `${emp.first_name} ${emp.last_name}`,
            department: emp.department,
            designation: emp.designation,
            share: perPerson,
          });
        }
        break;
      }

      case 'HOURS_BASED': {
        const totalHours = Array.from(hoursMap.values()).reduce((a, b) => a + b, 0);
        for (const emp of employees) {
          const hours = hoursMap.get(emp.id) || 0;
          const share = totalHours > 0
            ? MoneyUtil.multiply(distributable, hours / totalHours)
            : 0;
          distributions.push({
            employeeId: emp.id,
            employeeName: `${emp.first_name} ${emp.last_name}`,
            department: emp.department,
            designation: emp.designation,
            share,
            hoursWorked: hours,
          });
        }
        break;
      }

      case 'ROLE_WEIGHTED': {
        const weights: Record<string, number> = config.roleWeights || {};
        let totalWeight = 0;
        const empWeights: { emp: any; weight: number }[] = [];

        for (const emp of employees) {
          const weight = weights[emp.designation as string] || 1;
          empWeights.push({ emp, weight });
          totalWeight += weight;
        }

        for (const { emp, weight } of empWeights) {
          const share = totalWeight > 0
            ? MoneyUtil.multiply(distributable, weight / totalWeight)
            : 0;
          distributions.push({
            employeeId: emp.id,
            employeeName: `${emp.first_name} ${emp.last_name}`,
            department: emp.department,
            designation: emp.designation,
            share,
            weight,
          });
        }
        break;
      }

      case 'POINT_SYSTEM': {
        // Points = hours * role weight
        const weights: Record<string, number> = config.roleWeights || {};
        let totalPoints = 0;
        const empPoints: { emp: any; points: number }[] = [];

        for (const emp of employees) {
          const hours = hoursMap.get(emp.id) || 0;
          const weight = weights[emp.designation as string] || 1;
          const points = hours * weight;
          empPoints.push({ emp, points });
          totalPoints += points;
        }

        for (const { emp, points } of empPoints) {
          const share = totalPoints > 0
            ? MoneyUtil.multiply(distributable, points / totalPoints)
            : 0;
          distributions.push({
            employeeId: emp.id,
            employeeName: `${emp.first_name} ${emp.last_name}`,
            department: emp.department,
            designation: emp.designation,
            share,
            weight: points,
          });
        }
        break;
      }
    }

    const totalDistributed = MoneyUtil.sum(distributions.map((d) => d.share));

    // Save distribution record
    await db('tip_distributions').insert({
      id: uuidv4(),
      outlet_id: outletId,
      period_start: periodStart,
      period_end: periodEnd,
      total_tips_collected: totalTipsCollected,
      total_distributed: totalDistributed,
      tip_pool_config_id: config.id,
      distribution_details: JSON.stringify(distributions),
      created_by: userId,
      updated_by: userId,
    });

    await eventBus.publish(
      'TIP_DISTRIBUTED',
      'TipDistribution',
      config.id,
      {
        outletId,
        periodStart,
        periodEnd,
        totalCollected: totalTipsCollected,
        totalDistributed,
        employeeCount: distributions.length,
      },
      { userId, organizationId, outletId }
    );

    logger.info(`Tips distributed for outlet ${outletId}`, {
      totalCollected: totalTipsCollected,
      totalDistributed,
      employeeCount: distributions.length,
    });

    return { totalCollected: totalTipsCollected, totalDistributed, distributions };
  }
}

export const tipPoolService = new TipPoolService();
