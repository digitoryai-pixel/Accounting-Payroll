'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import Modal from '@/components/ui/Modal';
import { TextInput, SelectInput, TextArea } from '@/components/ui/Input';

/* ─── Currency Formatter ────────────────────────────────────────── */

function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    useGrouping: true,
  });
  return amount < 0 ? `-\u20B9${formatted}` : `\u20B9${formatted}`;
}

/* ─── Types ─────────────────────────────────────────────────────── */

interface Bill {
  id: string;
  billNumber: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Paid' | 'Overdue' | 'Partially Paid';
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  outstanding: number;
  creditDays: number;
  phone: string;
  rating: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  date: string;
  expectedDate: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Partially Received' | 'Received';
}

interface LineItem {
  item: string;
  qty: number;
  rate: number;
  gstPercent: number;
  amount: number;
}

/* ─── Mock Data ─────────────────────────────────────────────────── */

const mockBills: Bill[] = [
  {
    id: '1',
    billNumber: 'BILL-2026-001',
    vendor: 'Fresh Farms Produce',
    date: '2026-02-01',
    dueDate: '2026-02-15',
    amount: 85000,
    paid: 85000,
    balance: 0,
    status: 'Paid',
  },
  {
    id: '2',
    billNumber: 'BILL-2026-002',
    vendor: 'Premium Meats India',
    date: '2026-02-03',
    dueDate: '2026-02-18',
    amount: 120000,
    paid: 60000,
    balance: 60000,
    status: 'Partially Paid',
  },
  {
    id: '3',
    billNumber: 'BILL-2026-003',
    vendor: 'Delhi Dairy Co.',
    date: '2026-02-05',
    dueDate: '2026-02-12',
    amount: 45000,
    paid: 0,
    balance: 45000,
    status: 'Overdue',
  },
  {
    id: '4',
    billNumber: 'BILL-2026-004',
    vendor: 'SpiceMaster Trading',
    date: '2026-02-08',
    dueDate: '2026-02-22',
    amount: 32000,
    paid: 0,
    balance: 32000,
    status: 'Approved',
  },
  {
    id: '5',
    billNumber: 'BILL-2026-005',
    vendor: 'Kingfisher Beverages',
    date: '2026-02-10',
    dueDate: '2026-02-14',
    amount: 98000,
    paid: 0,
    balance: 98000,
    status: 'Overdue',
  },
  {
    id: '6',
    billNumber: 'BILL-2026-006',
    vendor: 'PackRight Solutions',
    date: '2026-02-12',
    dueDate: '2026-02-26',
    amount: 28000,
    paid: 0,
    balance: 28000,
    status: 'Pending',
  },
  {
    id: '7',
    billNumber: 'BILL-2026-007',
    vendor: 'CleanPro Services',
    date: '2026-02-15',
    dueDate: '2026-03-01',
    amount: 55000,
    paid: 0,
    balance: 55000,
    status: 'Draft',
  },
  {
    id: '8',
    billNumber: 'BILL-2026-008',
    vendor: 'ColdChain Logistics',
    date: '2026-02-18',
    dueDate: '2026-02-20',
    amount: 100000,
    paid: 0,
    balance: 100000,
    status: 'Overdue',
  },
];

