'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { TextInput, SelectInput, TextArea } from '@/components/ui/Input';

/* ─── Currency Formatter ─────────────────────────────────────────── */

function formatINR(amount: number): string {
  const formatted = amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `\u20B9${formatted}`;
}

/* ─── Types ──────────────────────────────────────────────────────── */

interface Invoice {
  id: string;
  invoiceNo: string;
  customer: string;
  date: string;
  dueDate: string;
  channel: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  type: string;
  outstanding: number;
  revenue: number;
  creditDays: number;
  phone: string;
}

interface LineItem {
  item: string;
  hsn: string;
  qty: number;
  rate: number;
  gstPercent: number;
  amount: number;
}

/* ─── Mock Data ──────────────────────────────────────────────────── */

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNo: 'INV-2026-001',
    customer: 'TechServe Solutions Pvt Ltd',
    date: '2026-02-01',
    dueDate: '2026-02-15',
    channel: 'B2B',
    amount: 85000,
    paid: 85000,
    balance: 0,
    status: 'Paid',
  },
  {
    id: '2',
    invoiceNo: 'INV-2026-002',
    customer: 'Swiggy Marketplace',
    date: '2026-02-03',
    dueDate: '2026-02-17',
    channel: 'Swiggy',
    amount: 42500,
    paid: 0,
    balance: 42500,
    status: 'Overdue',
  },
  {
    id: '3',
    invoiceNo: 'INV-2026-003',
    customer: 'Zomato Hyperpure',
    date: '2026-02-05',
    dueDate: '2026-03-05',
    channel: 'Zomato',
    amount: 38000,
    paid: 0,
    balance: 38000,
    status: 'Sent',
  },
  {
    id: '4',
    invoiceNo: 'INV-2026-004',
    customer: 'Rajesh Caterers',
    date: '2026-02-07',
    dueDate: '2026-02-21',
    channel: 'B2B',
    amount: 125000,
    paid: 50000,
    balance: 75000,
    status: 'Partially Paid',
  },
  {
    id: '5',
    invoiceNo: 'INV-2026-005',
    customer: 'Walk-in Customer',
    date: '2026-02-10',
    dueDate: '2026-02-10',
    channel: 'Dine-in',
    amount: 3200,
    paid: 3200,
    balance: 0,
    status: 'Paid',
  },
  {
    id: '6',
    invoiceNo: 'INV-2026-006',
    customer: 'InfoEdge India Ltd',
    date: '2026-02-12',
    dueDate: '2026-02-26',
    channel: 'B2B',
    amount: 64000,
    paid: 0,
    balance: 64000,
    status: 'Overdue',
  },
  {
    id: '7',
    invoiceNo: 'INV-2026-007',
    customer: 'Swiggy Marketplace',
    date: '2026-02-14',
    dueDate: '2026-02-28',
    channel: 'Swiggy',
    amount: 28500,
    paid: 0,
    balance: 28500,
    status: 'Sent',
  },
  {
    id: '8',
    invoiceNo: 'INV-2026-008',
    customer: 'Green Valley Organics',
    date: '2026-02-16',
    dueDate: '2026-02-20',
    channel: 'Takeaway',
    amount: 5800,
    paid: 0,
    balance: 5800,
    status: 'Overdue',
  },
  {
    id: '9',
    invoiceNo: 'INV-2026-009',
    customer: 'Hotel Grand Bharat',
    date: '2026-02-18',
    dueDate: '2026-03-18',
    channel: 'B2B',
    amount: 175000,
    paid: 0,
    balance: 175000,
    status: 'Draft',
  },
  {
    id: '10',
    invoiceNo: 'CN-2026-001',
    customer: 'Zomato Hyperpure',
    date: '2026-02-20',
    dueDate: '2026-02-20',
    channel: 'Zomato',
    amount: -4200,
    paid: 0,
    balance: -4200,
    status: 'Credit Note',
  },
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'TechServe Solutions Pvt Ltd',
    type: 'B2B',
    outstanding: 0,
    revenue: 340000,
    creditDays: 30,
    phone: '+91 98765 43210',
  },
  {
    id: '2',
    name: 'Rajesh Caterers',
    type: 'Catering',
    outstanding: 75000,
    revenue: 520000,
    creditDays: 15,
    phone: '+91 87654 32109',
  },
  {
    id: '3',
    name: 'Hotel Grand Bharat',
    type: 'B2B',
    outstanding: 175000,
    revenue: 890000,
    creditDays: 30,
    phone: '+91 76543 21098',
  },
  {
    id: '4',
    name: 'InfoEdge India Ltd',
    type: 'B2B',
    outstanding: 64000,
    revenue: 256000,
    creditDays: 15,
    phone: '+91 65432 10987',
  },
  {
    id: '5',
    name: 'Green Valley Organics',
    type: 'Franchise',
    outstanding: 5800,
    revenue: 148000,
    creditDays: 7,
    phone: '+91 54321 09876',
  },
  {
    id: '6',
    name: 'Swiggy Marketplace',
    type: 'B2B',
    outstanding: 71000,
    revenue: 425000,
    creditDays: 14,
    phone: '+91 43210 98765',
  },
];

