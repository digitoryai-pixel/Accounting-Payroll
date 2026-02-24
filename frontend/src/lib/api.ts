const API_BASE = '/api/v1';

async function fetchApi(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  // Handle CSV downloads
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return { success: true, data: await res.text(), csv: true };
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'API Error');
  }
  return json;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Employees
  getEmployees: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/employees${qs}`);
  },
  getEmployee: (id: string) => fetchApi(`/employees/${id}`),
  createEmployee: (data: any) =>
    fetchApi('/employees', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  getAttendanceSummary: (empId: string, month: number, year: number) =>
    fetchApi(`/employees/${empId}/attendance/summary?month=${month}&year=${year}`),

  // Salary
  getSalaryComponents: () => fetchApi('/salary/components'),
  getSalaryTemplates: () => fetchApi('/salary/templates'),

  // Payroll
  calculatePayroll: (data: { outletId?: string; month: number; year: number }) =>
    fetchApi('/payroll/calculate', { method: 'POST', body: JSON.stringify(data) }),
  approvePayroll: (id: string) =>
    fetchApi(`/payroll/${id}/approve`, { method: 'POST' }),
  processPayroll: (id: string) =>
    fetchApi(`/payroll/${id}/process`, { method: 'POST' }),
  getPayrollRun: (id: string) => fetchApi(`/payroll/${id}`),
  getPayrollSlips: (id: string) => fetchApi(`/payroll/${id}/slips`),
  getBankFile: (id: string) => fetchApi(`/payroll/${id}/bank-file`),
  getEmployeePayslip: (empId: string, month: number, year: number) =>
    fetchApi(`/payroll/employee/${empId}/payslip?month=${month}&year=${year}`),

  // Accounting
  getAccounts: (type?: string) => {
    const qs = type ? `?type=${type}` : '';
    return fetchApi(`/accounting/accounts${qs}`);
  },
  getJournalEntries: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/accounting/journal-entries${qs}`);
  },
  getTrialBalance: (fiscalYear?: string) => {
    const qs = fiscalYear ? `?fiscalYear=${fiscalYear}` : '';
    return fetchApi(`/accounting/trial-balance${qs}`);
  },
  getBalanceSheet: (asOfDate: string) =>
    fetchApi(`/accounting/balance-sheet?asOfDate=${asOfDate}`),
  getLedger: (code: string, from: string, to: string) =>
    fetchApi(`/accounting/ledger/${code}?from=${from}&to=${to}`),
  getDayBook: (date: string) => fetchApi(`/accounting/day-book?date=${date}`),
  getBankBook: (code: string, from: string, to: string) =>
    fetchApi(`/accounting/bank-book?accountCode=${code}&from=${from}&to=${to}`),

  // Reports
  getSalaryRegister: (month: number, year: number) =>
    fetchApi(`/reports/payroll/salary-register?month=${month}&year=${year}`),
  getPayrollByOutlet: (month: number, year: number) =>
    fetchApi(`/reports/payroll/by-outlet?month=${month}&year=${year}`),
  getOvertimeAnalytics: (month: number, year: number) =>
    fetchApi(`/reports/payroll/overtime?month=${month}&year=${year}`),
  getPnL: (from: string, to: string, outletId?: string) => {
    const qs = outletId ? `&outletId=${outletId}` : '';
    return fetchApi(`/reports/pnl?from=${from}&to=${to}${qs}`);
  },
  getConsolidatedPnL: (from: string, to: string) =>
    fetchApi(`/reports/pnl/consolidated?from=${from}&to=${to}`),
};

export function formatINR(paisa: number): string {
  const rupees = paisa / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatINR2(paisa: number): string {
  const rupees = paisa / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