const mockVendors: Vendor[] = [
  { id: '1', name: 'Fresh Farms Produce', category: 'Food Supplier', outstanding: 45000, creditDays: 15, phone: '+91 98100 12345', rating: 5 },
  { id: '2', name: 'Premium Meats India', category: 'Food Supplier', outstanding: 120000, creditDays: 30, phone: '+91 98200 23456', rating: 4 },
  { id: '3', name: 'Delhi Dairy Co.', category: 'Food Supplier', outstanding: 38000, creditDays: 7, phone: '+91 98300 34567', rating: 4 },
  { id: '4', name: 'SpiceMaster Trading', category: 'Food Supplier', outstanding: 32000, creditDays: 21, phone: '+91 98400 45678', rating: 5 },
  { id: '5', name: 'PackRight Solutions', category: 'Packaging', outstanding: 28000, creditDays: 30, phone: '+91 98500 56789', rating: 3 },
  { id: '6', name: 'Kingfisher Beverages', category: 'Beverage Supplier', outstanding: 98000, creditDays: 15, phone: '+91 98600 67890', rating: 4 },
  { id: '7', name: 'CleanPro Services', category: 'Services', outstanding: 55000, creditDays: 30, phone: '+91 98700 78901', rating: 4 },
  { id: '8', name: 'ColdChain Logistics', category: 'Services', outstanding: 100000, creditDays: 14, phone: '+91 98800 89012', rating: 3 },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2026-001', vendor: 'Fresh Farms Produce', date: '2026-02-01', expectedDate: '2026-02-05', amount: 65000, status: 'Received' },
  { id: '2', poNumber: 'PO-2026-002', vendor: 'Premium Meats India', date: '2026-02-05', expectedDate: '2026-02-10', amount: 140000, status: 'Partially Received' },
  { id: '3', poNumber: 'PO-2026-003', vendor: 'Kingfisher Beverages', date: '2026-02-10', expectedDate: '2026-02-18', amount: 92000, status: 'Sent' },
  { id: '4', poNumber: 'PO-2026-004', vendor: 'SpiceMaster Trading', date: '2026-02-15', expectedDate: '2026-02-25', amount: 48000, status: 'Sent' },
  { id: '5', poNumber: 'PO-2026-005', vendor: 'ColdChain Logistics', date: '2026-02-20', expectedDate: '2026-03-05', amount: 75000, status: 'Draft' },
];

const vendorCategoryOptions = [
  { value: 'Food Supplier', label: 'Food Supplier' },
  { value: 'Beverage Supplier', label: 'Beverage Supplier' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Services', label: 'Services' },
];

/* ─── Status Badge Helper ───────────────────────────────────────── */

function getBillStatusVariant(status: Bill['status']): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  switch (status) {
    case 'Draft': return 'default';
    case 'Pending': return 'warning';
    case 'Approved': return 'info';
    case 'Paid': return 'success';
    case 'Overdue': return 'danger';
    case 'Partially Paid': return 'purple';
    default: return 'default';
  }
}

function getPOStatusVariant(status: PurchaseOrder['status']): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  switch (status) {
    case 'Draft': return 'default';
    case 'Sent': return 'info';
    case 'Partially Received': return 'warning';
    case 'Received': return 'success';
    default: return 'default';
  }
}

/* ─── Rating Stars Component ────────────────────────────────────── */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Main Page Component ───────────────────────────────────────── */

export default function AccountsPayablePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewBillModal, setShowNewBillModal] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bills', label: 'Bills', count: mockBills.length },
    { id: 'vendors', label: 'Vendors', count: mockVendors.length },
    { id: 'purchase-orders', label: 'Purchase Orders', count: mockPurchaseOrders.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Payable</h1>
          <p className="text-gray-500 mt-1">Manage bills, vendors, and purchase orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowNewBillModal(true)}>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Bill
            </span>
          </Button>
          <Button variant="primary" onClick={() => setShowNewVendorModal(true)}>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Vendor
            </span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'bills' && <BillsTab />}
      {activeTab === 'vendors' && <VendorsTab />}
      {activeTab === 'purchase-orders' && <PurchaseOrdersTab />}

      {/* Modals */}
      <AddBillModal isOpen={showNewBillModal} onClose={() => setShowNewBillModal(false)} />
      <AddVendorModal isOpen={showNewVendorModal} onClose={() => setShowNewVendorModal(false)} />
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────────────────────────── */

