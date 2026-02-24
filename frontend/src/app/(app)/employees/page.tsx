'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardBody, Table, Badge, Spinner } from '@/components/Card';
import { api, formatINR } from '@/lib/api';

const OUTLETS = [
  { id: '', name: 'All Outlets' },
  { id: 'f9ded0b6-7acf-4718-ae64-76fe69318001', name: 'Downtown Restaurant' },
  { id: '0fba4a2e-e0a1-4646-8bc8-cf1b1d72b289', name: 'Craft Brewery' },
  { id: 'da2de65c-2392-4a2c-8955-7de7b417381c', name: 'Central Kitchen' },
];

const OUTLET_MAP: Record<string, string> = {
  'f9ded0b6-7acf-4718-ae64-76fe69318001': 'Downtown Restaurant',
  '0fba4a2e-e0a1-4646-8bc8-cf1b1d72b289': 'Craft Brewery',
  'da2de65c-2392-4a2c-8955-7de7b417381c': 'Central Kitchen',
};

const DEPT_COLORS: Record<string, string> = {
  KITCHEN: 'warning',
  SERVICE: 'info',
  BAR: 'purple',
  MANAGEMENT: 'success',
  CENTRAL_KITCHEN: 'danger',
};

function getDeptColor(dept: string): string {
  return DEPT_COLORS[dept] || 'default';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [outletId, setOutletId] = useState('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (outletId) params.outletId = outletId;
      if (searchDebounced) params.search = searchDebounced;
      const res = await api.getEmployees(params);
      setEmployees(Array.isArray(res.data) ? res.data : res.data?.employees || res.data?.data || []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [outletId, searchDebounced]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-500 mt-1">Manage employee records, attendance, and payslips</p>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {OUTLETS.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, code, or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="self-end">
              <span className="text-sm text-gray-500">
                {employees.length} employee{employees.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Employee Directory</h2>
              <p className="text-sm text-gray-500">Click a row to view details</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <Spinner />
          ) : employees.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="font-medium">No employees found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <Table headers={['Code', 'Name', 'Department', 'Designation', 'Outlet', 'Pay Type', 'Status']}>
              {employees.map((emp: any) => (
                <tr
                  key={emp.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedEmployee?.id === emp.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setSelectedEmployee(selectedEmployee?.id === emp.id ? null : emp)}
                >
                  <td className="py-3 px-4 font-mono text-sm">{emp.code}</td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                      {emp.email && <p className="text-xs text-gray-400 mt-0.5">{emp.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge text={emp.department?.replace(/_/g, ' ') || '-'} variant={getDeptColor(emp.department)} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{emp.designation || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {emp.outletName || OUTLET_MAP[emp.outletId] || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      text={emp.payType || emp.salaryType || '-'}
                      variant={emp.payType === 'MONTHLY' || emp.salaryType === 'MONTHLY' ? 'info' : 'default'}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      text={emp.status || 'ACTIVE'}
                      variant={
                        (emp.status || 'ACTIVE') === 'ACTIVE' ? 'success' :
                        emp.status === 'INACTIVE' ? 'danger' : 'default'
                      }
                    />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Employee Detail Panel */}
      {selectedEmployee && (
        <EmployeeDetailPanel
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

function EmployeeDetailPanel({ employee, onClose }: { employee: any; onClose: () => void }) {
  const [attendance, setAttendance] = useState<any>(null);
  const [payslip, setPayslip] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingPayslip, setLoadingPayslip] = useState(true);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    setLoadingAttendance(true);
    setLoadingPayslip(true);

    api.getAttendanceSummary(employee.id, month, year)
      .then((res) => setAttendance(res.data))
      .catch(() => setAttendance(null))
      .finally(() => setLoadingAttendance(false));

    api.getEmployeePayslip(employee.id, month, year)
      .then((res) => setPayslip(res.data))
      .catch(() => setPayslip(null))
      .finally(() => setLoadingPayslip(false));
  }, [employee.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Side Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-gray-500">{employee.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Details */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Employee Details</h3>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <DetailRow label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
                <DetailRow label="Code" value={employee.code} />
                <DetailRow label="Email" value={employee.email || '-'} />
                <DetailRow label="Phone" value={employee.phone || '-'} />
                <DetailRow label="Department" value={employee.department?.replace(/_/g, ' ') || '-'} />
                <DetailRow label="Designation" value={employee.designation || '-'} />
                <DetailRow label="Outlet" value={employee.outletName || OUTLET_MAP[employee.outletId] || '-'} />
                <DetailRow label="Pay Type" value={employee.payType || employee.salaryType || '-'} />
                <DetailRow label="Status" value={employee.status || 'ACTIVE'} />
                <DetailRow label="Join Date" value={employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : '-'} />
                {employee.grossSalary != null && (
                  <DetailRow label="Gross Salary" value={formatINR(employee.grossSalary)} />
                )}
                {employee.bankAccountNumber && (
                  <DetailRow label="Bank Account" value={employee.bankAccountNumber} />
                )}
                {employee.panNumber && (
                  <DetailRow label="PAN" value={employee.panNumber} />
                )}
                {employee.uanNumber && (
                  <DetailRow label="UAN" value={employee.uanNumber} />
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Attendance Summary - {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h3>
            </CardHeader>
            <CardBody>
              {loadingAttendance ? (
                <Spinner />
              ) : attendance ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AttendanceStat
                    label="Present"
                    value={attendance.present ?? attendance.presentDays ?? 0}
                    color="bg-green-50 text-green-700"
                  />
                  <AttendanceStat
                    label="Absent"
                    value={attendance.absent ?? attendance.absentDays ?? 0}
                    color="bg-red-50 text-red-700"
                  />
                  <AttendanceStat
                    label="Half Days"
                    value={attendance.halfDays ?? attendance.halfDay ?? 0}
                    color="bg-amber-50 text-amber-700"
                  />
                  <AttendanceStat
                    label="OT Hours"
                    value={attendance.overtimeHours ?? attendance.otHours ?? 0}
                    color="bg-blue-50 text-blue-700"
                  />
                  <AttendanceStat
                    label="Week Off"
                    value={attendance.weeklyOff ?? attendance.weekOff ?? 0}
                    color="bg-purple-50 text-purple-700"
                  />
                  <AttendanceStat
                    label="Holidays"
                    value={attendance.holidays ?? attendance.paidHolidays ?? 0}
                    color="bg-indigo-50 text-indigo-700"
                  />
                  <AttendanceStat
                    label="Paid Days"
                    value={attendance.paidDays ?? attendance.payableDays ?? 0}
                    color="bg-emerald-50 text-emerald-700"
                  />
                  <AttendanceStat
                    label="Total Days"
                    value={attendance.totalDays ?? attendance.daysInMonth ?? 0}
                    color="bg-gray-50 text-gray-700"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No attendance data available for this month</p>
              )}
            </CardBody>
          </Card>

          {/* Latest Payslip */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Latest Payslip - {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h3>
            </CardHeader>
            <CardBody>
              {loadingPayslip ? (
                <Spinner />
              ) : payslip ? (
                <div className="space-y-4">
                  {/* Earnings */}
                  {payslip.earnings && payslip.earnings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Earnings</p>
                      <div className="space-y-1.5">
                        {payslip.earnings.map((e: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{e.name || e.component}</span>
                            <span className="font-mono font-medium">{formatINR(e.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deductions */}
                  {payslip.deductions && payslip.deductions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Deductions</p>
                      <div className="space-y-1.5">
                        {payslip.deductions.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{d.name || d.component}</span>
                            <span className="font-mono font-medium text-red-600">-{formatINR(d.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    {payslip.grossEarnings != null && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Gross Earnings</span>
                        <span className="font-mono font-bold">{formatINR(payslip.grossEarnings)}</span>
                      </div>
                    )}
                    {payslip.totalDeductions != null && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Total Deductions</span>
                        <span className="font-mono font-bold text-red-600">-{formatINR(payslip.totalDeductions)}</span>
                      </div>
                    )}
                    {payslip.netPay != null && (
                      <div className="flex justify-between text-sm bg-green-50 -mx-6 px-6 py-2.5 rounded-lg">
                        <span className="font-bold text-green-800">Net Pay</span>
                        <span className="font-mono font-bold text-green-800 text-base">{formatINR(payslip.netPay)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No payslip available for this month</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function AttendanceStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 text-center ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}
