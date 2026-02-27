'use client';

import React, { useState } from 'react';
import { StatCard, Tabs, Badge, DataTable, Button, SelectInput } from '@/components/ui';
import type { Column } from '@/components/ui';

/* ─── Inline Mock Data ──────────────────────────────────────────────── */

const outlets = [
  {
    id: 'andheri',
    name: 'Spice Garden Andheri',
    type: 'Restaurant' as const,
    revenue: 1245000,
    foodCostPct: 30.2,
    laborCostPct: 22.5,
    ebitda: 310000,
    avgOrderValue: 850,
  },
  {
    id: 'bkc',
    name: 'Spice Garden BKC',
    type: 'QSR' as const,
    revenue: 980000,
    foodCostPct: 32.8,
    laborCostPct: 18.4,
    ebitda: 245000,
    avgOrderValue: 420,
  },
  {
    id: 'powai',
    name: 'Cloud Kitchen Powai',
    type: 'Cloud Kitchen' as const,
    revenue: 620000,
    foodCostPct: 36.0,
    laborCostPct: 14.2,
    ebitda: 155000,
    avgOrderValue: 380,
  },
];

const pnlData: Record<string, { lineItem: string; section: string; thisMonth: number; lastMonth: number }[]> = {
  andheri: [
    { lineItem: 'Food Sales', section: 'Revenue', thisMonth: 1050000, lastMonth: 980000 },
    { lineItem: 'Beverage Sales', section: 'Revenue', thisMonth: 145000, lastMonth: 132000 },
    { lineItem: 'Other Income', section: 'Revenue', thisMonth: 50000, lastMonth: 45000 },
    { lineItem: 'Total Revenue', section: 'Revenue', thisMonth: 1245000, lastMonth: 1157000 },
    { lineItem: 'Food Cost', section: 'COGS', thisMonth: 315000, lastMonth: 303800 },
    { lineItem: 'Beverage Cost', section: 'COGS', thisMonth: 61000, lastMonth: 55440 },
    { lineItem: 'Total COGS', section: 'COGS', thisMonth: 376000, lastMonth: 359240 },
    { lineItem: 'Gross Profit', section: 'Gross Profit', thisMonth: 869000, lastMonth: 797760 },
    { lineItem: 'Salaries & Wages', section: 'Operating Expenses', thisMonth: 280125, lastMonth: 272000 },
    { lineItem: 'Rent', section: 'Operating Expenses', thisMonth: 150000, lastMonth: 150000 },
    { lineItem: 'Utilities', section: 'Operating Expenses', thisMonth: 48000, lastMonth: 45000 },
    { lineItem: 'Marketing', section: 'Operating Expenses', thisMonth: 35000, lastMonth: 30000 },
    { lineItem: 'Other Operating Expenses', section: 'Operating Expenses', thisMonth: 45875, lastMonth: 42000 },
    { lineItem: 'Total Operating Expenses', section: 'Operating Expenses', thisMonth: 559000, lastMonth: 539000 },
    { lineItem: 'Net Profit', section: 'Net Profit', thisMonth: 310000, lastMonth: 258760 },
  ],
  bkc: [
    { lineItem: 'Food Sales', section: 'Revenue', thisMonth: 870000, lastMonth: 820000 },
    { lineItem: 'Beverage Sales', section: 'Revenue', thisMonth: 85000, lastMonth: 78000 },
    { lineItem: 'Other Income', section: 'Revenue', thisMonth: 25000, lastMonth: 22000 },
    { lineItem: 'Total Revenue', section: 'Revenue', thisMonth: 980000, lastMonth: 920000 },
    { lineItem: 'Food Cost', section: 'COGS', thisMonth: 285480, lastMonth: 275600 },
    { lineItem: 'Beverage Cost', section: 'COGS', thisMonth: 35960, lastMonth: 32760 },
    { lineItem: 'Total COGS', section: 'COGS', thisMonth: 321440, lastMonth: 308360 },
    { lineItem: 'Gross Profit', section: 'Gross Profit', thisMonth: 658560, lastMonth: 611640 },
    { lineItem: 'Salaries & Wages', section: 'Operating Expenses', thisMonth: 180320, lastMonth: 175000 },
    { lineItem: 'Rent', section: 'Operating Expenses', thisMonth: 120000, lastMonth: 120000 },
    { lineItem: 'Utilities', section: 'Operating Expenses', thisMonth: 38000, lastMonth: 35000 },
    { lineItem: 'Marketing', section: 'Operating Expenses', thisMonth: 42000, lastMonth: 38000 },
    { lineItem: 'Other Operating Expenses', section: 'Operating Expenses', thisMonth: 33240, lastMonth: 30000 },
    { lineItem: 'Total Operating Expenses', section: 'Operating Expenses', thisMonth: 413560, lastMonth: 398000 },
    { lineItem: 'Net Profit', section: 'Net Profit', thisMonth: 245000, lastMonth: 213640 },
  ],
  powai: [
    { lineItem: 'Food Sales', section: 'Revenue', thisMonth: 580000, lastMonth: 540000 },
    { lineItem: 'Beverage Sales', section: 'Revenue', thisMonth: 25000, lastMonth: 22000 },
    { lineItem: 'Other Income', section: 'Revenue', thisMonth: 15000, lastMonth: 12000 },
    { lineItem: 'Total Revenue', section: 'Revenue', thisMonth: 620000, lastMonth: 574000 },
    { lineItem: 'Food Cost', section: 'COGS', thisMonth: 208800, lastMonth: 199800 },
    { lineItem: 'Beverage Cost', section: 'COGS', thisMonth: 14400, lastMonth: 12320 },
    { lineItem: 'Total COGS', section: 'COGS', thisMonth: 223200, lastMonth: 212120 },
    { lineItem: 'Gross Profit', section: 'Gross Profit', thisMonth: 396800, lastMonth: 361880 },
    { lineItem: 'Salaries & Wages', section: 'Operating Expenses', thisMonth: 88040, lastMonth: 85000 },
    { lineItem: 'Rent', section: 'Operating Expenses', thisMonth: 75000, lastMonth: 75000 },
    { lineItem: 'Utilities', section: 'Operating Expenses', thisMonth: 32000, lastMonth: 30000 },
    { lineItem: 'Marketing', section: 'Operating Expenses', thisMonth: 28000, lastMonth: 25000 },
    { lineItem: 'Other Operating Expenses', section: 'Operating Expenses', thisMonth: 18760, lastMonth: 16000 },
    { lineItem: 'Total Operating Expenses', section: 'Operating Expenses', thisMonth: 241800, lastMonth: 231000 },
    { lineItem: 'Net Profit', section: 'Net Profit', thisMonth: 155000, lastMonth: 130880 },
  ],
  consolidated: [
    { lineItem: 'Food Sales', section: 'Revenue', thisMonth: 2500000, lastMonth: 2340000 },
    { lineItem: 'Beverage Sales', section: 'Revenue', thisMonth: 255000, lastMonth: 232000 },
    { lineItem: 'Other Income', section: 'Revenue', thisMonth: 90000, lastMonth: 79000 },
    { lineItem: 'Total Revenue', section: 'Revenue', thisMonth: 2845000, lastMonth: 2651000 },
    { lineItem: 'Food Cost', section: 'COGS', thisMonth: 809280, lastMonth: 779200 },
    { lineItem: 'Beverage Cost', section: 'COGS', thisMonth: 111360, lastMonth: 100520 },
    { lineItem: 'Total COGS', section: 'COGS', thisMonth: 920640, lastMonth: 879720 },
    { lineItem: 'Gross Profit', section: 'Gross Profit', thisMonth: 1924360, lastMonth: 1771280 },
    { lineItem: 'Salaries & Wages', section: 'Operating Expenses', thisMonth: 548485, lastMonth: 532000 },
    { lineItem: 'Rent', section: 'Operating Expenses', thisMonth: 345000, lastMonth: 345000 },
    { lineItem: 'Utilities', section: 'Operating Expenses', thisMonth: 118000, lastMonth: 110000 },
    { lineItem: 'Marketing', section: 'Operating Expenses', thisMonth: 105000, lastMonth: 93000 },
    { lineItem: 'Other Operating Expenses', section: 'Operating Expenses', thisMonth: 97875, lastMonth: 88000 },
    { lineItem: 'Total Operating Expenses', section: 'Operating Expenses', thisMonth: 1214360, lastMonth: 1168000 },
    { lineItem: 'Net Profit', section: 'Net Profit', thisMonth: 710000, lastMonth: 603280 },
  ],
};

