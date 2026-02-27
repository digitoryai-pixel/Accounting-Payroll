'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { TextInput, SelectInput, TextArea } from '@/components/ui/Input';

/* ─── Currency Formatter ────────────────────────────────────────── */

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ─── Types ─────────────────────────────────────────────────────── */

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  expiry: string;
  status: string;
  hsnCode: string;
  gstRate: number;
  isPerishable: boolean;
  shelfLifeDays: number;
}

interface StockMovement {
  id: string;
  date: string;
  item: string;
  type: string;
  quantity: string;
  reference: string;
  fromTo: string;
}

interface WastageEntry {
  id: string;
  date: string;
  item: string;
  quantity: string;
  reason: string;
  costImpact: number;
  recordedBy: string;
}

interface AuditEntry {
  id: string;
  date: string;
  item: string;
  bookStock: number;
  actualStock: number;
  variance: number;
  notes: string;
  auditedBy: string;
}

/* ─── Mock Data ─────────────────────────────────────────────────── */

const inventoryItems: InventoryItem[] = [
  { id: '1', sku: 'RM-001', name: 'Basmati Rice', category: 'Raw Materials', currentStock: 120, unit: 'kg', minStock: 50, maxStock: 300, reorderPoint: 75, unitCost: 85, totalValue: 10200, expiry: '2026-08-15', status: 'In Stock', hsnCode: '1006', gstRate: 5, isPerishable: false, shelfLifeDays: 365 },
  { id: '2', sku: 'RM-002', name: 'Chicken Breast', category: 'Raw Materials', currentStock: 25, unit: 'kg', minStock: 15, maxStock: 80, reorderPoint: 20, unitCost: 280, totalValue: 7000, expiry: '2026-03-05', status: 'In Stock', hsnCode: '0207', gstRate: 0, isPerishable: true, shelfLifeDays: 3 },
  { id: '3', sku: 'RM-003', name: 'Onions', category: 'Raw Materials', currentStock: 45, unit: 'kg', minStock: 20, maxStock: 100, reorderPoint: 30, unitCost: 35, totalValue: 1575, expiry: '2026-03-20', status: 'In Stock', hsnCode: '0703', gstRate: 0, isPerishable: true, shelfLifeDays: 14 },
  { id: '4', sku: 'RM-004', name: 'Tomatoes', category: 'Raw Materials', currentStock: 8, unit: 'kg', minStock: 15, maxStock: 60, reorderPoint: 20, unitCost: 40, totalValue: 320, expiry: '2026-03-04', status: 'Low Stock', hsnCode: '0702', gstRate: 0, isPerishable: true, shelfLifeDays: 7 },
  { id: '5', sku: 'RM-005', name: 'Paneer', category: 'Raw Materials', currentStock: 12, unit: 'kg', minStock: 8, maxStock: 40, reorderPoint: 10, unitCost: 320, totalValue: 3840, expiry: '2026-03-03', status: 'Expiring Soon', hsnCode: '0406', gstRate: 5, isPerishable: true, shelfLifeDays: 5 },
  { id: '6', sku: 'RM-006', name: 'Cooking Oil', category: 'Raw Materials', currentStock: 50, unit: 'L', minStock: 20, maxStock: 100, reorderPoint: 30, unitCost: 160, totalValue: 8000, expiry: '2026-12-31', status: 'In Stock', hsnCode: '1508', gstRate: 5, isPerishable: false, shelfLifeDays: 365 },
  { id: '7', sku: 'RM-007', name: 'Cumin Powder', category: 'Raw Materials', currentStock: 5, unit: 'kg', minStock: 3, maxStock: 20, reorderPoint: 5, unitCost: 450, totalValue: 2250, expiry: '2026-10-15', status: 'In Stock', hsnCode: '0909', gstRate: 5, isPerishable: false, shelfLifeDays: 270 },
  { id: '8', sku: 'RM-008', name: 'Turmeric', category: 'Raw Materials', currentStock: 3, unit: 'kg', minStock: 2, maxStock: 15, reorderPoint: 4, unitCost: 350, totalValue: 1050, expiry: '2027-01-10', status: 'In Stock', hsnCode: '0910', gstRate: 5, isPerishable: false, shelfLifeDays: 365 },
  { id: '9', sku: 'RM-009', name: 'Garam Masala', category: 'Raw Materials', currentStock: 2, unit: 'kg', minStock: 3, maxStock: 15, reorderPoint: 4, unitCost: 600, totalValue: 1200, expiry: '2026-09-20', status: 'Low Stock', hsnCode: '0910', gstRate: 5, isPerishable: false, shelfLifeDays: 270 },
  { id: '10', sku: 'RM-010', name: 'Ghee', category: 'Raw Materials', currentStock: 18, unit: 'L', minStock: 10, maxStock: 50, reorderPoint: 15, unitCost: 520, totalValue: 9360, expiry: '2026-11-30', status: 'In Stock', hsnCode: '0405', gstRate: 12, isPerishable: false, shelfLifeDays: 270 },
  { id: '11', sku: 'RM-011', name: 'Butter', category: 'Raw Materials', currentStock: 6, unit: 'kg', minStock: 5, maxStock: 25, reorderPoint: 8, unitCost: 480, totalValue: 2880, expiry: '2026-04-15', status: 'In Stock', hsnCode: '0405', gstRate: 12, isPerishable: true, shelfLifeDays: 60 },
  { id: '12', sku: 'SF-001', name: 'Cream', category: 'Semi-Finished', currentStock: 4, unit: 'L', minStock: 5, maxStock: 20, reorderPoint: 6, unitCost: 300, totalValue: 1200, expiry: '2026-03-06', status: 'Low Stock', hsnCode: '0401', gstRate: 5, isPerishable: true, shelfLifeDays: 10 },
  { id: '13', sku: 'RM-012', name: 'Coriander Leaves', category: 'Raw Materials', currentStock: 0, unit: 'kg', minStock: 2, maxStock: 10, reorderPoint: 3, unitCost: 80, totalValue: 0, expiry: '-', status: 'Out of Stock', hsnCode: '0709', gstRate: 0, isPerishable: true, shelfLifeDays: 3 },
  { id: '14', sku: 'RM-013', name: 'Green Chillies', category: 'Raw Materials', currentStock: 1, unit: 'kg', minStock: 2, maxStock: 8, reorderPoint: 3, unitCost: 120, totalValue: 120, expiry: '2026-03-04', status: 'Low Stock', hsnCode: '0709', gstRate: 0, isPerishable: true, shelfLifeDays: 5 },
  { id: '15', sku: 'PK-001', name: 'Takeaway Containers', category: 'Packaging', currentStock: 500, unit: 'pcs', minStock: 200, maxStock: 2000, reorderPoint: 300, unitCost: 8, totalValue: 4000, expiry: '-', status: 'In Stock', hsnCode: '3923', gstRate: 18, isPerishable: false, shelfLifeDays: 0 },
];

