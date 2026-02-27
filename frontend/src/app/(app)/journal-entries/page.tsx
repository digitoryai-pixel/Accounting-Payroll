'use client';

import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import { TextInput, SelectInput } from '@/components/ui/Input';

/* ─── Types ──────────────────────────────────────────────────────── */

type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
type JournalSource = 'MANUAL' | 'PAYROLL' | 'SALES' | 'PURCHASE' | 'AGGREGATOR' | 'COGS';

interface JournalLine {
  account: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference: string;
  source: JournalSource;
  status: JournalStatus;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
}

interface NewLine {
  account: string;
  description: string;
  debit: string;
  credit: string;
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatINR(amount: number): string {
  if (amount === 0) return '\u20B90';
  const formatted = amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `\u20B9${formatted}`;
}

/* ─── Account Options for Dropdown ───────────────────────────────── */

const ACCOUNT_OPTIONS = [
  { value: '1110', label: '1110 - Cash on Hand' },
  { value: '1120', label: '1120 - Primary Bank Account' },
  { value: '1130', label: '1130 - Payroll Bank Account' },
  { value: '1200', label: '1200 - Accounts Receivable' },
  { value: '1210', label: '1210 - Swiggy Receivable' },
  { value: '1220', label: '1220 - Zomato Receivable' },
  { value: '1300', label: '1300 - Inventory - Raw Materials' },
  { value: '1400', label: '1400 - Prepaid Rent' },
  { value: '1500', label: '1500 - Kitchen Equipment' },
  { value: '1510', label: '1510 - Furniture & Fixtures' },
  { value: '1520', label: '1520 - Accumulated Depreciation' },
  { value: '2100', label: '2100 - Accounts Payable' },
  { value: '2210', label: '2210 - PF Payable' },
  { value: '2220', label: '2220 - ESI Payable' },
  { value: '2230', label: '2230 - TDS Payable' },
  { value: '2240', label: '2240 - Professional Tax Payable' },
  { value: '2300', label: '2300 - GST Payable' },
  { value: '3100', label: '3100 - Owner Equity' },
  { value: '3200', label: '3200 - Retained Earnings' },
  { value: '4100', label: '4100 - Food Sales Revenue' },
  { value: '4200', label: '4200 - Beverage Sales Revenue' },
  { value: '4300', label: '4300 - Aggregator Sales Revenue' },
  { value: '4400', label: '4400 - Service Charge Income' },
  { value: '5100', label: '5100 - Food COGS' },
  { value: '5200', label: '5200 - Beverage COGS' },
  { value: '5300', label: '5300 - Packaging COGS' },
  { value: '6000', label: '6000 - Payroll Expenses' },
  { value: '6100', label: '6100 - Salary Expense' },
  { value: '6200', label: '6200 - Rent Expense' },
  { value: '6300', label: '6300 - Utilities Expense' },
  { value: '6400', label: '6400 - Depreciation Expense' },
  { value: '6500', label: '6500 - Commission Expense' },
  { value: '6600', label: '6600 - Employer PF Contribution' },
  { value: '6700', label: '6700 - Employer ESI Contribution' },
  { value: '6800', label: '6800 - Wastage / Write-off' },
  { value: '6900', label: '6900 - Miscellaneous Expense' },
];

function getAccountName(code: string): string {
  const found = ACCOUNT_OPTIONS.find((a) => a.value === code);
  return found ? found.label.split(' - ')[1] : 'Unknown Account';
}

/* ─── Mock Data ──────────────────────────────────────────────────── */

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: 'je-001',
    entryNumber: 'JE-001',
    date: '2026-02-01',
    description: 'Monthly Rent - Feb 2026',
    reference: 'RENT/FEB/2026',
    source: 'MANUAL',
    status: 'POSTED',
    totalDebit: 185000,
    totalCredit: 185000,
    lines: [
      { account: '6200', accountName: 'Rent Expense', description: 'Downtown outlet rent - Feb 2026', debit: 125000, credit: 0 },
      { account: '6200', accountName: 'Rent Expense', description: 'Central kitchen rent - Feb 2026', debit: 60000, credit: 0 },
      { account: '1120', accountName: 'Primary Bank Account', description: 'Rent payment via NEFT', debit: 0, credit: 185000 },
    ],
  },
  {
    id: 'je-002',
    entryNumber: 'JE-002',
    date: '2026-02-02',
    description: 'Vegetable Purchase - Fresh Farms',
    reference: 'PUR/VEG/0202',
    source: 'PURCHASE',
    status: 'POSTED',
    totalDebit: 34750,
    totalCredit: 34750,
    lines: [
      { account: '1300', accountName: 'Inventory - Raw Materials', description: 'Fresh vegetables - weekly order', debit: 34750, credit: 0 },
      { account: '2100', accountName: 'Accounts Payable', description: 'Fresh Farms Pvt Ltd', debit: 0, credit: 34750 },
    ],
  },
  {
    id: 'je-003',
    entryNumber: 'JE-003',
    date: '2026-02-03',
    description: 'Dine-in Sales - Day Total',
    reference: 'SALES/DIN/0203',
    source: 'SALES',
    status: 'POSTED',
    totalDebit: 87420,
    totalCredit: 87420,
    lines: [
      { account: '1110', accountName: 'Cash on Hand', description: 'Cash sales collected', debit: 42300, credit: 0 },
      { account: '1120', accountName: 'Primary Bank Account', description: 'Card/UPI payments received', debit: 45120, credit: 0 },
      { account: '4100', accountName: 'Food Sales Revenue', description: 'Food dine-in sales', debit: 0, credit: 68500 },
      { account: '4200', accountName: 'Beverage Sales Revenue', description: 'Beverage dine-in sales', debit: 0, credit: 18920 },
    ],
  },
  {
    id: 'je-004',
    entryNumber: 'JE-004',
    date: '2026-02-05',
    description: 'Swiggy Settlement - Week 1',
    reference: 'AGG/SWG/W01',
    source: 'AGGREGATOR',
    status: 'POSTED',
    totalDebit: 156800,
    totalCredit: 156800,
    lines: [
      { account: '1120', accountName: 'Primary Bank Account', description: 'Swiggy weekly settlement received', debit: 132280, credit: 0 },
      { account: '6500', accountName: 'Commission Expense', description: 'Swiggy commission (15.65%)', debit: 24520, credit: 0 },
      { account: '4300', accountName: 'Aggregator Sales Revenue', description: 'Swiggy orders - Week 1 Feb', debit: 0, credit: 156800 },
    ],
  },
  {
    id: 'je-005',
    entryNumber: 'JE-005',
    date: '2026-02-07',
    description: 'Staff Salary - January',
    reference: 'PAY/JAN/2026',
    source: 'PAYROLL',
    status: 'POSTED',
    totalDebit: 524600,
    totalCredit: 524600,
    lines: [
      { account: '6100', accountName: 'Salary Expense', description: 'Gross salary - all staff Jan 2026', debit: 420000, credit: 0 },
      { account: '6600', accountName: 'Employer PF Contribution', description: 'Employer PF @ 12%', debit: 50400, credit: 0 },
      { account: '6700', accountName: 'Employer ESI Contribution', description: 'Employer ESI @ 3.25%', debit: 13650, credit: 0 },
      { account: '6000', accountName: 'Payroll Expenses', description: 'Professional tax - employer', debit: 40550, credit: 0 },
      { account: '1130', accountName: 'Payroll Bank Account', description: 'Net salary payment', debit: 0, credit: 345600 },
      { account: '2210', accountName: 'PF Payable', description: 'PF liability (employee + employer)', debit: 0, credit: 100800 },
      { account: '2220', accountName: 'ESI Payable', description: 'ESI liability (employee + employer)', debit: 0, credit: 24150 },
      { account: '2230', accountName: 'TDS Payable', description: 'TDS on salary', debit: 0, credit: 12500 },
      { account: '2240', accountName: 'Professional Tax Payable', description: 'PT payable to state', debit: 0, credit: 41550 },
    ],
  },
  {
    id: 'je-006',
    entryNumber: 'JE-006',
    date: '2026-02-10',
    description: 'Kitchen Equipment Purchase',
    reference: 'CAP/EQP/0210',
    source: 'MANUAL',
    status: 'POSTED',
    totalDebit: 275000,
    totalCredit: 275000,
    lines: [
      { account: '1500', accountName: 'Kitchen Equipment', description: 'Commercial pizza oven - Moretti Forni', debit: 245000, credit: 0 },
      { account: '2300', accountName: 'GST Payable', description: 'GST input credit @ 18%', debit: 30000, credit: 0 },
      { account: '1120', accountName: 'Primary Bank Account', description: 'Payment via RTGS', debit: 0, credit: 275000 },
    ],
  },
  {
    id: 'je-007',
    entryNumber: 'JE-007',
    date: '2026-02-12',
    description: 'Food Wastage Write-off',
    reference: 'WO/WASTE/0212',
    source: 'MANUAL',
    status: 'POSTED',
    totalDebit: 8450,
    totalCredit: 8450,
    lines: [
      { account: '6800', accountName: 'Wastage / Write-off', description: 'Expired dairy products written off', debit: 5200, credit: 0 },
      { account: '6800', accountName: 'Wastage / Write-off', description: 'Spoiled vegetables - cold chain failure', debit: 3250, credit: 0 },
      { account: '1300', accountName: 'Inventory - Raw Materials', description: 'Inventory reduction for wastage', debit: 0, credit: 8450 },
    ],
  },
  {
    id: 'je-008',
    entryNumber: 'JE-008',
    date: '2026-02-15',
    description: 'Zomato Commission Adj',
    reference: 'AGG/ZOM/ADJ',
    source: 'AGGREGATOR',
    status: 'DRAFT',
    totalDebit: 18200,
    totalCredit: 18200,
    lines: [
      { account: '1220', accountName: 'Zomato Receivable', description: 'Pending Zomato settlement - adjustment', debit: 18200, credit: 0 },
      { account: '6500', accountName: 'Commission Expense', description: 'Zomato commission reversal', debit: 0, credit: 2850 },
      { account: '4300', accountName: 'Aggregator Sales Revenue', description: 'Zomato order cancellation adjustment', debit: 0, credit: 15350 },
    ],
  },
  {
    id: 'je-009',
    entryNumber: 'JE-009',
    date: '2026-02-18',
    description: 'End of Day Cash Reconciliation',
    reference: 'CASH/RECON/0218',
    source: 'MANUAL',
    status: 'DRAFT',
    totalDebit: 2150,
    totalCredit: 2150,
    lines: [
      { account: '1120', accountName: 'Primary Bank Account', description: 'Cash deposited to bank', debit: 2150, credit: 0 },
      { account: '1110', accountName: 'Cash on Hand', description: 'Cash transferred from till', debit: 0, credit: 2150 },
    ],
  },
  {
    id: 'je-010',
    entryNumber: 'JE-010',
    date: '2026-02-20',
    description: 'Correcting Entry - Wrong Account',
    reference: 'COR/ADJ/0220',
    source: 'MANUAL',
    status: 'REVERSED',
    totalDebit: 15000,
    totalCredit: 15000,
    lines: [
      { account: '6300', accountName: 'Utilities Expense', description: 'Reclassify from rent to utilities', debit: 15000, credit: 0 },
      { account: '6200', accountName: 'Rent Expense', description: 'Reverse incorrect rent booking', debit: 0, credit: 15000 },
    ],
  },
];