const transfers = [
  {
    transferNo: 'TRF-2026-001',
    fromOutlet: 'Spice Garden Andheri',
    toOutlet: 'Cloud Kitchen Powai',
    date: '25 Feb 2026',
    items: 'Basmati Rice (25 kg), Cooking Oil (10 L)',
    value: 4250,
    status: 'Received' as const,
  },
  {
    transferNo: 'TRF-2026-002',
    fromOutlet: 'Spice Garden BKC',
    toOutlet: 'Spice Garden Andheri',
    date: '24 Feb 2026',
    items: 'Paneer (8 kg), Cream (5 L)',
    value: 3120,
    status: 'Received' as const,
  },
  {
    transferNo: 'TRF-2026-003',
    fromOutlet: 'Cloud Kitchen Powai',
    toOutlet: 'Spice Garden BKC',
    date: '26 Feb 2026',
    items: 'Chicken (15 kg), Spice Mix (3 kg)',
    value: 5680,
    status: 'In Transit' as const,
  },
  {
    transferNo: 'TRF-2026-004',
    fromOutlet: 'Spice Garden Andheri',
    toOutlet: 'Spice Garden BKC',
    date: '27 Feb 2026',
    items: 'Disposable Containers (500 pcs)',
    value: 2750,
    status: 'Initiated' as const,
  },
  {
    transferNo: 'TRF-2026-005',
    fromOutlet: 'Spice Garden BKC',
    toOutlet: 'Cloud Kitchen Powai',
    date: '22 Feb 2026',
    items: 'Flour (20 kg), Ghee (5 L)',
    value: 3890,
    status: 'Cancelled' as const,
  },
];