function OverviewTab() {
  const agingData = [
    { label: 'Current', amount: 210000, color: 'bg-emerald-500', maxWidth: 210000 },
    { label: '1-30 Days', amount: 120000, color: 'bg-amber-500', maxWidth: 210000 },
    { label: '31-60 Days', amount: 58000, color: 'bg-orange-500', maxWidth: 210000 },
    { label: '60+ Days', amount: 30000, color: 'bg-red-500', maxWidth: 210000 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Outstanding"
          value={formatINR(418000)}
          subtitle="Across all vendors"
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Overdue Bills"
          value="3"
          subtitle="Requires attention"
          color="red"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="Due This Week"
          value="5"
          subtitle="Upcoming payments"
          color="yellow"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Vendors"
          value="12"
          subtitle="Active vendors"
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Aging Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Aging Analysis</h3>
        <p className="text-sm text-gray-500 mb-6">Outstanding payables by aging period</p>
        <div className="space-y-4">
          {agingData.map((item) => {
            const widthPercent = (item.amount / item.maxWidth) * 100;
            return (
              <div key={item.label} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-600 shrink-0">{item.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3`}
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{formatINR(item.amount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total Outstanding</span>
          <span className="text-lg font-bold text-gray-900">{formatINR(418000)}</span>
        </div>
      </div>

      {/* Recent Overdue Bills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Overdue Bills</h3>
        <p className="text-sm text-gray-500 mb-4">Bills past their due date requiring immediate attention</p>
        <div className="space-y-3">
          {mockBills
            .filter((b) => b.status === 'Overdue')
            .map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{bill.billNumber}</p>
                    <p className="text-xs text-gray-500">{bill.vendor} &middot; Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-700">{formatINR(bill.balance)}</p>
                  <Badge variant="danger">Overdue</Badge>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Bills Tab ─────────────────────────────────────────────────── */

function BillsTab() {
  const columns: Column[] = [
    {
      key: 'billNumber',
      label: 'Bill #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600">{value as string}</span>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => <span className="font-mono">{formatINR(value as number)}</span>,
    },
    {
      key: 'paid',
      label: 'Paid',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-emerald-600">{formatINR(value as number)}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      sortable: true,
      render: (value) => (
        <span className={`font-mono font-semibold ${(value as number) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getBillStatusVariant(value as Bill['status'])}>{value as string}</Badge>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">All Bills</h3>
        <p className="text-sm text-gray-500">Track and manage vendor bills and payments</p>
      </div>
      <DataTable
        columns={columns}
        data={mockBills}
        searchable
        searchPlaceholder="Search bills by number, vendor..."
      />
    </div>
  );
}

/* ─── Vendors Tab ───────────────────────────────────────────────── */

function VendorsTab() {
  const columns: Column[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-600">
              {(value as string).split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => <Badge variant="info">{value as string}</Badge>,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      sortable: true,
      render: (value) => (
        <span className={`font-mono font-semibold ${(value as number) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'creditDays',
      label: 'Credit Days',
      sortable: true,
      render: (value) => <span>{value as number} days</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => <span className="text-gray-600">{value as string}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => <RatingStars rating={value as number} />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Directory</h3>
        <p className="text-sm text-gray-500">Manage your vendor relationships and details</p>
      </div>
      <DataTable
        columns={columns}
        data={mockVendors}
        searchable
        searchPlaceholder="Search vendors by name, category..."
      />
    </div>
  );
}

/* ─── Purchase Orders Tab ───────────────────────────────────────── */

function PurchaseOrdersTab() {
  const columns: Column[] = [
    {
      key: 'poNumber',
      label: 'PO #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600">{value as string}</span>
      ),
    },
    {
      key: 'vendor',
      label: 'Vendor',
      sortable: true,
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'expectedDate',
      label: 'Expected Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => <span className="font-mono font-semibold">{formatINR(value as number)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge variant={getPOStatusVariant(value as PurchaseOrder['status'])}>{value as string}</Badge>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
        <p className="text-sm text-gray-500">Track purchase orders and delivery status</p>
      </div>
      <DataTable
        columns={columns}
        data={mockPurchaseOrders}
        searchable
        searchPlaceholder="Search purchase orders..."
      />
    </div>
  );
}

/* ─── Add Vendor Modal ──────────────────────────────────────────── */

function AddVendorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contact: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    address: '',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    creditDays: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name!]: e.target.value }));
  };

  const handleSubmit = () => {
    onClose();
    setFormData({
      name: '',
      category: '',
      contact: '',
      email: '',
      phone: '',
      gstin: '',
      pan: '',
      address: '',
      bankName: '',
      bankAccount: '',
      bankIfsc: '',
      creditDays: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vendor" size="lg">
      <div className="space-y-6">
        {/* Basic Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Basic Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Vendor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter vendor name"
              required
            />
            <SelectInput
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={vendorCategoryOptions}
              placeholder="Select category"
              required
            />
            <TextInput
              label="Contact Person"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Contact person name"
            />
            <TextInput
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vendor@example.com"
              type="email"
            />
            <TextInput
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
            />
            <TextInput
              label="Credit Days"
              name="creditDays"
              value={formData.creditDays}
              onChange={handleChange}
              placeholder="e.g. 30"
              type="number"
            />
          </div>
        </div>

        {/* Tax Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tax Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="GSTIN"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              placeholder="22AAAAA0000A1Z5"
            />
            <TextInput
              label="PAN"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              placeholder="AAAAA0000A"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Address</h4>
          <TextArea
            label="Full Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter vendor address"
            rows={3}
          />
        </div>

        {/* Bank Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Bank Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Bank name"
            />
            <TextInput
              label="Account Number"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              placeholder="Account number"
            />
            <TextInput
              label="IFSC Code"
              name="bankIfsc"
              value={formData.bankIfsc}
              onChange={handleChange}
              placeholder="SBIN0001234"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Add Vendor</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Add Bill Modal ────────────────────────────────────────────── */

function AddBillModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    vendor: '',
    billNumber: '',
    date: '',
    dueDate: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item: '', qty: 1, rate: 0, gstPercent: 18, amount: 0 },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name!]: e.target.value }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      const qty = field === 'qty' ? Number(value) : updated[index].qty;
      const rate = field === 'rate' ? Number(value) : updated[index].rate;
      updated[index].amount = qty * rate;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { item: '', qty: 1, rate: 0, gstPercent: 18, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const gstTotal = lineItems.reduce((sum, item) => sum + (item.amount * item.gstPercent) / 100, 0);
  const total = subtotal + gstTotal;

  const vendorOptions = mockVendors.map((v) => ({
    value: v.name,
    label: v.name,
  }));

  const handleSubmit = () => {
    onClose();
    setFormData({ vendor: '', billNumber: '', date: '', dueDate: '' });
    setLineItems([{ item: '', qty: 1, rate: 0, gstPercent: 18, amount: 0 }]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Bill" size="xl">
      <div className="space-y-6">
        {/* Bill Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Bill Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectInput
              label="Vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              options={vendorOptions}
              placeholder="Select vendor"
              required
            />
            <TextInput
              label="Bill Number"
              name="billNumber"
              value={formData.billNumber}
              onChange={handleChange}
              placeholder="BILL-2026-XXX"
              required
            />
            <TextInput
              label="Bill Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              type="date"
              required
            />
            <TextInput
              label="Due Date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              type="date"
              required
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Line Items</h4>
            <Button variant="ghost" size="sm" onClick={addLineItem}>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </span>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">Qty</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">Rate</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">GST %</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">Amount</th>
                  <th className="px-3 py-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                        placeholder="Item description"
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateLineItem(index, 'qty', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate || ''}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="28"
                        value={item.gstPercent}
                        onChange={(e) => updateLineItem(index, 'gstPercent', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {formatINR(item.amount)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-mono font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST</span>
              <span className="font-mono font-medium">{formatINR(gstTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2">
              <span className="text-gray-900">Total</span>
              <span className="font-mono text-base">{formatINR(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create Bill</Button>
        </div>
      </div>
    </Modal>
  );
}
