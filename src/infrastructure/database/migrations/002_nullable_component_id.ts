import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Make component_id nullable for system-generated deductions (PF, ESI, PT, TDS)
  await knex.raw(`
    ALTER TABLE payroll_slip_components
    ALTER COLUMN component_id DROP NOT NULL;
  `);
  await knex.raw(`
    ALTER TABLE payroll_slip_components
    DROP CONSTRAINT IF EXISTS payroll_slip_components_component_id_foreign;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE payroll_slip_components
    ALTER COLUMN component_id SET NOT NULL;
  `);
}