const budgetData: Record<string, { category: string; budget: number; actual: number }[]> = {
  andheri: [
    { category: 'Revenue', budget: 1300000, actual: 1245000 },
    { category: 'Food Cost', budget: 390000, actual: 376000 },
    { category: 'Labor', budget: 290000, actual: 280125 },
    { category: 'Rent', budget: 150000, actual: 150000 },
    { category: 'Marketing', budget: 40000, actual: 35000 },
    { category: 'Utilities', budget: 50000, actual: 48000 },
  ],
  bkc: [
    { category: 'Revenue', budget: 1000000, actual: 980000 },
    { category: 'Food Cost', budget: 320000, actual: 321440 },
    { category: 'Labor', budget: 185000, actual: 180320 },
    { category: 'Rent', budget: 120000, actual: 120000 },
    { category: 'Marketing', budget: 45000, actual: 42000 },
    { category: 'Utilities', budget: 38000, actual: 38000 },
  ],
  powai: [
    { category: 'Revenue', budget: 650000, actual: 620000 },
    { category: 'Food Cost', budget: 220000, actual: 223200 },
    { category: 'Labor', budget: 92000, actual: 88040 },
    { category: 'Rent', budget: 75000, actual: 75000 },
    { category: 'Marketing', budget: 30000, actual: 28000 },
    { category: 'Utilities', budget: 35000, actual: 32000 },
  ],
};

const benchmarkData = [
  { metric: 'Food Cost %', andheri: '30.2%', bkc: '32.8%', powai: '36.0%', bestPractice: '28-32%' },
  { metric: 'Labor Cost %', andheri: '22.5%', bkc: '18.4%', powai: '14.2%', bestPractice: '18-22%' },
  { metric: 'RevPASH', andheri: '₹1,850', bkc: '₹2,100', powai: '₹1,450', bestPractice: '₹2,000+' },
  { metric: 'Avg Table Turn', andheri: '3.2', bkc: '5.8', powai: 'N/A', bestPractice: '4.0+' },
  { metric: 'Customer Rating', andheri: '4.5', bkc: '4.2', powai: '4.0', bestPractice: '4.3+' },
];

