// ============================================================================
// F&B Accounting System - TypeScript Types
// ============================================================================

// ---------------------------------------------------------------------------
// Base Types
// ---------------------------------------------------------------------------

export type UUID = string;
export type ISODate = string; // ISO 8601 date string e.g. '2026-01-15'
export type ISODateTime = string; // ISO 8601 datetime e.g. '2026-01-15T10:30:00Z'

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

// ---------------------------------------------------------------------------
// Organization & Outlets
// ---------------------------------------------------------------------------

export type OutletType = 'RESTAURANT' | 'QSR' | 'CLOUD_KITCHEN' | 'CATERING' | 'BAR';

export interface Organization extends BaseEntity {
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  financialYearStart: number; // month 1-12, typically 4 for India (April)
  baseCurrency: string;
}

export interface Outlet extends BaseEntity {
  organizationId: UUID;
  name: string;
  code: string;
  type: OutletType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  fssaiLicense: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Chart of Accounts
// ---------------------------------------------------------------------------

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type AccountSubType =
  // Assets
  | 'CASH'
  | 'BANK'
  | 'ACCOUNTS_RECEIVABLE'
  | 'INVENTORY'
  | 'FIXED_ASSET'
  | 'OTHER_CURRENT_ASSET'
  | 'PREPAID_EXPENSE'
  // Liabilities
  | 'ACCOUNTS_PAYABLE'
  | 'CREDIT_CARD'
  | 'CURRENT_LIABILITY'
  | 'LONG_TERM_LIABILITY'
  | 'TAX_PAYABLE'
  | 'SALARY_PAYABLE'
  // Equity
  | 'OWNERS_EQUITY'
  | 'RETAINED_EARNINGS'
  | 'OPENING_BALANCE'
  // Revenue
  | 'SALES_REVENUE'
  | 'FOOD_REVENUE'
  | 'BEVERAGE_REVENUE'
  | 'CATERING_REVENUE'
  | 'AGGREGATOR_REVENUE'
  | 'OTHER_INCOME'
  // Expenses
  | 'COST_OF_GOODS_SOLD'
  | 'FOOD_COST'
  | 'BEVERAGE_COST'
  | 'PACKAGING_COST'
  | 'SALARY_EXPENSE'
  | 'RENT_EXPENSE'
  | 'UTILITY_EXPENSE'
  | 'MARKETING_EXPENSE'
  | 'AGGREGATOR_COMMISSION'
  | 'DEPRECIATION'
  | 'REPAIR_MAINTENANCE'
  | 'INSURANCE_EXPENSE'
  | 'LICENSE_EXPENSE'
  | 'MISC_EXPENSE';

export interface Account extends BaseEntity {
  code: string;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  parentId?: UUID;
  description?: string;
  isActive: boolean;
  balance: number; // in paisa
  outletId?: UUID; // null for org-level accounts
}

// ---------------------------------------------------------------------------
// Journal Entries
// ---------------------------------------------------------------------------

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'VOID';

export type JournalEntrySource =
  | 'MANUAL'
  | 'SALES'
  | 'PURCHASE'
  | 'PAYROLL'
  | 'INVENTORY'
  | 'DEPRECIATION'
  | 'AGGREGATOR'
  | 'GST'
  | 'OPENING_BALANCE'
  | 'PRODUCTION';

export interface JournalEntryLine {
  id: UUID;
  accountId: UUID;
  accountCode: string;
  accountName: string;
  debit: number; // in paisa
  credit: number; // in paisa
  description?: string;
  outletId?: UUID;
}

export interface JournalEntry extends BaseEntity {
  entryNumber: string;
  date: ISODate;
  description: string;
  lines: JournalEntryLine[];
  status: JournalEntryStatus;
  source: JournalEntrySource;
  referenceNumber?: string;
  referenceType?: string;
  postedBy?: UUID;
  postedAt?: ISODateTime;
  reversedBy?: UUID;
  reversedAt?: ISODateTime;
  outletId?: UUID;
}

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

export type VendorCategory =
  | 'VEGETABLE_SUPPLIER'
  | 'MEAT_SUPPLIER'
  | 'DAIRY_SUPPLIER'
  | 'SPICE_SUPPLIER'
  | 'GROCERY_SUPPLIER'
  | 'BEVERAGE_SUPPLIER'
  | 'PACKAGING_SUPPLIER'
  | 'EQUIPMENT_SUPPLIER'
  | 'CLEANING_SUPPLIES'
  | 'GAS_FUEL'
  | 'LINEN_UNIFORM'
  | 'SERVICES'
  | 'OTHER';

export interface Vendor extends BaseEntity {
  name: string;
  code: string;
  category: VendorCategory;
  gstin?: string;
  pan?: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  paymentTermDays: number;
  isActive: boolean;
  outstandingBalance: number; // in paisa
}

// ---------------------------------------------------------------------------
// Purchase Orders
// ---------------------------------------------------------------------------

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: UUID;
  inventoryItemId: UUID;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number; // in paisa
  taxRate: number; // percentage
  taxAmount: number; // in paisa
  totalAmount: number; // in paisa
  receivedQuantity: number;
}

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  vendorId: UUID;
  vendorName: string;
  outletId: UUID;
  outletName: string;
  date: ISODate;
  expectedDeliveryDate: ISODate;
  items: PurchaseOrderItem[];
  subtotal: number; // in paisa
  taxTotal: number; // in paisa
  total: number; // in paisa
  status: PurchaseOrderStatus;
  notes?: string;
  approvedBy?: UUID;
  approvedAt?: ISODateTime;
}