/* ─── Badge Helpers ──────────────────────────────────────────────── */

function getStatusVariant(status: JournalStatus): 'default' | 'success' | 'danger' {
  switch (status) {
    case 'DRAFT': return 'default';
    case 'POSTED': return 'success';
    case 'REVERSED': return 'danger';
  }
}

function getSourceVariant(source: JournalSource): 'info' | 'purple' | 'success' | 'warning' | 'danger' | 'default' {
  switch (source) {
    case 'MANUAL': return 'info';
    case 'PAYROLL': return 'purple';
    case 'SALES': return 'success';
    case 'PURCHASE': return 'warning';
    case 'COGS': return 'danger';
    case 'AGGREGATOR': return 'warning';
    default: return 'default';
  }
}

/* ─── Page Component ─────────────────────────────────────────────── */

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  /* ── Filter by status tab ──────────────────────────────────────── */

  const filteredEntries = useMemo(() => {
    if (activeTab === 'all') return entries;
    return entries.filter((e) => e.status === activeTab.toUpperCase());
  }, [entries, activeTab]);

  const tabCounts = useMemo(() => {
    const draft = entries.filter((e) => e.status === 'DRAFT').length;
    const posted = entries.filter((e) => e.status === 'POSTED').length;
    const reversed = entries.filter((e) => e.status === 'REVERSED').length;
    return { all: entries.length, draft, posted, reversed };
  }, [entries]);

  const tabs = [
    { id: 'all', label: 'All', count: tabCounts.all },
    { id: 'draft', label: 'Draft', count: tabCounts.draft },
    { id: 'posted', label: 'Posted', count: tabCounts.posted },
    { id: 'reversed', label: 'Reversed', count: tabCounts.reversed },
  ];

  /* ── Table columns ─────────────────────────────────────────────── */

  const columns: Column[] = [
    {
      key: 'entryNumber',
      label: 'Entry #',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600">{value as string}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      width: '120px',
      render: (value) => {
        const d = new Date(value as string);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value as string}</span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      width: '120px',
      render: (value) => (
        <Badge variant={getSourceVariant(value as JournalSource)}>
          {value as string}
        </Badge>
      ),
    },
    {
      key: 'totalDebit',
      label: 'Debit Total',
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="font-mono text-gray-900">{formatINR(value as number)}</span>
      ),
    },
    {
      key: 'totalCredit',
      label: 'Credit Total',
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="font-mono text-gray-900">{formatINR(value as number)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (value) => (
        <Badge variant={getStatusVariant(value as JournalStatus)}>
          {value as string}
        </Badge>
      ),
    },
  ];

  /* ── Handle new entry creation ─────────────────────────────────── */

  function handleCreateEntry(entry: {
    date: string;
    description: string;
    reference: string;
    lines: NewLine[];
  }) {
    const nextNumber = entries.length + 1;
    const entryNumber = `JE-${String(nextNumber).padStart(3, '0')}`;

    const journalLines: JournalLine[] = entry.lines.map((l) => ({
      account: l.account,
      accountName: getAccountName(l.account),
      description: l.description,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
    }));

    const totalDebit = journalLines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = journalLines.reduce((sum, l) => sum + l.credit, 0);

    const newEntry: JournalEntry = {
      id: `je-${nextNumber.toString().padStart(3, '0')}`,
      entryNumber,
      date: entry.date,
      description: entry.description,
      reference: entry.reference,
      source: 'MANUAL',
      status: 'DRAFT',
      lines: journalLines,
      totalDebit,
      totalCredit,
    };

    setEntries((prev) => [...prev, newEntry]);
    setShowCreateModal(false);
  }

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-500 mt-1">
            View and manage double-entry journal entries
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <span className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Journal Entry
          </span>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500 p-5">
          <p className="text-sm font-medium text-gray-500">Total Entries</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{entries.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-emerald-500 p-5">
          <p className="text-sm font-medium text-gray-500">Posted</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{tabCounts.posted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-gray-400 p-5">
          <p className="text-sm font-medium text-gray-500">Draft</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">{tabCounts.draft}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-red-500 p-5">
          <p className="text-sm font-medium text-gray-500">Reversed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{tabCounts.reversed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
        <DataTable
          columns={columns}
          data={filteredEntries}
          onRowClick={(row) => setViewEntry(row as unknown as JournalEntry)}
          searchable
          searchPlaceholder="Search by entry #, description, or source..."
          emptyMessage="No journal entries found for the selected filter."
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateJournalEntryModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEntry}
        />
      )}

      {/* View Modal */}
      {viewEntry && (
        <ViewJournalEntryModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
        />
      )}
    </div>
  );
}