const stockMovements: StockMovement[] = [
  { id: '1', date: '2026-02-27', item: 'Basmati Rice', type: 'IN', quantity: '50 kg', reference: 'PO-2026-0145', fromTo: 'Supplier: Gupta Traders' },
  { id: '2', date: '2026-02-27', item: 'Chicken Breast', type: 'IN', quantity: '30 kg', reference: 'PO-2026-0146', fromTo: 'Supplier: Fresh Meats Co.' },
  { id: '3', date: '2026-02-26', item: 'Cooking Oil', type: 'OUT', quantity: '5 L', reference: 'REQ-0892', fromTo: 'To: Main Kitchen' },
  { id: '4', date: '2026-02-26', item: 'Paneer', type: 'OUT', quantity: '4 kg', reference: 'REQ-0891', fromTo: 'To: Main Kitchen' },
  { id: '5', date: '2026-02-25', item: 'Onions', type: 'TRANSFER', quantity: '10 kg', reference: 'TRF-0234', fromTo: 'Store -> Prep Area' },
  { id: '6', date: '2026-02-25', item: 'Garam Masala', type: 'IN', quantity: '5 kg', reference: 'PO-2026-0143', fromTo: 'Supplier: Spice World' },
  { id: '7', date: '2026-02-24', item: 'Takeaway Containers', type: 'IN', quantity: '1000 pcs', reference: 'PO-2026-0142', fromTo: 'Supplier: PackRight Ind.' },
  { id: '8', date: '2026-02-24', item: 'Tomatoes', type: 'WASTAGE', quantity: '3 kg', reference: 'WST-0078', fromTo: 'Disposal' },
  { id: '9', date: '2026-02-23', item: 'Ghee', type: 'ADJUSTMENT', quantity: '-2 L', reference: 'ADJ-0034', fromTo: 'Stock Correction' },
  { id: '10', date: '2026-02-23', item: 'Cream', type: 'OUT', quantity: '3 L', reference: 'REQ-0887', fromTo: 'To: Dessert Station' },
];

