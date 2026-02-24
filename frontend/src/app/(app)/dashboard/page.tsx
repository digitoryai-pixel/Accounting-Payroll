'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatCard, Card, CardHeader, CardBody, Spinner } from '@/components/Card';
import { api, formatINR } from '@/lib/api';

interface OutletPayroll {
  outletName: string;
  employeeCount: number;
  totalGross: number;
  totalNet: number;
}

export default function DashboardPage() {
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [accountsCount, setAccountsCount] = useState<number | null>(null);
  const [payrollByOutlet, setPayrollByOutlet] = useState<OutletPayroll[]>([]);
  const [netPayroll, setNetPayroll] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    let completed = 0;
    const total = 3;
    const checkDone = () => {
      completed++;
      if (completed >= total) setLoading(false);
    };

    api.getEmployees()
      .then((data) => {
        setEmployeeCount(data.data.total);
      })
      .catch(() => {})
      .finally(checkDone);

    api.getPayrollByOutlet(currentMonth, currentYear)
      .then((data) => {
        const outlets: OutletPayroll[] = data.data || [];
        setPayrollByOutlet(outlets);
        const totalNet = outlets.reduce(
          (sum: number, o: OutletPayroll) => sum + (o.totalNet || 0),
          0
        );
        setNetPayroll(totalNet);
      })
      .catch(() => {})
      .finally(checkDone);

    api.getAccounts()
      .then((data) => {
        setAccountsCount(data.data.length);
      })
      .catch(() => {})
      .finally(checkDone);
  }, [currentMonth, currentYear]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Financial overview for your restaurant group</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Employees"
              value={employeeCount !== null ? String(employeeCount) : '--'}
              sub="Active workforce"
              color="indigo"
            />
            <StatCard
              label="Net Payroll"
              value={netPayroll !== null ? formatINR(netPayroll) : '--'}
              sub={`${currentMonth}/${currentYear}`}
              color="green"
            />
            <StatCard
              label="Chart of Accounts"
              value={accountsCount !== null ? String(accountsCount) : '--'}
              sub="Configured accounts"
              color="blue"
            />
            <StatCard
              label="Outlets"
              value="3"
              sub="Restaurant locations"
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Payroll by Outlet</h2>
                <p className="text-sm text-gray-500">
                  {currentMonth}/{currentYear} payroll summary
                </p>
              </CardHeader>
              <CardBody className="p-0">
                {payrollByOutlet.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                            Outlet
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                            Employees
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                            Gross
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                            Net
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {payrollByOutlet.map((outlet) => (
                          <tr key={outlet.outletName} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {outlet.outletName}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {outlet.employeeCount}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-700">
                              {formatINR(outlet.totalGross)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-gray-900">
                              {formatINR(outlet.totalNet)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    No payroll data for this period
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500">Common tasks and reports</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/payroll"
                    className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Run Payroll
                  </Link>
                  <Link
                    href="/employees"
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Employees
                  </Link>
                  <Link
                    href="/accounting"
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Trial Balance
                  </Link>
                  <Link
                    href="/reports"
                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Salary Register
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
