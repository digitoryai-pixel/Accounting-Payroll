'use client';

import React from 'react';
import Link from 'next/link';
import { StatCard, Badge, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui';

/* ─── Inline Mock Data ──────────────────────────────────────────────── */

function getMockData() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const revenueByChannel = [
    { channel: 'Dine-in', percentage: 42, color: 'bg-indigo-500' },
    { channel: 'Delivery (Swiggy)', percentage: 28, color: 'bg-orange-500' },
    { channel: 'Delivery (Zomato)', percentage: 18, color: 'bg-red-500' },
    { channel: 'Takeaway', percentage: 8, color: 'bg-emerald-500' },
    { channel: 'B2B/Catering', percentage: 4, color: 'bg-purple-500' },
  ];

  const revenueTrend = [
    { day: 'Mon', amount: 128000, label: '1.28L' },
    { day: 'Tue', amount: 142000, label: '1.42L' },
    { day: 'Wed', amount: 118000, label: '1.18L' },
    { day: 'Thu', amount: 155000, label: '1.55L' },
    { day: 'Fri', amount: 172000, label: '1.72L' },
    { day: 'Sat', amount: 198000, label: '1.98L' },
    { day: 'Sun', amount: 145230, label: '1.45L' },
  ];

  const topSellingItems = [
    { item: 'Butter Chicken', qtySold: 156, revenue: '₹46,800', foodCost: 28.5 },
    { item: 'Paneer Tikka', qtySold: 132, revenue: '₹29,040', foodCost: 24.2 },
    { item: 'Chicken Biryani', qtySold: 128, revenue: '₹44,800', foodCost: 31.0 },
    { item: 'Dal Makhani', qtySold: 98, revenue: '₹17,640', foodCost: 22.8 },
    { item: 'Gulab Jamun', qtySold: 87, revenue: '₹10,440', foodCost: 18.5 },
    { item: 'Masala Dosa', qtySold: 76, revenue: '₹11,400', foodCost: 26.3 },
  ];

  const recentTransactions = [
    {
      id: 'JE-2026-0147',
      date: '27 Feb 2026',
      description: 'Daily sales - Dine-in revenue',
      debit: '₹1,45,230',
      credit: '₹1,45,230',
      status: 'POSTED' as const,
    },
    {
      id: 'JE-2026-0146',
      date: '27 Feb 2026',
      description: 'Vendor payment - Fresh Veggies Supplier',
      debit: '₹32,500',
      credit: '₹32,500',
      status: 'POSTED' as const,
    },
    {
      id: 'JE-2026-0145',
      date: '26 Feb 2026',
      description: 'Swiggy settlement - Week 8',
      debit: '₹2,18,400',
      credit: '₹2,18,400',
      status: 'POSTED' as const,
    },
    {
      id: 'JE-2026-0144',
      date: '26 Feb 2026',
      description: 'Salary advance - Kitchen staff',
      debit: '₹15,000',
      credit: '₹15,000',
      status: 'PENDING' as const,
    },
    {
      id: 'JE-2026-0143',
      date: '25 Feb 2026',
      description: 'Electricity bill - Feb 2026',
      debit: '₹48,200',
      credit: '₹48,200',
      status: 'POSTED' as const,
    },
  ];

  const alerts = {
    lowStock: [
      { item: 'Basmati Rice', current: '5 kg', reorder: '25 kg' },
      { item: 'Cooking Oil', current: '3 L', reorder: '20 L' },
      { item: 'Paneer', current: '2 kg', reorder: '10 kg' },
    ],
    overdueInvoices: [
      { invoice: 'INV-2026-089', party: 'Corporate Catering Co.', amount: '₹1,25,000', daysOverdue: 12 },
      { invoice: 'INV-2026-076', party: 'Hotel Grand Palace', amount: '₹78,500', daysOverdue: 8 },
    ],
    gstReminder: 'GST return (GSTR-3B) due by 20th March 2026',
  };

  return {
    formattedDate,
    revenueByChannel,
    revenueTrend,
    topSellingItems,
    recentTransactions,
    alerts,
  };
}

/* ─── Dashboard Page Component ──────────────────────────────────────── */

