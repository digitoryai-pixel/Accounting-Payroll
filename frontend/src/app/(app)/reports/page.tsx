'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Table, Badge, StatCard, Spinner } from '@/components/Card';
import { api, formatINR, formatINR2 } from '@/lib/api';

type Tab = 'salary-register' | 'by-outlet' | 'overtime' | 'pnl';

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('salary-register');
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const tabs: { key: Tab; label: string }[] = [
    { key: 'salary-register', label: 'Salary Register' },
    { key: 'by-outlet', label: 'Payroll by Outlet' },
    { key: 'overtime', label: 'Overtime Analytics' },
    { key: 'pnl', label: 'P&L Report' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Payroll, accounting, and analytics reports</p>
        </div>
        <div className="flex gap-3">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'salary-register' && <SalaryRegister month={month} year={year} />}
      {tab === 'by-outlet' && <PayrollByOutlet month={month} year={year} />}
      {tab === 'overtime' && <OvertimeAnalytics month={month} year={year} />}
      {tab === 'pnl' && <PnLReport month={month} year={year} />}
    </div>
  );
}

function SalaryRegister({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSalaryRegister(month, year).then((res) => {
      setData(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month, year]);

  if (loading) return <Spinner />;

  const totalGross = data.reduce((sum: number, e: any) => sum + (e.totalEarnings || 0), 0);
  const totalDeductions = data.reduce((sum: number, e: any) => sum + (e.totalDeductions || 0), 0);
  const totalNet = data.reduce((sum: number, e: any) => sum + (e.netPayable || 0), 0);

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={String(data.length)} color="indigo" />
        <StatCard label="Total Gross" value={formatINR(totalGross)} color="blue" />
        <StatCard label="Total Deductions" value={formatINR(totalDeductions)} color="red" />
        <StatCard label="Total Net Pay" value={formatINR(totalNet)} color="green" />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Salary Register - {new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</h2>
        </CardHeader>
        <CardBody className="p-0">
          <Table headers={['Code', 'Name', 'Department', 'Working Days', 'Paid Days', 'Gross', 'PF', 'ESI', 'PT', 'TDS', 'Total Ded.', 'Net Pay']}>
            {data.map((emp: any) => (
              <tr key={emp.employeeId || emp.employeeCode} className="hover:bg-gray-50">
                <td className="py-2.5 px-3 font-mono text-xs">{emp.employeeCode}</td>
                <td className="py-2.5 px-3 font-medium text-sm">{emp.firstName} {emp.lastName}</td>
                <td className="py-2.5 px-3"><Badge text={emp.department || '-'} variant="default" /></td>
                <td className="py-2.5 px-3 text-center">{emp.workingDays || '-'}</td>
                <td className="py-2.5 px-3 text-center">{emp.paidDays || '-'}</td>
                <td className="py-2.5 px-3 text-right font-mono text-sm">{formatINR(emp.totalEarnings || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-xs">{formatINR(emp.pfDeduction || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-xs">{formatINR(emp.esiDeduction || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-xs">{formatINR(emp.ptDeduction || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-xs">{formatINR(emp.tdsDeduction || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-sm text-red-600">{formatINR(emp.totalDeductions || 0)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-sm font-bold text-green-700">{formatINR(emp.netPayable || 0)}</td>
              </tr>
            ))}
          </Table>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">TOTAL ({data.length} employees)</span>
            <div className="flex gap-8 font-mono font-bold">
              <span>Gross: {formatINR(totalGross)}</span>
              <span className="text-red-600">Ded: {formatINR(totalDeductions)}</span>
              <span className="text-green-700">Net: {formatINR(totalNet)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function PayrollByOutlet({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPayrollByOutlet(month, year).then((res) => {
      setData(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [month, year]);

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Payroll Summary by Outlet</h2>
      </CardHeader>
      <CardBody className="p-0">
        <Table headers={['Outlet', 'Employees', 'Gross Salary', 'Deductions', 'Net Pay', 'Employer Cost']}>
          {data.map((outlet: any, i: number) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{outlet.outletName}</td>
              <td className="py-3 px-4 text-center">{outlet.employeeCount}</td>
              <td className="py-3 px-4 text-right font-mono">{formatINR(outlet.totalGross || 0)}</td>
              <td className="py-3 px-4 text-right font-mono text-red-600">{formatINR(outlet.totalDeductions || 0)}</td>
              <td className="py-3 px-4 text-right font-mono font-bold text-green-700">{formatINR(outlet.totalNet || 0)}</td>
              <td className="py-3 px-4 text-right font-mono">{formatINR(outlet.totalEmployerCost || 0)}</td>
            </tr>
          ))}
        </Table>
        {data.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold">
            <span>GRAND TOTAL ({data.reduce((s: number, o: any) => s + (o.employeeCount || 0), 0)} employees)</span>
            <span className="font-mono text-green-700">
              Net: {formatINR(data.reduce((s: number, o: any) => s + (o.totalNet || 0), 0))}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function OvertimeAnalytics({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOvertimeAnalytics(month, year).then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [month, year]);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500">No overtime data</p>;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total OT Hours" value={`${data.totalOvertimeHours || 0} hrs`} color="amber" />
        <StatCard label="OT Cost" value={formatINR(data.totalOvertimeCost || 0)} color="red" />
        <StatCard label="Departments" value={String(data.byDepartment?.length || 0)} color="blue" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><h3 className="font-semibold">By Department</h3></CardHeader>
          <CardBody className="p-0">
            <Table headers={['Department', 'Hours', 'Cost']}>
              {(data.byDepartment || []).map((d: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4"><Badge text={d.department} variant="default" /></td>
                  <td className="py-3 px-4 text-right font-mono">{d.hours} hrs</td>
                  <td className="py-3 px-4 text-right font-mono">{formatINR(d.cost || 0)}</td>
                </tr>
              ))}
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">By Outlet</h3></CardHeader>
          <CardBody className="p-0">
            <Table headers={['Outlet', 'Hours', 'Cost']}>
              {(data.byOutlet || []).map((o: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{o.outletName}</td>
                  <td className="py-3 px-4 text-right font-mono">{o.hours} hrs</td>
                  <td className="py-3 px-4 text-right font-mono">{formatINR(o.cost || 0)}</td>
                </tr>
              ))}
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function PnLReport({ month, year }: { month: number; year: number }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    api.getConsolidatedPnL(from, to).then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [month, year]);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500">No P&L data</p>;

  const con = data.consolidated || data;
  const rev = con.revenue || {};
  const cogs = con.costOfGoodsSold || {};
  const opex = con.operatingExpenses || {};

  const PnLRow = ({ label, value, bold, indent }: { label: string; value: number; bold?: boolean; indent?: boolean }) => (
    <div className={`flex justify-between py-2 px-6 ${bold ? 'font-bold bg-gray-50 border-y border-gray-200' : ''} ${indent ? 'pl-12' : ''}`}>
      <span className={`${bold ? 'text-gray-900' : 'text-gray-600'} text-sm`}>{label}</span>
      <span className={`font-mono text-sm ${value < 0 ? 'text-red-600' : ''}`}>{formatINR(value || 0)}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Consolidated Profit & Loss</h2>
            <p className="text-sm text-gray-500">{new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</p>
          </CardHeader>
          <CardBody className="p-0">
            <PnLRow label="Food Sales" value={rev.foodSales || 0} indent />
            <PnLRow label="Beverage Sales" value={rev.beverageSales || 0} indent />
            <PnLRow label="Liquor Sales" value={rev.liquorSales || 0} indent />
            <PnLRow label="Service Charge" value={rev.serviceCharge || 0} indent />
            <PnLRow label="Other Income" value={rev.otherIncome || 0} indent />
            <PnLRow label="TOTAL REVENUE" value={rev.totalRevenue || 0} bold />

            <PnLRow label="Food COGS" value={cogs.foodCOGS || 0} indent />
            <PnLRow label="Beverage COGS" value={cogs.beverageCOGS || 0} indent />
            <PnLRow label="TOTAL COGS" value={cogs.totalCOGS || 0} bold />
            <PnLRow label="GROSS PROFIT" value={con.grossProfit || 0} bold />

            <PnLRow label="Payroll Cost" value={opex.payrollCost || 0} indent />
            <PnLRow label="Rent" value={opex.rent || 0} indent />
            <PnLRow label="Utilities" value={opex.utilities || 0} indent />
            <PnLRow label="Marketing" value={opex.marketing || 0} indent />
            <PnLRow label="Other Expenses" value={opex.otherExpenses || 0} indent />
            <PnLRow label="TOTAL OPERATING EXPENSES" value={opex.totalOperatingExpenses || 0} bold />

            <div className="flex justify-between py-4 px-6 bg-indigo-50 border-t-2 border-indigo-200">
              <span className="text-lg font-bold text-indigo-900">NET PROFIT</span>
              <span className={`text-lg font-bold font-mono ${(con.netProfit || 0) < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {formatINR(con.netProfit || 0)}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader><h3 className="font-semibold">By Outlet</h3></CardHeader>
          <CardBody className="space-y-4">
            {(data.outlets || data.byOutlet || []).map((o: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-sm">{o.outletName}</h4>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Revenue</span><span className="font-mono">{formatINR(o.revenue?.totalRevenue || 0)}</span></div>
                  <div className="flex justify-between"><span>COGS</span><span className="font-mono">{formatINR(o.costOfGoodsSold?.totalCOGS || 0)}</span></div>
                  <div className="flex justify-between"><span>OpEx</span><span className="font-mono">{formatINR(o.operatingExpenses?.totalOperatingExpenses || 0)}</span></div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Net Profit</span>
                    <span className={`font-mono ${(o.netProfit || 0) < 0 ? 'text-red-600' : 'text-green-700'}`}>{formatINR(o.netProfit || 0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
