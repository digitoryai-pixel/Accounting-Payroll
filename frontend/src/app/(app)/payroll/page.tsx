'use client';
import { useState } from 'react';
import { Card, CardHeader, CardBody, Table, Badge, StatCard, Spinner } from '@/components/Card';
import { api, formatINR, formatINR2 } from '@/lib/api';

const OUTLETS = [
  { id: '', label: 'All Outlets' },
  { id: 'f9ded0b6-7acf-4718-ae64-76fe69318001', label: 'Downtown Restaurant' },
  { id: '0fba4a2e-e0a1-4646-8bc8-cf1b1d72b289', label: 'Craft Brewery' },
  { id: 'da2de65c-2392-4a2c-8955-7de7b417381c', label: 'Central Kitchen' },
];

const STATUS_VARIANT: Record<string, string> = {
  DRAFT: 'default',
  CALCULATED: 'warning',
  APPROVED: 'info',
  PROCESSED: 'success',
  PAID: 'success',
};

export default function PayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [outletId, setOutletId] = useState('');
  const [payrollRun, setPayrollRun] = useState<any>(null);
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedSlip, setExpandedSlip] = useState<string | null>(null);

  const calculatePayroll = async () => {
    setLoading(true);
    setPayrollRun(null);
    setSlips([]);
    try {
      const payload: { month: number; year: number; outletId?: string } = { month, year };
      if (outletId) payload.outletId = outletId;
      const res = await api.calculatePayroll(payload);
      const run = res.data;
      setPayrollRun(run);
      // Fetch payslips for the run
      const slipsRes = await api.getPayrollSlips(run.id);
      setSlips(slipsRes.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to calculate payroll');
    } finally {
      setLoading(false);
    }
  };

  const approvePayroll = async () => {
    if (!payrollRun) return;
    setProcessing(true);
    try {
      const res = await api.approvePayroll(payrollRun.id);
      setPayrollRun(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to approve payroll');
    } finally {
      setProcessing(false);
    }
  };

  const processPayroll = async () => {
    if (!payrollRun) return;
    setProcessing(true);
    try {
      const res = await api.processPayroll(payrollRun.id);
      setPayrollRun(res.data);
    } catch (err: any) {
      alert(err.message || 'Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const downloadBankFile = async () => {
    if (!payrollRun) return;
    setProcessing(true);
    try {
      const res = await api.getBankFile(payrollRun.id);
      if (res.csv) {
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bank-file-${payrollRun.id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to download bank file');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        <p className="text-gray-500 mt-1">Run and manage payroll across outlets</p>
      </div>

      {/* Run Payroll Form */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Run Payroll</h2>
          <p className="text-sm text-gray-500">Select period and outlet to calculate payroll</p>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2025, m - 1).toLocaleString('en-IN', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Outlet</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {OUTLETS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={calculatePayroll}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating...' : 'Calculate Payroll'}
            </button>
          </div>
        </CardBody>
      </Card>

      {loading && <Spinner />}

      {/* Payroll Result Stats */}
      {payrollRun && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Employees"
              value={String(payrollRun.employeeCount || slips.length || 0)}
              sub="headcount"
              color="indigo"
            />
            <StatCard
              label="Gross Pay"
              value={formatINR(payrollRun.totalGross || 0)}
              sub="earnings"
              color="blue"
            />
            <StatCard
              label="Deductions"
              value={formatINR(payrollRun.totalDeductions || 0)}
              sub="employee"
              color="red"
            />
            <StatCard
              label="Net Pay"
              value={formatINR(payrollRun.totalNet || 0)}
              sub="take-home"
              color="green"
            />
            <StatCard
              label="Employer Cost"
              value={formatINR(payrollRun.totalEmployerCost || payrollRun.employerCost || 0)}
              sub="CTC contribution"
              color="amber"
            />
          </div>

          {/* Payroll Run Details */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Payroll Run Details</h2>
                  <Badge
                    text={payrollRun.status}
                    variant={STATUS_VARIANT[payrollRun.status] || 'default'}
                  />
                </div>
                <div className="flex gap-2">
                  {payrollRun.status === 'CALCULATED' && (
                    <button
                      onClick={approvePayroll}
                      disabled={processing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                  )}
                  {payrollRun.status === 'APPROVED' && (
                    <button
                      onClick={processPayroll}
                      disabled={processing}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Processing...' : 'Process & Post'}
                    </button>
                  )}
                  {(payrollRun.status === 'PROCESSED' || payrollRun.status === 'PAID') && (
                    <button
                      onClick={downloadBankFile}
                      disabled={processing}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? 'Downloading...' : 'Download Bank File'}
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {slips.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">No payslips found for this run.</div>
              ) : (
                <Table headers={['', 'Employee Code', 'Name', 'Paid Days', 'Earnings', 'Deductions', 'Net Pay']}>
                  {slips.map((slip: any) => (
                    <>
                      <tr
                        key={slip.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedSlip(expandedSlip === slip.id ? null : slip.id)}
                      >
                        <td className="py-3 px-4 w-8">
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedSlip === slip.id ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{slip.employee?.employeeCode || slip.employeeCode || '-'}</td>
                        <td className="py-3 px-4 font-medium">{slip.employee?.firstName ? `${slip.employee.firstName} ${slip.employee.lastName || ''}`.trim() : slip.employeeName || '-'}</td>
                        <td className="py-3 px-4">{slip.paidDays ?? slip.presentDays ?? '-'}</td>
                        <td className="py-3 px-4 text-right font-mono">{formatINR(slip.totalEarnings || slip.grossPay || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono text-red-600">{formatINR(slip.totalDeductions || 0)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-green-700">{formatINR(slip.netPay || 0)}</td>
                      </tr>
                      {expandedSlip === slip.id && (
                        <tr key={`${slip.id}-detail`}>
                          <td colSpan={7} className="bg-gray-50 px-8 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Earnings Breakdown */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Earnings</h4>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                                      <th className="text-left py-1">Component</th>
                                      <th className="text-right py-1">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(slip.earnings || []).map((e: any, i: number) => (
                                      <tr key={i} className="border-t border-gray-100">
                                        <td className="py-1.5">{e.name || e.component}</td>
                                        <td className="py-1.5 text-right font-mono">{formatINR2(e.amount)}</td>
                                      </tr>
                                    ))}
                                    {(!slip.earnings || slip.earnings.length === 0) && (
                                      <tr>
                                        <td colSpan={2} className="py-2 text-gray-400 text-center">No breakdown available</td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-gray-300 font-semibold">
                                      <td className="py-1.5">Total Earnings</td>
                                      <td className="py-1.5 text-right font-mono">{formatINR2(slip.totalEarnings || slip.grossPay || 0)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                              {/* Deductions Breakdown */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Deductions</h4>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-500 border-b border-gray-200">
                                      <th className="text-left py-1">Component</th>
                                      <th className="text-right py-1">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(slip.deductions || []).map((d: any, i: number) => (
                                      <tr key={i} className="border-t border-gray-100">
                                        <td className="py-1.5">{d.name || d.component}</td>
                                        <td className="py-1.5 text-right font-mono text-red-600">{formatINR2(d.amount)}</td>
                                      </tr>
                                    ))}
                                    {(!slip.deductions || slip.deductions.length === 0) && (
                                      <tr>
                                        <td colSpan={2} className="py-2 text-gray-400 text-center">No breakdown available</td>
                                      </tr>
                                    )}
                                  </tbody>
                                  <tfoot>
                                    <tr className="border-t border-gray-300 font-semibold">
                                      <td className="py-1.5">Total Deductions</td>
                                      <td className="py-1.5 text-right font-mono text-red-600">{formatINR2(slip.totalDeductions || 0)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-300 flex justify-end">
                              <span className="text-sm font-bold text-green-700">
                                Net Pay: {formatINR(slip.netPay || 0)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </Table>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
