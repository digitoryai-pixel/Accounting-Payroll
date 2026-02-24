// ============================================================
// CORE DOMAIN TYPES - Restaurant Financial Operating System
// ============================================================

// ---------- Base Types ----------
export type UUID = string;
export type Money = number; // Stored as paisa (integer) in DB, converted to rupees in application
export type Percentage = number; // Stored as basis points (e.g., 1200 = 12.00%)
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // ISO 8601

export interface BaseEntity {
  id: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy: UUID;
  updatedBy: UUID;
  isActive: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: UUID;
  entityType: string;
  entityId: UUID;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PROCESS';
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  performedBy: UUID;
  performedAt: ISODateTime;
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

// ---------- Organization Types ----------
export type OutletType = 'RESTAURANT' | 'BREWERY' | 'PUB' | 'QSR' | 'CENTRAL_KITCHEN' | 'CLOUD_KITCHEN' | 'CAFE';

export interface Organization {
  id: UUID;
  name: string;
  legalName: string;
  gstin: string;
  pan: string;
  tan: string;
  registeredAddress: Address;
  financialYearStart: number; // Month (1-12), typically 4 for April in India
  baseCurrency: 'INR';
}

export interface Outlet extends BaseEntity {
  organizationId: UUID;
  name: string;
  code: string;
  type: OutletType;
  address: Address;
  gstin: string;
  costCenterId: UUID;
  isHeadOffice: boolean;
  isFranchise: boolean;
  franchiseOwnerId?: UUID;
  digitoryOutletId?: string; // Link to Digitory PoS outlet
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: IndianState;
  pincode: string;
  country: 'IN';
}

export type IndianState =
  | 'AN' | 'AP' | 'AR' | 'AS' | 'BR' | 'CH' | 'CT' | 'DN' | 'DD' | 'DL'
  | 'GA' | 'GJ' | 'HR' | 'HP' | 'JK' | 'JH' | 'KA' | 'KL' | 'LA' | 'LD'
  | 'MP' | 'MH' | 'MN' | 'ML' | 'MZ' | 'NL' | 'OD' | 'PY' | 'PB' | 'RJ'
  | 'SK' | 'TN' | 'TG' | 'TR' | 'UP' | 'UK' | 'WB';

// ---------- Employee Types ----------
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'DAILY_WAGE' | 'TRAINEE';
export type EmployeeDepartment = 'KITCHEN' | 'SERVICE' | 'BAR' | 'MANAGEMENT' | 'ACCOUNTS' | 'HOUSEKEEPING' | 'DELIVERY' | 'CENTRAL_KITCHEN';
export type EmployeeDesignation =
  | 'EXECUTIVE_CHEF' | 'SOUS_CHEF' | 'CDP' | 'COMMIS_I' | 'COMMIS_II' | 'COMMIS_III'
  | 'KITCHEN_HELPER' | 'TANDOOR_CHEF' | 'PASTRY_CHEF' | 'BAKERY_CHEF'
  | 'RESTAURANT_MANAGER' | 'ASSISTANT_MANAGER' | 'CAPTAIN' | 'STEWARD' | 'HOST'
  | 'BARTENDER' | 'BAR_MANAGER' | 'BARBACK'
  | 'GENERAL_MANAGER' | 'AREA_MANAGER' | 'OPERATIONS_HEAD'
  | 'ACCOUNTANT' | 'CASHIER' | 'STORE_KEEPER'
  | 'DELIVERY_RIDER' | 'DISPATCH_MANAGER'
  | 'DISHWASHER' | 'CLEANER' | 'SECURITY';

export type PayType = 'MONTHLY_FIXED' | 'HOURLY' | 'PER_SHIFT' | 'DAILY_WAGE';
export type AttendanceSource = 'BIOMETRIC' | 'POS_LOGIN' | 'MANUAL' | 'GEOFENCE';

export interface Employee extends BaseEntity {
  employeeCode: string;
  organizationId: UUID;
  firstName: string;
  lastName: string;
  dateOfBirth: ISODate;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  email?: string;
  emergencyContact: string;
  address: Address;
  department: EmployeeDepartment;
  designation: EmployeeDesignation;
  employmentType: EmploymentType;
  payType: PayType;
  dateOfJoining: ISODate;
  dateOfExit?: ISODate;
  exitReason?: string;
  // Statutory
  pan?: string;
  aadhaar?: string; // Encrypted
  uan?: string; // Universal Account Number for PF
  esicNumber?: string;
  bankAccountNumber?: string; // Encrypted
  bankIfsc?: string;
  bankName?: string;
  // Outlet mapping
  primaryOutletId: UUID;
  outletMappings: EmployeeOutletMapping[];
  // Salary
  salaryTemplateId?: UUID;
  // Attendance
  attendanceSource: AttendanceSource;
  shiftPatternId?: UUID;
}

export interface EmployeeOutletMapping {
  employeeId: UUID;
  outletId: UUID;
  isPrimary: boolean;
  allocationPercentage: Percentage; // For cost allocation
  effectiveFrom: ISODate;
  effectiveTo?: ISODate;
}

// ---------- Salary Structure Types ----------
export type SalaryComponentType = 'EARNING' | 'DEDUCTION' | 'EMPLOYER_CONTRIBUTION';
export type CalculationBasis = 'FIXED' | 'PERCENTAGE_OF_BASIC' | 'PERCENTAGE_OF_GROSS' | 'PERCENTAGE_OF_CTC' | 'FORMULA' | 'SLAB';

export interface SalaryComponent extends BaseEntity {
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationBasis: CalculationBasis;
  value: number;
  formula?: string;
  isStatutory: boolean;
  isTaxable: boolean;
  isProRata: boolean;
  maxLimit?: Money;
  accountCode?: string; // Linked accounting head
  displayOrder: number;
}

export interface SalaryTemplate extends BaseEntity {
  name: string;
  description: string;
  organizationId: UUID;
  applicableDepartments: EmployeeDepartment[];
  applicableDesignations: EmployeeDesignation[];
  payType: PayType;
  components: SalaryTemplateComponent[];
}

export interface SalaryTemplateComponent {
  templateId: UUID;
  componentId: UUID;
  component?: SalaryComponent;
  overrideValue?: number;
  overrideFormula?: string;
}

export interface EmployeeSalaryStructure extends BaseEntity {
  employeeId: UUID;
  templateId: UUID;
  ctcAnnual: Money;
  grossMonthly: Money;
  basicMonthly: Money;
  effectiveFrom: ISODate;
  effectiveTo?: ISODate;
  components: EmployeeSalaryComponent[];
}

export interface EmployeeSalaryComponent {
  structureId: UUID;
  componentId: UUID;
  monthlyAmount: Money;
  annualAmount: Money;
  overrideValue?: number;
}

// ---------- Attendance & Shift Types ----------
export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'SPLIT' | 'FLEXIBLE';

export interface ShiftPattern extends BaseEntity {
  name: string;
  organizationId: UUID;
  shifts: ShiftDefinition[];
}

export interface ShiftDefinition {
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  shiftType: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  isWorkingDay: boolean;
}

export interface AttendanceRecord extends BaseEntity {
  employeeId: UUID;
  outletId: UUID;
  date: ISODate;
  source: AttendanceSource;
  checkIn?: ISODateTime;
  checkOut?: ISODateTime;
  hoursWorked: number;
  overtimeHours: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEK_OFF';
  shiftType?: ShiftType;
  remarks?: string;
}

// ---------- Payroll Types ----------
export type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PROCESSED' | 'PAID' | 'REVERSED';
export type PayrollPeriodType = 'MONTHLY' | 'BI_WEEKLY' | 'WEEKLY';

export interface PayrollRun extends BaseEntity {
  organizationId: UUID;
  outletId?: UUID; // null = all outlets
  periodType: PayrollPeriodType;
  periodStart: ISODate;
  periodEnd: ISODate;
  month: number;
  year: number;
  status: PayrollStatus;
  totalGross: Money;
  totalDeductions: Money;
  totalNet: Money;
  totalEmployerCost: Money;
  employeeCount: number;
  processedAt?: ISODateTime;
  processedBy?: UUID;
  approvedAt?: ISODateTime;
  approvedBy?: UUID;
  journalEntryId?: UUID; // Auto-posted accounting entry
  bankPayoutFileUrl?: string;
}

export interface PayrollSlip extends BaseEntity {
  payrollRunId: UUID;
  employeeId: UUID;
  outletId: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  workingDays: number;
  presentDays: number;
  paidDays: number;
  leaveDays: number;
  overtimeHours: number;
  // Earnings
  earnings: PayrollSlipComponent[];
  totalEarnings: Money;
  // Deductions
  deductions: PayrollSlipComponent[];
  totalDeductions: Money;
  // Net
  netPayable: Money;
  // Employer cost
  employerContributions: PayrollSlipComponent[];
  totalEmployerCost: Money;
  // Restaurant-specific
  tipsReceived: Money;
  serviceChargeShare: Money;
  incentiveAmount: Money;
  // Status
  status: PayrollStatus;
  payslipPdfUrl?: string;
}

export interface PayrollSlipComponent {
  componentId: UUID;
  componentCode: string;
  componentName: string;
  type: SalaryComponentType;
  calculatedAmount: Money;
  remarks?: string;
}

// ---------- Restaurant-Specific Payroll Types ----------
export interface TipPoolConfig extends BaseEntity {
  outletId: UUID;
  name: string;
  poolingMethod: 'EQUAL' | 'HOURS_BASED' | 'ROLE_WEIGHTED' | 'POINT_SYSTEM';
  eligibleDepartments: EmployeeDepartment[];
  roleWeights?: Record<EmployeeDesignation, number>;
  managementCut?: Percentage;
  kitchenShare?: Percentage;
  serviceShare?: Percentage;
}

export interface ServiceChargeConfig extends BaseEntity {
  outletId: UUID;
  serviceChargeRate: Percentage;
  distributionMethod: 'EQUAL' | 'ROLE_WEIGHTED' | 'DESIGNATION_SLAB';
  managementShare: Percentage;
  kitchenShare: Percentage;
  serviceShare: Percentage;
  barShare: Percentage;
  housekeepingShare: Percentage;
}

export interface IncentiveRule extends BaseEntity {
  name: string;
  organizationId: UUID;
  outletId?: UUID;
  targetType: 'SALES_AMOUNT' | 'COVERS' | 'AVERAGE_TICKET' | 'FOOD_COST_PCT' | 'REVIEW_RATING';
  targetValue: number;
  incentiveType: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_EXCESS';
  incentiveValue: number;
  applicableDepartments: EmployeeDepartment[];
  applicableDesignations?: EmployeeDesignation[];
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

// ---------- Compliance Types ----------
export interface PFConfig {
  employeeContributionRate: Percentage; // 12%
  employerContributionRate: Percentage; // 12% (8.33% EPS + 3.67% EPF)
  epsRate: Percentage; // 8.33%
  epfRate: Percentage; // 3.67%
  adminCharges: Percentage; // 0.50%
  edliCharges: Percentage; // 0.50%
  wagesCeiling: Money; // ₹15,000
  voluntaryAboveCeiling: boolean;
}

export interface ESIConfig {
  employeeContributionRate: Percentage; // 0.75%
  employerContributionRate: Percentage; // 3.25%
  wagesCeiling: Money; // ₹21,000
}

export interface ProfessionalTaxSlab {
  state: IndianState;
  fromAmount: Money;
  toAmount: Money;
  taxAmount: Money;
  frequency: 'MONTHLY' | 'ANNUAL';
}

export interface TDSSlab {
  regime: 'OLD' | 'NEW';
  financialYear: string;
  fromAmount: Money;
  toAmount: Money;
  rate: Percentage;
  surchargeRate?: Percentage;
  cessRate: Percentage;
}

// ---------- Accounting Types ----------
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type AccountSubType =
  | 'CURRENT_ASSET' | 'FIXED_ASSET' | 'BANK' | 'CASH'
  | 'CURRENT_LIABILITY' | 'LONG_TERM_LIABILITY'
  | 'SHARE_CAPITAL' | 'RETAINED_EARNINGS'
  | 'SALES_REVENUE' | 'OTHER_INCOME'
  | 'COST_OF_GOODS' | 'OPERATING_EXPENSE' | 'PAYROLL_EXPENSE' | 'ADMIN_EXPENSE';

export interface ChartOfAccount extends BaseEntity {
  organizationId: UUID;
  code: string;
  name: string;
  type: AccountType;
  subType: AccountSubType;
  parentAccountId?: UUID;
  isSystemAccount: boolean;
  isBankAccount: boolean;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  balance: Money;
  costCenterId?: UUID;
  description?: string;
}

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
export type JournalEntrySource =
  | 'MANUAL'
  | 'PAYROLL'
  | 'SALES'
  | 'PURCHASE'
  | 'INVENTORY'
  | 'STOCK_CLOSING'
  | 'COGS'
  | 'TIP_DISTRIBUTION'
  | 'SERVICE_CHARGE'
  | 'EXPENSE'
  | 'DEPRECIATION';

export interface JournalEntry extends BaseEntity {
  organizationId: UUID;
  entryNumber: string;
  date: ISODate;
  source: JournalEntrySource;
  sourceReferenceId?: UUID;
  description: string;
  lines: JournalEntryLine[];
  totalDebit: Money;
  totalCredit: Money;
  status: JournalEntryStatus;
  postedAt?: ISODateTime;
  postedBy?: UUID;
  reversalOfId?: UUID;
  fiscalYear: string;
  fiscalPeriod: number; // 1-12
  tags?: string[];
}

export interface JournalEntryLine {
  id: UUID;
  journalEntryId: UUID;
  accountId: UUID;
  accountCode: string;
  debit: Money;
  credit: Money;
  outletId?: UUID;
  costCenterId?: UUID;
  description?: string;
}

export interface CostCenter extends BaseEntity {
  organizationId: UUID;
  code: string;
  name: string;
  type: 'OUTLET' | 'DEPARTMENT' | 'PRODUCTION_UNIT' | 'FRANCHISE';
  parentId?: UUID;
  outletId?: UUID;
}

// ---------- COGS Types ----------
export interface COGSEntry extends BaseEntity {
  organizationId: UUID;
  outletId: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  openingStock: Money;
  purchases: Money;
  closingStock: Money;
  cogs: Money; // opening + purchases - closing
  salesRevenue: Money;
  cogsPercentage: Percentage;
  category?: 'FOOD' | 'BEVERAGE' | 'LIQUOR' | 'PACKAGING' | 'OTHER';
  journalEntryId?: UUID;
}

// ---------- P&L Types ----------
export interface ProfitAndLoss {
  organizationId: UUID;
  outletId?: UUID;
  periodStart: ISODate;
  periodEnd: ISODate;
  revenue: {
    foodSales: Money;
    beverageSales: Money;
    liquorSales: Money;
    serviceCharge: Money;
    otherIncome: Money;
    totalRevenue: Money;
  };
  costOfGoodsSold: {
    foodCOGS: Money;
    beverageCOGS: Money;
    liquorCOGS: Money;
    totalCOGS: Money;
  };
  grossProfit: Money;
  grossMargin: Percentage;
  operatingExpenses: {
    payrollCost: Money;
    rent: Money;
    utilities: Money;
    marketing: Money;
    repairs: Money;
    depreciation: Money;
    insurance: Money;
    licensesFees: Money;
    technology: Money;
    otherExpenses: Money;
    totalOperatingExpenses: Money;
  };
  operatingProfit: Money;
  operatingMargin: Percentage;
  otherExpenses: {
    interestExpense: Money;
    taxes: Money;
    totalOtherExpenses: Money;
  };
  netProfit: Money;
  netMargin: Percentage;
  // Key restaurant ratios
  ratios: {
    foodCostPercentage: Percentage;
    beverageCostPercentage: Percentage;
    laborCostPercentage: Percentage;
    primeCostPercentage: Percentage; // COGS + Labor
    occupancyCostPercentage: Percentage;
    revenuePerEmployee: Money;
    coversPerDay: number;
    averageTicketSize: Money;
  };
}

// ---------- Event Types ----------
export type DomainEventType =
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_EXITED'
  | 'SALARY_STRUCTURE_CREATED'
  | 'SALARY_STRUCTURE_UPDATED'
  | 'ATTENDANCE_RECORDED'
  | 'PAYROLL_CALCULATED'
  | 'PAYROLL_APPROVED'
  | 'PAYROLL_PROCESSED'
  | 'PAYROLL_REVERSED'
  | 'JOURNAL_ENTRY_POSTED'
  | 'JOURNAL_ENTRY_REVERSED'
  | 'COGS_CALCULATED'
  | 'SALES_SYNCED'
  | 'PURCHASE_SYNCED'
  | 'STOCK_CLOSING_SYNCED'
  | 'TIP_DISTRIBUTED'
  | 'SERVICE_CHARGE_DISTRIBUTED'
  | 'PAYSLIP_GENERATED'
  | 'BANK_FILE_GENERATED';

export interface DomainEvent {
  id: UUID;
  type: DomainEventType;
  aggregateType: string;
  aggregateId: UUID;
  payload: Record<string, unknown>;
  metadata: {
    userId: UUID;
    outletId?: UUID;
    organizationId: UUID;
    timestamp: ISODateTime;
    correlationId: UUID;
  };
  publishedAt?: ISODateTime;
}
