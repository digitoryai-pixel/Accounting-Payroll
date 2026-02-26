import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from './connection';
import { chartOfAccountsService } from '../../modules/accounting/chart-of-accounts.service';
import { complianceService } from '../../modules/compliance/compliance.service';
import { logger } from '../../common/utils/logger';

/**
 * Seed script - sets up a demo organization with:
 * - Organization + outlets
 * - Chart of accounts
 * - Compliance slabs (PF, ESI, PT, TDS)
 * - Default salary components
 * - Sample salary templates
 */
async function seed() {
  const db = getDb();
  const systemUserId = uuidv4();

  try {
    // Skip if already seeded
    const existing = await db('organizations').first();
    if (existing) {
      logger.info('Database already seeded, skipping...');
      return;
    }

    logger.info('Starting database seed...');

    // 1. Create organization
    const orgId = uuidv4();
    await db('organizations').insert({
      id: orgId,
      name: 'Demo Restaurant Group',
      legal_name: 'Demo Hospitality Pvt Ltd',
      gstin: '27DEMO00001Z5',
      pan: 'DEMO00001Z',
      tan: 'DEMO00001Z',
      registered_address: JSON.stringify({
        line1: '123 Demo Street',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400001',
        country: 'IN',
      }),
      financial_year_start: 4,
      base_currency: 'INR',
      is_active: true,
    });

    // 2. Create cost centers
    const ccHq = uuidv4();
    const ccOutlet1 = uuidv4();
    const ccOutlet2 = uuidv4();
    const ccCK = uuidv4();

    await db('cost_centers').insert([
      { id: ccHq, organization_id: orgId, code: 'CC-HQ', name: 'Head Office', type: 'OUTLET', is_active: true },
      { id: ccOutlet1, organization_id: orgId, code: 'CC-01', name: 'Main Restaurant', type: 'OUTLET', is_active: true },
      { id: ccOutlet2, organization_id: orgId, code: 'CC-02', name: 'Brewery Outlet', type: 'OUTLET', is_active: true },
      { id: ccCK, organization_id: orgId, code: 'CC-CK', name: 'Central Kitchen', type: 'PRODUCTION_UNIT', is_active: true },
    ]);

    // 3. Create outlets
    const outlet1Id = uuidv4();
    const outlet2Id = uuidv4();
    const ckId = uuidv4();

    await db('outlets').insert([
      {
        id: outlet1Id, organization_id: orgId, name: 'Downtown Restaurant', code: 'OUT-01',
        type: 'RESTAURANT', address: JSON.stringify({ line1: '456 Main St', city: 'Mumbai', state: 'MH', pincode: '400002', country: 'IN' }),
        cost_center_id: ccOutlet1, is_head_office: true, is_franchise: false, is_active: true,
        created_by: systemUserId, updated_by: systemUserId,
      },
      {
        id: outlet2Id, organization_id: orgId, name: 'Craft Brewery', code: 'OUT-02',
        type: 'BREWERY', address: JSON.stringify({ line1: '789 Brew Lane', city: 'Mumbai', state: 'MH', pincode: '400003', country: 'IN' }),
        cost_center_id: ccOutlet2, is_head_office: false, is_franchise: false, is_active: true,
        created_by: systemUserId, updated_by: systemUserId,
      },
      {
        id: ckId, organization_id: orgId, name: 'Central Production Kitchen', code: 'CK-01',
        type: 'CENTRAL_KITCHEN', address: JSON.stringify({ line1: '100 Industrial Area', city: 'Mumbai', state: 'MH', pincode: '400004', country: 'IN' }),
        cost_center_id: ccCK, is_head_office: false, is_franchise: false, is_active: true,
        created_by: systemUserId, updated_by: systemUserId,
      },
    ]);

    // 4. Seed chart of accounts
    await chartOfAccountsService.seedDefaultAccounts(orgId, systemUserId);

    // 5. Seed compliance slabs
    await complianceService.seedDefaultSlabs(orgId);

    // 6. Create default salary components
    const basicId = uuidv4();
    const hraId = uuidv4();
    const specialId = uuidv4();
    const conveyanceId = uuidv4();
    const medicalId = uuidv4();

    await db('salary_components').insert([
      { id: basicId, organization_id: orgId, code: 'BASIC', name: 'Basic Salary', type: 'EARNING', calculation_basis: 'PERCENTAGE_OF_CTC', value: 40, is_statutory: true, is_taxable: true, is_pro_rata: true, account_code: '6000', display_order: 1, is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: hraId, organization_id: orgId, code: 'HRA', name: 'House Rent Allowance', type: 'EARNING', calculation_basis: 'PERCENTAGE_OF_BASIC', value: 50, is_statutory: false, is_taxable: true, is_pro_rata: true, account_code: '6000', display_order: 2, is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: specialId, organization_id: orgId, code: 'SPECIAL', name: 'Special Allowance', type: 'EARNING', calculation_basis: 'PERCENTAGE_OF_CTC', value: 20, is_statutory: false, is_taxable: true, is_pro_rata: true, account_code: '6000', display_order: 3, is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: conveyanceId, organization_id: orgId, code: 'CONVEYANCE', name: 'Conveyance Allowance', type: 'EARNING', calculation_basis: 'FIXED', value: 1600, is_statutory: false, is_taxable: false, is_pro_rata: true, max_limit: 160000, account_code: '6000', display_order: 4, is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: medicalId, organization_id: orgId, code: 'MEDICAL', name: 'Medical Allowance', type: 'EARNING', calculation_basis: 'FIXED', value: 1250, is_statutory: false, is_taxable: false, is_pro_rata: true, max_limit: 125000, account_code: '6000', display_order: 5, is_active: true, created_by: systemUserId, updated_by: systemUserId },
    ]);

    // 7. Create salary templates
    const kitchenTemplateId = uuidv4();
    const serviceTemplateId = uuidv4();
    const managementTemplateId = uuidv4();

    await db('salary_templates').insert([
      { id: kitchenTemplateId, name: 'Kitchen Staff Template', description: 'For all kitchen roles', organization_id: orgId, applicable_departments: ['KITCHEN', 'CENTRAL_KITCHEN'], applicable_designations: [], pay_type: 'MONTHLY_FIXED', is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: serviceTemplateId, name: 'Service Staff Template', description: 'For service and bar roles', organization_id: orgId, applicable_departments: ['SERVICE', 'BAR'], applicable_designations: [], pay_type: 'MONTHLY_FIXED', is_active: true, created_by: systemUserId, updated_by: systemUserId },
      { id: managementTemplateId, name: 'Management Template', description: 'For management roles', organization_id: orgId, applicable_departments: ['MANAGEMENT', 'ACCOUNTS'], applicable_designations: [], pay_type: 'MONTHLY_FIXED', is_active: true, created_by: systemUserId, updated_by: systemUserId },
    ]);

    // Link components to templates
    const allTemplates = [kitchenTemplateId, serviceTemplateId, managementTemplateId];
    const allComponents = [basicId, hraId, specialId, conveyanceId, medicalId];

    for (const templateId of allTemplates) {
      for (const componentId of allComponents) {
        await db('salary_template_components').insert({
          id: uuidv4(),
          template_id: templateId,
          component_id: componentId,
        });
      }
    }

    logger.info('Database seed completed successfully!');
    logger.info(`Organization ID: ${orgId}`);
    logger.info(`Outlets: Downtown Restaurant (${outlet1Id}), Craft Brewery (${outlet2Id}), Central Kitchen (${ckId})`);

  } catch (error) {
    logger.error('Seed failed', { error });
    throw error;
  } finally {
    await closeDb();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
