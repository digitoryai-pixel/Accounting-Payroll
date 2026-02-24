import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { MoneyUtil } from '../../common/utils/money';
import { NotFoundError, ValidationError } from '../../common/errors';
import { eventBus } from '../../common/events/event-bus';
import { logger } from '../../common/utils/logger';
import { UUID, Money, ISODate, EmployeeDepartment, ServiceChargeConfig } from '../../common/types';

export interface ServiceChargeDistributionResult {
  totalServiceCharge: Money;
  departmentWise: {
    department: string;
    sharePercentage: number;
    amount: Money;
    employees: {
      employeeId: UUID;
      name: string;
      share: Money;
    }[];
  }[];
}

export class ServiceChargeService {
  async createConfig(
    outletId: UUID,
    config: {
      serviceChargeRate: number; // basis points e.g., 1000 = 10%
      distributionMethod: 'EQUAL' | 'ROLE_WEIGHTED' | 'DESIGNATION_SLAB';
      managementShare: number;
      kitchenShare: number;
      serviceShare: number;
      barShare: number;
      housekeepingShare: number;
    },
    userId: UUID
  ): Promise<ServiceChargeConfig> {
    const db = getDb();

    // Validate total shares = 100%
    const totalShares = config.managementShare + config.kitchenShare +
      config.serviceShare + config.barShare + config.housekeepingShare;
    if (totalShares !== 10000) {
      throw new ValidationError(`Department shares must sum to 100% (10000 basis points). Got ${totalShares}`);
    }

    // Deactivate existing configs
    await db('service_charge_configs')
      .where({ outlet_id: outletId, is_active: true })
      .update({ is_active: false });

    const id = uuidv4();
    await db('service_charge_configs').insert({
      id,
      outlet_id: outletId,
      service_charge_rate: config.serviceChargeRate,
      distribution_method: config.distributionMethod,
      management_share: config.managementShare,
      kitchen_share: config.kitchenShare,
      service_share: config.serviceShare,
      bar_share: config.barShare,
      housekeeping_share: config.housekeepingShare,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    return this.getConfig(id);
  }

  async getConfig(id: UUID): Promise<ServiceChargeConfig> {
    const db = getDb();
    const row = await db('service_charge_configs').where({ id }).first();
    if (!row) throw new NotFoundError('ServiceChargeConfig', id);
    return {
      id: row.id,
      outletId: row.outlet_id,
      serviceChargeRate: row.service_charge_rate,
      distributionMethod: row.distribution_method,
      managementShare: row.management_share,
      kitchenShare: row.kitchen_share,
      serviceShare: row.service_share,
      barShare: row.bar_share,
      housekeepingShare: row.housekeeping_share,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  async getActiveConfig(outletId: UUID): Promise<ServiceChargeConfig | null> {
    const db = getDb();
    const row = await db('service_charge_configs')
      .where({ outlet_id: outletId, is_active: true })
      .first();
    if (!row) return null;
    return this.getConfig(row.id);
  }

  /**
   * Distribute collected service charge among employees by department allocation
   */
  async distributeServiceCharge(
    outletId: UUID,
    periodStart: ISODate,
    periodEnd: ISODate,
    totalServiceCharge: Money,
    userId: UUID,
    organizationId: UUID
  ): Promise<ServiceChargeDistributionResult> {
    const db = getDb();

    const config = await this.getActiveConfig(outletId);
    if (!config) {
      throw new ValidationError('No active service charge configuration for this outlet');
    }

    // Get employees by department
    const employees = await db('employees')
      .where({ primary_outlet_id: outletId, is_active: true });

    const departmentMap: Record<string, { share: number; deptName: string }> = {
      MANAGEMENT: { share: config.managementShare, deptName: 'Management' },
      KITCHEN: { share: config.kitchenShare, deptName: 'Kitchen' },
      CENTRAL_KITCHEN: { share: config.kitchenShare, deptName: 'Kitchen' },
      SERVICE: { share: config.serviceShare, deptName: 'Service' },
      BAR: { share: config.barShare, deptName: 'Bar' },
      HOUSEKEEPING: { share: config.housekeepingShare, deptName: 'Housekeeping' },
    };

    const result: ServiceChargeDistributionResult = {
      totalServiceCharge,
      departmentWise: [],
    };

    // Group employees by department
    const deptGroups = new Map<string, any[]>();
    for (const emp of employees) {
      const dept = emp.department as string;
      if (!deptGroups.has(dept)) deptGroups.set(dept, []);
      deptGroups.get(dept)!.push(emp);
    }

    for (const [dept, emps] of deptGroups) {
      const mapping = departmentMap[dept];
      if (!mapping || mapping.share === 0) continue;

      const deptAmount = MoneyUtil.percentage(totalServiceCharge, mapping.share);

      // Equal distribution within department (for EQUAL method)
      const perEmployee = emps.length > 0 ? MoneyUtil.divide(deptAmount, emps.length) : 0;

      const empDistributions = emps.map((emp: any) => ({
        employeeId: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        share: perEmployee,
      }));

      result.departmentWise.push({
        department: mapping.deptName,
        sharePercentage: MoneyUtil.fromBasisPoints(mapping.share),
        amount: deptAmount,
        employees: empDistributions,
      });
    }

    await eventBus.publish(
      'SERVICE_CHARGE_DISTRIBUTED',
      'ServiceChargeDistribution',
      outletId,
      {
        outletId,
        periodStart,
        periodEnd,
        totalServiceCharge,
        departmentCount: result.departmentWise.length,
      },
      { userId, organizationId, outletId }
    );

    logger.info(`Service charge distributed for outlet ${outletId}`, {
      totalServiceCharge,
      departments: result.departmentWise.length,
    });

    return result;
  }
}

export const serviceChargeService = new ServiceChargeService();
