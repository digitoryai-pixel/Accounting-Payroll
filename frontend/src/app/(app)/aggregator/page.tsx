'use client';

import React, { useState } from 'react';
import {
  Modal,
  Badge,
  Button,
  Tabs,
  DataTable,
  StatCard,
  SelectInput,
  TextInput,
} from '@/components/ui';
import type { Column } from '@/components/ui';

/* ─── Currency Formatter ──────────────────────────────────────────── */

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/* ─── Mock Data: Orders ───────────────────────────────────────────── */

const mockOrders = [
  {
    orderId: 'SWG-240201-0012',
    platform: 'Swiggy',
    date: '2026-02-01',
    orderAmount: 856,
    commission: 188.32,
    platformFee: 25,
    tcs: 8.56,
    tds: 8.56,
    netPayout: 625.56,
    status: 'Matched',
  },
  {
    orderId: 'ZMT-240201-0034',
    platform: 'Zomato',
    date: '2026-02-01',
    orderAmount: 1245,
    commission: 249.00,
    platformFee: 30,
    tcs: 12.45,
    tds: 12.45,
    netPayout: 941.10,
    status: 'Matched',
  },
  {
    orderId: 'SWG-240202-0056',
    platform: 'Swiggy',
    date: '2026-02-02',
    orderAmount: 432,
    commission: 95.04,
    platformFee: 25,
    tcs: 4.32,
    tds: 4.32,
    netPayout: 303.32,
    status: 'Discrepancy',
  },
  {
    orderId: 'ZMT-240202-0078',
    platform: 'Zomato',
    date: '2026-02-02',
    orderAmount: 678,
    commission: 135.60,
    platformFee: 30,
    tcs: 6.78,
    tds: 6.78,
    netPayout: 498.84,
    status: 'Matched',
  },
  {
    orderId: 'SWG-240203-0091',
    platform: 'Swiggy',
    date: '2026-02-03',
    orderAmount: 1120,
    commission: 246.40,
    platformFee: 25,
    tcs: 11.20,
    tds: 11.20,
    netPayout: 826.20,
    status: 'Pending',
  },
  {
    orderId: 'ZMT-240203-0102',
    platform: 'Zomato',
    date: '2026-02-03',
    orderAmount: 345,
    commission: 69.00,
    platformFee: 30,
    tcs: 3.45,
    tds: 3.45,
    netPayout: 239.10,
    status: 'Discrepancy',
  },
  {
    orderId: 'SWG-240204-0115',
    platform: 'Swiggy',
    date: '2026-02-04',
    orderAmount: 1489,
    commission: 327.58,
    platformFee: 25,
    tcs: 14.89,
    tds: 14.89,
    netPayout: 1106.64,
    status: 'Matched',
  },
  {
    orderId: 'ZMT-240204-0128',
    platform: 'Zomato',
    date: '2026-02-04',
    orderAmount: 567,
    commission: 113.40,
    platformFee: 30,
    tcs: 5.67,
    tds: 5.67,
    netPayout: 412.26,
    status: 'Matched',
  },
  {
    orderId: 'SWG-240205-0134',
    platform: 'Swiggy',
    date: '2026-02-05',
    orderAmount: 298,
    commission: 65.56,
    platformFee: 25,
    tcs: 2.98,
    tds: 2.98,
    netPayout: 201.48,
    status: 'Discrepancy',
  },
  {
    orderId: 'ZMT-240205-0147',
    platform: 'Zomato',
    date: '2026-02-05',
    orderAmount: 923,
    commission: 184.60,
    platformFee: 30,
    tcs: 9.23,
    tds: 9.23,
    netPayout: 689.94,
    status: 'Pending',
  },
  {
    orderId: 'SWG-240206-0158',
    platform: 'Swiggy',
    date: '2026-02-06',
    orderAmount: 745,
    commission: 163.90,
    platformFee: 25,
    tcs: 7.45,
    tds: 7.45,
    netPayout: 541.20,
    status: 'Matched',
  },
  {
    orderId: 'ZMT-240206-0169',
    platform: 'Zomato',
    date: '2026-02-06',
    orderAmount: 1356,
    commission: 271.20,
    platformFee: 30,
    tcs: 13.56,
    tds: 13.56,
    netPayout: 1027.68,
    status: 'Discrepancy',
  },
];

/* ─── Mock Data: Settlements ──────────────────────────────────────── */