// ---------------------------------------------------------------------------
// Bills
// ---------------------------------------------------------------------------

export type BillStatus = 'DRAFT' | 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';

export interface BillItem {
  id: UUID;
  description: string;
  accountId: UUID;
  accountCode: string;
  quantity: number;
  unit: string;
  unitPrice: number; // in paisa
  taxRate: number;
  taxAmount: number; // in paisa
  totalAmount: number; // in paisa
  inventoryItemId?: UUID;
}

export interface Bill extends BaseEntity {
  billNumber: string;
  vendorId: UUID;
  vendorName: string;
  outletId: UUID;
  outletName: string;
  purchaseOrderId?: UUID;
  date: ISODate;
  dueDate: ISODate;
  items: BillItem[];
  subtotal: number; // in paisa
  taxTotal: number; // in paisa
  total: number; // in paisa
  amountPaid: number; // in paisa
  status: BillStatus;
  referenceNumber?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type CustomerType = 'WALK_IN' | 'REGULAR' | 'CORPORATE' | 'CATERING' | 'AGGREGATOR' | 'B2B';

export interface Customer extends BaseEntity {
  name: string;
  code: string;
  type: CustomerType;
  gstin?: string;
  pan?: string;
  contactPerson?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  creditLimit: number; // in paisa
  outstandingBalance: number; // in paisa
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'VOID';

export type InvoiceChannel =
  | 'DINE_IN'
  | 'TAKEAWAY'
  | 'DELIVERY'
  | 'SWIGGY'
  | 'ZOMATO'
  | 'CATERING'
  | 'B2B'
  | 'OTHER';

export interface InvoiceItem {
  id: UUID;
  description: string;
  recipeId?: UUID;
  quantity: number;
  unit: string;
  unitPrice: number; // in paisa
  discount: number; // in paisa
  taxRate: number;
  cgst: number; // in paisa
  sgst: number; // in paisa
  igst: number; // in paisa
  totalAmount: number; // in paisa
}

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  customerId?: UUID;
  customerName: string;
  outletId: UUID;
  outletName: string;
  date: ISODate;
  dueDate: ISODate;
  channel: InvoiceChannel;
  items: InvoiceItem[];
  subtotal: number; // in paisa
  discountTotal: number; // in paisa
  taxTotal: number; // in paisa
  total: number; // in paisa
  amountPaid: number; // in paisa
  status: InvoiceStatus;
  tableNumber?: string;
  serverName?: string;
  aggregatorOrderId?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

export type MenuEngineeringCategory =
  | 'STAR'       // High popularity, high margin
  | 'PLOW_HORSE' // High popularity, low margin
  | 'PUZZLE'     // Low popularity, high margin
  | 'DOG';       // Low popularity, low margin

export type RecipeCategory =
  | 'APPETIZER'
  | 'MAIN_COURSE'
  | 'BREAD'
  | 'RICE'
  | 'DESSERT'
  | 'BEVERAGE'
  | 'SIDE'
  | 'COMBO';

export interface RecipeIngredient {
  id: UUID;
  inventoryItemId: UUID;
  itemName: string;
  quantity: number;
  unit: string;
  costPerUnit: number; // in paisa
  totalCost: number; // in paisa
  wastagePercent: number;
}

export interface Recipe extends BaseEntity {
  name: string;
  code: string;
  category: RecipeCategory;
  description?: string;
  ingredients: RecipeIngredient[];
  preparationTime: number; // in minutes
  servingSize: number;
  servingUnit: string;
  totalCost: number; // in paisa
  sellingPrice: number; // in paisa
  foodCostPercent: number;
  marginPercent: number;
  menuCategory: MenuEngineeringCategory;
  popularity: number; // orders per day average
  isActive: boolean;
  outletIds: UUID[]; // available at which outlets
  imageUrl?: string;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export type InventoryCategory =
  | 'VEGETABLES'
  | 'FRUITS'
  | 'MEAT_POULTRY'
  | 'SEAFOOD'
  | 'DAIRY'
  | 'SPICES'
  | 'GRAINS_CEREALS'
  | 'OILS_FATS'
  | 'BEVERAGES'
  | 'DRY_GOODS'
  | 'FROZEN'
  | 'PACKAGING'
  | 'CLEANING'
  | 'GAS_FUEL'
  | 'OTHER';

export type InventoryUnit = 'KG' | 'G' | 'L' | 'ML' | 'PCS' | 'DOZEN' | 'BOX' | 'PACKET' | 'CYLINDER';

export interface InventoryItem extends BaseEntity {
  name: string;
  code: string;
  category: InventoryCategory;
  unit: InventoryUnit;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  costPerUnit: number; // in paisa
  lastPurchasePrice: number; // in paisa
  averageCost: number; // in paisa
  gstRate: number; // percentage
  hsnCode: string;
  shelfLifeDays?: number;
  storageRequirement?: string;
  isPerishable: boolean;
  isActive: boolean;
  outletId: UUID;
  vendorId?: UUID;
}

export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'WASTAGE'
  | 'ADJUSTMENT'
  | 'PRODUCTION_IN'
  | 'PRODUCTION_OUT'
  | 'RETURN';

export interface StockMovement extends BaseEntity {
  inventoryItemId: UUID;
  itemName: string;
  outletId: UUID;
  type: StockMovementType;
  quantity: number;
  unit: string;
  costPerUnit: number; // in paisa
  totalCost: number; // in paisa
  referenceType?: string; // 'BILL' | 'INVOICE' | 'TRANSFER' | 'PRODUCTION'
  referenceId?: UUID;
  notes?: string;
  date: ISODate;
  performedBy?: UUID;
}

export type WastageReason =
  | 'EXPIRED'
  | 'SPOILED'
  | 'DAMAGED'
  | 'KITCHEN_WASTE'
  | 'CUSTOMER_RETURN'
  | 'OVER_PRODUCTION'
  | 'SPILLAGE'
  | 'OTHER';

export interface WastageEntry extends BaseEntity {
  inventoryItemId: UUID;
  itemName: string;
  outletId: UUID;
  outletName: string;
  quantity: number;
  unit: string;
  costPerUnit: number; // in paisa
  totalCost: number; // in paisa
  reason: WastageReason;
  date: ISODate;
  notes?: string;
  reportedBy?: UUID;
}

// ---------------------------------------------------------------------------
// Aggregator Reconciliation
// ---------------------------------------------------------------------------

export type AggregatorPlatform = 'SWIGGY' | 'ZOMATO' | 'MAGICPIN' | 'DIRECT' | 'OTHER';

export type AggregatorOrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface AggregatorOrder extends BaseEntity {
  platform: AggregatorPlatform;
  platformOrderId: string;
  outletId: UUID;
  outletName: string;
  date: ISODate;
  orderTime: ISODateTime;
  deliveryTime?: ISODateTime;
  items: {
    name: string;
    quantity: number;
    unitPrice: number; // in paisa
    totalPrice: number; // in paisa
  }[];
  grossAmount: number; // in paisa
  discount: number; // in paisa - platform funded discount
  merchantDiscount: number; // in paisa - restaurant funded discount
  commission: number; // in paisa
  commissionRate: number; // percentage
  gst: number; // in paisa
  tcs: number; // in paisa (Tax Collected at Source)
  tds: number; // in paisa (Tax Deducted at Source)
  netPayable: number; // in paisa
  status: AggregatorOrderStatus;
  customerName?: string;
  deliveryAddress?: string;
  isReconciled: boolean;
  invoiceId?: UUID;
}

export type AggregatorSettlementStatus = 'PENDING' | 'RECEIVED' | 'PARTIALLY_RECEIVED' | 'DISPUTED';

export interface AggregatorSettlement extends BaseEntity {
  platform: AggregatorPlatform;
  outletId: UUID;
  outletName: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  totalOrders: number;
  grossAmount: number; // in paisa
  totalCommission: number; // in paisa
  totalDiscount: number; // in paisa
  totalMerchantDiscount: number; // in paisa
  totalGst: number; // in paisa
  totalTcs: number; // in paisa
  totalTds: number; // in paisa
  netPayable: number; // in paisa
  amountReceived: number; // in paisa
  difference: number; // in paisa (expected - received)
  status: AggregatorSettlementStatus;
  settlementDate?: ISODate;
  bankReferenceNumber?: string;
  orderIds: UUID[];
}

// ---------------------------------------------------------------------------
// GST
// ---------------------------------------------------------------------------

export type GSTReturnType = 'GSTR1' | 'GSTR3B' | 'GSTR2A' | 'GSTR9';
export type GSTReturnStatus = 'DRAFT' | 'FILED' | 'LATE_FILED';

export interface GSTSummary {
  taxableAmount: number; // in paisa
  cgst: number; // in paisa
  sgst: number; // in paisa
  igst: number; // in paisa
  cess: number; // in paisa
  totalTax: number; // in paisa
}

export interface GSTReturn extends BaseEntity {
  returnType: GSTReturnType;
  period: string; // e.g. '2026-01' for January 2026
  filingDate?: ISODate;
  dueDate: ISODate;
  status: GSTReturnStatus;
  outletId?: UUID;
  outletName?: string;
  salesSummary: GSTSummary;
  purchaseSummary: GSTSummary;
  netLiability: GSTSummary;
  itcClaimed: number; // in paisa (Input Tax Credit)
  taxPayable: number; // in paisa
  lateFee?: number; // in paisa
  interest?: number; // in paisa
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

export type EmployeeDepartment =
  | 'KITCHEN'
  | 'SERVICE'
  | 'BAR'
  | 'MANAGEMENT'
  | 'ACCOUNTS'
  | 'PROCUREMENT'
  | 'HOUSEKEEPING'
  | 'DELIVERY'
  | 'MARKETING';

export type EmployeeDesignation =
  | 'HEAD_CHEF'
  | 'SOUS_CHEF'
  | 'CDP'
  | 'COMMIS'
  | 'HELPER'
  | 'RESTAURANT_MANAGER'
  | 'FLOOR_MANAGER'
  | 'CAPTAIN'
  | 'WAITER'
  | 'BARTENDER'
  | 'CASHIER'
  | 'ACCOUNTANT'
  | 'STORE_KEEPER'
  | 'STEWARD'
  | 'DELIVERY_RIDER'
  | 'MARKETING_EXEC'
  | 'HR_MANAGER'
  | 'GENERAL_MANAGER';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TRAINEE';

export interface Employee extends BaseEntity {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: ISODate;
  dateOfJoining: ISODate;
  dateOfExit?: ISODate;
  department: EmployeeDepartment;
  designation: EmployeeDesignation;
  employmentType: EmploymentType;
  outletId: UUID;
  outletName: string;
  reportingTo?: UUID;
  basicSalary: number; // in paisa (monthly)
  hra: number; // in paisa
  specialAllowance: number; // in paisa
  grossSalary: number; // in paisa
  pfNumber?: string;
  esiNumber?: string;
  uanNumber?: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  panNumber: string;
  aadharNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export type PayrollRunStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'APPROVED'
  | 'PROCESSED'
  | 'PAID'
  | 'CANCELLED';

export interface PayrollSlip extends BaseEntity {
  payrollRunId: UUID;
  employeeId: UUID;
  employeeCode: string;
  employeeName: string;
  outletId: UUID;
  outletName: string;
  department: EmployeeDepartment;
  designation: EmployeeDesignation;
  workingDays: number;
  presentDays: number;
  lopDays: number;
  overtimeHours: number;
  basicSalary: number; // in paisa
  hra: number; // in paisa
  specialAllowance: number; // in paisa
  overtimePay: number; // in paisa
  bonus: number; // in paisa
  grossEarnings: number; // in paisa
  pfEmployee: number; // in paisa
  pfEmployer: number; // in paisa
  esiEmployee: number; // in paisa
  esiEmployer: number; // in paisa
  professionalTax: number; // in paisa
  tds: number; // in paisa
  otherDeductions: number; // in paisa
  totalDeductions: number; // in paisa
  netPay: number; // in paisa
}

export interface PayrollRun extends BaseEntity {
  runNumber: string;
  month: number;
  year: number;
  outletId?: UUID;
  outletName?: string;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGrossEarnings: number; // in paisa
  totalDeductions: number; // in paisa
  totalNetPay: number; // in paisa
  totalPfContribution: number; // in paisa
  totalEsiContribution: number; // in paisa
  slips: PayrollSlip[];
  calculatedAt?: ISODateTime;
  approvedBy?: UUID;
  approvedAt?: ISODateTime;
  processedAt?: ISODateTime;
  paidAt?: ISODateTime;
}

// ---------------------------------------------------------------------------
// Manufacturing / Bill of Materials
// ---------------------------------------------------------------------------

export interface BOMItem {
  id: UUID;
  inventoryItemId: UUID;
  itemName: string;
  quantity: number;
  unit: string;
  costPerUnit: number; // in paisa
  totalCost: number; // in paisa
  wastagePercent: number;
}

export interface BillOfMaterials extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  outputItemId: UUID;
  outputItemName: string;
  outputQuantity: number;
  outputUnit: string;
  items: BOMItem[];
  totalCost: number; // in paisa
  costPerUnit: number; // in paisa
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Production Orders
// ---------------------------------------------------------------------------

export type ProductionOrderStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface ProductionOrder extends BaseEntity {
  orderNumber: string;
  bomId: UUID;
  bomName: string;
  outletId: UUID;
  outletName: string;
  plannedQuantity: number;
  completedQuantity: number;
  unit: string;
  plannedDate: ISODate;
  startDate?: ISODate;
  completionDate?: ISODate;
  status: ProductionOrderStatus;
  estimatedCost: number; // in paisa
  actualCost: number; // in paisa
  notes?: string;
}

// ---------------------------------------------------------------------------
// B2B Sales
// ---------------------------------------------------------------------------

export interface B2BCustomer extends BaseEntity {
  name: string;
  code: string;
  gstin: string;
  pan: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  creditLimit: number; // in paisa
  outstandingBalance: number; // in paisa
  paymentTermDays: number;
  isActive: boolean;
}

export type SalesOrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'INVOICED'
  | 'CANCELLED';

export interface SalesOrderItem {
  id: UUID;
  itemName: string;
  recipeId?: UUID;
  bomId?: UUID;
  quantity: number;
  unit: string;
  unitPrice: number; // in paisa
  taxRate: number;
  taxAmount: number; // in paisa
  totalAmount: number; // in paisa
}

export interface SalesOrder extends BaseEntity {
  orderNumber: string;
  customerId: UUID;
  customerName: string;
  outletId: UUID;
  outletName: string;
  date: ISODate;
  deliveryDate: ISODate;
  items: SalesOrderItem[];
  subtotal: number; // in paisa
  taxTotal: number; // in paisa
  total: number; // in paisa
  status: SalesOrderStatus;
  invoiceId?: UUID;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface PnLLineItem {
  accountCode: string;
  accountName: string;
  amount: number; // in paisa
  percentage?: number;
  children?: PnLLineItem[];
}

export interface PnLReport {
  period: { from: ISODate; to: ISODate };
  outletId?: UUID;
  outletName?: string;
  revenue: PnLLineItem[];
  totalRevenue: number; // in paisa
  costOfGoods: PnLLineItem[];
  totalCogs: number; // in paisa
  grossProfit: number; // in paisa
  grossMargin: number; // percentage
  operatingExpenses: PnLLineItem[];
  totalOperatingExpenses: number; // in paisa
  operatingProfit: number; // in paisa
  operatingMargin: number; // percentage
  otherIncome: PnLLineItem[];
  otherExpenses: PnLLineItem[];
  netProfit: number; // in paisa
  netMargin: number; // percentage
}

export interface RevenueChannelBreakdown {
  channel: InvoiceChannel;
  label: string;
  amount: number; // in paisa
  percentage: number;
  orderCount: number;
  averageOrderValue: number; // in paisa
}

export interface TrendDataPoint {
  date: ISODate;
  label: string;
  revenue: number; // in paisa
  expenses: number; // in paisa
  profit: number; // in paisa
  foodCostPercent: number;
  coverCount?: number;
}

export interface TopSellingItem {
  recipeId: UUID;
  name: string;
  category: RecipeCategory;
  quantity: number;
  revenue: number; // in paisa
  cost: number; // in paisa
  margin: number;
}

export interface OutletPerformance {
  outletId: UUID;
  outletName: string;
  revenue: number; // in paisa
  expenses: number; // in paisa
  profit: number; // in paisa
  coverCount: number;
  averageBillValue: number; // in paisa
  foodCostPercent: number;
  laborCostPercent: number;
}

export interface DashboardStats {
  periodLabel: string;
  totalRevenue: number; // in paisa
  totalExpenses: number; // in paisa
  netProfit: number; // in paisa
  grossMargin: number; // percentage
  foodCostPercent: number;
  laborCostPercent: number;
  averageDailySales: number; // in paisa
  totalCovers: number;
  averageBillValue: number; // in paisa
  outstandingReceivables: number; // in paisa
  outstandingPayables: number; // in paisa
  cashBalance: number; // in paisa
  bankBalance: number; // in paisa
  inventoryValue: number; // in paisa
  wastagePercent: number;
  revenueByChannel: RevenueChannelBreakdown[];
  monthlyTrends: TrendDataPoint[];
  topSellingItems: TopSellingItem[];
  outletPerformance: OutletPerformance[];
  pendingBills: number;
  pendingInvoices: number;
  lowStockAlerts: number;
  upcomingPayroll: number; // in paisa
}

// ---------------------------------------------------------------------------
// App State
// ---------------------------------------------------------------------------

export interface AppState {
  organization: Organization;
  outlets: Outlet[];
  accounts: Account[];
  journalEntries: JournalEntry[];
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  bills: Bill[];
  customers: Customer[];
  invoices: Invoice[];
  recipes: Recipe[];
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  wastageEntries: WastageEntry[];
  aggregatorOrders: AggregatorOrder[];
  aggregatorSettlements: AggregatorSettlement[];
  gstReturns: GSTReturn[];
  employees: Employee[];
  payrollRuns: PayrollRun[];
  billsOfMaterials: BillOfMaterials[];
  productionOrders: ProductionOrder[];
  b2bCustomers: B2BCustomer[];
  salesOrders: SalesOrder[];
  dashboardStats: DashboardStats;
}
