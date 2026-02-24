import { v4 as uuidv4 } from 'uuid';
import { getDb, closeDb } from '../src/infrastructure/database/connection';

async function addTestEmployees() {
  const db = getDb();

  const org = await db('organizations').first();
  if (!org) { console.error('No org found'); process.exit(1); }

  const outlets = await db('outlets').where({ organization_id: org.id });
  const restaurant = outlets.find((o: any) => o.type === 'RESTAURANT');
  const brewery = outlets.find((o: any) => o.type === 'BREWERY');
  const ck = outlets.find((o: any) => o.type === 'CENTRAL_KITCHEN');

  const templates = await db('salary_templates').where({ organization_id: org.id });
  const kitchenTemplate = templates.find((t: any) => t.name.includes('Kitchen'));
  const serviceTemplate = templates.find((t: any) => t.name.includes('Service'));
  const mgmtTemplate = templates.find((t: any) => t.name.includes('Management'));

  const systemUser = uuidv4();
  const address = JSON.stringify({ line1: '123 Test St', city: 'Mumbai', state: 'MH', pincode: '400001', country: 'IN' });

  const employees = [
    // Kitchen staff - Downtown Restaurant
    { code: 'EMP00001', first: 'Rajesh', last: 'Sharma', dept: 'KITCHEN', desig: 'EXECUTIVE_CHEF', outlet: restaurant!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00002', first: 'Amit', last: 'Patel', dept: 'KITCHEN', desig: 'CDP', outlet: restaurant!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00003', first: 'Suresh', last: 'Kumar', dept: 'KITCHEN', desig: 'COMMIS_I', outlet: restaurant!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00004', first: 'Ravi', last: 'Singh', dept: 'KITCHEN', desig: 'KITCHEN_HELPER', outlet: restaurant!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
    // Service staff - Downtown Restaurant
    { code: 'EMP00005', first: 'Priya', last: 'Nair', dept: 'SERVICE', desig: 'CAPTAIN', outlet: restaurant!.id, template: serviceTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00006', first: 'Arun', last: 'Menon', dept: 'SERVICE', desig: 'STEWARD', outlet: restaurant!.id, template: serviceTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00007', first: 'Deepa', last: 'Iyer', dept: 'SERVICE', desig: 'HOST', outlet: restaurant!.id, template: serviceTemplate?.id, pay: 'MONTHLY_FIXED' },
    // Bar staff - Brewery
    { code: 'EMP00008', first: 'Vikram', last: 'Joshi', dept: 'BAR', desig: 'BAR_MANAGER', outlet: brewery!.id, template: serviceTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00009', first: 'Nikhil', last: 'Rao', dept: 'BAR', desig: 'BARTENDER', outlet: brewery!.id, template: serviceTemplate?.id, pay: 'MONTHLY_FIXED' },
    // Management
    { code: 'EMP00010', first: 'Sangeeta', last: 'Desai', dept: 'MANAGEMENT', desig: 'RESTAURANT_MANAGER', outlet: restaurant!.id, template: mgmtTemplate?.id, pay: 'MONTHLY_FIXED' },
    // Central Kitchen
    { code: 'EMP00011', first: 'Manoj', last: 'Pillai', dept: 'CENTRAL_KITCHEN', desig: 'SOUS_CHEF', outlet: ck!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
    { code: 'EMP00012', first: 'Kiran', last: 'Naik', dept: 'CENTRAL_KITCHEN', desig: 'COMMIS_II', outlet: ck!.id, template: kitchenTemplate?.id, pay: 'MONTHLY_FIXED' },
  ];

  console.log('\nAdding test employees...\n');

  for (const emp of employees) {
    const id = uuidv4();
    await db('employees').insert({
      id,
      employee_code: emp.code,
      organization_id: org.id,
      first_name: emp.first,
      last_name: emp.last,
      date_of_birth: '1990-01-15',
      gender: 'MALE',
      phone: '9876543210',
      address,
      department: emp.dept,
      designation: emp.desig,
      employment_type: 'FULL_TIME',
      pay_type: emp.pay,
      date_of_joining: '2024-01-01',
      pan: 'ABCDE1234F',
      uan: '100012345678',
      bank_ifsc: 'SBIN0001234',
      bank_name: 'State Bank of India',
      bank_account_encrypted: '12345678901234',
      primary_outlet_id: emp.outlet,
      salary_template_id: emp.template,
      attendance_source: 'MANUAL',
      is_active: true,
      created_by: systemUser,
      updated_by: systemUser,
    });

    // Create outlet mapping
    await db('employee_outlet_mappings').insert({
      id: uuidv4(),
      employee_id: id,
      outlet_id: emp.outlet,
      is_primary: true,
      allocation_percentage: 10000,
      effective_from: '2024-01-01',
    });

    console.log(`  ✓ ${emp.code} - ${emp.first} ${emp.last} (${emp.dept} - ${emp.desig})`);
  }

  // Now assign salary structures
  console.log('\nAssigning salary structures...\n');

  const salaryData: Record<string, number> = {
    'EMP00001': 600000,  // Executive Chef - ₹6L CTC
    'EMP00002': 360000,  // CDP - ₹3.6L
    'EMP00003': 240000,  // Commis I - ₹2.4L
    'EMP00004': 180000,  // Kitchen Helper - ₹1.8L
    'EMP00005': 300000,  // Captain - ₹3L
    'EMP00006': 216000,  // Steward - ₹2.16L
    'EMP00007': 240000,  // Host - ₹2.4L
    'EMP00008': 480000,  // Bar Manager - ₹4.8L
    'EMP00009': 264000,  // Bartender - ₹2.64L
    'EMP00010': 720000,  // Restaurant Manager - ₹7.2L
    'EMP00011': 420000,  // Sous Chef - ₹4.2L
    'EMP00012': 204000,  // Commis II - ₹2.04L
  };

  const components = await db('salary_components').where({ organization_id: org.id, is_active: true });

  for (const [empCode, ctcRupees] of Object.entries(salaryData)) {
    const emp = await db('employees').where({ employee_code: empCode, organization_id: org.id }).first();
    if (!emp) continue;

    const ctcPaisa = ctcRupees * 100;
    const ctcMonthly = Math.round(ctcPaisa / 12);
    const basicMonthly = Math.round(ctcMonthly * 0.4); // 40% of CTC
    const grossMonthly = ctcMonthly; // Simplified

    const structureId = uuidv4();
    await db('employee_salary_structures').insert({
      id: structureId,
      employee_id: emp.id,
      template_id: emp.salary_template_id,
      ctc_annual: ctcPaisa,
      gross_monthly: grossMonthly,
      basic_monthly: basicMonthly,
      effective_from: '2024-01-01',
      is_active: true,
      created_by: systemUser,
      updated_by: systemUser,
    });

    // Add component breakdowns
    for (const comp of components) {
      let monthlyAmount = 0;
      switch (comp.code) {
        case 'BASIC': monthlyAmount = basicMonthly; break;
        case 'HRA': monthlyAmount = Math.round(basicMonthly * 0.5); break;
        case 'SPECIAL': monthlyAmount = Math.round(ctcMonthly * 0.2); break;
        case 'CONVEYANCE': monthlyAmount = 160000; break; // ₹1600
        case 'MEDICAL': monthlyAmount = 125000; break; // ₹1250
      }

      await db('employee_salary_components').insert({
        id: uuidv4(),
        structure_id: structureId,
        component_id: comp.id,
        monthly_amount: monthlyAmount,
        annual_amount: monthlyAmount * 12,
      });
    }

    console.log(`  ✓ ${empCode} - CTC ₹${(ctcRupees).toLocaleString('en-IN')}/yr (₹${Math.round(ctcRupees/12).toLocaleString('en-IN')}/mo)`);
  }

  // Add attendance for current month (February 2026)
  console.log('\nAdding attendance for February 2026...\n');

  const allEmps = await db('employees').where({ organization_id: org.id, is_active: true });

  for (const emp of allEmps) {
    // Add attendance for days 1-23 of Feb 2026
    for (let day = 1; day <= 23; day++) {
      const date = `2026-02-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(date).getDay();
      const isWeekOff = dayOfWeek === 0; // Sunday off
      const status = isWeekOff ? 'WEEK_OFF' : 'PRESENT';

      await db('attendance_records').insert({
        id: uuidv4(),
        employee_id: emp.id,
        outlet_id: emp.primary_outlet_id,
        date,
        source: 'MANUAL',
        check_in: isWeekOff ? null : `${date}T09:00:00`,
        check_out: isWeekOff ? null : `${date}T18:00:00`,
        hours_worked: isWeekOff ? 0 : 8,
        overtime_hours: (day % 5 === 0 && !isWeekOff) ? 2 : 0, // OT every 5th day
        status,
        is_active: true,
        created_by: systemUser,
        updated_by: systemUser,
      });
    }
  }

  console.log(`  ✓ Attendance added for ${allEmps.length} employees (Feb 1-23, 2026)`);

  console.log('\n=== TEST DATA READY ===\n');
  console.log(`Organization: ${org.name} (${org.id})`);
  console.log(`Employees: ${allEmps.length}`);
  console.log(`Outlets: ${outlets.length}`);
  console.log('');

  await closeDb();
}

addTestEmployees().catch(console.error);