const mockSettlements = [
  {
    settlementId: 'SWG-SETT-2026-W05',
    platform: 'Swiggy',
    period: '01 Feb - 07 Feb 2026',
    orders: 48,
    grossAmount: 245600,
    commission: 54032,
    tcs: 2456,
    tds: 2456,
    netSettlement: 186656,
    status: 'Settled',
  },
  {
    settlementId: 'ZMT-SETT-2026-W05',
    platform: 'Zomato',
    period: '01 Feb - 07 Feb 2026',
    orders: 36,
    grossAmount: 182400,
    commission: 36480,
    tcs: 1824,
    tds: 1824,
    netSettlement: 142272,
    status: 'Settled',
  },
  {
    settlementId: 'SWG-SETT-2026-W06',
    platform: 'Swiggy',
    period: '08 Feb - 14 Feb 2026',
    orders: 52,
    grossAmount: 268300,
    commission: 59026,
    tcs: 2683,
    tds: 2683,
    netSettlement: 203908,
    status: 'Pending',
  },
  {
    settlementId: 'ZMT-SETT-2026-W06',
    platform: 'Zomato',
    period: '08 Feb - 14 Feb 2026',
    orders: 41,
    grossAmount: 198700,
    commission: 39740,
    tcs: 1987,
    tds: 1987,
    netSettlement: 154986,
    status: 'Pending',
  },
];

/* ─── Mock Data: Discrepancies ────────────────────────────────────── */

const mockDiscrepancies = [
  {
    orderId: 'SWG-240202-0056',
    platform: 'Swiggy',
    expectedAmount: 303.32,
    actualAmount: 278.50,
    difference: 24.82,
  },
  {
    orderId: 'ZMT-240203-0102',
    platform: 'Zomato',
    expectedAmount: 239.10,
    actualAmount: 210.00,
    difference: 29.10,
  },
  {
    orderId: 'SWG-240205-0134',
    platform: 'Swiggy',
    expectedAmount: 201.48,
    actualAmount: 185.20,
    difference: 16.28,
  },
  {
    orderId: 'ZMT-240206-0169',
    platform: 'Zomato',
    expectedAmount: 1027.68,
    actualAmount: 998.40,
    difference: 29.28,
  },
  {
    orderId: 'SWG-240207-0182',
    platform: 'Swiggy',
    expectedAmount: 456.80,
    actualAmount: 432.10,
    difference: 24.70,
  },
  {
    orderId: 'ZMT-240208-0195',
    platform: 'Zomato',
    expectedAmount: 612.30,
    actualAmount: 589.50,
    difference: 22.80,
  },
  {
    orderId: 'SWG-240209-0208',
    platform: 'Swiggy',
    expectedAmount: 378.90,
    actualAmount: 352.60,
    difference: 26.30,
  },
];

/* ─── Mock Data: Monthly Trends ───────────────────────────────────── */