export default function DashboardPage() {
  const {
    formattedDate,
    revenueByChannel,
    revenueTrend,
    topSellingItems,
    recentTransactions,
    alerts,
  } = getMockData();

  const maxRevenue = Math.max(...revenueTrend.map((d) => d.amount));

  /* ── Top Selling Items Table Columns ───────────────────────────── */

  const topItemsColumns: Column[] = [
    {
      key: 'item',
      label: 'Item',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value as string}</span>
      ),
    },
    {
      key: 'qtySold',
      label: 'Qty Sold',
      sortable: true,
      render: (value) => (
        <span className="font-mono">{value as number}</span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value as string}</span>
      ),
    },
    {
      key: 'foodCost',
      label: 'Food Cost %',
      sortable: true,
      render: (value) => {
        const pct = value as number;
        const variant = pct < 25 ? 'success' : pct < 30 ? 'info' : pct < 35 ? 'warning' : 'danger';
        return <Badge variant={variant}>{pct}%</Badge>;
      },
    },
  ];

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ─── 1. Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}! Here is your business overview.
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          {formattedDate}
        </div>
      </div>

      {/* ─── 2. Top Stats Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value="₹1,45,230"
          subtitle="vs yesterday"
          trend={{ direction: 'up', percentage: 12 }}
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="MTD Revenue"
          value="₹28,45,000"
          subtitle="vs last month"
          trend={{ direction: 'up', percentage: 8 }}
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="Food Cost %"
          value="32.5%"
          subtitle="Target: <35%"
          trend={{ direction: 'down', percentage: 1.5 }}
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Cash Balance"
          value="₹5,42,000"
          subtitle="Across all accounts"
          color="purple"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* ─── 3. Second Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Accounts Receivable"
          value="₹3,25,000"
          subtitle="From 8 parties"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Accounts Payable"
          value="₹4,18,000"
          subtitle="To 15 vendors"
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Active Employees"
          value="45"
          subtitle="Across 3 outlets"
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Bills"
          value="12"
          subtitle="₹2,85,000 total"
          trend={{ direction: 'up', percentage: 3 }}
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ─── 4 & 5. Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue by Channel</h2>
          <p className="text-sm text-gray-500 mb-5">Breakdown of today&apos;s revenue sources</p>
          <div className="space-y-4">
            {revenueByChannel.map((ch) => (
              <div key={ch.channel}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{ch.channel}</span>
                  <span className="text-sm font-semibold text-gray-900">{ch.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`${ch.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${ch.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend - Last 7 Days */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Revenue Trend</h2>
          <p className="text-sm text-gray-500 mb-5">Last 7 days performance</p>
          <div className="flex items-end justify-between gap-3 h-48">
            {revenueTrend.map((d) => {
              const heightPct = (d.amount / maxRevenue) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">{d.label}</span>
                  <div className="w-full flex justify-center" style={{ height: '140px' }}>
                    <div className="relative w-full max-w-[40px] flex items-end">
                      <div
                        className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors duration-200 cursor-default"
                        style={{ height: `${heightPct}%` }}
                        title={`₹${d.amount.toLocaleString('en-IN')}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 6 & 7. Tables Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Selling Items</h2>
          <p className="text-sm text-gray-500 mb-4">This month&apos;s best performers</p>
          <DataTable
            columns={topItemsColumns}
            data={topSellingItems}
          />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Transactions</h2>
          <p className="text-sm text-gray-500 mb-4">Latest journal entries</p>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${tx.status === 'POSTED' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {tx.description}
                    </span>
                    <Badge variant={tx.status === 'POSTED' ? 'success' : 'warning'}>
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {tx.id} &middot; {tx.date}
                    </span>
                    <span className="text-sm font-mono font-medium text-gray-700">
                      {tx.debit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/accounting"
            className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all journal entries
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ─── 8. Quick Actions ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h2>
        <p className="text-sm text-gray-500 mb-4">Common tasks and shortcuts</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/accounting"
            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Invoice
          </Link>
          <Link
            href="/accounting"
            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Record Bill
          </Link>
          <Link
            href="/accounting"
            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Journal Entry
          </Link>
          <Link
            href="/payroll"
            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Run Payroll
          </Link>
          <Link
            href="/reports"
            className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Reports
          </Link>
        </div>
      </div>

      {/* ─── 9. Alerts / Notifications ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Alerts &amp; Notifications</h2>
        <p className="text-sm text-gray-500 mb-4">Items requiring your attention</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Low Stock Alerts */}
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-sm font-semibold text-red-800">Low Stock Items</h3>
              <Badge variant="danger">{alerts.lowStock.length}</Badge>
            </div>
            <div className="space-y-2">
              {alerts.lowStock.map((item) => (
                <div key={item.item} className="flex items-center justify-between text-sm">
                  <span className="text-red-700 font-medium">{item.item}</span>
                  <span className="text-red-600 text-xs">
                    {item.current} / {item.reorder}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Invoices */}
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-amber-800">Overdue Invoices</h3>
              <Badge variant="warning">{alerts.overdueInvoices.length}</Badge>
            </div>
            <div className="space-y-2">
              {alerts.overdueInvoices.map((inv) => (
                <div key={inv.invoice} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 font-medium">{inv.party}</span>
                    <span className="text-amber-800 font-mono font-semibold text-xs">{inv.amount}</span>
                  </div>
                  <span className="text-amber-600 text-xs">
                    {inv.invoice} &middot; {inv.daysOverdue} days overdue
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* GST Reminder */}
          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-800">Compliance</h3>
              <Badge variant="info">Reminder</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-blue-700">{alerts.gstReminder}</p>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>21 days remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