const wastageLog: WastageEntry[] = [
  { id: '1', date: '2026-02-27', item: 'Coriander Leaves', quantity: '1.5 kg', reason: 'Expired', costImpact: 120, recordedBy: 'Rajesh Kumar' },
  { id: '2', date: '2026-02-26', item: 'Tomatoes', quantity: '3 kg', reason: 'Spoiled', costImpact: 120, recordedBy: 'Amit Sharma' },
  { id: '3', date: '2026-02-25', item: 'Cream', quantity: '2 L', reason: 'Expired', costImpact: 600, recordedBy: 'Priya Singh' },
  { id: '4', date: '2026-02-24', item: 'Chicken Breast', quantity: '2 kg', reason: 'Preparation Waste', costImpact: 560, recordedBy: 'Rajesh Kumar' },
  { id: '5', date: '2026-02-23', item: 'Paneer', quantity: '0.5 kg', reason: 'Spillage', costImpact: 160, recordedBy: 'Deepak Verma' },
  { id: '6', date: '2026-02-22', item: 'Cooking Oil', quantity: '1 L', reason: 'Spillage', costImpact: 160, recordedBy: 'Amit Sharma' },
];

const recentAudits: AuditEntry[] = [
  { id: '1', date: '2026-02-25', item: 'Basmati Rice', bookStock: 125, actualStock: 120, variance: -5, notes: 'Measurement loss during dispensing', auditedBy: 'Suresh Patel' },
  { id: '2', date: '2026-02-25', item: 'Cooking Oil', bookStock: 52, actualStock: 50, variance: -2, notes: 'Minor spillage unrecorded', auditedBy: 'Suresh Patel' },
  { id: '3', date: '2026-02-25', item: 'Takeaway Containers', bookStock: 490, actualStock: 500, variance: 10, notes: 'Previous count was incorrect', auditedBy: 'Priya Singh' },
  { id: '4', date: '2026-02-20', item: 'Ghee', bookStock: 20, actualStock: 18, variance: -2, notes: 'Unrecorded kitchen use', auditedBy: 'Suresh Patel' },
  { id: '5', date: '2026-02-20', item: 'Cumin Powder', bookStock: 5, actualStock: 5, variance: 0, notes: 'Stock matches', auditedBy: 'Priya Singh' },
];

/* ─── Status & Badge Helpers ────────────────────────────────────── */

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (status) {
    case 'In Stock': return 'success';
    case 'Low Stock': return 'warning';
    case 'Out of Stock': return 'danger';
    case 'Expiring Soon': return 'info';
    default: return 'default';
  }
}

function getMovementTypeVariant(type: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (type) {
    case 'IN': return 'success';
    case 'OUT': return 'danger';
    case 'TRANSFER': return 'info';
    case 'ADJUSTMENT': return 'warning';
    case 'WASTAGE': return 'danger';
    default: return 'default';
  }
}

function getReasonVariant(reason: string): 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple' {
  switch (reason) {
    case 'Expired': return 'danger';
    case 'Spoiled': return 'danger';
    case 'Preparation Waste': return 'warning';
    case 'Spillage': return 'info';
    default: return 'default';
  }
}

/* ─── Column Definitions ────────────────────────────────────────── */