/* ─── Create Journal Entry Modal ─────────────────────────────────── */

function CreateJournalEntryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: {
    date: string;
    description: string;
    reference: string;
    lines: NewLine[];
  }) => void;
}) {
  const [date, setDate] = useState('2026-02-27');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<NewLine[]>([
    { account: '', description: '', debit: '', credit: '' },
    { account: '', description: '', debit: '', credit: '' },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01 && totalDebit > 0;

  function updateLine(index: number, field: keyof NewLine, value: string) {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addLine() {
    setLines((prev) => [...prev, { account: '', description: '', debit: '', credit: '' }]);
  }

  function removeLine(index: number) {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!date || !description) return;
    if (!isBalanced) return;

    const validLines = lines.filter(
      (l) => l.account && ((parseFloat(l.debit) || 0) > 0 || (parseFloat(l.credit) || 0) > 0)
    );
    if (validLines.length < 2) return;

    onSave({ date, description, reference, lines: validLines });
  }

  const canSave = date && description && isBalanced;

  return (
    <Modal isOpen={true} onClose={onClose} title="New Journal Entry" size="xl">
      <div className="space-y-5">
        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <TextInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter journal description"
            required
          />
          <TextInput
            label="Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., INV-001, RENT/MAR"
          />
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
            <Button variant="ghost" size="sm" onClick={addLine}>
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Line
              </span>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-[220px]">
                    Account
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-[140px]">
                    Debit ({'\u20B9'})
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-[140px]">
                    Credit ({'\u20B9'})
                  </th>
                  <th className="px-3 py-2.5 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2">
                      <SelectInput
                        value={line.account}
                        onChange={(e) => updateLine(idx, 'account', e.target.value)}
                        options={ACCOUNT_OPTIONS}
                        placeholder="Select account"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <TextInput
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Line description"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit}
                        onChange={(e) => {
                          updateLine(idx, 'debit', e.target.value);
                          if (e.target.value && parseFloat(e.target.value) > 0) {
                            updateLine(idx, 'credit', '');
                          }
                        }}
                        placeholder="0"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit}
                        onChange={(e) => {
                          updateLine(idx, 'credit', e.target.value);
                          if (e.target.value && parseFloat(e.target.value) > 0) {
                            updateLine(idx, 'debit', '');
                          }
                        }}
                        placeholder="0"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeLine(idx)}
                        disabled={lines.length <= 2}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove line"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Running Totals */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500 font-medium">Total Debit</p>
              <p className="text-lg font-bold text-gray-900 font-mono mt-1">{formatINR(totalDebit)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 font-medium">Total Credit</p>
              <p className="text-lg font-bold text-gray-900 font-mono mt-1">{formatINR(totalCredit)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 font-medium">Difference</p>
              <p
                className={`text-lg font-bold font-mono mt-1 ${
                  isBalanced ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {isBalanced ? 'Balanced' : formatINR(difference)}
              </p>
            </div>
          </div>
          {!isBalanced && totalDebit > 0 && (
            <p className="text-xs text-red-500 text-center mt-2">
              Debit and Credit totals must be equal to save the entry.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save as Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── View Journal Entry Modal ───────────────────────────────────── */

function ViewJournalEntryModal({
  entry,
  onClose,
}: {
  entry: JournalEntry;
  onClose: () => void;
}) {
  const formattedDate = new Date(entry.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal isOpen={true} onClose={onClose} title={`Journal Entry - ${entry.entryNumber}`} size="xl">
      <div className="space-y-5">
        {/* Entry Header Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Entry Number</p>
            <p className="text-sm font-bold text-indigo-600 font-mono mt-0.5">{entry.entryNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Date</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Source</p>
            <div className="mt-1">
              <Badge variant={getSourceVariant(entry.source)}>{entry.source}</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Status</p>
            <div className="mt-1">
              <Badge variant={getStatusVariant(entry.status)}>{entry.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Description</p>
            <p className="text-sm text-gray-900 mt-0.5">{entry.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Reference</p>
            <p className="text-sm text-gray-900 font-mono mt-0.5">{entry.reference || '-'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Account
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-[140px]">
                    Debit
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-[140px]">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {entry.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono text-xs text-gray-500">{line.account}</span>
                      <span className="mx-1.5 text-gray-300">-</span>
                      <span className="font-medium text-gray-900">{line.accountName}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{line.description}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {line.debit > 0 ? (
                        <span className="text-gray-900">{formatINR(line.debit)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {line.credit > 0 ? (
                        <span className="text-gray-900">{formatINR(line.credit)}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-bold text-gray-900">
                    {formatINR(entry.totalDebit)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-bold text-gray-900">
                    {formatINR(entry.totalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Balance Indicator */}
        <div className="flex justify-center">
          {entry.totalDebit === entry.totalCredit ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-emerald-700">Entry is balanced</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z" />
              </svg>
              <span className="text-sm font-medium text-red-700">
                Entry is unbalanced by {formatINR(Math.abs(entry.totalDebit - entry.totalCredit))}
              </span>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
