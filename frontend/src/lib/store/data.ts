// ============================================================================
// F&B Accounting System - Demo Data
// Spice Garden Restaurant Group, Mumbai
// ============================================================================

import type {
  AppState,
  Organization,
  Outlet,
  Account,
  JournalEntry,
  Vendor,
  PurchaseOrder,
  Bill,
  Customer,
  Invoice,
  Recipe,
  InventoryItem,
  StockMovement,
  WastageEntry,
  AggregatorOrder,
  AggregatorSettlement,
  GSTReturn,
  Employee,
  PayrollRun,
  BillOfMaterials,
  ProductionOrder,
  B2BCustomer,
  SalesOrder,
  DashboardStats,
} from './types';

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

const organization: Organization = {
  id: 'uuid-org-1',
  name: 'Spice Garden Restaurant Group',
  legalName: 'Spice Garden Foods Pvt. Ltd.',
  gstin: '27AADCS1234F1ZH',
  pan: 'AADCS1234F',
  address: '401, Pinnacle Business Park, Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400069',
  phone: '+91-22-4567-8900',
  email: 'accounts@spicegarden.in',
  website: 'https://spicegarden.in',
  financialYearStart: 4,
  baseCurrency: 'INR',
  createdAt: '2023-04-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Outlets
// ---------------------------------------------------------------------------

const outlets: Outlet[] = [
  {
    id: 'uuid-outlet-1',
    organizationId: 'uuid-org-1',
    name: 'Spice Garden Andheri',
    code: 'SGA',
    type: 'RESTAURANT',
    address: '12, Lokhandwala Complex, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    phone: '+91-22-2631-4500',
    email: 'andheri@spicegarden.in',
    gstin: '27AADCS1234F1ZH',
    fssaiLicense: '11523045000123',
    isActive: true,
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-outlet-2',
    organizationId: 'uuid-org-1',
    name: 'Spice Garden BKC',
    code: 'SGB',
    type: 'QSR',
    address: 'G-07, Trade Centre, BKC',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    phone: '+91-22-2654-7800',
    email: 'bkc@spicegarden.in',
    gstin: '27AADCS1234F2ZG',
    fssaiLicense: '11523045000456',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-outlet-3',
    organizationId: 'uuid-org-1',
    name: 'Cloud Kitchen Powai',
    code: 'CKP',
    type: 'CLOUD_KITCHEN',
    address: 'Unit 5, Industrial Estate, Powai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400076',
    phone: '+91-22-2570-3200',
    email: 'powai@spicegarden.in',
    gstin: '27AADCS1234F3ZF',
    fssaiLicense: '11523045000789',
    isActive: true,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Chart of Accounts
// ---------------------------------------------------------------------------

const accounts: Account[] = [
  // ASSET accounts
  { id: 'uuid-acc-1', code: '1000', name: 'Cash on Hand', type: 'ASSET', subType: 'CASH', isActive: true, balance: 28500000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-2', code: '1010', name: 'HDFC Bank - Current Account', type: 'ASSET', subType: 'BANK', isActive: true, balance: 345000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-3', code: '1020', name: 'ICICI Bank - Operations Account', type: 'ASSET', subType: 'BANK', isActive: true, balance: 128000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-4', code: '1100', name: 'Accounts Receivable', type: 'ASSET', subType: 'ACCOUNTS_RECEIVABLE', isActive: true, balance: 87500000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-5', code: '1200', name: 'Food Inventory', type: 'ASSET', subType: 'INVENTORY', isActive: true, balance: 42000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-6', code: '1210', name: 'Beverage Inventory', type: 'ASSET', subType: 'INVENTORY', isActive: true, balance: 18500000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-7', code: '1220', name: 'Packaging Inventory', type: 'ASSET', subType: 'INVENTORY', isActive: true, balance: 6500000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-8', code: '1300', name: 'Kitchen Equipment', type: 'ASSET', subType: 'FIXED_ASSET', isActive: true, balance: 350000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-9', code: '1310', name: 'Furniture & Fixtures', type: 'ASSET', subType: 'FIXED_ASSET', isActive: true, balance: 180000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-10', code: '1400', name: 'Prepaid Rent', type: 'ASSET', subType: 'PREPAID_EXPENSE', isActive: true, balance: 75000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-29', code: '1500', name: 'GST Input Credit', type: 'ASSET', subType: 'OTHER_CURRENT_ASSET', isActive: true, balance: 15600000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  // LIABILITY accounts
  { id: 'uuid-acc-11', code: '2000', name: 'Accounts Payable', type: 'LIABILITY', subType: 'ACCOUNTS_PAYABLE', isActive: true, balance: 56000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-12', code: '2100', name: 'GST Payable', type: 'LIABILITY', subType: 'TAX_PAYABLE', isActive: true, balance: 32000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-13', code: '2110', name: 'TDS Payable', type: 'LIABILITY', subType: 'TAX_PAYABLE', isActive: true, balance: 8500000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-14', code: '2200', name: 'Salary Payable', type: 'LIABILITY', subType: 'SALARY_PAYABLE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-15', code: '2300', name: 'PF Payable', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', isActive: true, balance: 4200000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-16', code: '2400', name: 'Business Loan - HDFC', type: 'LIABILITY', subType: 'LONG_TERM_LIABILITY', isActive: true, balance: 500000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  // EQUITY accounts
  { id: 'uuid-acc-17', code: '3000', name: 'Owner\'s Capital', type: 'EQUITY', subType: 'OWNERS_EQUITY', isActive: true, balance: 800000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-18', code: '3100', name: 'Retained Earnings', type: 'EQUITY', subType: 'RETAINED_EARNINGS', isActive: true, balance: 125000000, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  // REVENUE accounts
  { id: 'uuid-acc-19', code: '4000', name: 'Food Sales - Dine In', type: 'REVENUE', subType: 'FOOD_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-20', code: '4010', name: 'Beverage Sales', type: 'REVENUE', subType: 'BEVERAGE_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-21', code: '4020', name: 'Aggregator Sales - Swiggy', type: 'REVENUE', subType: 'AGGREGATOR_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-22', code: '4030', name: 'Aggregator Sales - Zomato', type: 'REVENUE', subType: 'AGGREGATOR_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-23', code: '4040', name: 'Catering Revenue', type: 'REVENUE', subType: 'CATERING_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-30', code: '4050', name: 'B2B Sales', type: 'REVENUE', subType: 'SALES_REVENUE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-31', code: '4900', name: 'Other Income', type: 'REVENUE', subType: 'OTHER_INCOME', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  // EXPENSE accounts
  { id: 'uuid-acc-24', code: '5000', name: 'Food Cost', type: 'EXPENSE', subType: 'FOOD_COST', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-25', code: '5010', name: 'Beverage Cost', type: 'EXPENSE', subType: 'BEVERAGE_COST', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-32', code: '5020', name: 'Packaging Cost', type: 'EXPENSE', subType: 'PACKAGING_COST', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-26', code: '5100', name: 'Salaries & Wages', type: 'EXPENSE', subType: 'SALARY_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-27', code: '5200', name: 'Rent Expense', type: 'EXPENSE', subType: 'RENT_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-28', code: '5300', name: 'Aggregator Commission', type: 'EXPENSE', subType: 'AGGREGATOR_COMMISSION', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-33', code: '5400', name: 'Utilities (Gas, Electric, Water)', type: 'EXPENSE', subType: 'UTILITY_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-34', code: '5500', name: 'Repairs & Maintenance', type: 'EXPENSE', subType: 'REPAIR_MAINTENANCE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-35', code: '5600', name: 'Marketing & Advertising', type: 'EXPENSE', subType: 'MARKETING_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-36', code: '5700', name: 'Depreciation', type: 'EXPENSE', subType: 'DEPRECIATION', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-37', code: '5800', name: 'Insurance', type: 'EXPENSE', subType: 'INSURANCE_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-acc-38', code: '5900', name: 'FSSAI & License Fees', type: 'EXPENSE', subType: 'LICENSE_EXPENSE', isActive: true, balance: 0, createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
];

// ---------------------------------------------------------------------------
// Journal Entries
// ---------------------------------------------------------------------------

const journalEntries: JournalEntry[] = [
  {
    id: 'uuid-je-1',
    entryNumber: 'JE-2026-001',
    date: '2026-02-01',
    description: 'Monthly rent payment - all outlets',
    status: 'POSTED',
    source: 'MANUAL',
    referenceNumber: 'RENT-FEB-26',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-01T10:00:00Z',
    lines: [
      { id: 'uuid-jel-1a', accountId: 'uuid-acc-27', accountCode: '5200', accountName: 'Rent Expense', debit: 45000000, credit: 0, description: 'Rent - Andheri, BKC, Powai', outletId: 'uuid-outlet-1' },
      { id: 'uuid-jel-1b', accountId: 'uuid-acc-2', accountCode: '1010', accountName: 'HDFC Bank - Current Account', debit: 0, credit: 45000000, description: 'Rent payment via bank transfer' },
    ],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'uuid-je-2',
    entryNumber: 'JE-2026-002',
    date: '2026-02-03',
    description: 'Daily dine-in sales - Andheri outlet',
    status: 'POSTED',
    source: 'SALES',
    referenceNumber: 'SALES-SGA-20260203',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-03T22:00:00Z',
    lines: [
      { id: 'uuid-jel-2a', accountId: 'uuid-acc-1', accountCode: '1000', accountName: 'Cash on Hand', debit: 8500000, credit: 0, description: 'Cash sales', outletId: 'uuid-outlet-1' },
      { id: 'uuid-jel-2b', accountId: 'uuid-acc-2', accountCode: '1010', accountName: 'HDFC Bank - Current Account', debit: 12300000, credit: 0, description: 'Card/UPI sales' },
      { id: 'uuid-jel-2c', accountId: 'uuid-acc-19', accountCode: '4000', accountName: 'Food Sales - Dine In', debit: 0, credit: 17627119, description: 'Net food sales' },
      { id: 'uuid-jel-2d', accountId: 'uuid-acc-12', accountCode: '2100', accountName: 'GST Payable', debit: 0, credit: 3172881, description: 'GST @ 5% on food sales' },
    ],
    createdAt: '2026-02-03T22:00:00Z',
    updatedAt: '2026-02-03T22:00:00Z',
  },
  {
    id: 'uuid-je-3',
    entryNumber: 'JE-2026-003',
    date: '2026-02-05',
    description: 'Vegetable purchase from Fresh Farms - Andheri',
    status: 'POSTED',
    source: 'PURCHASE',
    referenceNumber: 'BILL-2026-001',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-05T14:00:00Z',
    lines: [
      { id: 'uuid-jel-3a', accountId: 'uuid-acc-5', accountCode: '1200', accountName: 'Food Inventory', debit: 7800000, credit: 0, description: 'Vegetables purchased' },
      { id: 'uuid-jel-3b', accountId: 'uuid-acc-29', accountCode: '1500', accountName: 'GST Input Credit', debit: 390000, credit: 0, description: 'GST ITC @ 5%' },
      { id: 'uuid-jel-3c', accountId: 'uuid-acc-11', accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 8190000, description: 'Amount payable to Fresh Farms' },
    ],
    createdAt: '2026-02-05T14:00:00Z',
    updatedAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'uuid-je-4',
    entryNumber: 'JE-2026-004',
    date: '2026-02-07',
    description: 'Swiggy settlement received for week 1-7 Feb',
    status: 'POSTED',
    source: 'AGGREGATOR',
    referenceNumber: 'SWG-SETTLE-W1-FEB26',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-07T16:00:00Z',
    lines: [
      { id: 'uuid-jel-4a', accountId: 'uuid-acc-2', accountCode: '1010', accountName: 'HDFC Bank - Current Account', debit: 18500000, credit: 0, description: 'Swiggy weekly settlement' },
      { id: 'uuid-jel-4b', accountId: 'uuid-acc-28', accountCode: '5300', accountName: 'Aggregator Commission', debit: 5200000, credit: 0, description: 'Swiggy commission @ 22%' },
      { id: 'uuid-jel-4c', accountId: 'uuid-acc-21', accountCode: '4020', accountName: 'Aggregator Sales - Swiggy', debit: 0, credit: 22523810, description: 'Swiggy gross sales (excl GST)' },
      { id: 'uuid-jel-4d', accountId: 'uuid-acc-12', accountCode: '2100', accountName: 'GST Payable', debit: 0, credit: 1176190, description: 'GST on Swiggy sales' },
    ],
    createdAt: '2026-02-07T16:00:00Z',
    updatedAt: '2026-02-07T16:00:00Z',
  },
  {
    id: 'uuid-je-5',
    entryNumber: 'JE-2026-005',
    date: '2026-02-10',
    description: 'Meat purchase from Mumbai Meats - BKC',
    status: 'POSTED',
    source: 'PURCHASE',
    referenceNumber: 'BILL-2026-003',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-10T11:00:00Z',
    lines: [
      { id: 'uuid-jel-5a', accountId: 'uuid-acc-5', accountCode: '1200', accountName: 'Food Inventory', debit: 12000000, credit: 0, description: 'Chicken & mutton purchase' },
      { id: 'uuid-jel-5b', accountId: 'uuid-acc-29', accountCode: '1500', accountName: 'GST Input Credit', debit: 600000, credit: 0, description: 'GST ITC @ 5%' },
      { id: 'uuid-jel-5c', accountId: 'uuid-acc-11', accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 12600000, description: 'Amount payable to Mumbai Meats' },
    ],
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'uuid-je-6',
    entryNumber: 'JE-2026-006',
    date: '2026-02-12',
    description: 'Vendor payment - Fresh Farms Produce',
    status: 'POSTED',
    source: 'MANUAL',
    referenceNumber: 'PAY-VND-001',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-12T15:00:00Z',
    lines: [
      { id: 'uuid-jel-6a', accountId: 'uuid-acc-11', accountCode: '2000', accountName: 'Accounts Payable', debit: 8190000, credit: 0, description: 'Payment to Fresh Farms' },
      { id: 'uuid-jel-6b', accountId: 'uuid-acc-2', accountCode: '1010', accountName: 'HDFC Bank - Current Account', debit: 0, credit: 8190000, description: 'Bank transfer to Fresh Farms' },
    ],
    createdAt: '2026-02-12T15:00:00Z',
    updatedAt: '2026-02-12T15:00:00Z',
  },
  {
    id: 'uuid-je-7',
    entryNumber: 'JE-2026-007',
    date: '2026-02-15',
    description: 'Catering event - corporate party',
    status: 'POSTED',
    source: 'SALES',
    referenceNumber: 'INV-2026-008',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-15T20:00:00Z',
    lines: [
      { id: 'uuid-jel-7a', accountId: 'uuid-acc-4', accountCode: '1100', accountName: 'Accounts Receivable', debit: 25000000, credit: 0, description: 'Catering invoice - TechStar' },
      { id: 'uuid-jel-7b', accountId: 'uuid-acc-23', accountCode: '4040', accountName: 'Catering Revenue', debit: 0, credit: 21186441, description: 'Catering revenue (excl GST)' },
      { id: 'uuid-jel-7c', accountId: 'uuid-acc-12', accountCode: '2100', accountName: 'GST Payable', debit: 0, credit: 3813559, description: 'GST @ 18% on catering' },
    ],
    createdAt: '2026-02-15T20:00:00Z',
    updatedAt: '2026-02-15T20:00:00Z',
  },
  {
    id: 'uuid-je-8',
    entryNumber: 'JE-2026-008',
    date: '2026-02-20',
    description: 'Utility bills payment - February',
    status: 'POSTED',
    source: 'MANUAL',
    referenceNumber: 'UTIL-FEB-26',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-02-20T12:00:00Z',
    lines: [
      { id: 'uuid-jel-8a', accountId: 'uuid-acc-33', accountCode: '5400', accountName: 'Utilities (Gas, Electric, Water)', debit: 8500000, credit: 0, description: 'Electricity & gas bills' },
      { id: 'uuid-jel-8b', accountId: 'uuid-acc-2', accountCode: '1010', accountName: 'HDFC Bank - Current Account', debit: 0, credit: 8500000, description: 'Utility payments' },
    ],
    createdAt: '2026-02-20T12:00:00Z',
    updatedAt: '2026-02-20T12:00:00Z',
  },
  {
    id: 'uuid-je-9',
    entryNumber: 'JE-2026-009',
    date: '2026-01-31',
    description: 'January 2026 payroll posting',
    status: 'POSTED',
    source: 'PAYROLL',
    referenceNumber: 'PR-2026-01',
    postedBy: 'uuid-emp-1',
    postedAt: '2026-01-31T18:00:00Z',
    lines: [
      { id: 'uuid-jel-9a', accountId: 'uuid-acc-26', accountCode: '5100', accountName: 'Salaries & Wages', debit: 68500000, credit: 0, description: 'Jan 2026 gross salary' },
      { id: 'uuid-jel-9b', accountId: 'uuid-acc-14', accountCode: '2200', accountName: 'Salary Payable', debit: 0, credit: 55200000, description: 'Net pay to employees' },
      { id: 'uuid-jel-9c', accountId: 'uuid-acc-15', accountCode: '2300', accountName: 'PF Payable', debit: 0, credit: 8200000, description: 'PF contribution (employee + employer)' },
      { id: 'uuid-jel-9d', accountId: 'uuid-acc-13', accountCode: '2110', accountName: 'TDS Payable', debit: 0, credit: 3500000, description: 'TDS deducted' },
      { id: 'uuid-jel-9e', accountId: 'uuid-acc-12', accountCode: '2100', accountName: 'GST Payable', debit: 0, credit: 1600000, description: 'Professional tax' },
    ],
    createdAt: '2026-01-31T18:00:00Z',
    updatedAt: '2026-01-31T18:00:00Z',
  },
  {
    id: 'uuid-je-10',
    entryNumber: 'JE-2026-010',
    date: '2026-02-25',
    description: 'Monthly depreciation entry',
    status: 'POSTED',
    source: 'DEPRECIATION',
    lines: [
      { id: 'uuid-jel-10a', accountId: 'uuid-acc-36', accountCode: '5700', accountName: 'Depreciation', debit: 4416667, credit: 0, description: 'Monthly depreciation on fixed assets' },
      { id: 'uuid-jel-10b', accountId: 'uuid-acc-8', accountCode: '1300', accountName: 'Kitchen Equipment', debit: 0, credit: 2916667, description: 'Depreciation - kitchen equipment' },
      { id: 'uuid-jel-10c', accountId: 'uuid-acc-9', accountCode: '1310', accountName: 'Furniture & Fixtures', debit: 0, credit: 1500000, description: 'Depreciation - furniture' },
    ],
    createdAt: '2026-02-25T09:00:00Z',
    updatedAt: '2026-02-25T09:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

const vendors: Vendor[] = [
  {
    id: 'uuid-vnd-1', name: 'Fresh Farms Produce', code: 'VND-001', category: 'VEGETABLE_SUPPLIER',
    gstin: '27AABCF1234G1ZH', pan: 'AABCF1234G', contactPerson: 'Ramesh Patil', phone: '+91-98200-11223',
    email: 'ramesh@freshfarms.in', address: 'APMC Market, Vashi', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703',
    bankAccountNumber: '1234567890', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank',
    paymentTermDays: 7, isActive: true, outstandingBalance: 0,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-2', name: 'Mumbai Meats & Poultry', code: 'VND-002', category: 'MEAT_SUPPLIER',
    gstin: '27AABCM5678H1ZG', pan: 'AABCM5678H', contactPerson: 'Irfan Sheikh', phone: '+91-98200-22334',
    email: 'irfan@mumbaimeats.in', address: 'Crawford Market, Fort', city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    bankAccountNumber: '2345678901', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India',
    paymentTermDays: 7, isActive: true, outstandingBalance: 12600000,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'uuid-vnd-3', name: 'Amul Dairy Products', code: 'VND-003', category: 'DAIRY_SUPPLIER',
    gstin: '24AABCA9876D1ZF', pan: 'AABCA9876D', contactPerson: 'Sanjay Mehta', phone: '+91-98200-33445',
    email: 'mumbai@amul.coop', address: 'Amul Parlour, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069',
    bankAccountNumber: '3456789012', bankIfsc: 'ICIC0001234', bankName: 'ICICI Bank',
    paymentTermDays: 15, isActive: true, outstandingBalance: 4500000,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-4', name: 'Everest Spices Distributors', code: 'VND-004', category: 'SPICE_SUPPLIER',
    gstin: '27AABCE3456J1ZE', pan: 'AABCE3456J', contactPerson: 'Deepak Shah', phone: '+91-98200-44556',
    email: 'deepak@everestdist.in', address: 'Spice Market, Masjid Bunder', city: 'Mumbai', state: 'Maharashtra', pincode: '400003',
    bankAccountNumber: '4567890123', bankIfsc: 'UTIB0001234', bankName: 'Axis Bank',
    paymentTermDays: 30, isActive: true, outstandingBalance: 3200000,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-5', name: 'PackRight Solutions', code: 'VND-005', category: 'PACKAGING_SUPPLIER',
    gstin: '27AABCP7890K1ZD', pan: 'AABCP7890K', contactPerson: 'Priya Joshi', phone: '+91-98200-55667',
    email: 'priya@packright.in', address: 'MIDC, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400093',
    bankAccountNumber: '5678901234', bankIfsc: 'KKBK0001234', bankName: 'Kotak Mahindra Bank',
    paymentTermDays: 30, isActive: true, outstandingBalance: 1800000,
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-6', name: 'Royal Kitchen Equipment', code: 'VND-006', category: 'EQUIPMENT_SUPPLIER',
    gstin: '27AABCR2345L1ZC', pan: 'AABCR2345L', contactPerson: 'Vikram Singhania', phone: '+91-98200-66778',
    email: 'vikram@royalkitchen.in', address: 'Lower Parel, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400013',
    bankAccountNumber: '6789012345', bankIfsc: 'HDFC0005678', bankName: 'HDFC Bank',
    paymentTermDays: 45, isActive: true, outstandingBalance: 0,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-7', name: 'Bharat Gas Agency', code: 'VND-007', category: 'GAS_FUEL',
    gstin: '27AABCB1111M1ZB', pan: 'AABCB1111M', contactPerson: 'Suresh Kumar', phone: '+91-98200-77889',
    email: 'suresh@bharatgas.in', address: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058',
    bankAccountNumber: '7890123456', bankIfsc: 'SBIN0005678', bankName: 'State Bank of India',
    paymentTermDays: 15, isActive: true, outstandingBalance: 800000,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-vnd-8', name: 'Basmati Traders', code: 'VND-008', category: 'GROCERY_SUPPLIER',
    gstin: '27AABCB2222N1ZA', pan: 'AABCB2222N', contactPerson: 'Abdul Rahman', phone: '+91-98200-88990',
    email: 'abdul@basmatitraders.in', address: 'APMC Market, Vashi', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703',
    bankAccountNumber: '8901234567', bankIfsc: 'PUNB0001234', bankName: 'Punjab National Bank',
    paymentTermDays: 15, isActive: true, outstandingBalance: 5600000,
    createdAt: '2023-06-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Purchase Orders
// ---------------------------------------------------------------------------

const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'uuid-po-1', orderNumber: 'PO-2026-001', vendorId: 'uuid-vnd-1', vendorName: 'Fresh Farms Produce',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-03', expectedDeliveryDate: '2026-02-05',
    items: [
      { id: 'uuid-poi-1a', inventoryItemId: 'uuid-inv-1', itemName: 'Onions', quantity: 50, unit: 'KG', unitPrice: 4000, taxRate: 0, taxAmount: 0, totalAmount: 200000, receivedQuantity: 50 },
      { id: 'uuid-poi-1b', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 40, unit: 'KG', unitPrice: 5000, taxRate: 0, taxAmount: 0, totalAmount: 200000, receivedQuantity: 40 },
      { id: 'uuid-poi-1c', inventoryItemId: 'uuid-inv-3', itemName: 'Potatoes', quantity: 60, unit: 'KG', unitPrice: 3000, taxRate: 0, taxAmount: 0, totalAmount: 180000, receivedQuantity: 60 },
      { id: 'uuid-poi-1d', inventoryItemId: 'uuid-inv-4', itemName: 'Green Chillies', quantity: 10, unit: 'KG', unitPrice: 8000, taxRate: 0, taxAmount: 0, totalAmount: 80000, receivedQuantity: 10 },
      { id: 'uuid-poi-1e', inventoryItemId: 'uuid-inv-5', itemName: 'Ginger-Garlic', quantity: 15, unit: 'KG', unitPrice: 12000, taxRate: 0, taxAmount: 0, totalAmount: 180000, receivedQuantity: 15 },
    ],
    subtotal: 840000, taxTotal: 0, total: 840000, status: 'RECEIVED',
    createdAt: '2026-02-03T09:00:00Z', updatedAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'uuid-po-2', orderNumber: 'PO-2026-002', vendorId: 'uuid-vnd-2', vendorName: 'Mumbai Meats & Poultry',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-08', expectedDeliveryDate: '2026-02-10',
    items: [
      { id: 'uuid-poi-2a', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', quantity: 30, unit: 'KG', unitPrice: 22000, taxRate: 5, taxAmount: 33000, totalAmount: 693000, receivedQuantity: 30 },
      { id: 'uuid-poi-2b', inventoryItemId: 'uuid-inv-7', itemName: 'Mutton (Bone-In)', quantity: 20, unit: 'KG', unitPrice: 65000, taxRate: 5, taxAmount: 65000, totalAmount: 1365000, receivedQuantity: 20 },
    ],
    subtotal: 1960000, taxTotal: 98000, total: 2058000, status: 'RECEIVED',
    createdAt: '2026-02-08T08:00:00Z', updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'uuid-po-3', orderNumber: 'PO-2026-003', vendorId: 'uuid-vnd-3', vendorName: 'Amul Dairy Products',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', date: '2026-02-10', expectedDeliveryDate: '2026-02-12',
    items: [
      { id: 'uuid-poi-3a', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 20, unit: 'KG', unitPrice: 48000, taxRate: 12, taxAmount: 115200, totalAmount: 1075200, receivedQuantity: 20 },
      { id: 'uuid-poi-3b', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 15, unit: 'L', unitPrice: 28000, taxRate: 12, taxAmount: 50400, totalAmount: 470400, receivedQuantity: 15 },
      { id: 'uuid-poi-3c', inventoryItemId: 'uuid-inv-10', itemName: 'Paneer', quantity: 25, unit: 'KG', unitPrice: 32000, taxRate: 5, taxAmount: 40000, totalAmount: 840000, receivedQuantity: 0 },
    ],
    subtotal: 2220000, taxTotal: 205600, total: 2425600, status: 'PARTIALLY_RECEIVED',
    createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-12T11:00:00Z',
  },
  {
    id: 'uuid-po-4', orderNumber: 'PO-2026-004', vendorId: 'uuid-vnd-5', vendorName: 'PackRight Solutions',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', date: '2026-02-15', expectedDeliveryDate: '2026-02-20',
    items: [
      { id: 'uuid-poi-4a', inventoryItemId: 'uuid-inv-17', itemName: 'Food Containers (750ml)', quantity: 500, unit: 'PCS', unitPrice: 800, taxRate: 18, taxAmount: 72000, totalAmount: 472000, receivedQuantity: 0 },
      { id: 'uuid-poi-4b', inventoryItemId: 'uuid-inv-18', itemName: 'Delivery Bags', quantity: 200, unit: 'PCS', unitPrice: 1500, taxRate: 18, taxAmount: 54000, totalAmount: 354000, receivedQuantity: 0 },
    ],
    subtotal: 700000, taxTotal: 126000, total: 826000, status: 'APPROVED',
    approvedBy: 'uuid-emp-1', approvedAt: '2026-02-16T10:00:00Z',
    createdAt: '2026-02-15T14:00:00Z', updatedAt: '2026-02-16T10:00:00Z',
  },
  {
    id: 'uuid-po-5', orderNumber: 'PO-2026-005', vendorId: 'uuid-vnd-8', vendorName: 'Basmati Traders',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-18', expectedDeliveryDate: '2026-02-22',
    items: [
      { id: 'uuid-poi-5a', inventoryItemId: 'uuid-inv-11', itemName: 'Basmati Rice (Premium)', quantity: 100, unit: 'KG', unitPrice: 14000, taxRate: 5, taxAmount: 70000, totalAmount: 1470000, receivedQuantity: 0 },
      { id: 'uuid-poi-5b', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 50, unit: 'L', unitPrice: 16000, taxRate: 5, taxAmount: 40000, totalAmount: 840000, receivedQuantity: 0 },
    ],
    subtotal: 2200000, taxTotal: 110000, total: 2310000, status: 'SUBMITTED',
    createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-18T09:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Bills
// ---------------------------------------------------------------------------

const bills: Bill[] = [
  {
    id: 'uuid-bill-1', billNumber: 'BILL-2026-001', vendorId: 'uuid-vnd-1', vendorName: 'Fresh Farms Produce',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', purchaseOrderId: 'uuid-po-1',
    date: '2026-02-05', dueDate: '2026-02-12',
    items: [
      { id: 'uuid-bi-1a', description: 'Vegetables - weekly supply', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 1, unit: 'LOT', unitPrice: 7800000, taxRate: 5, taxAmount: 390000, totalAmount: 8190000 },
    ],
    subtotal: 7800000, taxTotal: 390000, total: 8190000, amountPaid: 8190000, status: 'PAID',
    referenceNumber: 'FF/INV/2026/0205',
    createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-12T15:00:00Z',
  },
  {
    id: 'uuid-bill-2', billNumber: 'BILL-2026-002', vendorId: 'uuid-vnd-7', vendorName: 'Bharat Gas Agency',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    date: '2026-02-03', dueDate: '2026-02-18',
    items: [
      { id: 'uuid-bi-2a', description: 'Commercial LPG Cylinders x 4', accountId: 'uuid-acc-33', accountCode: '5400', quantity: 4, unit: 'CYLINDER', unitPrice: 180000, taxRate: 5, taxAmount: 36000, totalAmount: 756000 },
    ],
    subtotal: 720000, taxTotal: 36000, total: 756000, amountPaid: 0, status: 'PENDING',
    referenceNumber: 'BGA/2026/0203',
    createdAt: '2026-02-03T11:00:00Z', updatedAt: '2026-02-03T11:00:00Z',
  },
  {
    id: 'uuid-bill-3', billNumber: 'BILL-2026-003', vendorId: 'uuid-vnd-2', vendorName: 'Mumbai Meats & Poultry',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', purchaseOrderId: 'uuid-po-2',
    date: '2026-02-10', dueDate: '2026-02-17',
    items: [
      { id: 'uuid-bi-3a', description: 'Chicken (Whole) 30kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 30, unit: 'KG', unitPrice: 22000, taxRate: 5, taxAmount: 33000, totalAmount: 693000 },
      { id: 'uuid-bi-3b', description: 'Mutton (Bone-In) 20kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 20, unit: 'KG', unitPrice: 65000, taxRate: 5, taxAmount: 65000, totalAmount: 1365000 },
    ],
    subtotal: 1960000, taxTotal: 98000, total: 2058000, amountPaid: 0, status: 'OVERDUE',
    referenceNumber: 'MMP/2026/0210',
    createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'uuid-bill-4', billNumber: 'BILL-2026-004', vendorId: 'uuid-vnd-3', vendorName: 'Amul Dairy Products',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', purchaseOrderId: 'uuid-po-3',
    date: '2026-02-12', dueDate: '2026-02-27',
    items: [
      { id: 'uuid-bi-4a', description: 'Butter (Amul) 20kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 20, unit: 'KG', unitPrice: 48000, taxRate: 12, taxAmount: 115200, totalAmount: 1075200 },
      { id: 'uuid-bi-4b', description: 'Fresh Cream 15L', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 15, unit: 'L', unitPrice: 28000, taxRate: 12, taxAmount: 50400, totalAmount: 470400 },
    ],
    subtotal: 1380000, taxTotal: 165600, total: 1545600, amountPaid: 800000, status: 'PARTIALLY_PAID',
    referenceNumber: 'AMUL/MUM/2026/0212',
    createdAt: '2026-02-12T11:00:00Z', updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'uuid-bill-5', billNumber: 'BILL-2026-005', vendorId: 'uuid-vnd-4', vendorName: 'Everest Spices Distributors',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    date: '2026-02-08', dueDate: '2026-03-10',
    items: [
      { id: 'uuid-bi-5a', description: 'Turmeric Powder 10kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 10, unit: 'KG', unitPrice: 18000, taxRate: 5, taxAmount: 9000, totalAmount: 189000 },
      { id: 'uuid-bi-5b', description: 'Red Chilli Powder 10kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 10, unit: 'KG', unitPrice: 25000, taxRate: 5, taxAmount: 12500, totalAmount: 262500 },
      { id: 'uuid-bi-5c', description: 'Garam Masala 5kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 5, unit: 'KG', unitPrice: 45000, taxRate: 5, taxAmount: 11250, totalAmount: 236250 },
      { id: 'uuid-bi-5d', description: 'Coriander Powder 8kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 8, unit: 'KG', unitPrice: 15000, taxRate: 5, taxAmount: 6000, totalAmount: 126000 },
    ],
    subtotal: 775000, taxTotal: 38750, total: 813750, amountPaid: 0, status: 'PENDING',
    referenceNumber: 'ESP/2026/0208',
    createdAt: '2026-02-08T14:00:00Z', updatedAt: '2026-02-08T14:00:00Z',
  },
  {
    id: 'uuid-bill-6', billNumber: 'BILL-2026-006', vendorId: 'uuid-vnd-8', vendorName: 'Basmati Traders',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    date: '2026-01-25', dueDate: '2026-02-09',
    items: [
      { id: 'uuid-bi-6a', description: 'Basmati Rice (Premium) 100kg', accountId: 'uuid-acc-5', accountCode: '1200', quantity: 100, unit: 'KG', unitPrice: 14000, taxRate: 5, taxAmount: 70000, totalAmount: 1470000 },
    ],
    subtotal: 1400000, taxTotal: 70000, total: 1470000, amountPaid: 1470000, status: 'PAID',
    referenceNumber: 'BT/2026/0125',
    createdAt: '2026-01-25T10:00:00Z', updatedAt: '2026-02-08T10:00:00Z',
  },
  {
    id: 'uuid-bill-7', billNumber: 'BILL-2026-007', vendorId: 'uuid-vnd-5', vendorName: 'PackRight Solutions',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-01', dueDate: '2026-03-03',
    items: [
      { id: 'uuid-bi-7a', description: 'Food Containers (500ml) x 1000', accountId: 'uuid-acc-7', accountCode: '1220', quantity: 1000, unit: 'PCS', unitPrice: 600, taxRate: 18, taxAmount: 108000, totalAmount: 708000 },
      { id: 'uuid-bi-7b', description: 'Food Containers (750ml) x 500', accountId: 'uuid-acc-7', accountCode: '1220', quantity: 500, unit: 'PCS', unitPrice: 800, taxRate: 18, taxAmount: 72000, totalAmount: 472000 },
    ],
    subtotal: 1000000, taxTotal: 180000, total: 1180000, amountPaid: 0, status: 'PENDING',
    referenceNumber: 'PR/2026/0201',
    createdAt: '2026-02-01T12:00:00Z', updatedAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'uuid-bill-8', billNumber: 'BILL-2026-008', vendorId: 'uuid-vnd-6', vendorName: 'Royal Kitchen Equipment',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    date: '2026-01-15', dueDate: '2026-03-01',
    items: [
      { id: 'uuid-bi-8a', description: 'Commercial Tandoor - Repair & Service', accountId: 'uuid-acc-34', accountCode: '5500', quantity: 1, unit: 'PCS', unitPrice: 1500000, taxRate: 18, taxAmount: 270000, totalAmount: 1770000 },
    ],
    subtotal: 1500000, taxTotal: 270000, total: 1770000, amountPaid: 1770000, status: 'PAID',
    referenceNumber: 'RKE/SVC/2026/0115',
    createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-28T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

const customers: Customer[] = [
  {
    id: 'uuid-cust-1', name: 'Walk-In Customer', code: 'CUST-001', type: 'WALK_IN',
    phone: '', email: '', address: '', city: 'Mumbai', state: 'Maharashtra', pincode: '',
    creditLimit: 0, outstandingBalance: 0, isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2023-04-01T00:00:00Z',
  },
  {
    id: 'uuid-cust-2', name: 'TechStar Solutions Pvt. Ltd.', code: 'CUST-002', type: 'CORPORATE',
    gstin: '27AADCT5678G1ZH', contactPerson: 'Neha Kapoor', phone: '+91-98765-43210',
    email: 'neha@techstar.in', address: 'BKC Tower, Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051',
    creditLimit: 50000000, outstandingBalance: 25000000, isActive: true,
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'uuid-cust-3', name: 'Grand Hyatt Mumbai', code: 'CUST-003', type: 'B2B',
    gstin: '27AADCG9012H1ZG', contactPerson: 'Rajesh Nair', phone: '+91-98765-12345',
    email: 'procurement@grandhyatt.in', address: 'Santacruz East', city: 'Mumbai', state: 'Maharashtra', pincode: '400055',
    creditLimit: 100000000, outstandingBalance: 35000000, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'uuid-cust-4', name: 'Swiggy (Platform)', code: 'CUST-AGG-01', type: 'AGGREGATOR',
    phone: '+91-80-6766-6666', email: 'restaurant-support@swiggy.in',
    address: 'Embassy Tech Village, Bangalore', city: 'Bangalore', state: 'Karnataka', pincode: '560103',
    creditLimit: 0, outstandingBalance: 0, isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-cust-5', name: 'Zomato (Platform)', code: 'CUST-AGG-02', type: 'AGGREGATOR',
    phone: '+91-120-611-1111', email: 'restaurant-support@zomato.com',
    address: 'Info Edge Building, Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301',
    creditLimit: 0, outstandingBalance: 0, isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-cust-6', name: 'Wedding Bells Event Management', code: 'CUST-004', type: 'CATERING',
    gstin: '27AADCW3456J1ZF', contactPerson: 'Pooja Sharma', phone: '+91-98765-67890',
    email: 'pooja@weddingbells.in', address: 'Powai Business District', city: 'Mumbai', state: 'Maharashtra', pincode: '400076',
    creditLimit: 30000000, outstandingBalance: 0, isActive: true,
    createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

const invoices: Invoice[] = [
  {
    id: 'uuid-inv-inv-1', invoiceNumber: 'INV-2026-001', customerId: 'uuid-cust-1', customerName: 'Walk-In Customer',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-03', dueDate: '2026-02-03',
    channel: 'DINE_IN', tableNumber: 'T-12', serverName: 'Ravi Kumar',
    items: [
      { id: 'uuid-ii-1a', description: 'Butter Chicken', recipeId: 'uuid-rec-1', quantity: 2, unit: 'PCS', unitPrice: 42000, discount: 0, taxRate: 5, cgst: 2100, sgst: 2100, igst: 0, totalAmount: 88200 },
      { id: 'uuid-ii-1b', description: 'Garlic Naan', recipeId: 'uuid-rec-7', quantity: 4, unit: 'PCS', unitPrice: 8000, discount: 0, taxRate: 5, cgst: 800, sgst: 800, igst: 0, totalAmount: 33600 },
      { id: 'uuid-ii-1c', description: 'Hyderabadi Biryani', recipeId: 'uuid-rec-2', quantity: 1, unit: 'PCS', unitPrice: 38000, discount: 0, taxRate: 5, cgst: 950, sgst: 950, igst: 0, totalAmount: 39900 },
      { id: 'uuid-ii-1d', description: 'Lassi (Sweet)', quantity: 2, unit: 'PCS', unitPrice: 12000, discount: 0, taxRate: 5, cgst: 600, sgst: 600, igst: 0, totalAmount: 25200 },
    ],
    subtotal: 178000, discountTotal: 0, taxTotal: 8900, total: 186900, amountPaid: 186900, status: 'PAID',
    createdAt: '2026-02-03T20:30:00Z', updatedAt: '2026-02-03T20:30:00Z',
  },
  {
    id: 'uuid-inv-inv-2', invoiceNumber: 'INV-2026-002', customerName: 'Walk-In Customer',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-04', dueDate: '2026-02-04',
    channel: 'DINE_IN', tableNumber: 'T-05', serverName: 'Amit Singh',
    items: [
      { id: 'uuid-ii-2a', description: 'Dal Makhani', recipeId: 'uuid-rec-3', quantity: 1, unit: 'PCS', unitPrice: 28000, discount: 0, taxRate: 5, cgst: 700, sgst: 700, igst: 0, totalAmount: 29400 },
      { id: 'uuid-ii-2b', description: 'Paneer Tikka', recipeId: 'uuid-rec-4', quantity: 1, unit: 'PCS', unitPrice: 32000, discount: 0, taxRate: 5, cgst: 800, sgst: 800, igst: 0, totalAmount: 33600 },
      { id: 'uuid-ii-2c', description: 'Butter Naan', recipeId: 'uuid-rec-7', quantity: 3, unit: 'PCS', unitPrice: 7000, discount: 0, taxRate: 5, cgst: 525, sgst: 525, igst: 0, totalAmount: 22050 },
      { id: 'uuid-ii-2d', description: 'Gulab Jamun', recipeId: 'uuid-rec-8', quantity: 2, unit: 'PCS', unitPrice: 10000, discount: 0, taxRate: 5, cgst: 500, sgst: 500, igst: 0, totalAmount: 21000 },
    ],
    subtotal: 101000, discountTotal: 0, taxTotal: 5050, total: 106050, amountPaid: 106050, status: 'PAID',
    createdAt: '2026-02-04T21:00:00Z', updatedAt: '2026-02-04T21:00:00Z',
  },
  {
    id: 'uuid-inv-inv-3', invoiceNumber: 'INV-2026-003', customerName: 'Rahul (Swiggy)',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', date: '2026-02-05', dueDate: '2026-02-05',
    channel: 'SWIGGY', aggregatorOrderId: 'SWG-ORD-90001',
    items: [
      { id: 'uuid-ii-3a', description: 'Chicken Biryani', recipeId: 'uuid-rec-2', quantity: 2, unit: 'PCS', unitPrice: 35000, discount: 5000, taxRate: 5, cgst: 1625, sgst: 1625, igst: 0, totalAmount: 68250 },
      { id: 'uuid-ii-3b', description: 'Butter Chicken', recipeId: 'uuid-rec-1', quantity: 1, unit: 'PCS', unitPrice: 38000, discount: 3000, taxRate: 5, cgst: 875, sgst: 875, igst: 0, totalAmount: 36750 },
    ],
    subtotal: 108000, discountTotal: 8000, taxTotal: 5000, total: 105000, amountPaid: 105000, status: 'PAID',
    createdAt: '2026-02-05T13:15:00Z', updatedAt: '2026-02-05T13:15:00Z',
  },
  {
    id: 'uuid-inv-inv-4', invoiceNumber: 'INV-2026-004', customerName: 'Priya (Zomato)',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', date: '2026-02-06', dueDate: '2026-02-06',
    channel: 'ZOMATO', aggregatorOrderId: 'ZMT-ORD-80001',
    items: [
      { id: 'uuid-ii-4a', description: 'Chole Bhature', recipeId: 'uuid-rec-5', quantity: 1, unit: 'PCS', unitPrice: 22000, discount: 0, taxRate: 5, cgst: 550, sgst: 550, igst: 0, totalAmount: 23100 },
      { id: 'uuid-ii-4b', description: 'Dal Makhani', recipeId: 'uuid-rec-3', quantity: 1, unit: 'PCS', unitPrice: 25000, discount: 0, taxRate: 5, cgst: 625, sgst: 625, igst: 0, totalAmount: 26250 },
      { id: 'uuid-ii-4c', description: 'Jeera Rice', quantity: 1, unit: 'PCS', unitPrice: 15000, discount: 0, taxRate: 5, cgst: 375, sgst: 375, igst: 0, totalAmount: 15750 },
    ],
    subtotal: 62000, discountTotal: 0, taxTotal: 3100, total: 65100, amountPaid: 65100, status: 'PAID',
    createdAt: '2026-02-06T19:30:00Z', updatedAt: '2026-02-06T19:30:00Z',
  },
  {
    id: 'uuid-inv-inv-5', invoiceNumber: 'INV-2026-005', customerName: 'Takeaway Customer',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', date: '2026-02-07', dueDate: '2026-02-07',
    channel: 'TAKEAWAY',
    items: [
      { id: 'uuid-ii-5a', description: 'Tandoori Chicken (Full)', recipeId: 'uuid-rec-6', quantity: 1, unit: 'PCS', unitPrice: 55000, discount: 0, taxRate: 5, cgst: 1375, sgst: 1375, igst: 0, totalAmount: 57750 },
      { id: 'uuid-ii-5b', description: 'Roomali Roti', quantity: 6, unit: 'PCS', unitPrice: 5000, discount: 0, taxRate: 5, cgst: 750, sgst: 750, igst: 0, totalAmount: 31500 },
    ],
    subtotal: 85000, discountTotal: 0, taxTotal: 4250, total: 89250, amountPaid: 89250, status: 'PAID',
    createdAt: '2026-02-07T18:00:00Z', updatedAt: '2026-02-07T18:00:00Z',
  },
  {
    id: 'uuid-inv-inv-6', invoiceNumber: 'INV-2026-006', customerName: 'Suresh (Swiggy)',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', date: '2026-02-08', dueDate: '2026-02-08',
    channel: 'SWIGGY', aggregatorOrderId: 'SWG-ORD-90005',
    items: [
      { id: 'uuid-ii-6a', description: 'Paneer Butter Masala', recipeId: 'uuid-rec-9', quantity: 2, unit: 'PCS', unitPrice: 30000, discount: 4000, taxRate: 5, cgst: 1400, sgst: 1400, igst: 0, totalAmount: 58800 },
      { id: 'uuid-ii-6b', description: 'Garlic Naan', recipeId: 'uuid-rec-7', quantity: 4, unit: 'PCS', unitPrice: 7000, discount: 0, taxRate: 5, cgst: 700, sgst: 700, igst: 0, totalAmount: 29400 },
    ],
    subtotal: 88000, discountTotal: 4000, taxTotal: 4200, total: 88200, amountPaid: 88200, status: 'PAID',
    createdAt: '2026-02-08T12:45:00Z', updatedAt: '2026-02-08T12:45:00Z',
  },
  {
    id: 'uuid-inv-inv-7', invoiceNumber: 'INV-2026-007', customerName: 'Dinner Party (Zomato)',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-10', dueDate: '2026-02-10',
    channel: 'ZOMATO', aggregatorOrderId: 'ZMT-ORD-80005',
    items: [
      { id: 'uuid-ii-7a', description: 'Hyderabadi Biryani', recipeId: 'uuid-rec-2', quantity: 3, unit: 'PCS', unitPrice: 35000, discount: 5000, taxRate: 5, cgst: 5000, sgst: 5000, igst: 0, totalAmount: 110000 },
      { id: 'uuid-ii-7b', description: 'Raita', quantity: 3, unit: 'PCS', unitPrice: 6000, discount: 0, taxRate: 5, cgst: 450, sgst: 450, igst: 0, totalAmount: 18900 },
    ],
    subtotal: 123000, discountTotal: 5000, taxTotal: 10900, total: 128900, amountPaid: 128900, status: 'PAID',
    createdAt: '2026-02-10T20:00:00Z', updatedAt: '2026-02-10T20:00:00Z',
  },
  {
    id: 'uuid-inv-inv-8', invoiceNumber: 'INV-2026-008', customerId: 'uuid-cust-2', customerName: 'TechStar Solutions Pvt. Ltd.',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-15', dueDate: '2026-03-15',
    channel: 'CATERING',
    items: [
      { id: 'uuid-ii-8a', description: 'Corporate Lunch Buffet - 50 pax', quantity: 50, unit: 'PCS', unitPrice: 35000, discount: 0, taxRate: 18, cgst: 157500, sgst: 157500, igst: 0, totalAmount: 2065000 },
      { id: 'uuid-ii-8b', description: 'Beverage Station (Tea/Coffee)', quantity: 50, unit: 'PCS', unitPrice: 5000, discount: 0, taxRate: 18, cgst: 22500, sgst: 22500, igst: 0, totalAmount: 295000 },
      { id: 'uuid-ii-8c', description: 'Live Counter - Chaat Station', quantity: 1, unit: 'PCS', unitPrice: 800000, discount: 0, taxRate: 18, cgst: 72000, sgst: 72000, igst: 0, totalAmount: 944000 },
    ],
    subtotal: 2800000, discountTotal: 0, taxTotal: 504000, total: 3304000, amountPaid: 0, status: 'SENT',
    notes: 'Corporate lunch for TechStar annual meet',
    createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'uuid-inv-inv-9', invoiceNumber: 'INV-2026-009', customerId: 'uuid-cust-3', customerName: 'Grand Hyatt Mumbai',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-20', dueDate: '2026-03-20',
    channel: 'B2B',
    items: [
      { id: 'uuid-ii-9a', description: 'Ready-to-Cook Gravy Base (Butter Chicken) - 50L', quantity: 50, unit: 'L', unitPrice: 18000, discount: 0, taxRate: 12, cgst: 54000, sgst: 54000, igst: 0, totalAmount: 1008000 },
      { id: 'uuid-ii-9b', description: 'Ready-to-Cook Gravy Base (Dal Makhani) - 30L', quantity: 30, unit: 'L', unitPrice: 15000, discount: 0, taxRate: 12, cgst: 27000, sgst: 27000, igst: 0, totalAmount: 504000 },
    ],
    subtotal: 1350000, discountTotal: 0, taxTotal: 162000, total: 1512000, amountPaid: 0, status: 'SENT',
    notes: 'Monthly B2B gravy base supply',
    createdAt: '2026-02-20T11:00:00Z', updatedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'uuid-inv-inv-10', invoiceNumber: 'INV-2026-010', customerName: 'Family Dinner',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-22', dueDate: '2026-02-22',
    channel: 'DINE_IN', tableNumber: 'T-01', serverName: 'Ravi Kumar',
    items: [
      { id: 'uuid-ii-10a', description: 'Fish Tikka', recipeId: 'uuid-rec-10', quantity: 1, unit: 'PCS', unitPrice: 45000, discount: 0, taxRate: 5, cgst: 1125, sgst: 1125, igst: 0, totalAmount: 47250 },
      { id: 'uuid-ii-10b', description: 'Butter Chicken', recipeId: 'uuid-rec-1', quantity: 1, unit: 'PCS', unitPrice: 42000, discount: 0, taxRate: 5, cgst: 1050, sgst: 1050, igst: 0, totalAmount: 44100 },
      { id: 'uuid-ii-10c', description: 'Biryani', recipeId: 'uuid-rec-2', quantity: 2, unit: 'PCS', unitPrice: 38000, discount: 0, taxRate: 5, cgst: 1900, sgst: 1900, igst: 0, totalAmount: 79800 },
      { id: 'uuid-ii-10d', description: 'Naan Basket', quantity: 1, unit: 'PCS', unitPrice: 25000, discount: 0, taxRate: 5, cgst: 625, sgst: 625, igst: 0, totalAmount: 26250 },
      { id: 'uuid-ii-10e', description: 'Gulab Jamun', recipeId: 'uuid-rec-8', quantity: 4, unit: 'PCS', unitPrice: 10000, discount: 0, taxRate: 5, cgst: 1000, sgst: 1000, igst: 0, totalAmount: 42000 },
    ],
    subtotal: 228000, discountTotal: 0, taxTotal: 11400, total: 239400, amountPaid: 239400, status: 'PAID',
    createdAt: '2026-02-22T21:30:00Z', updatedAt: '2026-02-22T21:30:00Z',
  },
];

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

const recipes: Recipe[] = [
  {
    id: 'uuid-rec-1', name: 'Butter Chicken', code: 'REC-001', category: 'MAIN_COURSE',
    description: 'Creamy tomato-based chicken curry, signature dish',
    ingredients: [
      { id: 'uuid-ri-1a', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', quantity: 0.3, unit: 'KG', costPerUnit: 22000, totalCost: 6600, wastagePercent: 10 },
      { id: 'uuid-ri-1b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 0.05, unit: 'KG', costPerUnit: 48000, totalCost: 2400, wastagePercent: 2 },
      { id: 'uuid-ri-1c', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 0.05, unit: 'L', costPerUnit: 28000, totalCost: 1400, wastagePercent: 2 },
      { id: 'uuid-ri-1d', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 0.15, unit: 'KG', costPerUnit: 5000, totalCost: 750, wastagePercent: 5 },
      { id: 'uuid-ri-1e', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.01, unit: 'KG', costPerUnit: 30000, totalCost: 300, wastagePercent: 0 },
      { id: 'uuid-ri-1f', inventoryItemId: 'uuid-inv-14', itemName: 'Garam Masala', quantity: 0.005, unit: 'KG', costPerUnit: 45000, totalCost: 225, wastagePercent: 0 },
    ],
    preparationTime: 45, servingSize: 1, servingUnit: 'portion',
    totalCost: 11675, sellingPrice: 42000, foodCostPercent: 27.8, marginPercent: 72.2,
    menuCategory: 'STAR', popularity: 35, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-2', name: 'Hyderabadi Chicken Biryani', code: 'REC-002', category: 'RICE',
    description: 'Dum-cooked layered biryani with fragrant basmati rice',
    ingredients: [
      { id: 'uuid-ri-2a', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', quantity: 0.25, unit: 'KG', costPerUnit: 22000, totalCost: 5500, wastagePercent: 10 },
      { id: 'uuid-ri-2b', inventoryItemId: 'uuid-inv-11', itemName: 'Basmati Rice (Premium)', quantity: 0.2, unit: 'KG', costPerUnit: 14000, totalCost: 2800, wastagePercent: 5 },
      { id: 'uuid-ri-2c', inventoryItemId: 'uuid-inv-1', itemName: 'Onions', quantity: 0.15, unit: 'KG', costPerUnit: 4000, totalCost: 600, wastagePercent: 10 },
      { id: 'uuid-ri-2d', inventoryItemId: 'uuid-inv-14', itemName: 'Garam Masala', quantity: 0.008, unit: 'KG', costPerUnit: 45000, totalCost: 360, wastagePercent: 0 },
      { id: 'uuid-ri-2e', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.03, unit: 'L', costPerUnit: 16000, totalCost: 480, wastagePercent: 0 },
      { id: 'uuid-ri-2f', inventoryItemId: 'uuid-inv-15', itemName: 'Saffron', quantity: 0.001, unit: 'G', costPerUnit: 50000, totalCost: 50, wastagePercent: 0 },
    ],
    preparationTime: 60, servingSize: 1, servingUnit: 'portion',
    totalCost: 9790, sellingPrice: 38000, foodCostPercent: 25.8, marginPercent: 74.2,
    menuCategory: 'STAR', popularity: 42, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-3', name: 'Dal Makhani', code: 'REC-003', category: 'MAIN_COURSE',
    description: 'Slow-cooked black lentils in creamy butter gravy',
    ingredients: [
      { id: 'uuid-ri-3a', inventoryItemId: 'uuid-inv-16', itemName: 'Black Urad Dal', quantity: 0.1, unit: 'KG', costPerUnit: 12000, totalCost: 1200, wastagePercent: 2 },
      { id: 'uuid-ri-3b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 0.04, unit: 'KG', costPerUnit: 48000, totalCost: 1920, wastagePercent: 2 },
      { id: 'uuid-ri-3c', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 0.04, unit: 'L', costPerUnit: 28000, totalCost: 1120, wastagePercent: 2 },
      { id: 'uuid-ri-3d', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 0.1, unit: 'KG', costPerUnit: 5000, totalCost: 500, wastagePercent: 5 },
    ],
    preparationTime: 120, servingSize: 1, servingUnit: 'portion',
    totalCost: 4740, sellingPrice: 28000, foodCostPercent: 16.9, marginPercent: 83.1,
    menuCategory: 'STAR', popularity: 30, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-4', name: 'Paneer Tikka', code: 'REC-004', category: 'APPETIZER',
    description: 'Tandoor-grilled marinated paneer with bell peppers',
    ingredients: [
      { id: 'uuid-ri-4a', inventoryItemId: 'uuid-inv-10', itemName: 'Paneer', quantity: 0.2, unit: 'KG', costPerUnit: 32000, totalCost: 6400, wastagePercent: 5 },
      { id: 'uuid-ri-4b', inventoryItemId: 'uuid-inv-4', itemName: 'Green Chillies', quantity: 0.02, unit: 'KG', costPerUnit: 8000, totalCost: 160, wastagePercent: 5 },
      { id: 'uuid-ri-4c', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.02, unit: 'L', costPerUnit: 16000, totalCost: 320, wastagePercent: 0 },
    ],
    preparationTime: 30, servingSize: 1, servingUnit: 'portion',
    totalCost: 6880, sellingPrice: 32000, foodCostPercent: 21.5, marginPercent: 78.5,
    menuCategory: 'PUZZLE', popularity: 15, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-5', name: 'Chole Bhature', code: 'REC-005', category: 'MAIN_COURSE',
    description: 'Spiced chickpea curry served with deep-fried bread',
    ingredients: [
      { id: 'uuid-ri-5a', inventoryItemId: 'uuid-inv-16', itemName: 'Chickpeas (Dried)', quantity: 0.12, unit: 'KG', costPerUnit: 10000, totalCost: 1200, wastagePercent: 2 },
      { id: 'uuid-ri-5b', inventoryItemId: 'uuid-inv-1', itemName: 'Onions', quantity: 0.08, unit: 'KG', costPerUnit: 4000, totalCost: 320, wastagePercent: 10 },
      { id: 'uuid-ri-5c', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.1, unit: 'L', costPerUnit: 16000, totalCost: 1600, wastagePercent: 5 },
      { id: 'uuid-ri-5d', inventoryItemId: 'uuid-inv-19', itemName: 'Maida (All Purpose Flour)', quantity: 0.15, unit: 'KG', costPerUnit: 4500, totalCost: 675, wastagePercent: 5 },
    ],
    preparationTime: 40, servingSize: 1, servingUnit: 'portion',
    totalCost: 3795, sellingPrice: 22000, foodCostPercent: 17.3, marginPercent: 82.7,
    menuCategory: 'PLOW_HORSE', popularity: 28, isActive: true,
    outletIds: ['uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-6', name: 'Tandoori Chicken (Full)', code: 'REC-006', category: 'APPETIZER',
    description: 'Whole chicken marinated in yogurt & spices, cooked in tandoor',
    ingredients: [
      { id: 'uuid-ri-6a', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', quantity: 0.8, unit: 'KG', costPerUnit: 22000, totalCost: 17600, wastagePercent: 15 },
      { id: 'uuid-ri-6b', inventoryItemId: 'uuid-inv-9', itemName: 'Yogurt/Cream', quantity: 0.1, unit: 'L', costPerUnit: 28000, totalCost: 2800, wastagePercent: 2 },
      { id: 'uuid-ri-6c', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.015, unit: 'KG', costPerUnit: 30000, totalCost: 450, wastagePercent: 0 },
    ],
    preparationTime: 50, servingSize: 1, servingUnit: 'portion',
    totalCost: 20850, sellingPrice: 55000, foodCostPercent: 37.9, marginPercent: 62.1,
    menuCategory: 'PLOW_HORSE', popularity: 22, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-7', name: 'Garlic Naan', code: 'REC-007', category: 'BREAD',
    description: 'Tandoor-baked leavened bread with garlic',
    ingredients: [
      { id: 'uuid-ri-7a', inventoryItemId: 'uuid-inv-19', itemName: 'Maida (All Purpose Flour)', quantity: 0.08, unit: 'KG', costPerUnit: 4500, totalCost: 360, wastagePercent: 5 },
      { id: 'uuid-ri-7b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 0.015, unit: 'KG', costPerUnit: 48000, totalCost: 720, wastagePercent: 2 },
      { id: 'uuid-ri-7c', inventoryItemId: 'uuid-inv-5', itemName: 'Ginger-Garlic', quantity: 0.005, unit: 'KG', costPerUnit: 12000, totalCost: 60, wastagePercent: 5 },
    ],
    preparationTime: 10, servingSize: 1, servingUnit: 'piece',
    totalCost: 1140, sellingPrice: 8000, foodCostPercent: 14.3, marginPercent: 85.7,
    menuCategory: 'STAR', popularity: 50, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-8', name: 'Gulab Jamun', code: 'REC-008', category: 'DESSERT',
    description: 'Deep-fried milk dumplings in rose-scented sugar syrup',
    ingredients: [
      { id: 'uuid-ri-8a', inventoryItemId: 'uuid-inv-20', itemName: 'Khoya/Mawa', quantity: 0.05, unit: 'KG', costPerUnit: 40000, totalCost: 2000, wastagePercent: 5 },
      { id: 'uuid-ri-8b', inventoryItemId: 'uuid-inv-19', itemName: 'Maida (All Purpose Flour)', quantity: 0.01, unit: 'KG', costPerUnit: 4500, totalCost: 45, wastagePercent: 5 },
      { id: 'uuid-ri-8c', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.02, unit: 'L', costPerUnit: 16000, totalCost: 320, wastagePercent: 5 },
    ],
    preparationTime: 25, servingSize: 2, servingUnit: 'pieces',
    totalCost: 2365, sellingPrice: 10000, foodCostPercent: 23.7, marginPercent: 76.3,
    menuCategory: 'PUZZLE', popularity: 12, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-9', name: 'Paneer Butter Masala', code: 'REC-009', category: 'MAIN_COURSE',
    description: 'Cottage cheese cubes in rich tomato-butter gravy',
    ingredients: [
      { id: 'uuid-ri-9a', inventoryItemId: 'uuid-inv-10', itemName: 'Paneer', quantity: 0.2, unit: 'KG', costPerUnit: 32000, totalCost: 6400, wastagePercent: 5 },
      { id: 'uuid-ri-9b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 0.04, unit: 'KG', costPerUnit: 48000, totalCost: 1920, wastagePercent: 2 },
      { id: 'uuid-ri-9c', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 0.04, unit: 'L', costPerUnit: 28000, totalCost: 1120, wastagePercent: 2 },
      { id: 'uuid-ri-9d', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 0.12, unit: 'KG', costPerUnit: 5000, totalCost: 600, wastagePercent: 5 },
    ],
    preparationTime: 35, servingSize: 1, servingUnit: 'portion',
    totalCost: 10040, sellingPrice: 32000, foodCostPercent: 31.4, marginPercent: 68.6,
    menuCategory: 'PLOW_HORSE', popularity: 25, isActive: true,
    outletIds: ['uuid-outlet-1', 'uuid-outlet-2', 'uuid-outlet-3'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-rec-10', name: 'Fish Tikka', code: 'REC-010', category: 'APPETIZER',
    description: 'Tandoor-grilled marinated fish with lemon and spices',
    ingredients: [
      { id: 'uuid-ri-10a', inventoryItemId: 'uuid-inv-21', itemName: 'Surmai (King Fish)', quantity: 0.25, unit: 'KG', costPerUnit: 55000, totalCost: 13750, wastagePercent: 15 },
      { id: 'uuid-ri-10b', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.02, unit: 'L', costPerUnit: 16000, totalCost: 320, wastagePercent: 0 },
      { id: 'uuid-ri-10c', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.008, unit: 'KG', costPerUnit: 30000, totalCost: 240, wastagePercent: 0 },
    ],
    preparationTime: 25, servingSize: 1, servingUnit: 'portion',
    totalCost: 14310, sellingPrice: 45000, foodCostPercent: 31.8, marginPercent: 68.2,
    menuCategory: 'DOG', popularity: 8, isActive: true,
    outletIds: ['uuid-outlet-1'],
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Inventory Items
// ---------------------------------------------------------------------------

const inventoryItems: InventoryItem[] = [
  { id: 'uuid-inv-1', name: 'Onions', code: 'INV-001', category: 'VEGETABLES', unit: 'KG', currentStock: 120, minimumStock: 30, maximumStock: 200, reorderPoint: 50, costPerUnit: 4000, lastPurchasePrice: 4000, averageCost: 3800, gstRate: 0, hsnCode: '0703', isPerishable: true, shelfLifeDays: 14, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-1', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'uuid-inv-2', name: 'Tomatoes', code: 'INV-002', category: 'VEGETABLES', unit: 'KG', currentStock: 80, minimumStock: 20, maximumStock: 150, reorderPoint: 40, costPerUnit: 5000, lastPurchasePrice: 5000, averageCost: 4500, gstRate: 0, hsnCode: '0702', isPerishable: true, shelfLifeDays: 7, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-1', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'uuid-inv-3', name: 'Potatoes', code: 'INV-003', category: 'VEGETABLES', unit: 'KG', currentStock: 150, minimumStock: 40, maximumStock: 250, reorderPoint: 60, costPerUnit: 3000, lastPurchasePrice: 3000, averageCost: 2800, gstRate: 0, hsnCode: '0701', isPerishable: true, shelfLifeDays: 21, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-1', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'uuid-inv-4', name: 'Green Chillies', code: 'INV-004', category: 'VEGETABLES', unit: 'KG', currentStock: 8, minimumStock: 5, maximumStock: 30, reorderPoint: 8, costPerUnit: 8000, lastPurchasePrice: 8000, averageCost: 7500, gstRate: 0, hsnCode: '0904', isPerishable: true, shelfLifeDays: 5, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-1', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'uuid-inv-5', name: 'Ginger-Garlic Paste', code: 'INV-005', category: 'VEGETABLES', unit: 'KG', currentStock: 12, minimumStock: 5, maximumStock: 30, reorderPoint: 8, costPerUnit: 12000, lastPurchasePrice: 12000, averageCost: 11500, gstRate: 0, hsnCode: '0910', isPerishable: true, shelfLifeDays: 10, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-1', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'uuid-inv-6', name: 'Chicken (Whole)', code: 'INV-006', category: 'MEAT_POULTRY', unit: 'KG', currentStock: 45, minimumStock: 15, maximumStock: 80, reorderPoint: 20, costPerUnit: 22000, lastPurchasePrice: 22000, averageCost: 21000, gstRate: 5, hsnCode: '0207', isPerishable: true, shelfLifeDays: 2, storageRequirement: 'Walk-in Freezer, -18C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-2', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
  { id: 'uuid-inv-7', name: 'Mutton (Bone-In)', code: 'INV-007', category: 'MEAT_POULTRY', unit: 'KG', currentStock: 18, minimumStock: 8, maximumStock: 40, reorderPoint: 12, costPerUnit: 65000, lastPurchasePrice: 65000, averageCost: 62000, gstRate: 5, hsnCode: '0204', isPerishable: true, shelfLifeDays: 2, storageRequirement: 'Walk-in Freezer, -18C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-2', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
  { id: 'uuid-inv-8', name: 'Butter (Amul)', code: 'INV-008', category: 'DAIRY', unit: 'KG', currentStock: 25, minimumStock: 10, maximumStock: 50, reorderPoint: 15, costPerUnit: 48000, lastPurchasePrice: 48000, averageCost: 46000, gstRate: 12, hsnCode: '0405', isPerishable: true, shelfLifeDays: 30, storageRequirement: 'Cold Room, 4C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-3', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-12T00:00:00Z' },
  { id: 'uuid-inv-9', name: 'Fresh Cream', code: 'INV-009', category: 'DAIRY', unit: 'L', currentStock: 18, minimumStock: 8, maximumStock: 30, reorderPoint: 10, costPerUnit: 28000, lastPurchasePrice: 28000, averageCost: 27000, gstRate: 12, hsnCode: '0401', isPerishable: true, shelfLifeDays: 7, storageRequirement: 'Cold Room, 4C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-3', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-12T00:00:00Z' },
  { id: 'uuid-inv-10', name: 'Paneer', code: 'INV-010', category: 'DAIRY', unit: 'KG', currentStock: 15, minimumStock: 8, maximumStock: 40, reorderPoint: 12, costPerUnit: 32000, lastPurchasePrice: 32000, averageCost: 31000, gstRate: 5, hsnCode: '0406', isPerishable: true, shelfLifeDays: 5, storageRequirement: 'Cold Room, 4C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-3', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-12T00:00:00Z' },
  { id: 'uuid-inv-11', name: 'Basmati Rice (Premium)', code: 'INV-011', category: 'GRAINS_CEREALS', unit: 'KG', currentStock: 180, minimumStock: 50, maximumStock: 300, reorderPoint: 80, costPerUnit: 14000, lastPurchasePrice: 14000, averageCost: 13500, gstRate: 5, hsnCode: '1006', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-8', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-25T00:00:00Z' },
  { id: 'uuid-inv-12', name: 'Cooking Oil (Refined Sunflower)', code: 'INV-012', category: 'OILS_FATS', unit: 'L', currentStock: 60, minimumStock: 20, maximumStock: 100, reorderPoint: 30, costPerUnit: 16000, lastPurchasePrice: 16000, averageCost: 15500, gstRate: 5, hsnCode: '1512', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-8', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-01-25T00:00:00Z' },
  { id: 'uuid-inv-13', name: 'Kashmiri Chilli Powder', code: 'INV-013', category: 'SPICES', unit: 'KG', currentStock: 8, minimumStock: 3, maximumStock: 15, reorderPoint: 5, costPerUnit: 30000, lastPurchasePrice: 30000, averageCost: 28000, gstRate: 5, hsnCode: '0904', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-4', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-08T00:00:00Z' },
  { id: 'uuid-inv-14', name: 'Garam Masala', code: 'INV-014', category: 'SPICES', unit: 'KG', currentStock: 4, minimumStock: 2, maximumStock: 10, reorderPoint: 3, costPerUnit: 45000, lastPurchasePrice: 45000, averageCost: 43000, gstRate: 5, hsnCode: '0910', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-4', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-08T00:00:00Z' },
  { id: 'uuid-inv-15', name: 'Saffron (Kesar)', code: 'INV-015', category: 'SPICES', unit: 'G', currentStock: 50, minimumStock: 10, maximumStock: 100, reorderPoint: 20, costPerUnit: 50000, lastPurchasePrice: 50000, averageCost: 48000, gstRate: 5, hsnCode: '0910', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-4', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-08T00:00:00Z' },
  { id: 'uuid-inv-16', name: 'Black Urad Dal', code: 'INV-016', category: 'DRY_GOODS', unit: 'KG', currentStock: 40, minimumStock: 15, maximumStock: 80, reorderPoint: 20, costPerUnit: 12000, lastPurchasePrice: 12000, averageCost: 11500, gstRate: 5, hsnCode: '0713', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-8', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-inv-17', name: 'Food Containers (750ml)', code: 'INV-017', category: 'PACKAGING', unit: 'PCS', currentStock: 800, minimumStock: 200, maximumStock: 2000, reorderPoint: 400, costPerUnit: 800, lastPurchasePrice: 800, averageCost: 750, gstRate: 18, hsnCode: '3923', isPerishable: false, isActive: true, outletId: 'uuid-outlet-3', vendorId: 'uuid-vnd-5', createdAt: '2024-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-inv-18', name: 'Delivery Bags (Insulated)', code: 'INV-018', category: 'PACKAGING', unit: 'PCS', currentStock: 150, minimumStock: 50, maximumStock: 500, reorderPoint: 100, costPerUnit: 1500, lastPurchasePrice: 1500, averageCost: 1400, gstRate: 18, hsnCode: '4202', isPerishable: false, isActive: true, outletId: 'uuid-outlet-3', vendorId: 'uuid-vnd-5', createdAt: '2024-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-inv-19', name: 'Maida (All Purpose Flour)', code: 'INV-019', category: 'GRAINS_CEREALS', unit: 'KG', currentStock: 50, minimumStock: 15, maximumStock: 100, reorderPoint: 25, costPerUnit: 4500, lastPurchasePrice: 4500, averageCost: 4200, gstRate: 5, hsnCode: '1101', isPerishable: false, isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-8', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  { id: 'uuid-inv-20', name: 'Khoya/Mawa', code: 'INV-020', category: 'DAIRY', unit: 'KG', currentStock: 5, minimumStock: 2, maximumStock: 15, reorderPoint: 3, costPerUnit: 40000, lastPurchasePrice: 40000, averageCost: 38000, gstRate: 5, hsnCode: '0402', isPerishable: true, shelfLifeDays: 3, storageRequirement: 'Cold Room, 4C', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-3', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
  { id: 'uuid-inv-21', name: 'Surmai (King Fish)', code: 'INV-021', category: 'SEAFOOD', unit: 'KG', currentStock: 6, minimumStock: 3, maximumStock: 15, reorderPoint: 5, costPerUnit: 55000, lastPurchasePrice: 55000, averageCost: 52000, gstRate: 5, hsnCode: '0302', isPerishable: true, shelfLifeDays: 1, storageRequirement: 'Ice Box / Freezer', isActive: true, outletId: 'uuid-outlet-1', vendorId: 'uuid-vnd-2', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
];

// ---------------------------------------------------------------------------
// Stock Movements
// ---------------------------------------------------------------------------

const stockMovements: StockMovement[] = [
  { id: 'uuid-sm-1', inventoryItemId: 'uuid-inv-1', itemName: 'Onions', outletId: 'uuid-outlet-1', type: 'PURCHASE', quantity: 50, unit: 'KG', costPerUnit: 4000, totalCost: 200000, referenceType: 'BILL', referenceId: 'uuid-bill-1', date: '2026-02-05', createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-05T10:00:00Z' },
  { id: 'uuid-sm-2', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', outletId: 'uuid-outlet-1', type: 'PURCHASE', quantity: 40, unit: 'KG', costPerUnit: 5000, totalCost: 200000, referenceType: 'BILL', referenceId: 'uuid-bill-1', date: '2026-02-05', createdAt: '2026-02-05T10:00:00Z', updatedAt: '2026-02-05T10:00:00Z' },
  { id: 'uuid-sm-3', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', outletId: 'uuid-outlet-1', type: 'PURCHASE', quantity: 30, unit: 'KG', costPerUnit: 22000, totalCost: 660000, referenceType: 'BILL', referenceId: 'uuid-bill-3', date: '2026-02-10', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'uuid-sm-4', inventoryItemId: 'uuid-inv-7', itemName: 'Mutton (Bone-In)', outletId: 'uuid-outlet-1', type: 'PURCHASE', quantity: 20, unit: 'KG', costPerUnit: 65000, totalCost: 1300000, referenceType: 'BILL', referenceId: 'uuid-bill-3', date: '2026-02-10', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-10T09:00:00Z' },
  { id: 'uuid-sm-5', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', outletId: 'uuid-outlet-1', type: 'SALE', quantity: -8, unit: 'KG', costPerUnit: 22000, totalCost: -176000, referenceType: 'INVOICE', date: '2026-02-03', notes: 'Daily kitchen consumption', createdAt: '2026-02-03T22:00:00Z', updatedAt: '2026-02-03T22:00:00Z' },
  { id: 'uuid-sm-6', inventoryItemId: 'uuid-inv-11', itemName: 'Basmati Rice (Premium)', outletId: 'uuid-outlet-1', type: 'SALE', quantity: -12, unit: 'KG', costPerUnit: 14000, totalCost: -168000, referenceType: 'INVOICE', date: '2026-02-03', notes: 'Daily kitchen consumption', createdAt: '2026-02-03T22:00:00Z', updatedAt: '2026-02-03T22:00:00Z' },
  { id: 'uuid-sm-7', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', outletId: 'uuid-outlet-2', type: 'PURCHASE', quantity: 20, unit: 'KG', costPerUnit: 48000, totalCost: 960000, referenceType: 'BILL', referenceId: 'uuid-bill-4', date: '2026-02-12', createdAt: '2026-02-12T11:00:00Z', updatedAt: '2026-02-12T11:00:00Z' },
  { id: 'uuid-sm-8', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', outletId: 'uuid-outlet-1', type: 'TRANSFER_OUT', quantity: -5, unit: 'KG', costPerUnit: 22000, totalCost: -110000, date: '2026-02-08', notes: 'Transfer to Cloud Kitchen Powai', createdAt: '2026-02-08T07:00:00Z', updatedAt: '2026-02-08T07:00:00Z' },
  { id: 'uuid-sm-9', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', outletId: 'uuid-outlet-3', type: 'TRANSFER_IN', quantity: 5, unit: 'KG', costPerUnit: 22000, totalCost: 110000, date: '2026-02-08', notes: 'Transfer from Spice Garden Andheri', createdAt: '2026-02-08T08:00:00Z', updatedAt: '2026-02-08T08:00:00Z' },
  { id: 'uuid-sm-10', inventoryItemId: 'uuid-inv-17', itemName: 'Food Containers (750ml)', outletId: 'uuid-outlet-3', type: 'SALE', quantity: -45, unit: 'PCS', costPerUnit: 800, totalCost: -36000, referenceType: 'INVOICE', date: '2026-02-05', notes: 'Delivery packaging', createdAt: '2026-02-05T22:00:00Z', updatedAt: '2026-02-05T22:00:00Z' },
];

// ---------------------------------------------------------------------------
// Wastage Entries
// ---------------------------------------------------------------------------

const wastageEntries: WastageEntry[] = [
  { id: 'uuid-wst-1', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', quantity: 3, unit: 'KG', costPerUnit: 5000, totalCost: 15000, reason: 'SPOILED', date: '2026-02-06', notes: 'Stored too long, overripe', createdAt: '2026-02-06T08:00:00Z', updatedAt: '2026-02-06T08:00:00Z' },
  { id: 'uuid-wst-2', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', quantity: 1, unit: 'L', costPerUnit: 28000, totalCost: 28000, reason: 'EXPIRED', date: '2026-02-08', notes: 'Past expiry date', createdAt: '2026-02-08T07:00:00Z', updatedAt: '2026-02-08T07:00:00Z' },
  { id: 'uuid-wst-3', inventoryItemId: 'uuid-inv-6', itemName: 'Chicken (Whole)', outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', quantity: 2, unit: 'KG', costPerUnit: 22000, totalCost: 44000, reason: 'KITCHEN_WASTE', date: '2026-02-10', notes: 'Trimmings and bones from prep', createdAt: '2026-02-10T16:00:00Z', updatedAt: '2026-02-10T16:00:00Z' },
  { id: 'uuid-wst-4', inventoryItemId: 'uuid-inv-11', itemName: 'Basmati Rice (Premium)', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', quantity: 3, unit: 'KG', costPerUnit: 14000, totalCost: 42000, reason: 'OVER_PRODUCTION', date: '2026-02-12', notes: 'Excess biryani prepared, not sold', createdAt: '2026-02-12T22:00:00Z', updatedAt: '2026-02-12T22:00:00Z' },
  { id: 'uuid-wst-5', inventoryItemId: 'uuid-inv-4', itemName: 'Green Chillies', outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', quantity: 0.5, unit: 'KG', costPerUnit: 8000, totalCost: 4000, reason: 'SPOILED', date: '2026-02-15', notes: 'Turned soft', createdAt: '2026-02-15T07:00:00Z', updatedAt: '2026-02-15T07:00:00Z' },
  { id: 'uuid-wst-6', inventoryItemId: 'uuid-inv-20', itemName: 'Khoya/Mawa', outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', quantity: 0.5, unit: 'KG', costPerUnit: 40000, totalCost: 20000, reason: 'EXPIRED', date: '2026-02-18', notes: 'Short shelf life item expired', createdAt: '2026-02-18T08:00:00Z', updatedAt: '2026-02-18T08:00:00Z' },
];

// ---------------------------------------------------------------------------
// Aggregator Orders
// ---------------------------------------------------------------------------

const aggregatorOrders: AggregatorOrder[] = [
  {
    id: 'uuid-agg-1', platform: 'SWIGGY', platformOrderId: 'SWG-ORD-90001', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-05', orderTime: '2026-02-05T13:00:00Z', deliveryTime: '2026-02-05T13:42:00Z',
    items: [
      { name: 'Chicken Biryani', quantity: 2, unitPrice: 35000, totalPrice: 70000 },
      { name: 'Butter Chicken', quantity: 1, unitPrice: 38000, totalPrice: 38000 },
    ],
    grossAmount: 108000, discount: 8000, merchantDiscount: 0, commission: 22000, commissionRate: 22,
    gst: 5000, tcs: 1080, tds: 1080, netPayable: 75840, status: 'DELIVERED',
    customerName: 'Rahul M.', isReconciled: true, invoiceId: 'uuid-inv-inv-3',
    createdAt: '2026-02-05T13:00:00Z', updatedAt: '2026-02-05T13:42:00Z',
  },
  {
    id: 'uuid-agg-2', platform: 'SWIGGY', platformOrderId: 'SWG-ORD-90002', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-05', orderTime: '2026-02-05T19:15:00Z', deliveryTime: '2026-02-05T19:55:00Z',
    items: [
      { name: 'Dal Makhani', quantity: 2, unitPrice: 25000, totalPrice: 50000 },
      { name: 'Garlic Naan', quantity: 4, unitPrice: 7000, totalPrice: 28000 },
      { name: 'Paneer Butter Masala', quantity: 1, unitPrice: 30000, totalPrice: 30000 },
    ],
    grossAmount: 108000, discount: 5000, merchantDiscount: 3000, commission: 22000, commissionRate: 22,
    gst: 5000, tcs: 1080, tds: 1080, netPayable: 74840, status: 'DELIVERED',
    customerName: 'Ankita S.', isReconciled: true,
    createdAt: '2026-02-05T19:15:00Z', updatedAt: '2026-02-05T19:55:00Z',
  },
  {
    id: 'uuid-agg-3', platform: 'ZOMATO', platformOrderId: 'ZMT-ORD-80001', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-06', orderTime: '2026-02-06T19:15:00Z', deliveryTime: '2026-02-06T19:52:00Z',
    items: [
      { name: 'Chole Bhature', quantity: 1, unitPrice: 22000, totalPrice: 22000 },
      { name: 'Dal Makhani', quantity: 1, unitPrice: 25000, totalPrice: 25000 },
      { name: 'Jeera Rice', quantity: 1, unitPrice: 15000, totalPrice: 15000 },
    ],
    grossAmount: 62000, discount: 0, merchantDiscount: 0, commission: 15500, commissionRate: 25,
    gst: 3100, tcs: 620, tds: 620, netPayable: 45160, status: 'DELIVERED',
    customerName: 'Priya K.', isReconciled: true, invoiceId: 'uuid-inv-inv-4',
    createdAt: '2026-02-06T19:15:00Z', updatedAt: '2026-02-06T19:52:00Z',
  },
  {
    id: 'uuid-agg-4', platform: 'SWIGGY', platformOrderId: 'SWG-ORD-90005', outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    date: '2026-02-08', orderTime: '2026-02-08T12:30:00Z', deliveryTime: '2026-02-08T13:10:00Z',
    items: [
      { name: 'Paneer Butter Masala', quantity: 2, unitPrice: 30000, totalPrice: 60000 },
      { name: 'Garlic Naan', quantity: 4, unitPrice: 7000, totalPrice: 28000 },
    ],
    grossAmount: 88000, discount: 4000, merchantDiscount: 0, commission: 18480, commissionRate: 22,
    gst: 4200, tcs: 880, tds: 880, netPayable: 63560, status: 'DELIVERED',
    customerName: 'Suresh P.', isReconciled: true, invoiceId: 'uuid-inv-inv-6',
    createdAt: '2026-02-08T12:30:00Z', updatedAt: '2026-02-08T13:10:00Z',
  },
  {
    id: 'uuid-agg-5', platform: 'ZOMATO', platformOrderId: 'ZMT-ORD-80005', outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    date: '2026-02-10', orderTime: '2026-02-10T19:45:00Z', deliveryTime: '2026-02-10T20:25:00Z',
    items: [
      { name: 'Hyderabadi Biryani', quantity: 3, unitPrice: 35000, totalPrice: 105000 },
      { name: 'Raita', quantity: 3, unitPrice: 6000, totalPrice: 18000 },
    ],
    grossAmount: 123000, discount: 5000, merchantDiscount: 0, commission: 29500, commissionRate: 25,
    gst: 5900, tcs: 1230, tds: 1230, netPayable: 85040, status: 'DELIVERED',
    customerName: 'Dinner Party', isReconciled: true, invoiceId: 'uuid-inv-inv-7',
    createdAt: '2026-02-10T19:45:00Z', updatedAt: '2026-02-10T20:25:00Z',
  },
  {
    id: 'uuid-agg-6', platform: 'SWIGGY', platformOrderId: 'SWG-ORD-90010', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-15', orderTime: '2026-02-15T20:00:00Z', deliveryTime: '2026-02-15T20:38:00Z',
    items: [
      { name: 'Butter Chicken', quantity: 2, unitPrice: 38000, totalPrice: 76000 },
      { name: 'Hyderabadi Biryani', quantity: 1, unitPrice: 35000, totalPrice: 35000 },
      { name: 'Gulab Jamun', quantity: 4, unitPrice: 10000, totalPrice: 40000 },
    ],
    grossAmount: 151000, discount: 10000, merchantDiscount: 5000, commission: 29920, commissionRate: 22,
    gst: 6800, tcs: 1510, tds: 1510, netPayable: 101260, status: 'DELIVERED',
    customerName: 'Vikram R.', isReconciled: false,
    createdAt: '2026-02-15T20:00:00Z', updatedAt: '2026-02-15T20:38:00Z',
  },
  {
    id: 'uuid-agg-7', platform: 'ZOMATO', platformOrderId: 'ZMT-ORD-80010', outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    date: '2026-02-18', orderTime: '2026-02-18T13:00:00Z', status: 'CANCELLED',
    items: [
      { name: 'Tandoori Chicken (Full)', quantity: 1, unitPrice: 55000, totalPrice: 55000 },
    ],
    grossAmount: 55000, discount: 0, merchantDiscount: 0, commission: 0, commissionRate: 25,
    gst: 0, tcs: 0, tds: 0, netPayable: 0,
    customerName: 'Cancelled Order', isReconciled: true,
    createdAt: '2026-02-18T13:00:00Z', updatedAt: '2026-02-18T13:05:00Z',
  },
  {
    id: 'uuid-agg-8', platform: 'SWIGGY', platformOrderId: 'SWG-ORD-90015', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    date: '2026-02-20', orderTime: '2026-02-20T12:30:00Z', deliveryTime: '2026-02-20T13:05:00Z',
    items: [
      { name: 'Chole Bhature', quantity: 2, unitPrice: 22000, totalPrice: 44000 },
      { name: 'Lassi (Sweet)', quantity: 2, unitPrice: 12000, totalPrice: 24000 },
    ],
    grossAmount: 68000, discount: 0, merchantDiscount: 0, commission: 14960, commissionRate: 22,
    gst: 3400, tcs: 680, tds: 680, netPayable: 52280, status: 'DELIVERED',
    customerName: 'Meera J.', isReconciled: false,
    createdAt: '2026-02-20T12:30:00Z', updatedAt: '2026-02-20T13:05:00Z',
  },
];

// ---------------------------------------------------------------------------
// Aggregator Settlements
// ---------------------------------------------------------------------------

const aggregatorSettlements: AggregatorSettlement[] = [
  {
    id: 'uuid-settle-1', platform: 'SWIGGY', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    periodStart: '2026-02-01', periodEnd: '2026-02-07',
    totalOrders: 18, grossAmount: 425000, totalCommission: 93500, totalDiscount: 25000,
    totalMerchantDiscount: 8000, totalGst: 20000, totalTcs: 4250, totalTds: 4250,
    netPayable: 295000, amountReceived: 295000, difference: 0,
    status: 'RECEIVED', settlementDate: '2026-02-10', bankReferenceNumber: 'SWG-NEFT-20260210-001',
    orderIds: ['uuid-agg-1', 'uuid-agg-2'],
    createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'uuid-settle-2', platform: 'ZOMATO', outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    periodStart: '2026-02-01', periodEnd: '2026-02-07',
    totalOrders: 12, grossAmount: 310000, totalCommission: 77500, totalDiscount: 15000,
    totalMerchantDiscount: 5000, totalGst: 15500, totalTcs: 3100, totalTds: 3100,
    netPayable: 205800, amountReceived: 203500, difference: 2300,
    status: 'DISPUTED', settlementDate: '2026-02-10', bankReferenceNumber: 'ZMT-NEFT-20260210-001',
    orderIds: ['uuid-agg-3'],
    createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'uuid-settle-3', platform: 'SWIGGY', outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    periodStart: '2026-02-08', periodEnd: '2026-02-14',
    totalOrders: 22, grossAmount: 520000, totalCommission: 114400, totalDiscount: 18000,
    totalMerchantDiscount: 6000, totalGst: 25200, totalTcs: 5200, totalTds: 5200,
    netPayable: 371200, amountReceived: 0, difference: 371200,
    status: 'PENDING',
    orderIds: ['uuid-agg-4'],
    createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// GST Returns
// ---------------------------------------------------------------------------

const gstReturns: GSTReturn[] = [
  {
    id: 'uuid-gst-1', returnType: 'GSTR3B', period: '2025-12', filingDate: '2026-01-18', dueDate: '2026-01-20', status: 'FILED',
    outletName: 'Consolidated',
    salesSummary: { taxableAmount: 850000000, cgst: 23750000, sgst: 23750000, igst: 0, cess: 0, totalTax: 47500000 },
    purchaseSummary: { taxableAmount: 320000000, cgst: 10500000, sgst: 10500000, igst: 0, cess: 0, totalTax: 21000000 },
    netLiability: { taxableAmount: 530000000, cgst: 13250000, sgst: 13250000, igst: 0, cess: 0, totalTax: 26500000 },
    itcClaimed: 21000000, taxPayable: 26500000,
    createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'uuid-gst-2', returnType: 'GSTR1', period: '2025-12', filingDate: '2026-01-10', dueDate: '2026-01-11', status: 'FILED',
    outletName: 'Consolidated',
    salesSummary: { taxableAmount: 850000000, cgst: 23750000, sgst: 23750000, igst: 0, cess: 0, totalTax: 47500000 },
    purchaseSummary: { taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, totalTax: 0 },
    netLiability: { taxableAmount: 850000000, cgst: 23750000, sgst: 23750000, igst: 0, cess: 0, totalTax: 47500000 },
    itcClaimed: 0, taxPayable: 47500000,
    createdAt: '2026-01-08T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'uuid-gst-3', returnType: 'GSTR3B', period: '2026-01', filingDate: '2026-02-18', dueDate: '2026-02-20', status: 'FILED',
    outletName: 'Consolidated',
    salesSummary: { taxableAmount: 920000000, cgst: 25800000, sgst: 25800000, igst: 0, cess: 0, totalTax: 51600000 },
    purchaseSummary: { taxableAmount: 350000000, cgst: 11500000, sgst: 11500000, igst: 0, cess: 0, totalTax: 23000000 },
    netLiability: { taxableAmount: 570000000, cgst: 14300000, sgst: 14300000, igst: 0, cess: 0, totalTax: 28600000 },
    itcClaimed: 23000000, taxPayable: 28600000,
    createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-02-18T00:00:00Z',
  },
  {
    id: 'uuid-gst-4', returnType: 'GSTR3B', period: '2026-02', dueDate: '2026-03-20', status: 'DRAFT',
    outletName: 'Consolidated',
    salesSummary: { taxableAmount: 780000000, cgst: 21500000, sgst: 21500000, igst: 0, cess: 0, totalTax: 43000000 },
    purchaseSummary: { taxableAmount: 280000000, cgst: 9200000, sgst: 9200000, igst: 0, cess: 0, totalTax: 18400000 },
    netLiability: { taxableAmount: 500000000, cgst: 12300000, sgst: 12300000, igst: 0, cess: 0, totalTax: 24600000 },
    itcClaimed: 18400000, taxPayable: 24600000,
    createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-02-25T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

const employees: Employee[] = [
  {
    id: 'uuid-emp-1', employeeCode: 'SG-001', firstName: 'Vikram', lastName: 'Sharma', email: 'vikram.sharma@spicegarden.in', phone: '+91-98765-00001',
    dateOfBirth: '1980-05-15', dateOfJoining: '2023-04-01', department: 'MANAGEMENT', designation: 'GENERAL_MANAGER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', basicSalary: 7500000, hra: 3750000, specialAllowance: 1250000, grossSalary: 12500000,
    pfNumber: 'MH/MUM/12345/001', esiNumber: '', uanNumber: '100012345001',
    bankAccountNumber: '50100012345001', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPS1234A', aadharNumber: '1234-5678-9001',
    address: 'Flat 12A, Green Valley, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400058', isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-2', employeeCode: 'SG-002', firstName: 'Rajan', lastName: 'Pillai', email: 'rajan.pillai@spicegarden.in', phone: '+91-98765-00002',
    dateOfBirth: '1978-08-20', dateOfJoining: '2023-04-01', department: 'KITCHEN', designation: 'HEAD_CHEF', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', basicSalary: 5000000, hra: 2500000, specialAllowance: 1000000, grossSalary: 8500000,
    pfNumber: 'MH/MUM/12345/002', uanNumber: '100012345002',
    bankAccountNumber: '50100012345002', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPP2345B', aadharNumber: '1234-5678-9002',
    address: '15, Sea View Apartments, Versova', city: 'Mumbai', state: 'Maharashtra', pincode: '400061', isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-3', employeeCode: 'SG-003', firstName: 'Arjun', lastName: 'Deshmukh', email: 'arjun.deshmukh@spicegarden.in', phone: '+91-98765-00003',
    dateOfBirth: '1985-11-10', dateOfJoining: '2023-06-15', department: 'KITCHEN', designation: 'SOUS_CHEF', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-2',
    basicSalary: 3500000, hra: 1750000, specialAllowance: 750000, grossSalary: 6000000,
    pfNumber: 'MH/MUM/12345/003', uanNumber: '100012345003',
    bankAccountNumber: '50100012345003', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPD3456C', aadharNumber: '1234-5678-9003',
    address: '8B, Krishna Nagar, Goregaon', city: 'Mumbai', state: 'Maharashtra', pincode: '400062', isActive: true,
    createdAt: '2023-06-15T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-4', employeeCode: 'SG-004', firstName: 'Mohammed', lastName: 'Farooq', email: 'mohammed.farooq@spicegarden.in', phone: '+91-98765-00004',
    dateOfBirth: '1990-03-25', dateOfJoining: '2023-08-01', department: 'KITCHEN', designation: 'CDP', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', reportingTo: 'uuid-emp-2',
    basicSalary: 2500000, hra: 1250000, specialAllowance: 500000, grossSalary: 4250000,
    pfNumber: 'MH/MUM/12345/004', uanNumber: '100012345004',
    bankAccountNumber: '50100012345004', bankIfsc: 'ICIC0001234', bankName: 'ICICI Bank', panNumber: 'ABCPF4567D', aadharNumber: '1234-5678-9004',
    address: '22, Mogul Lane, Mahim', city: 'Mumbai', state: 'Maharashtra', pincode: '400016', isActive: true,
    createdAt: '2023-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-5', employeeCode: 'SG-005', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@spicegarden.in', phone: '+91-98765-00005',
    dateOfBirth: '1992-07-12', dateOfJoining: '2024-01-15', department: 'SERVICE', designation: 'RESTAURANT_MANAGER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    basicSalary: 4000000, hra: 2000000, specialAllowance: 800000, grossSalary: 6800000,
    pfNumber: 'MH/MUM/12345/005', uanNumber: '100012345005',
    bankAccountNumber: '50100012345005', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPN5678E', aadharNumber: '1234-5678-9005',
    address: '5C, Palm Grove, Bandra', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', isActive: true,
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-6', employeeCode: 'SG-006', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.kumar@spicegarden.in', phone: '+91-98765-00006',
    dateOfBirth: '1995-01-08', dateOfJoining: '2023-04-01', department: 'SERVICE', designation: 'CAPTAIN', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-5',
    basicSalary: 1800000, hra: 900000, specialAllowance: 300000, grossSalary: 3000000,
    pfNumber: 'MH/MUM/12345/006', esiNumber: 'MH/MUM/ESI/006', uanNumber: '100012345006',
    bankAccountNumber: '50100012345006', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPK6789F', aadharNumber: '1234-5678-9006',
    address: '12, Shankar Nagar, Jogeshwari', city: 'Mumbai', state: 'Maharashtra', pincode: '400060', isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-7', employeeCode: 'SG-007', firstName: 'Amit', lastName: 'Singh', email: 'amit.singh@spicegarden.in', phone: '+91-98765-00007',
    dateOfBirth: '1996-09-18', dateOfJoining: '2023-05-01', department: 'SERVICE', designation: 'WAITER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-6',
    basicSalary: 1200000, hra: 600000, specialAllowance: 200000, grossSalary: 2000000,
    pfNumber: 'MH/MUM/12345/007', esiNumber: 'MH/MUM/ESI/007', uanNumber: '100012345007',
    bankAccountNumber: '50100012345007', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPS7890G', aadharNumber: '1234-5678-9007',
    address: '4, Labour Colony, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', isActive: true,
    createdAt: '2023-05-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-8', employeeCode: 'SG-008', firstName: 'Sunita', lastName: 'Patil', email: 'sunita.patil@spicegarden.in', phone: '+91-98765-00008',
    dateOfBirth: '1988-12-05', dateOfJoining: '2023-04-01', department: 'ACCOUNTS', designation: 'ACCOUNTANT', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-1',
    basicSalary: 3000000, hra: 1500000, specialAllowance: 500000, grossSalary: 5000000,
    pfNumber: 'MH/MUM/12345/008', uanNumber: '100012345008',
    bankAccountNumber: '50100012345008', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPP8901H', aadharNumber: '1234-5678-9008',
    address: '7, Sai Krupa, Malad', city: 'Mumbai', state: 'Maharashtra', pincode: '400064', isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-9', employeeCode: 'SG-009', firstName: 'Deepak', lastName: 'Gupta', email: 'deepak.gupta@spicegarden.in', phone: '+91-98765-00009',
    dateOfBirth: '1991-04-22', dateOfJoining: '2024-08-01', department: 'KITCHEN', designation: 'COMMIS', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', reportingTo: 'uuid-emp-3',
    basicSalary: 1500000, hra: 750000, specialAllowance: 250000, grossSalary: 2500000,
    pfNumber: 'MH/MUM/12345/009', esiNumber: 'MH/MUM/ESI/009', uanNumber: '100012345009',
    bankAccountNumber: '50100012345009', bankIfsc: 'ICIC0001234', bankName: 'ICICI Bank', panNumber: 'ABCPG9012J', aadharNumber: '1234-5678-9009',
    address: '3, Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', isActive: true,
    createdAt: '2024-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-10', employeeCode: 'SG-010', firstName: 'Ramesh', lastName: 'Yadav', email: 'ramesh.yadav@spicegarden.in', phone: '+91-98765-00010',
    dateOfBirth: '1993-06-30', dateOfJoining: '2024-08-01', department: 'KITCHEN', designation: 'HELPER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai', reportingTo: 'uuid-emp-9',
    basicSalary: 1000000, hra: 500000, specialAllowance: 200000, grossSalary: 1700000,
    pfNumber: 'MH/MUM/12345/010', esiNumber: 'MH/MUM/ESI/010', uanNumber: '100012345010',
    bankAccountNumber: '50100012345010', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPY0123K', aadharNumber: '1234-5678-9010',
    address: '1, Staff Quarters, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', isActive: true,
    createdAt: '2024-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-11', employeeCode: 'SG-011', firstName: 'Anita', lastName: 'Joshi', email: 'anita.joshi@spicegarden.in', phone: '+91-98765-00011',
    dateOfBirth: '1994-10-15', dateOfJoining: '2024-01-15', department: 'SERVICE', designation: 'CASHIER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', reportingTo: 'uuid-emp-5',
    basicSalary: 1600000, hra: 800000, specialAllowance: 300000, grossSalary: 2700000,
    pfNumber: 'MH/MUM/12345/011', esiNumber: 'MH/MUM/ESI/011', uanNumber: '100012345011',
    bankAccountNumber: '50100012345011', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPJ1234L', aadharNumber: '1234-5678-9011',
    address: '9, Kalanagar, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', isActive: true,
    createdAt: '2024-01-15T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-12', employeeCode: 'SG-012', firstName: 'Suresh', lastName: 'More', email: 'suresh.more@spicegarden.in', phone: '+91-98765-00012',
    dateOfBirth: '1997-02-28', dateOfJoining: '2023-09-01', department: 'KITCHEN', designation: 'COMMIS', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-3',
    basicSalary: 1500000, hra: 750000, specialAllowance: 250000, grossSalary: 2500000,
    pfNumber: 'MH/MUM/12345/012', esiNumber: 'MH/MUM/ESI/012', uanNumber: '100012345012',
    bankAccountNumber: '50100012345012', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPM2345M', aadharNumber: '1234-5678-9012',
    address: '14, Ganesh Nagar, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', isActive: true,
    createdAt: '2023-09-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-13', employeeCode: 'SG-013', firstName: 'Rahul', lastName: 'Sawant', email: 'rahul.sawant@spicegarden.in', phone: '+91-98765-00013',
    dateOfBirth: '1998-07-05', dateOfJoining: '2024-03-01', department: 'SERVICE', designation: 'WAITER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC', reportingTo: 'uuid-emp-5',
    basicSalary: 1200000, hra: 600000, specialAllowance: 200000, grossSalary: 2000000,
    pfNumber: 'MH/MUM/12345/013', esiNumber: 'MH/MUM/ESI/013', uanNumber: '100012345013',
    bankAccountNumber: '50100012345013', bankIfsc: 'ICIC0001234', bankName: 'ICICI Bank', panNumber: 'ABCPS3456N', aadharNumber: '1234-5678-9013',
    address: '6, Nehru Nagar, Kurla', city: 'Mumbai', state: 'Maharashtra', pincode: '400070', isActive: true,
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-14', employeeCode: 'SG-014', firstName: 'Manoj', lastName: 'Tiwari', email: 'manoj.tiwari@spicegarden.in', phone: '+91-98765-00014',
    dateOfBirth: '1993-11-20', dateOfJoining: '2023-04-01', department: 'PROCUREMENT', designation: 'STORE_KEEPER', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-1',
    basicSalary: 1800000, hra: 900000, specialAllowance: 300000, grossSalary: 3000000,
    pfNumber: 'MH/MUM/12345/014', esiNumber: 'MH/MUM/ESI/014', uanNumber: '100012345014',
    bankAccountNumber: '50100012345014', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPT4567P', aadharNumber: '1234-5678-9014',
    address: '10, Dattatray Colony, Jogeshwari', city: 'Mumbai', state: 'Maharashtra', pincode: '400060', isActive: true,
    createdAt: '2023-04-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-15', employeeCode: 'SG-015', firstName: 'Kavita', lastName: 'Menon', email: 'kavita.menon@spicegarden.in', phone: '+91-98765-00015',
    dateOfBirth: '1990-09-10', dateOfJoining: '2025-06-01', department: 'MARKETING', designation: 'MARKETING_EXEC', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-1',
    basicSalary: 2500000, hra: 1250000, specialAllowance: 500000, grossSalary: 4250000,
    pfNumber: 'MH/MUM/12345/015', uanNumber: '100012345015',
    bankAccountNumber: '50100012345015', bankIfsc: 'HDFC0001234', bankName: 'HDFC Bank', panNumber: 'ABCPM5678Q', aadharNumber: '1234-5678-9015',
    address: '23, Asha Nagar, Mulund', city: 'Mumbai', state: 'Maharashtra', pincode: '400080', isActive: true,
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-16', employeeCode: 'SG-016', firstName: 'Babu', lastName: 'Das', email: 'babu.das@spicegarden.in', phone: '+91-98765-00016',
    dateOfBirth: '1999-01-15', dateOfJoining: '2024-08-15', department: 'HOUSEKEEPING', designation: 'STEWARD', employmentType: 'FULL_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-5',
    basicSalary: 1000000, hra: 500000, specialAllowance: 200000, grossSalary: 1700000,
    pfNumber: 'MH/MUM/12345/016', esiNumber: 'MH/MUM/ESI/016', uanNumber: '100012345016',
    bankAccountNumber: '50100012345016', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPD6789R', aadharNumber: '1234-5678-9016',
    address: '2, Dharavi Cross Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400017', isActive: true,
    createdAt: '2024-08-15T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-17', employeeCode: 'SG-017', firstName: 'Ganesh', lastName: 'Pawar', email: 'ganesh.pawar@spicegarden.in', phone: '+91-98765-00017',
    dateOfBirth: '1995-04-12', dateOfJoining: '2024-08-01', department: 'DELIVERY', designation: 'DELIVERY_RIDER', employmentType: 'CONTRACT',
    outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
    basicSalary: 1200000, hra: 0, specialAllowance: 500000, grossSalary: 1700000,
    bankAccountNumber: '50100012345017', bankIfsc: 'SBIN0001234', bankName: 'State Bank of India', panNumber: 'ABCPP7890S', aadharNumber: '1234-5678-9017',
    address: '5, Saki Naka, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400072', isActive: true,
    createdAt: '2024-08-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-emp-18', employeeCode: 'SG-018', firstName: 'Neha', lastName: 'Verma', email: 'neha.verma@spicegarden.in', phone: '+91-98765-00018',
    dateOfBirth: '1997-12-25', dateOfJoining: '2025-01-10', department: 'SERVICE', designation: 'WAITER', employmentType: 'PART_TIME',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', reportingTo: 'uuid-emp-6',
    basicSalary: 800000, hra: 0, specialAllowance: 200000, grossSalary: 1000000,
    bankAccountNumber: '50100012345018', bankIfsc: 'ICIC0001234', bankName: 'ICICI Bank', panNumber: 'ABCPV8901T', aadharNumber: '1234-5678-9018',
    address: '8, Azad Nagar, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', isActive: true,
    createdAt: '2025-01-10T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Payroll Runs
// ---------------------------------------------------------------------------

const payrollRuns: PayrollRun[] = [
  {
    id: 'uuid-pr-1', runNumber: 'PR-2026-01', month: 1, year: 2026,
    status: 'PAID', totalEmployees: 18, totalGrossEarnings: 68500000, totalDeductions: 13300000, totalNetPay: 55200000,
    totalPfContribution: 8200000, totalEsiContribution: 580000,
    calculatedAt: '2026-01-28T10:00:00Z', approvedBy: 'uuid-emp-1', approvedAt: '2026-01-29T14:00:00Z',
    processedAt: '2026-01-30T10:00:00Z', paidAt: '2026-01-31T12:00:00Z',
    slips: [
      {
        id: 'uuid-ps-1-1', payrollRunId: 'uuid-pr-1', employeeId: 'uuid-emp-1', employeeCode: 'SG-001', employeeName: 'Vikram Sharma',
        outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', department: 'MANAGEMENT', designation: 'GENERAL_MANAGER',
        workingDays: 31, presentDays: 30, lopDays: 0, overtimeHours: 0,
        basicSalary: 7500000, hra: 3750000, specialAllowance: 1250000, overtimePay: 0, bonus: 0, grossEarnings: 12500000,
        pfEmployee: 900000, pfEmployer: 900000, esiEmployee: 0, esiEmployer: 0, professionalTax: 20000, tds: 1800000, otherDeductions: 0,
        totalDeductions: 2720000, netPay: 9780000,
        createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-01-31T12:00:00Z',
      },
      {
        id: 'uuid-ps-1-2', payrollRunId: 'uuid-pr-1', employeeId: 'uuid-emp-2', employeeCode: 'SG-002', employeeName: 'Rajan Pillai',
        outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', department: 'KITCHEN', designation: 'HEAD_CHEF',
        workingDays: 31, presentDays: 29, lopDays: 0, overtimeHours: 8,
        basicSalary: 5000000, hra: 2500000, specialAllowance: 1000000, overtimePay: 200000, bonus: 0, grossEarnings: 8700000,
        pfEmployee: 600000, pfEmployer: 600000, esiEmployee: 0, esiEmployer: 0, professionalTax: 20000, tds: 800000, otherDeductions: 0,
        totalDeductions: 1420000, netPay: 7280000,
        createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-01-31T12:00:00Z',
      },
      {
        id: 'uuid-ps-1-3', payrollRunId: 'uuid-pr-1', employeeId: 'uuid-emp-7', employeeCode: 'SG-007', employeeName: 'Amit Singh',
        outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', department: 'SERVICE', designation: 'WAITER',
        workingDays: 31, presentDays: 28, lopDays: 1, overtimeHours: 4,
        basicSalary: 1161290, hra: 580645, specialAllowance: 193548, overtimePay: 50000, bonus: 0, grossEarnings: 1985483,
        pfEmployee: 139355, pfEmployer: 139355, esiEmployee: 14891, esiEmployer: 64452, professionalTax: 20000, tds: 0, otherDeductions: 0,
        totalDeductions: 174246, netPay: 1811237,
        createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-01-31T12:00:00Z',
      },
    ],
    createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-01-31T12:00:00Z',
  },
  {
    id: 'uuid-pr-2', runNumber: 'PR-2026-02', month: 2, year: 2026,
    status: 'CALCULATED', totalEmployees: 18, totalGrossEarnings: 69200000, totalDeductions: 13500000, totalNetPay: 55700000,
    totalPfContribution: 8300000, totalEsiContribution: 590000,
    calculatedAt: '2026-02-25T10:00:00Z',
    slips: [
      {
        id: 'uuid-ps-2-1', payrollRunId: 'uuid-pr-2', employeeId: 'uuid-emp-1', employeeCode: 'SG-001', employeeName: 'Vikram Sharma',
        outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', department: 'MANAGEMENT', designation: 'GENERAL_MANAGER',
        workingDays: 28, presentDays: 27, lopDays: 0, overtimeHours: 0,
        basicSalary: 7500000, hra: 3750000, specialAllowance: 1250000, overtimePay: 0, bonus: 0, grossEarnings: 12500000,
        pfEmployee: 900000, pfEmployer: 900000, esiEmployee: 0, esiEmployer: 0, professionalTax: 20000, tds: 1800000, otherDeductions: 0,
        totalDeductions: 2720000, netPay: 9780000,
        createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z',
      },
      {
        id: 'uuid-ps-2-2', payrollRunId: 'uuid-pr-2', employeeId: 'uuid-emp-2', employeeCode: 'SG-002', employeeName: 'Rajan Pillai',
        outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', department: 'KITCHEN', designation: 'HEAD_CHEF',
        workingDays: 28, presentDays: 27, lopDays: 0, overtimeHours: 12,
        basicSalary: 5000000, hra: 2500000, specialAllowance: 1000000, overtimePay: 300000, bonus: 0, grossEarnings: 8800000,
        pfEmployee: 600000, pfEmployer: 600000, esiEmployee: 0, esiEmployer: 0, professionalTax: 20000, tds: 820000, otherDeductions: 0,
        totalDeductions: 1440000, netPay: 7360000,
        createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z',
      },
    ],
    createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Bills of Materials
// ---------------------------------------------------------------------------

const billsOfMaterials: BillOfMaterials[] = [
  {
    id: 'uuid-bom-1', name: 'Butter Chicken Gravy Base', code: 'BOM-001',
    description: 'Concentrated gravy base for Butter Chicken, yields 10L',
    outputItemId: 'uuid-inv-manufactured-1', outputItemName: 'Butter Chicken Gravy Base', outputQuantity: 10, outputUnit: 'L',
    items: [
      { id: 'uuid-bomi-1a', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 5, unit: 'KG', costPerUnit: 5000, totalCost: 25000, wastagePercent: 5 },
      { id: 'uuid-bomi-1b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 1, unit: 'KG', costPerUnit: 48000, totalCost: 48000, wastagePercent: 2 },
      { id: 'uuid-bomi-1c', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 1, unit: 'L', costPerUnit: 28000, totalCost: 28000, wastagePercent: 2 },
      { id: 'uuid-bomi-1d', inventoryItemId: 'uuid-inv-1', itemName: 'Onions', quantity: 2, unit: 'KG', costPerUnit: 4000, totalCost: 8000, wastagePercent: 10 },
      { id: 'uuid-bomi-1e', inventoryItemId: 'uuid-inv-5', itemName: 'Ginger-Garlic Paste', quantity: 0.5, unit: 'KG', costPerUnit: 12000, totalCost: 6000, wastagePercent: 5 },
      { id: 'uuid-bomi-1f', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.2, unit: 'KG', costPerUnit: 30000, totalCost: 6000, wastagePercent: 0 },
      { id: 'uuid-bomi-1g', inventoryItemId: 'uuid-inv-14', itemName: 'Garam Masala', quantity: 0.1, unit: 'KG', costPerUnit: 45000, totalCost: 4500, wastagePercent: 0 },
    ],
    totalCost: 125500, costPerUnit: 12550, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-bom-2', name: 'Dal Makhani Base', code: 'BOM-002',
    description: 'Concentrated dal makhani base, yields 10L',
    outputItemId: 'uuid-inv-manufactured-2', outputItemName: 'Dal Makhani Base', outputQuantity: 10, outputUnit: 'L',
    items: [
      { id: 'uuid-bomi-2a', inventoryItemId: 'uuid-inv-16', itemName: 'Black Urad Dal', quantity: 3, unit: 'KG', costPerUnit: 12000, totalCost: 36000, wastagePercent: 2 },
      { id: 'uuid-bomi-2b', inventoryItemId: 'uuid-inv-8', itemName: 'Butter (Amul)', quantity: 0.8, unit: 'KG', costPerUnit: 48000, totalCost: 38400, wastagePercent: 2 },
      { id: 'uuid-bomi-2c', inventoryItemId: 'uuid-inv-9', itemName: 'Fresh Cream', quantity: 0.8, unit: 'L', costPerUnit: 28000, totalCost: 22400, wastagePercent: 2 },
      { id: 'uuid-bomi-2d', inventoryItemId: 'uuid-inv-2', itemName: 'Tomatoes', quantity: 2, unit: 'KG', costPerUnit: 5000, totalCost: 10000, wastagePercent: 5 },
    ],
    totalCost: 106800, costPerUnit: 10680, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-bom-3', name: 'Biryani Masala Paste', code: 'BOM-003',
    description: 'House-special biryani masala paste, yields 5kg',
    outputItemId: 'uuid-inv-manufactured-3', outputItemName: 'Biryani Masala Paste', outputQuantity: 5, outputUnit: 'KG',
    items: [
      { id: 'uuid-bomi-3a', inventoryItemId: 'uuid-inv-1', itemName: 'Onions (fried)', quantity: 3, unit: 'KG', costPerUnit: 4000, totalCost: 12000, wastagePercent: 15 },
      { id: 'uuid-bomi-3b', inventoryItemId: 'uuid-inv-5', itemName: 'Ginger-Garlic Paste', quantity: 1, unit: 'KG', costPerUnit: 12000, totalCost: 12000, wastagePercent: 5 },
      { id: 'uuid-bomi-3c', inventoryItemId: 'uuid-inv-14', itemName: 'Garam Masala', quantity: 0.3, unit: 'KG', costPerUnit: 45000, totalCost: 13500, wastagePercent: 0 },
      { id: 'uuid-bomi-3d', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.2, unit: 'KG', costPerUnit: 30000, totalCost: 6000, wastagePercent: 0 },
      { id: 'uuid-bomi-3e', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.5, unit: 'L', costPerUnit: 16000, totalCost: 8000, wastagePercent: 0 },
    ],
    totalCost: 51500, costPerUnit: 10300, isActive: true,
    createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'uuid-bom-4', name: 'Tandoori Marinade', code: 'BOM-004',
    description: 'Tandoori marinade paste for chicken/paneer, yields 5kg',
    outputItemId: 'uuid-inv-manufactured-4', outputItemName: 'Tandoori Marinade', outputQuantity: 5, outputUnit: 'KG',
    items: [
      { id: 'uuid-bomi-4a', inventoryItemId: 'uuid-inv-9', itemName: 'Yogurt/Cream', quantity: 2, unit: 'L', costPerUnit: 28000, totalCost: 56000, wastagePercent: 2 },
      { id: 'uuid-bomi-4b', inventoryItemId: 'uuid-inv-13', itemName: 'Kashmiri Chilli Powder', quantity: 0.3, unit: 'KG', costPerUnit: 30000, totalCost: 9000, wastagePercent: 0 },
      { id: 'uuid-bomi-4c', inventoryItemId: 'uuid-inv-5', itemName: 'Ginger-Garlic Paste', quantity: 0.5, unit: 'KG', costPerUnit: 12000, totalCost: 6000, wastagePercent: 5 },
      { id: 'uuid-bomi-4d', inventoryItemId: 'uuid-inv-14', itemName: 'Garam Masala', quantity: 0.15, unit: 'KG', costPerUnit: 45000, totalCost: 6750, wastagePercent: 0 },
      { id: 'uuid-bomi-4e', inventoryItemId: 'uuid-inv-12', itemName: 'Cooking Oil (Refined)', quantity: 0.3, unit: 'L', costPerUnit: 16000, totalCost: 4800, wastagePercent: 0 },
    ],
    totalCost: 82550, costPerUnit: 16510, isActive: true,
    createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Production Orders
// ---------------------------------------------------------------------------

const productionOrders: ProductionOrder[] = [
  {
    id: 'uuid-prod-1', orderNumber: 'PROD-2026-001', bomId: 'uuid-bom-1', bomName: 'Butter Chicken Gravy Base',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    plannedQuantity: 20, completedQuantity: 20, unit: 'L', plannedDate: '2026-02-10', startDate: '2026-02-10', completionDate: '2026-02-10',
    status: 'COMPLETED', estimatedCost: 251000, actualCost: 258000,
    notes: 'Weekly gravy base production + B2B order for Grand Hyatt',
    createdAt: '2026-02-08T00:00:00Z', updatedAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'uuid-prod-2', orderNumber: 'PROD-2026-002', bomId: 'uuid-bom-3', bomName: 'Biryani Masala Paste',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
    plannedQuantity: 10, completedQuantity: 5, unit: 'KG', plannedDate: '2026-02-15', startDate: '2026-02-15',
    status: 'IN_PROGRESS', estimatedCost: 103000, actualCost: 52000,
    notes: 'Bi-weekly masala paste production',
    createdAt: '2026-02-13T00:00:00Z', updatedAt: '2026-02-15T14:00:00Z',
  },
  {
    id: 'uuid-prod-3', orderNumber: 'PROD-2026-003', bomId: 'uuid-bom-4', bomName: 'Tandoori Marinade',
    outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
    plannedQuantity: 10, completedQuantity: 0, unit: 'KG', plannedDate: '2026-03-01',
    status: 'PLANNED', estimatedCost: 165100, actualCost: 0,
    notes: 'Monthly marinade preparation',
    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// B2B Customers
// ---------------------------------------------------------------------------

const b2bCustomers: B2BCustomer[] = [
  {
    id: 'uuid-b2b-1', name: 'Grand Hyatt Mumbai', code: 'B2B-001',
    gstin: '27AADCG9012H1ZG', pan: 'AADCG9012H', contactPerson: 'Rajesh Nair', phone: '+91-98765-12345',
    email: 'procurement@grandhyatt.in', address: 'Santacruz East', city: 'Mumbai', state: 'Maharashtra', pincode: '400055',
    creditLimit: 100000000, outstandingBalance: 35000000, paymentTermDays: 30, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'uuid-b2b-2', name: 'Taj Hotels Catering Division', code: 'B2B-002',
    gstin: '27AADCT9876J1ZF', pan: 'AADCT9876J', contactPerson: 'Meera Iyer', phone: '+91-98765-23456',
    email: 'catering@tajhotels.com', address: 'Colaba', city: 'Mumbai', state: 'Maharashtra', pincode: '400005',
    creditLimit: 150000000, outstandingBalance: 0, paymentTermDays: 30, isActive: true,
    createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'uuid-b2b-3', name: 'FreshMenu Cloud Kitchens', code: 'B2B-003',
    gstin: '27AADCF5432K1ZE', pan: 'AADCF5432K', contactPerson: 'Arjun Mehta', phone: '+91-98765-34567',
    email: 'sourcing@freshmenu.in', address: 'Whitefield', city: 'Mumbai', state: 'Maharashtra', pincode: '400069',
    creditLimit: 50000000, outstandingBalance: 12500000, paymentTermDays: 15, isActive: true,
    createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'uuid-b2b-4', name: 'Blue Star Airlines Catering', code: 'B2B-004',
    gstin: '27AADCB2222L1ZD', pan: 'AADCB2222L', contactPerson: 'Siddharth Kapoor', phone: '+91-98765-45678',
    email: 'inflight@bluestar.in', address: 'Andheri East, Airport Area', city: 'Mumbai', state: 'Maharashtra', pincode: '400099',
    creditLimit: 200000000, outstandingBalance: 0, paymentTermDays: 45, isActive: true,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Sales Orders
// ---------------------------------------------------------------------------

const salesOrders: SalesOrder[] = [
  {
    id: 'uuid-so-1', orderNumber: 'SO-2026-001', customerId: 'uuid-b2b-1', customerName: 'Grand Hyatt Mumbai',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-15', deliveryDate: '2026-02-20',
    items: [
      { id: 'uuid-soi-1a', itemName: 'Butter Chicken Gravy Base', bomId: 'uuid-bom-1', quantity: 50, unit: 'L', unitPrice: 18000, taxRate: 12, taxAmount: 108000, totalAmount: 1008000 },
      { id: 'uuid-soi-1b', itemName: 'Dal Makhani Base', bomId: 'uuid-bom-2', quantity: 30, unit: 'L', unitPrice: 15000, taxRate: 12, taxAmount: 54000, totalAmount: 504000 },
    ],
    subtotal: 1350000, taxTotal: 162000, total: 1512000, status: 'DELIVERED', invoiceId: 'uuid-inv-inv-9',
    notes: 'Monthly B2B gravy base supply',
    createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-02-20T14:00:00Z',
  },
  {
    id: 'uuid-so-2', orderNumber: 'SO-2026-002', customerId: 'uuid-b2b-3', customerName: 'FreshMenu Cloud Kitchens',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-18', deliveryDate: '2026-02-22',
    items: [
      { id: 'uuid-soi-2a', itemName: 'Biryani Masala Paste', bomId: 'uuid-bom-3', quantity: 20, unit: 'KG', unitPrice: 15000, taxRate: 12, taxAmount: 36000, totalAmount: 336000 },
      { id: 'uuid-soi-2b', itemName: 'Tandoori Marinade', bomId: 'uuid-bom-4', quantity: 10, unit: 'KG', unitPrice: 22000, taxRate: 12, taxAmount: 26400, totalAmount: 246400 },
    ],
    subtotal: 520000, taxTotal: 62400, total: 582400, status: 'IN_PRODUCTION',
    createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'uuid-so-3', orderNumber: 'SO-2026-003', customerId: 'uuid-b2b-2', customerName: 'Taj Hotels Catering Division',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-22', deliveryDate: '2026-03-01',
    items: [
      { id: 'uuid-soi-3a', itemName: 'Butter Chicken Gravy Base', bomId: 'uuid-bom-1', quantity: 100, unit: 'L', unitPrice: 17000, taxRate: 12, taxAmount: 204000, totalAmount: 1904000 },
      { id: 'uuid-soi-3b', itemName: 'Dal Makhani Base', bomId: 'uuid-bom-2', quantity: 50, unit: 'L', unitPrice: 14000, taxRate: 12, taxAmount: 84000, totalAmount: 784000 },
      { id: 'uuid-soi-3c', itemName: 'Biryani Masala Paste', bomId: 'uuid-bom-3', quantity: 30, unit: 'KG', unitPrice: 15000, taxRate: 12, taxAmount: 54000, totalAmount: 504000 },
    ],
    subtotal: 2850000, taxTotal: 342000, total: 3192000, status: 'CONFIRMED',
    notes: 'Large order for March banquet season',
    createdAt: '2026-02-22T11:00:00Z', updatedAt: '2026-02-22T15:00:00Z',
  },
  {
    id: 'uuid-so-4', orderNumber: 'SO-2026-004', customerId: 'uuid-b2b-4', customerName: 'Blue Star Airlines Catering',
    outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri', date: '2026-02-25', deliveryDate: '2026-03-10',
    items: [
      { id: 'uuid-soi-4a', itemName: 'Butter Chicken Gravy Base', bomId: 'uuid-bom-1', quantity: 200, unit: 'L', unitPrice: 16000, taxRate: 12, taxAmount: 384000, totalAmount: 3584000 },
      { id: 'uuid-soi-4b', itemName: 'Tandoori Marinade', bomId: 'uuid-bom-4', quantity: 50, unit: 'KG', unitPrice: 20000, taxRate: 12, taxAmount: 120000, totalAmount: 1120000 },
    ],
    subtotal: 4200000, taxTotal: 504000, total: 4704000, status: 'DRAFT',
    notes: 'Trial order for inflight catering partnership',
    createdAt: '2026-02-25T14:00:00Z', updatedAt: '2026-02-25T14:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

const dashboardStats: DashboardStats = {
  periodLabel: 'February 2026 (MTD)',
  totalRevenue: 920000000,
  totalExpenses: 685000000,
  netProfit: 235000000,
  grossMargin: 68.5,
  foodCostPercent: 28.2,
  laborCostPercent: 22.5,
  averageDailySales: 32857143,
  totalCovers: 4850,
  averageBillValue: 18969,
  outstandingReceivables: 87500000,
  outstandingPayables: 56000000,
  cashBalance: 28500000,
  bankBalance: 473000000,
  inventoryValue: 67000000,
  wastagePercent: 2.1,
  revenueByChannel: [
    { channel: 'DINE_IN', label: 'Dine In', amount: 380000000, percentage: 41.3, orderCount: 1850, averageOrderValue: 20541 },
    { channel: 'SWIGGY', label: 'Swiggy', amount: 215000000, percentage: 23.4, orderCount: 1420, averageOrderValue: 15141 },
    { channel: 'ZOMATO', label: 'Zomato', amount: 175000000, percentage: 19.0, orderCount: 1180, averageOrderValue: 14831 },
    { channel: 'TAKEAWAY', label: 'Takeaway', amount: 65000000, percentage: 7.1, orderCount: 520, averageOrderValue: 12500 },
    { channel: 'CATERING', label: 'Catering', amount: 55000000, percentage: 6.0, orderCount: 8, averageOrderValue: 687500 },
    { channel: 'B2B', label: 'B2B Sales', amount: 30000000, percentage: 3.2, orderCount: 5, averageOrderValue: 600000 },
  ],
  monthlyTrends: [
    { date: '2025-09-01', label: 'Sep 2025', revenue: 780000000, expenses: 590000000, profit: 190000000, foodCostPercent: 29.5, coverCount: 4100 },
    { date: '2025-10-01', label: 'Oct 2025', revenue: 820000000, expenses: 610000000, profit: 210000000, foodCostPercent: 28.8, coverCount: 4350 },
    { date: '2025-11-01', label: 'Nov 2025', revenue: 850000000, expenses: 640000000, profit: 210000000, foodCostPercent: 29.1, coverCount: 4500 },
    { date: '2025-12-01', label: 'Dec 2025', revenue: 950000000, expenses: 700000000, profit: 250000000, foodCostPercent: 27.5, coverCount: 5200 },
    { date: '2026-01-01', label: 'Jan 2026', revenue: 880000000, expenses: 660000000, profit: 220000000, foodCostPercent: 28.0, coverCount: 4700 },
    { date: '2026-02-01', label: 'Feb 2026', revenue: 920000000, expenses: 685000000, profit: 235000000, foodCostPercent: 28.2, coverCount: 4850 },
  ],
  topSellingItems: [
    { recipeId: 'uuid-rec-2', name: 'Hyderabadi Chicken Biryani', category: 'RICE', quantity: 1260, revenue: 47880000, cost: 12335400, margin: 74.2 },
    { recipeId: 'uuid-rec-1', name: 'Butter Chicken', category: 'MAIN_COURSE', quantity: 1050, revenue: 44100000, cost: 12258750, margin: 72.2 },
    { recipeId: 'uuid-rec-7', name: 'Garlic Naan', category: 'BREAD', quantity: 3500, revenue: 28000000, cost: 3990000, margin: 85.7 },
    { recipeId: 'uuid-rec-3', name: 'Dal Makhani', category: 'MAIN_COURSE', quantity: 900, revenue: 25200000, cost: 4266000, margin: 83.1 },
    { recipeId: 'uuid-rec-5', name: 'Chole Bhature', category: 'MAIN_COURSE', quantity: 840, revenue: 18480000, cost: 3187800, margin: 82.7 },
    { recipeId: 'uuid-rec-9', name: 'Paneer Butter Masala', category: 'MAIN_COURSE', quantity: 750, revenue: 24000000, cost: 7530000, margin: 68.6 },
    { recipeId: 'uuid-rec-6', name: 'Tandoori Chicken (Full)', category: 'APPETIZER', quantity: 660, revenue: 36300000, cost: 13761000, margin: 62.1 },
    { recipeId: 'uuid-rec-4', name: 'Paneer Tikka', category: 'APPETIZER', quantity: 450, revenue: 14400000, cost: 3096000, margin: 78.5 },
  ],
  outletPerformance: [
    {
      outletId: 'uuid-outlet-1', outletName: 'Spice Garden Andheri',
      revenue: 450000000, expenses: 330000000, profit: 120000000,
      coverCount: 2800, averageBillValue: 16071, foodCostPercent: 27.5, laborCostPercent: 21.0,
    },
    {
      outletId: 'uuid-outlet-2', outletName: 'Spice Garden BKC',
      revenue: 280000000, expenses: 210000000, profit: 70000000,
      coverCount: 1500, averageBillValue: 18667, foodCostPercent: 28.0, laborCostPercent: 23.0,
    },
    {
      outletId: 'uuid-outlet-3', outletName: 'Cloud Kitchen Powai',
      revenue: 190000000, expenses: 145000000, profit: 45000000,
      coverCount: 550, averageBillValue: 34545, foodCostPercent: 30.0, laborCostPercent: 18.0,
    },
  ],
  pendingBills: 4,
  pendingInvoices: 2,
  lowStockAlerts: 3,
  upcomingPayroll: 69200000,
};

// ---------------------------------------------------------------------------
// Export function
// ---------------------------------------------------------------------------

export function getInitialData(): AppState {
  return {
    organization,
    outlets,
    accounts,
    journalEntries,
    vendors,
    purchaseOrders,
    bills,
    customers,
    invoices,
    recipes,
    inventoryItems,
    stockMovements,
    wastageEntries,
    aggregatorOrders,
    aggregatorSettlements,
    gstReturns,
    employees,
    payrollRuns,
    billsOfMaterials,
    productionOrders,
    b2bCustomers,
    salesOrders,
    dashboardStats,
  };
}
