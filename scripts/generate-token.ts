import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from '../src/infrastructure/database/connection';

// Stable admin UUID (consistent across regenerations)
const ADMIN_USER_UUID = '00000000-0000-4000-a000-000000000001';

async function generateToken() {
  const db = getDb();

  // Get the seeded organization
  const org = await db('organizations').first();
  if (!org) {
    console.error('No organization found. Run seed first.');
    process.exit(1);
  }

  // Get all outlets
  const outlets = await db('outlets').where({ organization_id: org.id });

  const payload = {
    id: ADMIN_USER_UUID,
    organizationId: org.id,
    outletIds: outlets.map((o: any) => o.id),
    role: 'SUPER_ADMIN',
    permissions: [
      'employee:create', 'employee:read', 'employee:update', 'employee:delete',
      'attendance:create', 'attendance:read',
      'salary:manage', 'salary:read',
      'payroll:process', 'payroll:approve', 'payroll:read',
      'accounting:manage', 'accounting:read',
      'reports:read', 'reports:manage',
      'restaurant:manage', 'restaurant:read',
      'compliance:manage', 'compliance:read',
    ],
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-test-secret-key-for-digitory-financial-os', {
    expiresIn: '7d',
  });

  console.log('\n=== DIGITORY FINANCIAL OS - TEST TOKEN ===\n');
  console.log('Organization:', org.name, `(${org.id})`);
  console.log('Outlets:');
  outlets.forEach((o: any) => console.log(`  - ${o.name} (${o.id}) [${o.type}]`));
  console.log('\nJWT Token (valid 7 days):');
  console.log(token);
  console.log('\nUsage:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/v1/accounting/accounts`);
  console.log('');

  await closeDb();
}

generateToken().catch(console.error);
