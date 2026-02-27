'use client';

import { useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/* ─── Currency Formatter ──────────────────────────────────────────── */

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/* ─── Types ───────────────────────────────────────────────────────── */

interface GSTReturn {
  id: string;
  returnType: string;
  period: string;
  dueDate: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  status: 'Filed' | 'In Progress' | 'Not Started' | 'Overdue';
}

interface MonthlySummary {
  month: string;
  salesTaxable: number;
  outputCGST: number;
  outputSGST: number;
  purchasesTaxable: number;
  inputCGST: number;
  inputSGST: number;
  netPayable: number;
}

interface GSTRateBreakdown {
  rate: string;
  description: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  total: number;
}

interface TDSEntry {
  id: string;
  vendor: string;
  section: string;
  amount: number;
  tdsRate: number;
  tdsAmount: number;
}

interface TDSReceivable {
  id: string;
  aggregator: string;
  section: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  status: string;
}

interface Form26QStatus {
  quarter: string;
  period: string;
  dueDate: string;
  status: string;
  challanPaid: boolean;
}

interface EInvoice {
  id: string;
  invoiceNo: string;
  customer: string;
  amount: number;
  irnNumber: string;
  qrStatus: 'Generated' | 'Pending' | 'Failed';
}

interface HSNCode {
  code: string;
  description: string;
  gstRate: string;
  category: string;
}

/* ─── Mock Data ───────────────────────────────────────────────────── */

const gstReturns: GSTReturn[] = [
  { id: '1', returnType: 'GSTR-1', period: 'January 2026', dueDate: '2026-02-11', taxableAmount: 1850000, cgst: 92500, sgst: 92500, igst: 0, totalTax: 185000, status: 'Filed' },
  { id: '2', returnType: 'GSTR-3B', period: 'January 2026', dueDate: '2026-02-20', taxableAmount: 1850000, cgst: 92500, sgst: 92500, igst: 0, totalTax: 185000, status: 'Filed' },
  { id: '3', returnType: 'GSTR-1', period: 'February 2026', dueDate: '2026-03-11', taxableAmount: 1720000, cgst: 86000, sgst: 86000, igst: 0, totalTax: 172000, status: 'In Progress' },
  { id: '4', returnType: 'GSTR-3B', period: 'February 2026', dueDate: '2026-03-20', taxableAmount: 1720000, cgst: 86000, sgst: 86000, igst: 0, totalTax: 172000, status: 'Not Started' },
  { id: '5', returnType: 'GSTR-1', period: 'December 2025', dueDate: '2026-01-11', taxableAmount: 2100000, cgst: 105000, sgst: 105000, igst: 0, totalTax: 210000, status: 'Filed' },
  { id: '6', returnType: 'GSTR-3B', period: 'December 2025', dueDate: '2026-01-20', taxableAmount: 2100000, cgst: 105000, sgst: 105000, igst: 0, totalTax: 210000, status: 'Filed' },
  { id: '7', returnType: 'GSTR-1', period: 'November 2025', dueDate: '2025-12-11', taxableAmount: 1680000, cgst: 84000, sgst: 84000, igst: 0, totalTax: 168000, status: 'Filed' },
  { id: '8', returnType: 'GSTR-3B', period: 'November 2025', dueDate: '2025-12-20', taxableAmount: 1680000, cgst: 84000, sgst: 84000, igst: 5600, totalTax: 173600, status: 'Overdue' },
];

const monthlySummary: MonthlySummary[] = [
  { month: 'February 2026', salesTaxable: 1720000, outputCGST: 86000, outputSGST: 86000, purchasesTaxable: 980000, inputCGST: 49000, inputSGST: 49000, netPayable: 74000 },
  { month: 'January 2026', salesTaxable: 1850000, outputCGST: 92500, outputSGST: 92500, purchasesTaxable: 1060000, inputCGST: 53000, inputSGST: 53000, netPayable: 79000 },
  { month: 'December 2025', salesTaxable: 2100000, outputCGST: 105000, outputSGST: 105000, purchasesTaxable: 1240000, inputCGST: 62000, inputSGST: 62000, netPayable: 86000 },
  { month: 'November 2025', salesTaxable: 1680000, outputCGST: 84000, outputSGST: 84000, purchasesTaxable: 950000, inputCGST: 47500, inputSGST: 47500, netPayable: 73000 },
  { month: 'October 2025', salesTaxable: 1590000, outputCGST: 79500, outputSGST: 79500, purchasesTaxable: 920000, inputCGST: 46000, inputSGST: 46000, netPayable: 67000 },
  { month: 'September 2025', salesTaxable: 1480000, outputCGST: 74000, outputSGST: 74000, purchasesTaxable: 870000, inputCGST: 43500, inputSGST: 43500, netPayable: 61000 },
];

const gstRateBreakdown: GSTRateBreakdown[] = [
  { rate: '5%', description: 'Non-AC restaurant food, takeaway items', taxableValue: 820000, cgst: 20500, sgst: 20500, total: 41000 },
  { rate: '12%', description: 'Processed food items, branded namkeens', taxableValue: 340000, cgst: 20400, sgst: 20400, total: 40800 },
  { rate: '18%', description: 'AC restaurant dining, liquor establishment food', taxableValue: 480000, cgst: 43200, sgst: 43200, total: 86400 },
  { rate: '28%', description: 'Aerated beverages, tobacco products', taxableValue: 80000, cgst: 11200, sgst: 11200, total: 22400 },
];

const tdsEntries: TDSEntry[] = [
  { id: '1', vendor: 'Fresh Farm Supplies Pvt Ltd', section: '194C', amount: 450000, tdsRate: 2, tdsAmount: 9000 },
  { id: '2', vendor: 'GreenLeaf Organic Traders', section: '194Q', amount: 680000, tdsRate: 0.1, tdsAmount: 680 },
  { id: '3', vendor: 'CloudKitchen Tech Solutions', section: '194J', amount: 250000, tdsRate: 10, tdsAmount: 25000 },
  { id: '4', vendor: 'Mumbai Spice Wholesalers', section: '194C', amount: 320000, tdsRate: 2, tdsAmount: 6400 },
  { id: '5', vendor: 'Elite Interiors & Renovation', section: '194C', amount: 580000, tdsRate: 2, tdsAmount: 11600 },
];

const tdsReceivables: TDSReceivable[] = [
  { id: '1', aggregator: 'Zomato', section: '194-O', grossAmount: 520000, tdsRate: 1, tdsAmount: 5200, status: 'Reflected in 26AS' },
  { id: '2', aggregator: 'Swiggy', section: '194-O', grossAmount: 480000, tdsRate: 1, tdsAmount: 4800, status: 'Reflected in 26AS' },
  { id: '3', aggregator: 'EatSure', section: '194-O', grossAmount: 150000, tdsRate: 1, tdsAmount: 1500, status: 'Pending Verification' },
];

const form26QStatus: Form26QStatus[] = [
  { quarter: 'Q3 FY 2025-26', period: 'Oct - Dec 2025', dueDate: '2026-01-31', status: 'Filed', challanPaid: true },
  { quarter: 'Q4 FY 2025-26', period: 'Jan - Mar 2026', dueDate: '2026-05-31', status: 'In Progress', challanPaid: false },
];

const eInvoices: EInvoice[] = [
  { id: '1', invoiceNo: 'INV-2026-0234', customer: 'Taj Hotels & Resorts', amount: 185000, irnNumber: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4', qrStatus: 'Generated' },
  { id: '2', invoiceNo: 'INV-2026-0235', customer: 'ITC Grand Maratha', amount: 245000, irnNumber: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5', qrStatus: 'Generated' },
  { id: '3', invoiceNo: 'INV-2026-0236', customer: 'Oberoi Group Catering', amount: 320000, irnNumber: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', qrStatus: 'Generated' },
  { id: '4', invoiceNo: 'INV-2026-0237', customer: 'Marriott Banquets', amount: 178000, irnNumber: '', qrStatus: 'Pending' },
  { id: '5', invoiceNo: 'INV-2026-0238', customer: 'Radisson Blu Events', amount: 96000, irnNumber: '', qrStatus: 'Failed' },
];

const hsnCodes: HSNCode[] = [
  { code: '0201', description: 'Meat of bovine animals, fresh or chilled', gstRate: '5%', category: 'Raw Meat' },
  { code: '0401', description: 'Milk and cream, not concentrated', gstRate: '0%', category: 'Dairy' },
  { code: '0713', description: 'Dried leguminous vegetables (pulses)', gstRate: '5%', category: 'Pulses' },
  { code: '1006', description: 'Rice in all forms', gstRate: '5%', category: 'Rice' },
  { code: '2106', description: 'Food preparations not elsewhere specified', gstRate: '18%', category: 'Food Preparations' },
  { code: '9963', description: 'Restaurant services', gstRate: '5% / 18%', category: 'Restaurant Services' },
];

/* ─── Main Component ──────────────────────────────────────────────── */

export default function GSTPage() {
  const [activeTab, setActiveTab] = useState('gst-returns');

  const tabs = [
    { id: 'gst-returns', label: 'GST Returns', count: gstReturns.length },
    { id: 'gst-summary', label: 'GST Summary' },
    { id: 'tds-management', label: 'TDS Management', count: tdsEntries.length },
    { id: 'e-invoicing', label: 'E-Invoicing', count: eInvoices.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GST & Tax Compliance</h1>
        <p className="text-gray-500 mt-1">Manage GST returns, TDS, and e-invoicing for F&B operations</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Output GST"
          value={formatCurrency(324000)}
          subtitle="Current month liability"
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Input GST"
          value={formatCurrency(186000)}
          subtitle="Claimable credit"
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Net Payable"
          value={formatCurrency(138000)}
          subtitle="After ITC adjustment"
          color="blue"
          trend={{ direction: 'down', percentage: 5.2 }}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
            </svg>
          }
        />
        <StatCard
          title="ITC Available"
          value={formatCurrency(186000)}
          subtitle="Input tax credit balance"
          color="purple"
          trend={{ direction: 'up', percentage: 8.4 }}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div>
        {activeTab === 'gst-returns' && <GSTReturnsTab />}
        {activeTab === 'gst-summary' && <GSTSummaryTab />}
        {activeTab === 'tds-management' && <TDSManagementTab />}
        {activeTab === 'e-invoicing' && <EInvoicingTab />}
      </div>

      {/* HSN Code Reference (always visible) */}
      <HSNCodeReference />
    </div>
  );
}

/* ─── GST Returns Tab ─────────────────────────────────────────────── */

function GSTReturnsTab() {
  const statusBadge = (status: GSTReturn['status']) => {
    const variantMap: Record<GSTReturn['status'], 'success' | 'warning' | 'default' | 'danger'> = {
      'Filed': 'success',
      'In Progress': 'warning',
      'Not Started': 'default',
      'Overdue': 'danger',
    };
    return <Badge variant={variantMap[status]}>{status}</Badge>;
  };

  const columns: Column[] = [
    { key: 'returnType', label: 'Return Type', sortable: true },
    { key: 'period', label: 'Period', sortable: true },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      key: 'taxableAmount',
      label: 'Taxable Amount',
      sortable: true,
      render: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'cgst',
      label: 'CGST',
      render: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'sgst',
      label: 'SGST',
      render: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'igst',
      label: 'IGST',
      render: (value) => <span className="font-mono">{(value as number) > 0 ? formatCurrency(value as number) : '-'}</span>,
    },
    {
      key: 'totalTax',
      label: 'Total Tax',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => statusBadge(value as GSTReturn['status']),
    },
    {
      key: 'id',
      label: 'Action',
      render: (_value, row) => {
        const r = row as GSTReturn;
        if (r.status === 'Filed') {
          return (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">View</Button>
              <Button variant="secondary" size="sm">Download</Button>
            </div>
          );
        }
        if (r.status === 'In Progress') {
          return (
            <div className="flex gap-2">
              <Button variant="primary" size="sm">File</Button>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          );
        }
        if (r.status === 'Overdue') {
          return (
            <div className="flex gap-2">
              <Button variant="danger" size="sm">File Now</Button>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          );
        }
        return <Button variant="primary" size="sm">File</Button>;
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">GST Returns</h2>
          <p className="text-sm text-gray-500">Track and file GSTR-1 and GSTR-3B returns</p>
        </div>
        <Button variant="primary" size="sm">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export All
          </span>
        </Button>
      </div>
      <DataTable columns={columns} data={gstReturns} searchable searchPlaceholder="Search returns..." />
    </div>
  );
}

/* ─── GST Summary Tab ─────────────────────────────────────────────── */

function GSTSummaryTab() {
  return (
    <div className="space-y-6">
      {/* Monthly Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Monthly GST Summary</h2>
          <p className="text-sm text-gray-500">6-month overview of GST collections and credits</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Month</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Sales (Taxable)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Output CGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Output SGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Purchases (Taxable)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Input CGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Input SGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {monthlySummary.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.month}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.salesTaxable)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.outputCGST)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.outputSGST)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.purchasesTaxable)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700 text-right font-mono">{formatCurrency(row.inputCGST)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700 text-right font-mono">{formatCurrency(row.inputSGST)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-bold text-indigo-700">{formatCurrency(row.netPayable)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(monthlySummary.reduce((s, r) => s + r.salesTaxable, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(monthlySummary.reduce((s, r) => s + r.outputCGST, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(monthlySummary.reduce((s, r) => s + r.outputSGST, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(monthlySummary.reduce((s, r) => s + r.purchasesTaxable, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-700">{formatCurrency(monthlySummary.reduce((s, r) => s + r.inputCGST, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-emerald-700">{formatCurrency(monthlySummary.reduce((s, r) => s + r.inputSGST, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-indigo-700">{formatCurrency(monthlySummary.reduce((s, r) => s + r.netPayable, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* GST Rate Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">GST Rate Breakdown</h2>
          <p className="text-sm text-gray-500">Current month tax collection by GST slab</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">GST Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Taxable Value</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">CGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">SGST</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {gstRateBreakdown.map((row) => (
                <tr key={row.rate} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={row.rate === '5%' ? 'success' : row.rate === '12%' ? 'info' : row.rate === '18%' ? 'warning' : 'danger'}>
                      {row.rate}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.taxableValue)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.cgst)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.sgst)}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-semibold">{formatCurrency(row.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(gstRateBreakdown.reduce((s, r) => s + r.taxableValue, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(gstRateBreakdown.reduce((s, r) => s + r.cgst, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(gstRateBreakdown.reduce((s, r) => s + r.sgst, 0))}</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold">{formatCurrency(gstRateBreakdown.reduce((s, r) => s + r.total, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Restaurant-specific note */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Restaurant GST Rate Note</p>
              <p className="text-sm text-amber-700 mt-1">
                5% GST for non-AC/non-liquor establishments (no ITC available). 18% GST for AC/liquor establishments (ITC available). Standalone restaurants opting for composition scheme attract 5% GST without ITC benefit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TDS Management Tab ──────────────────────────────────────────── */

function TDSManagementTab() {
  const tdsColumns: Column[] = [
    { key: 'vendor', label: 'Vendor', sortable: true },
    {
      key: 'section',
      label: 'Section',
      render: (value) => <Badge variant="info">{value as string}</Badge>,
    },
    {
      key: 'amount',
      label: 'Payment Amount',
      sortable: true,
      render: (value) => <span className="font-mono">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'tdsRate',
      label: 'TDS Rate',
      render: (value) => <span className="font-medium">{value as number}%</span>,
    },
    {
      key: 'tdsAmount',
      label: 'TDS Amount',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold text-red-700">{formatCurrency(value as number)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* TDS Deducted on Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">TDS Deducted on Payments</h2>
            <p className="text-sm text-gray-500">Tax deducted at source on vendor payments</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total TDS Deducted</p>
            <p className="text-xl font-bold text-red-700 font-mono">{formatCurrency(tdsEntries.reduce((s, e) => s + e.tdsAmount, 0))}</p>
          </div>
        </div>
        <DataTable columns={tdsColumns} data={tdsEntries} searchable searchPlaceholder="Search vendors..." />
      </div>

      {/* TDS Receivable from Aggregators */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">TDS Receivable from Aggregators</h2>
            <p className="text-sm text-gray-500">TDS deducted by food delivery platforms under Section 194-O</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total TDS Receivable</p>
            <p className="text-xl font-bold text-emerald-700 font-mono">{formatCurrency(tdsReceivables.reduce((s, e) => s + e.tdsAmount, 0))}</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Aggregator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Section</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Gross Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">TDS Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">TDS Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {tdsReceivables.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.aggregator}</td>
                  <td className="px-4 py-3 text-sm"><Badge variant="purple">{row.section}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{formatCurrency(row.grossAmount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{row.tdsRate}%</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-emerald-700">{formatCurrency(row.tdsAmount)}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={row.status === 'Reflected in 26AS' ? 'success' : 'warning'}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form 26Q Filing Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Form 26Q Filing Status</h2>
          <p className="text-sm text-gray-500">Quarterly TDS return filing status</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Quarter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Challan Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {form26QStatus.map((row) => (
                <tr key={row.quarter} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.quarter}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(row.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={row.status === 'Filed' ? 'success' : 'warning'}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {row.challanPaid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {row.status === 'Filed' ? (
                      <Button variant="ghost" size="sm">View</Button>
                    ) : (
                      <Button variant="primary" size="sm">File Return</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── E-Invoicing Tab ─────────────────────────────────────────────── */

function EInvoicingTab() {
  const qrBadge = (status: EInvoice['qrStatus']) => {
    const variantMap: Record<EInvoice['qrStatus'], 'success' | 'warning' | 'danger'> = {
      'Generated': 'success',
      'Pending': 'warning',
      'Failed': 'danger',
    };
    return <Badge variant={variantMap[status]}>{status}</Badge>;
  };

  const eInvoiceColumns: Column[] = [
    { key: 'invoiceNo', label: 'Invoice #', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold">{formatCurrency(value as number)}</span>,
    },
    {
      key: 'irnNumber',
      label: 'IRN Number',
      render: (value) => {
        const irn = value as string;
        if (!irn) return <span className="text-gray-400 italic">Not generated</span>;
        return (
          <span className="font-mono text-xs" title={irn}>
            {irn.substring(0, 20)}...
          </span>
        );
      },
    },
    {
      key: 'qrStatus',
      label: 'QR Code',
      render: (value) => qrBadge(value as EInvoice['qrStatus']),
    },
    {
      key: 'id',
      label: 'Action',
      render: (_value, row) => {
        const invoice = row as EInvoice;
        if (invoice.qrStatus === 'Generated') {
          return (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">View</Button>
              <Button variant="secondary" size="sm">Print</Button>
            </div>
          );
        }
        if (invoice.qrStatus === 'Failed') {
          return <Button variant="danger" size="sm">Retry</Button>;
        }
        return <Button variant="primary" size="sm">Generate</Button>;
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">E-Invoices</h2>
          <p className="text-sm text-gray-500">Generate and manage e-invoices with IRN and QR codes</p>
        </div>
        <Button variant="primary">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Generate E-Invoice
          </span>
        </Button>
      </div>
      <DataTable columns={eInvoiceColumns} data={eInvoices} searchable searchPlaceholder="Search invoices..." />

      {/* E-Invoice Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{eInvoices.filter(e => e.qrStatus === 'Generated').length}</p>
          <p className="text-sm text-emerald-600 mt-1">Successfully Generated</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{eInvoices.filter(e => e.qrStatus === 'Pending').length}</p>
          <p className="text-sm text-amber-600 mt-1">Pending Generation</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{eInvoices.filter(e => e.qrStatus === 'Failed').length}</p>
          <p className="text-sm text-red-600 mt-1">Failed</p>
        </div>
      </div>
    </div>
  );
}

/* ─── HSN Code Reference ──────────────────────────────────────────── */

function HSNCodeReference() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">HSN Code Reference</h2>
        <p className="text-sm text-gray-500">Common HSN/SAC codes for Food & Beverage businesses</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hsnCodes.map((hsn) => (
          <div key={hsn.code} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-lg font-bold text-indigo-600">{hsn.code}</span>
              <Badge variant={hsn.gstRate === '0%' ? 'success' : hsn.gstRate === '5%' || hsn.gstRate === '5% / 18%' ? 'info' : 'warning'}>
                {hsn.gstRate} GST
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900">{hsn.category}</p>
            <p className="text-xs text-gray-500 mt-1">{hsn.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