/* ─── Helpers ───────────────────────────────────────────────────────── */

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

function getTypeBadgeVariant(type: string): 'info' | 'success' | 'purple' {
  if (type === 'Restaurant') return 'info';
  if (type === 'QSR') return 'success';
  return 'purple';
}

function metricColor(value: number, good: number, bad: number, lowerIsBetter = true): string {
  if (lowerIsBetter) {
    return value <= good ? 'text-emerald-600' : value >= bad ? 'text-red-600' : 'text-amber-600';
  }
  return value >= good ? 'text-emerald-600' : value <= bad ? 'text-red-600' : 'text-amber-600';
}

/* ─── Tab Definitions ───────────────────────────────────────────────── */

const tabList = [
  { id: 'comparison', label: 'Outlet Comparison' },
  { id: 'pnl', label: 'P&L by Outlet' },
  { id: 'transfers', label: 'Inter-Location Transfers', count: transfers.length },
  { id: 'budgets', label: 'Budgets' },
];

/* ─── Page Component ────────────────────────────────────────────────── */

export default function MultiLocationPage() {
  const [activeTab, setActiveTab] = useState('comparison');
  const [pnlOutlet, setPnlOutlet] = useState('consolidated');
  const [budgetOutlet, setBudgetOutlet] = useState('andheri');

  return (
    <div className="space-y-6">
      {/* ─── 1. Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Location Management</h1>
          <p className="text-gray-500 mt-1">
            Compare performance, manage transfers, and track budgets across all outlets
          </p>
        </div>
        <Button variant="primary" size="md">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Outlet
          </span>
        </Button>
      </div>

      {/* ─── 2. Stats Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outlets"
          value="3"
          subtitle="Active locations"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Best Performer"
          value="Andheri"
          subtitle="Highest EBITDA margin"
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Highest Food Cost"
          value="36%"
          subtitle="Cloud Kitchen Powai"
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue MTD"
          value="₹28,45,000"
          subtitle="vs last month"
          trend={{ direction: 'up', percentage: 7.3 }}
          color="purple"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ─── 3. Tabs ───────────────────────────────────────────────── */}
      <Tabs tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Tab Content ───────────────────────────────────────────── */}
      {activeTab === 'comparison' && <OutletComparison />}
      {activeTab === 'pnl' && <PnLByOutlet outlet={pnlOutlet} onOutletChange={setPnlOutlet} />}
      {activeTab === 'transfers' && <InterLocationTransfers />}
      {activeTab === 'budgets' && <BudgetsTab outlet={budgetOutlet} onOutletChange={setBudgetOutlet} />}

      {/* ─── 8. Benchmarking Section ───────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Benchmarking</h2>
        <p className="text-sm text-gray-500 mb-4">KPI comparison across outlets vs industry best practices</p>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Metric</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Andheri</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">BKC</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Powai</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Best Practice
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {benchmarkData.map((row) => (
                <tr key={row.metric} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.metric}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono">{row.andheri}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono">{row.bkc}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono">{row.powai}</td>
                  <td className="px-4 py-3 text-sm text-center font-mono text-emerald-600 font-medium">{row.bestPractice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4. Outlet Comparison Tab
   ═══════════════════════════════════════════════════════════════════════ */

function OutletComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {outlets.map((outlet) => (
        <div
          key={outlet.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          {/* Outlet Name + Type Badge */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{outlet.name}</h3>
            </div>
            <Badge variant={getTypeBadgeVariant(outlet.type)}>{outlet.type}</Badge>
          </div>

          {/* Metrics Grid */}
          <div className="space-y-3">
            {/* Revenue */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Revenue</span>
              <span className="text-sm font-semibold font-mono text-gray-900">{formatINR(outlet.revenue)}</span>
            </div>

            {/* Food Cost % */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Food Cost %</span>
              <span className={`text-sm font-semibold font-mono ${metricColor(outlet.foodCostPct, 31, 35)}`}>
                {outlet.foodCostPct}%
              </span>
            </div>

            {/* Labor Cost % */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Labor Cost %</span>
              <span className={`text-sm font-semibold font-mono ${metricColor(outlet.laborCostPct, 20, 25)}`}>
                {outlet.laborCostPct}%
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* EBITDA */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">EBITDA</span>
              <span className={`text-sm font-semibold font-mono ${metricColor(outlet.ebitda, 250000, 150000, false)}`}>
                {formatINR(outlet.ebitda)}
              </span>
            </div>

            {/* Avg Order Value */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Avg Order Value</span>
              <span className="text-sm font-semibold font-mono text-gray-900">{formatINR(outlet.avgOrderValue)}</span>
            </div>
          </div>

          {/* Mini bar - EBITDA margin indicator */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">EBITDA Margin</span>
              <span className="text-xs font-medium text-gray-600">
                {((outlet.ebitda / outlet.revenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  (outlet.ebitda / outlet.revenue) * 100 >= 25
                    ? 'bg-emerald-500'
                    : (outlet.ebitda / outlet.revenue) * 100 >= 20
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((outlet.ebitda / outlet.revenue) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. P&L by Outlet Tab
   ═══════════════════════════════════════════════════════════════════════ */

function PnLByOutlet({
  outlet,
  onOutletChange,
}: {
  outlet: string;
  onOutletChange: (val: string) => void;
}) {
  const rows = pnlData[outlet] || pnlData.consolidated;

  const outletOptions = [
    { value: 'consolidated', label: 'Consolidated (All Outlets)' },
    { value: 'andheri', label: 'Spice Garden Andheri' },
    { value: 'bkc', label: 'Spice Garden BKC' },
    { value: 'powai', label: 'Cloud Kitchen Powai' },
  ];

  const sectionHeaders: Record<string, boolean> = {
    Revenue: true,
    COGS: true,
    'Gross Profit': true,
    'Operating Expenses': true,
    'Net Profit': true,
  };

  const totalLineItems = ['Total Revenue', 'Total COGS', 'Gross Profit', 'Total Operating Expenses', 'Net Profit'];

  let lastSection = '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Profit &amp; Loss Statement</h2>
        <div className="w-64">
          <SelectInput
            label="Select Outlet"
            value={outlet}
            onChange={(e) => onOutletChange(e.target.value)}
            options={outletOptions}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Line Item</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">This Month</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Last Month</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Variance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">% Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => {
              const variance = row.thisMonth - row.lastMonth;
              const pctChange = row.lastMonth !== 0 ? (variance / row.lastMonth) * 100 : 0;
              const isTotal = totalLineItems.includes(row.lineItem);
              const isNetProfit = row.lineItem === 'Net Profit';
              const showSectionHeader = row.section !== lastSection && sectionHeaders[row.section];

              if (showSectionHeader) {
                lastSection = row.section;
              }

              return (
                <React.Fragment key={row.lineItem}>
                  {showSectionHeader && !isTotal && row.lineItem !== row.section && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        {row.section}
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`
                      ${isNetProfit ? 'bg-indigo-50 border-t-2 border-indigo-200' : isTotal ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className={`px-4 py-3 text-sm ${isTotal || isNetProfit ? 'font-bold text-gray-900' : 'text-gray-700 pl-8'}`}>
                      {row.lineItem}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-mono ${isNetProfit ? 'font-bold text-indigo-900' : isTotal ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {formatINR(row.thisMonth)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-gray-500">
                      {formatINR(row.lastMonth)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-mono ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {variance >= 0 ? '+' : ''}{formatINR(variance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono text-xs font-medium px-2 py-0.5 rounded-full ${
                          pctChange >= 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. Inter-Location Transfers Tab
   ═══════════════════════════════════════════════════════════════════════ */

function InterLocationTransfers() {
  const statusVariant = (status: string): 'success' | 'warning' | 'info' | 'danger' => {
    switch (status) {
      case 'Received': return 'success';
      case 'In Transit': return 'info';
      case 'Initiated': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  };

  const transferColumns: Column[] = [
    {
      key: 'transferNo',
      label: 'Transfer #',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-indigo-600">{value as string}</span>,
    },
    {
      key: 'fromOutlet',
      label: 'From Outlet',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'toOutlet',
      label: 'To Outlet',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
    },
    {
      key: 'items',
      label: 'Items',
      render: (value) => (
        <span className="text-gray-600 max-w-[200px] truncate block" title={value as string}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (value) => <span className="font-mono font-medium">{formatINR(value as number)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={statusVariant(value as string)}>{value as string}</Badge>,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Inter-Location Transfers</h2>
          <p className="text-sm text-gray-500">Track inventory movements between outlets</p>
        </div>
        <Button variant="primary" size="sm">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Transfer
          </span>
        </Button>
      </div>
      <DataTable
        columns={transferColumns}
        data={transfers}
        searchable
        searchPlaceholder="Search transfers..."
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. Budgets Tab
   ═══════════════════════════════════════════════════════════════════════ */

function BudgetsTab({
  outlet,
  onOutletChange,
}: {
  outlet: string;
  onOutletChange: (val: string) => void;
}) {
  const rows = budgetData[outlet] || budgetData.andheri;

  const outletOptions = [
    { value: 'andheri', label: 'Spice Garden Andheri' },
    { value: 'bkc', label: 'Spice Garden BKC' },
    { value: 'powai', label: 'Cloud Kitchen Powai' },
  ];

  const outletLabel = outletOptions.find((o) => o.value === outlet)?.label || outlet;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Budget vs Actual</h2>
          <p className="text-sm text-gray-500">{outletLabel} - February 2026</p>
        </div>
        <div className="w-64">
          <SelectInput
            label="Select Outlet"
            value={outlet}
            onChange={(e) => onOutletChange(e.target.value)}
            options={outletOptions}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Budget</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actual</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Variance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">% Used</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-48">Utilization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => {
              const variance = row.actual - row.budget;
              const pctUsed = row.budget !== 0 ? (row.actual / row.budget) * 100 : 0;
              const isRevenue = row.category === 'Revenue';
              // For revenue: over budget is good. For expenses: under budget is good.
              const isGood = isRevenue ? variance >= 0 : variance <= 0;

              let barColor = 'bg-emerald-500';
              if (!isRevenue) {
                if (pctUsed > 100) barColor = 'bg-red-500';
                else if (pctUsed > 90) barColor = 'bg-amber-500';
                else barColor = 'bg-emerald-500';
              } else {
                if (pctUsed >= 95) barColor = 'bg-emerald-500';
                else if (pctUsed >= 80) barColor = 'bg-amber-500';
                else barColor = 'bg-red-500';
              }

              return (
                <tr key={row.category} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.category}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">{formatINR(row.budget)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 font-medium">{formatINR(row.actual)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-mono ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
                    {variance >= 0 ? '+' : ''}{formatINR(variance)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`inline-flex items-center font-mono text-xs font-medium px-2 py-0.5 rounded-full ${
                        isGood
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {pctUsed.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(pctUsed, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Budget Summary */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(() => {
          const totalBudget = rows.filter((r) => r.category !== 'Revenue').reduce((sum, r) => sum + r.budget, 0);
          const totalActual = rows.filter((r) => r.category !== 'Revenue').reduce((sum, r) => sum + r.actual, 0);
          const totalVariance = totalActual - totalBudget;
          const totalPctUsed = totalBudget !== 0 ? (totalActual / totalBudget) * 100 : 0;

          return (
            <>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Expense Budget</p>
                <p className="text-lg font-bold font-mono text-gray-900 mt-1">{formatINR(totalBudget)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Expense Actual</p>
                <p className="text-lg font-bold font-mono text-gray-900 mt-1">{formatINR(totalActual)}</p>
              </div>
              <div className={`rounded-lg p-4 border ${totalVariance <= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Variance</p>
                <p className={`text-lg font-bold font-mono mt-1 ${totalVariance <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {totalVariance >= 0 ? '+' : ''}{formatINR(totalVariance)}
                  <span className="text-sm font-normal ml-2">({totalPctUsed.toFixed(1)}% used)</span>
                </p>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
