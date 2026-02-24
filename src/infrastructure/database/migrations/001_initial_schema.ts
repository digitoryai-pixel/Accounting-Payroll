import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  // =============================================
  // ORGANIZATION & OUTLET TABLES
  // =============================================
  await knex.schema.createTable('organizations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('name', 255).notNullable();
    t.string('legal_name', 255).notNullable();
    t.string('gstin', 15);
    t.string('pan', 10);
    t.string('tan', 10);
    t.jsonb('registered_address').notNullable();
    t.integer('financial_year_start').notNullable().defaultTo(4);
    t.string('base_currency', 3).notNullable().defaultTo('INR');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('outlets', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('name', 255).notNullable();
    t.string('code', 20).notNullable();
    t.enum('type', ['RESTAURANT', 'BREWERY', 'PUB', 'QSR', 'CENTRAL_KITCHEN', 'CLOUD_KITCHEN', 'CAFE']).notNullable();
    t.jsonb('address').notNullable();
    t.string('gstin', 15);
    t.uuid('cost_center_id');
    t.boolean('is_head_office').notNullable().defaultTo(false);
    t.boolean('is_franchise').notNullable().defaultTo(false);
    t.uuid('franchise_owner_id');
    t.string('digitory_outlet_id', 100);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'code']);
  });

  // =============================================
  // COST CENTERS
  // =============================================
  await knex.schema.createTable('cost_centers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('code', 20).notNullable();
    t.string('name', 255).notNullable();
    t.enum('type', ['OUTLET', 'DEPARTMENT', 'PRODUCTION_UNIT', 'FRANCHISE']).notNullable();
    t.uuid('parent_id').references('id').inTable('cost_centers');
    t.uuid('outlet_id').references('id').inTable('outlets');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'code']);
  });

  // Add FK from outlets to cost_centers
  await knex.schema.alterTable('outlets', (t) => {
    t.foreign('cost_center_id').references('id').inTable('cost_centers');
  });

  // =============================================
  // EMPLOYEE TABLES
  // =============================================
  await knex.schema.createTable('employees', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('employee_code', 20).notNullable();
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.date('date_of_birth').notNullable();
    t.enum('gender', ['MALE', 'FEMALE', 'OTHER']).notNullable();
    t.string('phone', 15).notNullable();
    t.string('email', 255);
    t.string('emergency_contact', 15);
    t.jsonb('address').notNullable();
    t.enum('department', [
      'KITCHEN', 'SERVICE', 'BAR', 'MANAGEMENT', 'ACCOUNTS',
      'HOUSEKEEPING', 'DELIVERY', 'CENTRAL_KITCHEN'
    ]).notNullable();
    t.string('designation', 50).notNullable();
    t.enum('employment_type', ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'DAILY_WAGE', 'TRAINEE']).notNullable();
    t.enum('pay_type', ['MONTHLY_FIXED', 'HOURLY', 'PER_SHIFT', 'DAILY_WAGE']).notNullable();
    t.date('date_of_joining').notNullable();
    t.date('date_of_exit');
    t.string('exit_reason', 500);
    // Statutory - encrypted sensitive fields
    t.string('pan', 10);
    t.text('aadhaar_encrypted');
    t.string('uan', 22);
    t.string('esic_number', 17);
    t.text('bank_account_encrypted');
    t.string('bank_ifsc', 11);
    t.string('bank_name', 100);
    // Outlet mapping
    t.uuid('primary_outlet_id').notNullable().references('id').inTable('outlets');
    t.uuid('salary_template_id');
    t.enum('attendance_source', ['BIOMETRIC', 'POS_LOGIN', 'MANUAL', 'GEOFENCE']).notNullable().defaultTo('MANUAL');
    t.uuid('shift_pattern_id');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'employee_code']);
    t.index(['organization_id', 'department']);
    t.index(['primary_outlet_id']);
    t.index(['is_active']);
  });

  await knex.schema.createTable('employee_outlet_mappings', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('employee_id').notNullable().references('id').inTable('employees').onDelete('CASCADE');
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.boolean('is_primary').notNullable().defaultTo(false);
    t.integer('allocation_percentage').notNullable().defaultTo(10000); // basis points
    t.date('effective_from').notNullable();
    t.date('effective_to');
    t.timestamps(true, true);
    t.index(['employee_id']);
    t.index(['outlet_id']);
  });

  // =============================================
  // SHIFT & ATTENDANCE TABLES
  // =============================================
  await knex.schema.createTable('shift_patterns', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('name', 100).notNullable();
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('shift_definitions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('shift_pattern_id').notNullable().references('id').inTable('shift_patterns').onDelete('CASCADE');
    t.integer('day_of_week').notNullable(); // 0-6
    t.enum('shift_type', ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'SPLIT', 'FLEXIBLE']).notNullable();
    t.time('start_time').notNullable();
    t.time('end_time').notNullable();
    t.integer('break_minutes').notNullable().defaultTo(30);
    t.boolean('is_working_day').notNullable().defaultTo(true);
  });

  // Add FK from employees to shift_patterns
  await knex.schema.alterTable('employees', (t) => {
    t.foreign('shift_pattern_id').references('id').inTable('shift_patterns');
  });

  await knex.schema.createTable('attendance_records', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('employee_id').notNullable().references('id').inTable('employees');
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.date('date').notNullable();
    t.enum('source', ['BIOMETRIC', 'POS_LOGIN', 'MANUAL', 'GEOFENCE']).notNullable();
    t.timestamp('check_in');
    t.timestamp('check_out');
    t.decimal('hours_worked', 5, 2).notNullable().defaultTo(0);
    t.decimal('overtime_hours', 5, 2).notNullable().defaultTo(0);
    t.enum('status', ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF']).notNullable();
    t.string('shift_type', 20);
    t.string('remarks', 500);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['employee_id', 'date']);
    t.index(['employee_id', 'date']);
    t.index(['outlet_id', 'date']);
  });

  // =============================================
  // SALARY STRUCTURE TABLES
  // =============================================
  await knex.schema.createTable('salary_components', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('code', 20).notNullable();
    t.string('name', 100).notNullable();
    t.enum('type', ['EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION']).notNullable();
    t.enum('calculation_basis', ['FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'PERCENTAGE_OF_CTC', 'FORMULA', 'SLAB']).notNullable();
    t.decimal('value', 15, 4).notNullable().defaultTo(0);
    t.text('formula');
    t.boolean('is_statutory').notNullable().defaultTo(false);
    t.boolean('is_taxable').notNullable().defaultTo(true);
    t.boolean('is_pro_rata').notNullable().defaultTo(true);
    t.bigInteger('max_limit');
    t.string('account_code', 20);
    t.integer('display_order').notNullable().defaultTo(0);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'code']);
  });

  await knex.schema.createTable('salary_templates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('name', 100).notNullable();
    t.string('description', 500);
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.specificType('applicable_departments', 'text[]');
    t.specificType('applicable_designations', 'text[]');
    t.enum('pay_type', ['MONTHLY_FIXED', 'HOURLY', 'PER_SHIFT', 'DAILY_WAGE']).notNullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  // Add FK from employees to salary_templates
  await knex.schema.alterTable('employees', (t) => {
    t.foreign('salary_template_id').references('id').inTable('salary_templates');
  });

  await knex.schema.createTable('salary_template_components', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('template_id').notNullable().references('id').inTable('salary_templates').onDelete('CASCADE');
    t.uuid('component_id').notNullable().references('id').inTable('salary_components');
    t.decimal('override_value', 15, 4);
    t.text('override_formula');
    t.timestamps(true, true);
    t.unique(['template_id', 'component_id']);
  });

  await knex.schema.createTable('employee_salary_structures', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('employee_id').notNullable().references('id').inTable('employees');
    t.uuid('template_id').notNullable().references('id').inTable('salary_templates');
    t.bigInteger('ctc_annual').notNullable();
    t.bigInteger('gross_monthly').notNullable();
    t.bigInteger('basic_monthly').notNullable();
    t.date('effective_from').notNullable();
    t.date('effective_to');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.index(['employee_id', 'effective_from']);
  });

  await knex.schema.createTable('employee_salary_components', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('structure_id').notNullable().references('id').inTable('employee_salary_structures').onDelete('CASCADE');
    t.uuid('component_id').notNullable().references('id').inTable('salary_components');
    t.bigInteger('monthly_amount').notNullable();
    t.bigInteger('annual_amount').notNullable();
    t.decimal('override_value', 15, 4);
    t.timestamps(true, true);
    t.unique(['structure_id', 'component_id']);
  });

  // =============================================
  // PAYROLL TABLES
  // =============================================
  await knex.schema.createTable('payroll_runs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.uuid('outlet_id').references('id').inTable('outlets');
    t.enum('period_type', ['MONTHLY', 'BI_WEEKLY', 'WEEKLY']).notNullable().defaultTo('MONTHLY');
    t.date('period_start').notNullable();
    t.date('period_end').notNullable();
    t.integer('month').notNullable();
    t.integer('year').notNullable();
    t.enum('status', ['DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PROCESSED', 'PAID', 'REVERSED']).notNullable().defaultTo('DRAFT');
    t.bigInteger('total_gross').notNullable().defaultTo(0);
    t.bigInteger('total_deductions').notNullable().defaultTo(0);
    t.bigInteger('total_net').notNullable().defaultTo(0);
    t.bigInteger('total_employer_cost').notNullable().defaultTo(0);
    t.integer('employee_count').notNullable().defaultTo(0);
    t.timestamp('processed_at');
    t.uuid('processed_by');
    t.timestamp('approved_at');
    t.uuid('approved_by');
    t.uuid('journal_entry_id');
    t.string('bank_payout_file_url', 500);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.index(['organization_id', 'year', 'month']);
    t.index(['status']);
  });

  await knex.schema.createTable('payroll_slips', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('payroll_run_id').notNullable().references('id').inTable('payroll_runs').onDelete('CASCADE');
    t.uuid('employee_id').notNullable().references('id').inTable('employees');
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.date('period_start').notNullable();
    t.date('period_end').notNullable();
    t.integer('working_days').notNullable();
    t.integer('present_days').notNullable();
    t.decimal('paid_days', 5, 2).notNullable();
    t.integer('leave_days').notNullable().defaultTo(0);
    t.decimal('overtime_hours', 6, 2).notNullable().defaultTo(0);
    t.bigInteger('total_earnings').notNullable().defaultTo(0);
    t.bigInteger('total_deductions').notNullable().defaultTo(0);
    t.bigInteger('net_payable').notNullable().defaultTo(0);
    t.bigInteger('total_employer_cost').notNullable().defaultTo(0);
    t.bigInteger('tips_received').notNullable().defaultTo(0);
    t.bigInteger('service_charge_share').notNullable().defaultTo(0);
    t.bigInteger('incentive_amount').notNullable().defaultTo(0);
    t.enum('status', ['DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PROCESSED', 'PAID', 'REVERSED']).notNullable().defaultTo('DRAFT');
    t.string('payslip_pdf_url', 500);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['payroll_run_id', 'employee_id']);
    t.index(['employee_id']);
    t.index(['outlet_id']);
  });

  await knex.schema.createTable('payroll_slip_components', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('payroll_slip_id').notNullable().references('id').inTable('payroll_slips').onDelete('CASCADE');
    t.uuid('component_id').notNullable().references('id').inTable('salary_components');
    t.string('component_code', 20).notNullable();
    t.string('component_name', 100).notNullable();
    t.enum('type', ['EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION']).notNullable();
    t.bigInteger('calculated_amount').notNullable();
    t.string('remarks', 500);
    t.timestamps(true, true);
  });

  // =============================================
  // RESTAURANT-SPECIFIC PAYROLL TABLES
  // =============================================
  await knex.schema.createTable('tip_pool_configs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.string('name', 100).notNullable();
    t.enum('pooling_method', ['EQUAL', 'HOURS_BASED', 'ROLE_WEIGHTED', 'POINT_SYSTEM']).notNullable();
    t.specificType('eligible_departments', 'text[]').notNullable();
    t.jsonb('role_weights');
    t.integer('management_cut'); // basis points
    t.integer('kitchen_share'); // basis points
    t.integer('service_share'); // basis points
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('service_charge_configs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.integer('service_charge_rate').notNullable(); // basis points
    t.enum('distribution_method', ['EQUAL', 'ROLE_WEIGHTED', 'DESIGNATION_SLAB']).notNullable();
    t.integer('management_share').notNullable().defaultTo(0);
    t.integer('kitchen_share').notNullable().defaultTo(0);
    t.integer('service_share').notNullable().defaultTo(0);
    t.integer('bar_share').notNullable().defaultTo(0);
    t.integer('housekeeping_share').notNullable().defaultTo(0);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('incentive_rules', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('name', 100).notNullable();
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.uuid('outlet_id').references('id').inTable('outlets');
    t.enum('target_type', ['SALES_AMOUNT', 'COVERS', 'AVERAGE_TICKET', 'FOOD_COST_PCT', 'REVIEW_RATING']).notNullable();
    t.decimal('target_value', 15, 4).notNullable();
    t.enum('incentive_type', ['FIXED_AMOUNT', 'PERCENTAGE_OF_EXCESS']).notNullable();
    t.decimal('incentive_value', 15, 4).notNullable();
    t.specificType('applicable_departments', 'text[]').notNullable();
    t.specificType('applicable_designations', 'text[]');
    t.enum('period_type', ['DAILY', 'WEEKLY', 'MONTHLY']).notNullable().defaultTo('MONTHLY');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('tip_distributions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.date('period_start').notNullable();
    t.date('period_end').notNullable();
    t.bigInteger('total_tips_collected').notNullable();
    t.bigInteger('total_distributed').notNullable();
    t.uuid('tip_pool_config_id').notNullable().references('id').inTable('tip_pool_configs');
    t.jsonb('distribution_details').notNullable(); // per-employee breakdown
    t.uuid('journal_entry_id');
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
  });

  // =============================================
  // COMPLIANCE TABLES
  // =============================================
  await knex.schema.createTable('pf_config', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.integer('employee_contribution_rate').notNullable().defaultTo(1200); // 12%
    t.integer('employer_contribution_rate').notNullable().defaultTo(1200);
    t.integer('eps_rate').notNullable().defaultTo(833); // 8.33%
    t.integer('epf_rate').notNullable().defaultTo(367); // 3.67%
    t.integer('admin_charges').notNullable().defaultTo(50); // 0.50%
    t.integer('edli_charges').notNullable().defaultTo(50); // 0.50%
    t.bigInteger('wages_ceiling').notNullable().defaultTo(1500000); // ₹15,000 in paisa
    t.boolean('voluntary_above_ceiling').notNullable().defaultTo(false);
    t.date('effective_from').notNullable();
    t.date('effective_to');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('esi_config', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.integer('employee_contribution_rate').notNullable().defaultTo(75); // 0.75%
    t.integer('employer_contribution_rate').notNullable().defaultTo(325); // 3.25%
    t.bigInteger('wages_ceiling').notNullable().defaultTo(2100000); // ₹21,000 in paisa
    t.date('effective_from').notNullable();
    t.date('effective_to');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('professional_tax_slabs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('state', 2).notNullable();
    t.bigInteger('from_amount').notNullable();
    t.bigInteger('to_amount').notNullable();
    t.bigInteger('tax_amount').notNullable();
    t.enum('frequency', ['MONTHLY', 'ANNUAL']).notNullable().defaultTo('MONTHLY');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
    t.index(['state']);
  });

  await knex.schema.createTable('tds_slabs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.enum('regime', ['OLD', 'NEW']).notNullable();
    t.string('financial_year', 7).notNullable(); // e.g., 2024-25
    t.bigInteger('from_amount').notNullable();
    t.bigInteger('to_amount').notNullable();
    t.integer('rate').notNullable(); // basis points
    t.integer('surcharge_rate'); // basis points
    t.integer('cess_rate').notNullable().defaultTo(400); // 4%
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
    t.index(['regime', 'financial_year']);
  });

  // =============================================
  // CHART OF ACCOUNTS & JOURNAL ENTRIES
  // =============================================
  await knex.schema.createTable('chart_of_accounts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('code', 20).notNullable();
    t.string('name', 255).notNullable();
    t.enum('type', ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']).notNullable();
    t.string('sub_type', 50).notNullable();
    t.uuid('parent_account_id').references('id').inTable('chart_of_accounts');
    t.boolean('is_system_account').notNullable().defaultTo(false);
    t.boolean('is_bank_account').notNullable().defaultTo(false);
    t.jsonb('bank_details');
    t.bigInteger('balance').notNullable().defaultTo(0);
    t.uuid('cost_center_id').references('id').inTable('cost_centers');
    t.string('description', 500);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'code']);
    t.index(['organization_id', 'type']);
  });

  await knex.schema.createTable('journal_entries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.string('entry_number', 30).notNullable();
    t.date('date').notNullable();
    t.enum('source', [
      'MANUAL', 'PAYROLL', 'SALES', 'PURCHASE', 'INVENTORY',
      'STOCK_CLOSING', 'COGS', 'TIP_DISTRIBUTION', 'SERVICE_CHARGE',
      'EXPENSE', 'DEPRECIATION'
    ]).notNullable();
    t.uuid('source_reference_id');
    t.string('description', 500).notNullable();
    t.bigInteger('total_debit').notNullable();
    t.bigInteger('total_credit').notNullable();
    t.enum('status', ['DRAFT', 'POSTED', 'REVERSED']).notNullable().defaultTo('DRAFT');
    t.timestamp('posted_at');
    t.uuid('posted_by');
    t.uuid('reversal_of_id').references('id').inTable('journal_entries');
    t.string('fiscal_year', 7).notNullable();
    t.integer('fiscal_period').notNullable();
    t.specificType('tags', 'text[]');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.unique(['organization_id', 'entry_number']);
    t.index(['organization_id', 'date']);
    t.index(['source']);
    t.index(['status']);
  });

  // Add FK from payroll_runs to journal_entries
  await knex.schema.alterTable('payroll_runs', (t) => {
    t.foreign('journal_entry_id').references('id').inTable('journal_entries');
  });

  await knex.schema.createTable('journal_entry_lines', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('journal_entry_id').notNullable().references('id').inTable('journal_entries').onDelete('CASCADE');
    t.uuid('account_id').notNullable().references('id').inTable('chart_of_accounts');
    t.string('account_code', 20).notNullable();
    t.bigInteger('debit').notNullable().defaultTo(0);
    t.bigInteger('credit').notNullable().defaultTo(0);
    t.uuid('outlet_id').references('id').inTable('outlets');
    t.uuid('cost_center_id').references('id').inTable('cost_centers');
    t.string('description', 500);
    t.timestamps(true, true);
    t.index(['journal_entry_id']);
    t.index(['account_id']);
  });

  // =============================================
  // COGS TABLE
  // =============================================
  await knex.schema.createTable('cogs_entries', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.uuid('organization_id').notNullable().references('id').inTable('organizations');
    t.uuid('outlet_id').notNullable().references('id').inTable('outlets');
    t.date('period_start').notNullable();
    t.date('period_end').notNullable();
    t.bigInteger('opening_stock').notNullable();
    t.bigInteger('purchases').notNullable();
    t.bigInteger('closing_stock').notNullable();
    t.bigInteger('cogs').notNullable();
    t.bigInteger('sales_revenue').notNullable();
    t.integer('cogs_percentage').notNullable(); // basis points
    t.enum('category', ['FOOD', 'BEVERAGE', 'LIQUOR', 'PACKAGING', 'OTHER']).notNullable();
    t.uuid('journal_entry_id').references('id').inTable('journal_entries');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.uuid('created_by');
    t.uuid('updated_by');
    t.timestamps(true, true);
    t.index(['organization_id', 'outlet_id', 'period_start']);
  });

  // =============================================
  // AUDIT LOG TABLE
  // =============================================
  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('entity_type', 50).notNullable();
    t.uuid('entity_id').notNullable();
    t.enum('action', ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PROCESS']).notNullable();
    t.jsonb('old_value');
    t.jsonb('new_value');
    t.uuid('performed_by').notNullable();
    t.timestamp('performed_at').notNullable().defaultTo(knex.fn.now());
    t.string('ip_address', 45);
    t.jsonb('metadata');
    t.index(['entity_type', 'entity_id']);
    t.index(['performed_by']);
    t.index(['performed_at']);
  });

  // =============================================
  // DOMAIN EVENTS TABLE (for event sourcing)
  // =============================================
  await knex.schema.createTable('domain_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    t.string('type', 50).notNullable();
    t.string('aggregate_type', 50).notNullable();
    t.uuid('aggregate_id').notNullable();
    t.jsonb('payload').notNullable();
    t.jsonb('metadata').notNullable();
    t.timestamp('published_at');
    t.timestamps(true, true);
    t.index(['type']);
    t.index(['aggregate_type', 'aggregate_id']);
    t.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    'domain_events', 'audit_logs', 'cogs_entries',
    'journal_entry_lines', 'journal_entries', 'chart_of_accounts',
    'tds_slabs', 'professional_tax_slabs', 'esi_config', 'pf_config',
    'tip_distributions', 'incentive_rules', 'service_charge_configs', 'tip_pool_configs',
    'payroll_slip_components', 'payroll_slips', 'payroll_runs',
    'employee_salary_components', 'employee_salary_structures',
    'salary_template_components', 'salary_templates', 'salary_components',
    'attendance_records', 'shift_definitions', 'shift_patterns',
    'employee_outlet_mappings', 'employees',
    'cost_centers', 'outlets', 'organizations',
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
}