const stockColumns: Column[] = [
  { key: 'sku', label: 'SKU', sortable: true, width: '90px' },
  { key: 'name', label: 'Item Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true, render: (val) => <span className="text-xs text-gray-600">{val as string}</span> },
  { key: 'currentStock', label: 'Current Stock', sortable: true, render: (val) => <span className="font-mono font-medium">{val as number}</span> },
  { key: 'unit', label: 'Unit' },
  { key: 'minStock', label: 'Min Stock', render: (val) => <span className="font-mono text-gray-500">{val as number}</span> },
  { key: 'unitCost', label: 'Unit Cost', sortable: true, render: (val) => formatINR(val as number) },
  { key: 'totalValue', label: 'Total Value', sortable: true, render: (val) => <span className="font-mono font-medium">{formatINR(val as number)}</span> },
  { key: 'expiry', label: 'Expiry', render: (val) => {
    const v = val as string;
    return v === '-' ? <span className="text-gray-400">N/A</span> : v;
  }},
  { key: 'status', label: 'Status', render: (val) => <Badge variant={getStatusVariant(val as string)}>{val as string}</Badge> },
];

const movementColumns: Column[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'item', label: 'Item', sortable: true },
  { key: 'type', label: 'Type', render: (val) => <Badge variant={getMovementTypeVariant(val as string)}>{val as string}</Badge> },
  { key: 'quantity', label: 'Quantity' },
  { key: 'reference', label: 'Reference', render: (val) => <span className="font-mono text-xs">{val as string}</span> },
  { key: 'fromTo', label: 'From/To' },
];

const wastageColumns: Column[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'item', label: 'Item', sortable: true },
  { key: 'quantity', label: 'Quantity' },
  { key: 'reason', label: 'Reason', render: (val) => <Badge variant={getReasonVariant(val as string)}>{val as string}</Badge> },
  { key: 'costImpact', label: 'Cost Impact', sortable: true, render: (val) => <span className="font-mono font-medium text-red-600">{formatINR(val as number)}</span> },
  { key: 'recordedBy', label: 'Recorded By' },
];

const auditColumns: Column[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'item', label: 'Item', sortable: true },
  { key: 'bookStock', label: 'Book Stock', render: (val) => <span className="font-mono">{val as number}</span> },
  { key: 'actualStock', label: 'Actual Stock', render: (val) => <span className="font-mono">{val as number}</span> },
  { key: 'variance', label: 'Variance', render: (val) => {
    const v = val as number;
    const color = v > 0 ? 'text-emerald-600' : v < 0 ? 'text-red-600' : 'text-gray-500';
    return <span className={`font-mono font-medium ${color}`}>{v > 0 ? `+${v}` : v}</span>;
  }},
  { key: 'notes', label: 'Notes' },
  { key: 'auditedBy', label: 'Audited By' },
];

/* ─── Tab Definitions ───────────────────────────────────────────── */

const tabList = [
  { id: 'overview', label: 'Stock Overview', count: 15 },
  { id: 'movements', label: 'Stock Movements', count: 10 },
  { id: 'wastage', label: 'Wastage Log', count: 6 },
  { id: 'audit', label: 'Stock Audit' },
];

/* ─── Category Options ──────────────────────────────────────────── */

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Semi-Finished', label: 'Semi-Finished' },
  { value: 'Finished Goods', label: 'Finished Goods' },
  { value: 'Packaging', label: 'Packaging' },
  { value: 'Non-Food', label: 'Non-Food' },
];

const unitOptions = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' },
  { value: 'dozen', label: 'dozen' },
];