const mockMonthlyTrends = [
  { month: 'Sep 2025', swiggy: 720000, zomato: 498000, total: 1218000 },
  { month: 'Oct 2025', swiggy: 765000, zomato: 523000, total: 1288000 },
  { month: 'Nov 2025', swiggy: 798000, zomato: 541000, total: 1339000 },
  { month: 'Dec 2025', swiggy: 832000, zomato: 567000, total: 1399000 },
  { month: 'Jan 2026', swiggy: 812000, zomato: 555000, total: 1367000 },
  { month: 'Feb 2026', swiggy: 845000, zomato: 582000, total: 1427000 },
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  Main Page Component                                               */
/* ═══════════════════════════════════════════════════════════════════ */

export default function AggregatorReconciliationPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPlatform, setImportPlatform] = useState('');
  const [importDateFrom, setImportDateFrom] = useState('');
  const [importDateTo, setImportDateTo] = useState('');

  const tabs = [
    { id: 'orders', label: 'Orders', count: mockOrders.length },
    { id: 'settlements', label: 'Settlements', count: mockSettlements.length },
    { id: 'reconciliation', label: 'Reconciliation', count: mockDiscrepancies.length },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <div>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Aggregator Reconciliation
          </h1>
          <p className="text-gray-500 mt-1">
            Reconcile orders and settlements from Swiggy &amp; Zomato
          </p>
        </div>
        <Button onClick={() => setImportModalOpen(true)}>
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            Import Orders
          </span>
        </Button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Swiggy Revenue"
          value="₹8,45,000"
          subtitle="Commission: 22%"
          color="yellow"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          trend={{ direction: 'up', percentage: 12.4 }}
        />
        <StatCard
          title="Zomato Revenue"
          value="₹5,82,000"
          subtitle="Commission: 20%"
          color="red"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          trend={{ direction: 'up', percentage: 8.7 }}
        />
        <StatCard
          title="Total Net Payout"
          value="₹11,18,460"
          subtitle="After all deductions"
          color="green"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
          trend={{ direction: 'up', percentage: 10.2 }}
        />
        <StatCard
          title="Discrepancies Found"
          value="7"
          subtitle="Requires review"
          color="red"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          trend={{ direction: 'down', percentage: 3 }}
        />
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ── Tab Content ──────────────────────────────────────────── */}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'settlements' && <SettlementsTab />}
      {activeTab === 'reconciliation' && <ReconciliationTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}

      {/* ── Import Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Orders"
        size="md"
      >
        <div className="space-y-4">
          <SelectInput
            label="Platform"
            value={importPlatform}
            onChange={(e) => setImportPlatform(e.target.value)}
            placeholder="Select platform"
            required
            options={[
              { value: 'swiggy', label: 'Swiggy' },
              { value: 'zomato', label: 'Zomato' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CSV File <span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-10 w-10 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload a file</span>
                    <input type="file" accept=".csv" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only, up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Date From"
              type="date"
              value={importDateFrom}
              onChange={(e) => setImportDateFrom(e.target.value)}
              required
            />
            <TextInput
              label="Date To"
              type="date"
              value={importDateTo}
              onChange={(e) => setImportDateTo(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setImportModalOpen(false)}>
              Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Orders Tab                                                        */
/* ═══════════════════════════════════════════════════════════════════ */

function OrdersTab() {
  const columns: Column[] = [
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs font-medium text-gray-900">
          {value as string}
        </span>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (value) => {
        const platform = value as string;
        return platform === 'Swiggy' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
            {platform}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
            {platform}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span>
          {new Date(value as string).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'orderAmount',
      label: 'Order Amount',
      sortable: true,
      render: (value) => (
        <span className="font-mono">{formatINR(value as number)}</span>
      ),
    },
    {
      key: 'commission',
      label: 'Commission',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-red-600">
          -{formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'platformFee',
      label: 'Platform Fee',
      render: (value) => (
        <span className="font-mono text-red-600">
          -{formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'tcs',
      label: 'TCS',
      render: (value) => (
        <span className="font-mono text-gray-500">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'tds',
      label: 'TDS',
      render: (value) => (
        <span className="font-mono text-gray-500">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'netPayout',
      label: 'Net Payout',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-gray-900">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const status = value as string;
        const variant =
          status === 'Matched'
            ? 'success'
            : status === 'Discrepancy'
              ? 'danger'
              : 'warning';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Aggregator Orders
        </h2>
        <span className="text-sm text-gray-500">
          {mockOrders.length} orders
        </span>
      </div>
      <DataTable
        columns={columns}
        data={mockOrders}
        searchable
        searchPlaceholder="Search by order ID, platform, status..."
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Settlements Tab                                                   */
/* ═══════════════════════════════════════════════════════════════════ */

function SettlementsTab() {
  const columns: Column[] = [
    {
      key: 'settlementId',
      label: 'Settlement ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs font-medium text-gray-900">
          {value as string}
        </span>
      ),
    },
    {
      key: 'platform',
      label: 'Platform',
      sortable: true,
      render: (value) => {
        const platform = value as string;
        return platform === 'Swiggy' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
            {platform}
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
            {platform}
          </span>
        );
      },
    },
    {
      key: 'period',
      label: 'Period',
      render: (value) => (
        <span className="text-sm">{value as string}</span>
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium">{value as number}</span>
      ),
    },
    {
      key: 'grossAmount',
      label: 'Gross Amount',
      sortable: true,
      render: (value) => (
        <span className="font-mono">{formatINR(value as number)}</span>
      ),
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (value) => (
        <span className="font-mono text-red-600">
          -{formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'tcs',
      label: 'TCS',
      render: (value) => (
        <span className="font-mono text-gray-500">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'tds',
      label: 'TDS',
      render: (value) => (
        <span className="font-mono text-gray-500">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'netSettlement',
      label: 'Net Settlement',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-semibold text-gray-900">
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const status = value as string;
        return (
          <Badge variant={status === 'Settled' ? 'success' : 'warning'}>
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Settlement History
        </h2>
        <span className="text-sm text-gray-500">
          {mockSettlements.length} settlements
        </span>
      </div>
      <DataTable
        columns={columns}
        data={mockSettlements}
        searchable
        searchPlaceholder="Search by settlement ID, platform..."
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Reconciliation Tab                                                */
/* ═══════════════════════════════════════════════════════════════════ */

function ReconciliationTab() {
  const totalOrders = mockOrders.length;
  const matchedOrders = mockOrders.filter((o) => o.status === 'Matched').length;
  const discrepancyOrders = mockOrders.filter(
    (o) => o.status === 'Discrepancy'
  ).length;
  const pendingOrders = mockOrders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 p-5">
          <p className="text-sm font-medium text-gray-500">Matched</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {matchedOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500 p-5">
          <p className="text-sm font-medium text-gray-500">Discrepancies</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {discrepancyOrders}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500 p-5">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {pendingOrders}
          </p>
        </div>
      </div>

      {/* ── Discrepancies List ─────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Discrepancies ({mockDiscrepancies.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Orders with payout amount mismatches requiring review
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {mockDiscrepancies.map((d) => (
            <div
              key={d.orderId}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-6 flex-1 min-w-0">
                {/* Order ID */}
                <div className="min-w-[160px]">
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {d.orderId}
                  </p>
                  {d.platform === 'Swiggy' ? (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
                      {d.platform}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                      {d.platform}
                    </span>
                  )}
                </div>

                {/* Amounts */}
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-gray-500">Expected</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {formatINR(d.expectedAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Actual</p>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {formatINR(d.actualAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Difference</p>
                    <p className="font-mono text-sm font-semibold text-red-600">
                      -{formatINR(d.difference)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button variant="danger" size="sm">
                  Dispute
                </Button>
                <Button variant="secondary" size="sm">
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Total Discrepancy */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
          <span className="text-sm font-semibold text-gray-700">
            Total Discrepancy
          </span>
          <span className="font-mono text-lg font-bold text-red-600">
            -
            {formatINR(
              mockDiscrepancies.reduce((sum, d) => sum + d.difference, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  Analytics Tab                                                     */
/* ═══════════════════════════════════════════════════════════════════ */

function AnalyticsTab() {
  const swiggyRevenue = 845000;
  const zomatoRevenue = 582000;
  const maxRevenue = Math.max(swiggyRevenue, zomatoRevenue);

  const swiggyCommission = 22;
  const zomatoCommission = 20;

  return (
    <div className="space-y-6">
      {/* ── Platform Revenue Bars ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Platform-wise Revenue
        </h2>
        <div className="space-y-6">
          {/* Swiggy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
                  Swiggy
                </span>
                <span className="text-sm text-gray-500">
                  {mockOrders.filter((o) => o.platform === 'Swiggy').length}{' '}
                  orders
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {formatINR(swiggyRevenue)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div
                className="bg-orange-500 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${(swiggyRevenue / maxRevenue) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Zomato */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
                  Zomato
                </span>
                <span className="text-sm text-gray-500">
                  {mockOrders.filter((o) => o.platform === 'Zomato').length}{' '}
                  orders
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-gray-900">
                {formatINR(zomatoRevenue)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4">
              <div
                className="bg-red-500 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${(zomatoRevenue / maxRevenue) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Commission Comparison ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Commission Percentage Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Swiggy Commission */}
          <div className="bg-orange-50 rounded-lg p-5 border border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-orange-800">
                Swiggy Commission
              </span>
              <span className="text-2xl font-bold text-orange-700">
                {swiggyCommission}%
              </span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full"
                style={{ width: `${(swiggyCommission / 30) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-orange-600">
              Effective deduction: {formatINR(Math.round(swiggyRevenue * (swiggyCommission / 100)))}
            </p>
          </div>

          {/* Zomato Commission */}
          <div className="bg-red-50 rounded-lg p-5 border border-red-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-red-800">
                Zomato Commission
              </span>
              <span className="text-2xl font-bold text-red-700">
                {zomatoCommission}%
              </span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-3">
              <div
                className="bg-red-500 h-3 rounded-full"
                style={{ width: `${(zomatoCommission / 30) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-red-600">
              Effective deduction: {formatINR(Math.round(zomatoRevenue * (zomatoCommission / 100)))}
            </p>
          </div>
        </div>
      </div>

      {/* ── Monthly Trend Table ────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Revenue Trend
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Month
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    Swiggy
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Zomato
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {mockMonthlyTrends.map((row, idx) => {
                const prevTotal =
                  idx > 0 ? mockMonthlyTrends[idx - 1].total : null;
                const growth = prevTotal
                  ? (((row.total - prevTotal) / prevTotal) * 100).toFixed(1)
                  : null;
                return (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-gray-700">
                      {formatINR(row.swiggy)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-gray-700">
                      {formatINR(row.zomato)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right font-semibold text-gray-900">
                      {formatINR(row.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {growth !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            parseFloat(growth) >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {parseFloat(growth) >= 0 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          )}
                          {Math.abs(parseFloat(growth))}%
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