/* ─── Status / Channel Badge Helpers ─────────────────────────────── */

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const statusVariant: Record<string, BadgeVariant> = {
  Draft: 'default',
  Sent: 'info',
  Paid: 'success',
  Overdue: 'danger',
  'Partially Paid': 'warning',
  'Credit Note': 'purple',
};

const channelVariant: Record<string, BadgeVariant> = {
  'Dine-in': 'info',
  Swiggy: 'warning',
  Zomato: 'danger',
  Takeaway: 'default',
  B2B: 'purple',
};

/* ─── Revenue by Channel Data ────────────────────────────────────── */

const revenueByChannel = [
  { channel: 'Dine-in', percentage: 42, color: 'bg-blue-500' },
  { channel: 'Swiggy', percentage: 28, color: 'bg-amber-500' },
  { channel: 'Zomato', percentage: 18, color: 'bg-red-500' },
  { channel: 'Takeaway', percentage: 8, color: 'bg-gray-500' },
  { channel: 'B2B', percentage: 4, color: 'bg-purple-500' },
];

/* ─── Empty Line Item Template ───────────────────────────────────── */

function emptyLineItem(): LineItem {
  return { item: '', hsn: '', qty: 1, rate: 0, gstPercent: 5, amount: 0 };
}

/* ═══════════════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════════════ */