const gstRateOptions = [
  { value: '0', label: '0%' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18%' },
  { value: '28', label: '28%' },
];

const wastageReasonOptions = [
  { value: 'Expired', label: 'Expired' },
  { value: 'Spoiled', label: 'Spoiled' },
  { value: 'Preparation Waste', label: 'Preparation Waste' },
  { value: 'Spillage', label: 'Spillage' },
];

/* ─── Main Component ────────────────────────────────────────────── */

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWastageModal, setShowWastageModal] = useState(false);

  /* ── Add Item Form State ─────────────────────────────────────── */
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'kg',
    minStock: '',
    maxStock: '',
    reorderPoint: '',
    unitCost: '',
    hsnCode: '',
    gstRate: '5',
    isPerishable: false,
    shelfLifeDays: '',
  });

  /* ── Wastage Form State ──────────────────────────────────────── */
  const [wastageForm, setWastageForm] = useState({
    item: '',
    quantity: '',
    reason: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  /* ── Audit Form State ────────────────────────────────────────── */
  const [auditForm, setAuditForm] = useState({
    item: '',
    bookStock: 0,
    actualStock: '',
    notes: '',
  });

  /* ── Filtered Inventory ──────────────────────────────────────── */
  const filteredItems = useMemo(() => {
    if (!categoryFilter) return inventoryItems;
    return inventoryItems.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  /* ── Audit Helpers ───────────────────────────────────────────── */
  const auditVariance = auditForm.actualStock !== '' ? Number(auditForm.actualStock) - auditForm.bookStock : 0;

  function handleAuditItemChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedItem = inventoryItems.find((i) => i.name === e.target.value);
    setAuditForm({
      ...auditForm,
      item: e.target.value,
      bookStock: selectedItem ? selectedItem.currentStock : 0,
      actualStock: '',
    });
  }

  /* ── Form Handlers ───────────────────────────────────────────── */
  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowAddModal(false);
    setAddForm({
      name: '', sku: '', category: '', unit: 'kg', minStock: '', maxStock: '',
      reorderPoint: '', unitCost: '', hsnCode: '', gstRate: '5', isPerishable: false, shelfLifeDays: '',
    });
  }

  function handleWastageSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowWastageModal(false);
    setWastageForm({ item: '', quantity: '', reason: '', notes: '', date: new Date().toISOString().split('T')[0] });
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track stock levels, movements, and wastage for your kitchen</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowWastageModal(true)}>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Record Wastage
            </span>
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items"
          value="48"
          subtitle="Across all categories"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock Alerts"
          value="5"
          subtitle="Items need reordering"
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatCard
          title="Total Value"
          value={formatINR(482000)}
          subtitle="Current inventory worth"
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Wastage This Month"
          value={formatINR(12500)}
          subtitle="Feb 2026"
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

        {/* ── Stock Overview ───────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stock Overview</h2>
              <div className="w-56">
                <SelectInput
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={categoryOptions}
                  placeholder="Filter by category"
                />
              </div>
            </div>
            <DataTable
              columns={stockColumns}
              data={filteredItems}
              searchable
              searchPlaceholder="Search by SKU, item name, or category..."
              emptyMessage="No inventory items found."
            />
          </div>
        )}

        {/* ── Stock Movements ─────────────────────────────────────── */}
        {activeTab === 'movements' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stock Movements</h2>
              <p className="text-sm text-gray-500 mt-1">Track all inventory inflows, outflows, and transfers</p>
            </div>
            <DataTable
              columns={movementColumns}
              data={stockMovements}
              searchable
              searchPlaceholder="Search by item, type, or reference..."
              emptyMessage="No stock movements found."
            />
          </div>
        )}

        {/* ── Wastage Log ─────────────────────────────────────────── */}
        {activeTab === 'wastage' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Wastage Log</h2>
                <p className="text-sm text-gray-500 mt-1">Record and track all food wastage for cost control</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowWastageModal(true)}>
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Record Wastage
                </span>
              </Button>
            </div>
            <DataTable
              columns={wastageColumns}
              data={wastageLog}
              searchable
              searchPlaceholder="Search by item or reason..."
              emptyMessage="No wastage entries found."
            />
          </div>
        )}

        {/* ── Stock Audit ─────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Stock Audit</h2>
              <p className="text-sm text-gray-500 mt-1">Reconcile physical stock with system records</p>
            </div>

            {/* Audit Form */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">New Audit Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <SelectInput
                    label="Select Item"
                    value={auditForm.item}
                    onChange={handleAuditItemChange}
                    options={inventoryItems.map((i) => ({ value: i.name, label: `${i.sku} - ${i.name}` }))}
                    placeholder="Choose an item"
                    required
                  />
                </div>
                <div>
                  <TextInput
                    label="Book Stock"
                    value={auditForm.bookStock.toString()}
                    onChange={() => {}}
                    disabled
                  />
                </div>
                <div>
                  <TextInput
                    label="Actual Stock"
                    value={auditForm.actualStock}
                    onChange={(e) => setAuditForm({ ...auditForm, actualStock: e.target.value })}
                    type="number"
                    placeholder="Enter count"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variance</label>
                  <div className={`
                    block w-full rounded-lg border px-3 py-2 text-sm font-mono font-medium
                    ${auditVariance > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                      auditVariance < 0 ? 'bg-red-50 border-red-300 text-red-700' :
                      'bg-gray-50 border-gray-300 text-gray-500'}
                  `}>
                    {auditForm.actualStock !== '' ? (auditVariance > 0 ? `+${auditVariance}` : auditVariance) : '-'}
                  </div>
                </div>
                <div>
                  <TextInput
                    label="Notes"
                    value={auditForm.notes}
                    onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                    placeholder="Audit notes"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => {
                  setAuditForm({ item: '', bookStock: 0, actualStock: '', notes: '' });
                }}>
                  Save Audit Entry
                </Button>
              </div>
            </div>

            {/* Recent Audits Table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Recent Audits</h3>
              <DataTable
                columns={auditColumns}
                data={recentAudits}
                searchable
                searchPlaceholder="Search audit entries..."
                emptyMessage="No audit entries found."
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Add Item Modal ──────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item" size="lg">
        <form onSubmit={handleAddSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Item Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Basmati Rice"
              required
            />
            <TextInput
              label="SKU"
              value={addForm.sku}
              onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
              placeholder="e.g. RM-016"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Category"
              value={addForm.category}
              onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              options={categoryOptions.filter((c) => c.value !== '')}
              placeholder="Select category"
              required
            />
            <SelectInput
              label="Unit"
              value={addForm.unit}
              onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
              options={unitOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Min Stock"
              value={addForm.minStock}
              onChange={(e) => setAddForm({ ...addForm, minStock: e.target.value })}
              type="number"
              placeholder="0"
              required
            />
            <TextInput
              label="Max Stock"
              value={addForm.maxStock}
              onChange={(e) => setAddForm({ ...addForm, maxStock: e.target.value })}
              type="number"
              placeholder="0"
              required
            />
            <TextInput
              label="Reorder Point"
              value={addForm.reorderPoint}
              onChange={(e) => setAddForm({ ...addForm, reorderPoint: e.target.value })}
              type="number"
              placeholder="0"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Unit Cost (INR)"
              value={addForm.unitCost}
              onChange={(e) => setAddForm({ ...addForm, unitCost: e.target.value })}
              type="number"
              placeholder="0"
              required
            />
            <TextInput
              label="HSN Code"
              value={addForm.hsnCode}
              onChange={(e) => setAddForm({ ...addForm, hsnCode: e.target.value })}
              placeholder="e.g. 1006"
            />
            <SelectInput
              label="GST Rate"
              value={addForm.gstRate}
              onChange={(e) => setAddForm({ ...addForm, gstRate: e.target.value })}
              options={gstRateOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.isPerishable}
                  onChange={(e) => setAddForm({ ...addForm, isPerishable: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">Is Perishable</span>
              </label>
            </div>
            {addForm.isPerishable && (
              <TextInput
                label="Shelf Life (Days)"
                value={addForm.shelfLifeDays}
                onChange={(e) => setAddForm({ ...addForm, shelfLifeDays: e.target.value })}
                type="number"
                placeholder="e.g. 7"
                required
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Item</Button>
          </div>
        </form>
      </Modal>

      {/* ── Record Wastage Modal ────────────────────────────────────── */}
      <Modal isOpen={showWastageModal} onClose={() => setShowWastageModal(false)} title="Record Wastage" size="md">
        <form onSubmit={handleWastageSubmit} className="space-y-5">
          <SelectInput
            label="Item"
            value={wastageForm.item}
            onChange={(e) => setWastageForm({ ...wastageForm, item: e.target.value })}
            options={inventoryItems.map((i) => ({ value: i.name, label: `${i.sku} - ${i.name}` }))}
            placeholder="Select item"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Quantity"
              value={wastageForm.quantity}
              onChange={(e) => setWastageForm({ ...wastageForm, quantity: e.target.value })}
              type="number"
              placeholder="0"
              required
            />
            <SelectInput
              label="Reason"
              value={wastageForm.reason}
              onChange={(e) => setWastageForm({ ...wastageForm, reason: e.target.value })}
              options={wastageReasonOptions}
              placeholder="Select reason"
              required
            />
          </div>

          <TextInput
            label="Date"
            value={wastageForm.date}
            onChange={(e) => setWastageForm({ ...wastageForm, date: e.target.value })}
            type="date"
            required
          />

          <TextArea
            label="Notes"
            value={wastageForm.notes}
            onChange={(e) => setWastageForm({ ...wastageForm, notes: e.target.value })}
            placeholder="Additional details about the wastage..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowWastageModal(false)}>Cancel</Button>
            <Button variant="danger" type="submit">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Record Wastage
              </span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