export default function AccountsReceivablePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices', count: mockInvoices.length },
    { id: 'customers', label: 'Customers', count: mockCustomers.length },
    { id: 'credit-notes', label: 'Credit Notes', count: mockInvoices.filter((i) => i.status === 'Credit Note').length },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable</h1>
          <p className="text-gray-500 mt-1">Manage invoices, customers, and collections</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowCustomerModal(true)}>
            New Customer
          </Button>
          <Button variant="primary" onClick={() => setShowInvoiceModal(true)}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'credit-notes' && <CreditNotesTab />}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <AddInvoiceModal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} />
      <AddCustomerModal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════════════════════════ */

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outstanding"
          value={formatINR(325000)}
          subtitle="across all customers"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Overdue Invoices"
          value="4"
          subtitle="need follow-up"
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          title="Due This Week"
          value="6"
          subtitle="invoices pending"
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Customers"
          value="8"
          subtitle="active accounts"
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Revenue by Channel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Channel</h3>
        <div className="space-y-4">
          {revenueByChannel.map((ch) => (
            <div key={ch.channel} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-24">{ch.channel}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ch.color} rounded-full transition-all duration-500`}
                  style={{ width: `${ch.percentage}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">{ch.percentage}%</span>
            </div>
          ))}
        </div>

        {/* Legend row */}
        <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-gray-100">
          {revenueByChannel.map((ch) => (
            <div key={ch.channel} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${ch.color}`} />
              <span className="text-xs text-gray-600">{ch.channel} ({ch.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Invoices Tab
   ═══════════════════════════════════════════════════════════════════ */

function InvoicesTab() {
  const columns: Column[] = [
    {
      key: 'invoiceNo',
      label: 'Invoice #',
      sortable: true,
      render: (val) => <span className="font-mono font-medium text-indigo-600">{val as string}</span>,
    },
    { key: 'customer', label: 'Customer', sortable: true },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (val) => <Badge variant={channelVariant[val as string] || 'default'}>{val as string}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val) => <span className="font-mono">{formatINR(val as number)}</span>,
    },
    {
      key: 'paid',
      label: 'Paid',
      sortable: true,
      render: (val) => <span className="font-mono">{formatINR(val as number)}</span>,
    },
    {
      key: 'balance',
      label: 'Balance',
      sortable: true,
      render: (val) => (
        <span className={`font-mono font-medium ${(val as number) > 0 ? 'text-red-600' : (val as number) < 0 ? 'text-purple-600' : 'text-green-600'}`}>
          {formatINR(val as number)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={statusVariant[val as string] || 'default'}>{val as string}</Badge>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={mockInvoices}
      searchable
      searchPlaceholder="Search invoices by number, customer, or channel..."
      emptyMessage="No invoices found."
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Customers Tab
   ═══════════════════════════════════════════════════════════════════ */

function CustomersTab() {
  const columns: Column[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val) => <span className="font-medium text-gray-900">{val as string}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (val) => {
        const typeVariant: Record<string, BadgeVariant> = {
          'Dine-in': 'info',
          B2B: 'purple',
          Catering: 'warning',
          Franchise: 'success',
        };
        return <Badge variant={typeVariant[val as string] || 'default'}>{val as string}</Badge>;
      },
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      sortable: true,
      render: (val) => (
        <span className={`font-mono font-medium ${(val as number) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatINR(val as number)}
        </span>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue (Total)',
      sortable: true,
      render: (val) => <span className="font-mono">{formatINR(val as number)}</span>,
    },
    {
      key: 'creditDays',
      label: 'Credit Days',
      sortable: true,
      render: (val) => <span>{val as number} days</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (val) => <span className="text-gray-600">{val as string}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={mockCustomers}
      searchable
      searchPlaceholder="Search customers by name, type, or phone..."
      emptyMessage="No customers found."
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Credit Notes Tab
   ═══════════════════════════════════════════════════════════════════ */

function CreditNotesTab() {
  const creditNotes = mockInvoices.filter((inv) => inv.status === 'Credit Note');

  const columns: Column[] = [
    {
      key: 'invoiceNo',
      label: 'Credit Note #',
      sortable: true,
      render: (val) => <span className="font-mono font-medium text-purple-600">{val as string}</span>,
    },
    { key: 'customer', label: 'Customer', sortable: true },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'channel',
      label: 'Channel',
      render: (val) => <Badge variant={channelVariant[val as string] || 'default'}>{val as string}</Badge>,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val) => <span className="font-mono font-medium text-purple-600">{formatINR(Math.abs(val as number))}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant="purple">{val as string}</Badge>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={creditNotes}
      searchable
      searchPlaceholder="Search credit notes..."
      emptyMessage="No credit notes found."
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Add Invoice Modal
   ═══════════════════════════════════════════════════════════════════ */

function AddInvoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [customer, setCustomer] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('INV-2026-011');
  const [date, setDate] = useState('2026-02-27');
  const [dueDate, setDueDate] = useState('2026-03-27');
  const [channel, setChannel] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyLineItem()]);

  const customerOptions = mockCustomers.map((c) => ({ value: c.id, label: c.name }));
  const channelOptions = [
    { value: 'Dine-in', label: 'Dine-in' },
    { value: 'Swiggy', label: 'Swiggy' },
    { value: 'Zomato', label: 'Zomato' },
    { value: 'Takeaway', label: 'Takeaway' },
    { value: 'B2B', label: 'B2B' },
  ];

  /* ── Line item helpers ──────────────────────────────────────────── */

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      // Recalculate amount = qty * rate
      item.amount = item.qty * item.rate;
      updated[index] = item;
      return updated;
    });
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, emptyLineItem()]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  /* ── Totals ─────────────────────────────────────────────────────── */

  const subtotal = useMemo(() => lineItems.reduce((sum, li) => sum + li.amount, 0), [lineItems]);
  const totalGST = useMemo(
    () => lineItems.reduce((sum, li) => sum + (li.amount * li.gstPercent) / 100, 0),
    [lineItems]
  );
  const cgst = totalGST / 2;
  const sgst = totalGST / 2;
  const grandTotal = subtotal + totalGST;

  /* ── Submit ─────────────────────────────────────────────────────── */

  function handleSubmit() {
    // In a real app this would call an API
    onClose();
  }

  function resetAndClose() {
    setCustomer('');
    setInvoiceNo('INV-2026-011');
    setDate('2026-02-27');
    setDueDate('2026-03-27');
    setChannel('');
    setLineItems([emptyLineItem()]);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="New Invoice" size="xl">
      <div className="space-y-6">
        {/* ── Top fields ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectInput
            label="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            options={customerOptions}
            placeholder="Select customer"
            required
          />
          <TextInput
            label="Invoice #"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
          />
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <TextInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <SelectInput
            label="Channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            options={channelOptions}
            placeholder="Select channel"
            required
          />
        </div>

        {/* ── Line Items ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Line Items</h4>
            <Button variant="ghost" size="sm" onClick={addLineItem}>
              + Add Item
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">HSN</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500 w-20">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500 w-28">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500 w-20">GST%</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500 w-28">Amount</th>
                  <th className="px-3 py-2 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lineItems.map((li, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={li.item}
                        onChange={(e) => updateLineItem(idx, 'item', e.target.value)}
                        placeholder="Item name"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={li.hsn}
                        onChange={(e) => updateLineItem(idx, 'hsn', e.target.value)}
                        placeholder="HSN code"
                        className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={li.qty}
                        onChange={(e) => updateLineItem(idx, 'qty', Number(e.target.value))}
                        min={1}
                        className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={li.rate}
                        onChange={(e) => updateLineItem(idx, 'rate', Number(e.target.value))}
                        min={0}
                        className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={li.gstPercent}
                        onChange={(e) => updateLineItem(idx, 'gstPercent', Number(e.target.value))}
                        min={0}
                        max={28}
                        className="w-16 border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-mono font-medium text-gray-900">
                      {formatINR(li.amount)}
                    </td>
                    <td className="px-3 py-2">
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => removeLineItem(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Totals ──────────────────────────────────────────────── */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-mono">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>CGST</span>
              <span className="font-mono">{formatINR(cgst)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>SGST</span>
              <span className="font-mono">{formatINR(sgst)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="font-mono">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create Invoice</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Add Customer Modal
   ═══════════════════════════════════════════════════════════════════ */

function AddCustomerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [creditDays, setCreditDays] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const typeOptions = [
    { value: 'Dine-in', label: 'Dine-in' },
    { value: 'B2B', label: 'B2B' },
    { value: 'Catering', label: 'Catering' },
    { value: 'Franchise', label: 'Franchise' },
  ];

  function handleSubmit() {
    // In a real app this would call an API
    onClose();
  }

  function resetAndClose() {
    setName('');
    setType('');
    setContact('');
    setEmail('');
    setPhone('');
    setGstin('');
    setAddress('');
    setCreditDays('');
    setCreditLimit('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="New Customer" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer or business name"
            required
          />
          <SelectInput
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={typeOptions}
            placeholder="Select type"
            required
          />
          <TextInput
            label="Contact Person"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact person name"
          />
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
          <TextInput
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            required
          />
          <TextInput
            label="GSTIN"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            placeholder="22AAAAA0000A1Z5"
          />
          <TextInput
            label="Credit Days"
            type="number"
            value={creditDays}
            onChange={(e) => setCreditDays(e.target.value)}
            placeholder="e.g. 30"
          />
          <TextInput
            label="Credit Limit"
            type="number"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            placeholder="e.g. 500000"
          />
        </div>
        <TextArea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Full billing address"
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Customer</Button>
        </div>
      </div>
    </Modal>
  );
}
