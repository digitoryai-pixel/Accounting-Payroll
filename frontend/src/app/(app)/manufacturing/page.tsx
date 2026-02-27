'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import DataTable, { Column } from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import { TextInput, SelectInput } from '@/components/ui/Input';

/* ─── Currency Formatter ──────────────────────────────────────────── */

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatINR2(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─── Types ───────────────────────────────────────────────────────── */

interface BOMItem {
  item: string;
  qty: number;
  unit: string;
  unitCost: number;
  total: number;
  wastage: number;
  isSubAssembly: boolean;
}

interface BOM {
  id: string;
  bomNumber: string;
  product: string;
  category: string;
  version: string;
  outputQty: string;
  outputUnit: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
  status: 'Active' | 'Draft' | 'Archived';
  effectiveDate: string;
  yieldPercentage: number;
  items: BOMItem[];
}

interface ProductionOrder {
  id: string;
  orderNumber: string;
  product: string;
  bomRef: string;
  qty: number;
  unit: string;
  plannedDate: string;
  batchNumber: string;
  status: 'Planned' | 'In Progress' | 'Quality Check' | 'Completed' | 'Released' | 'On Hold';
  actualYield: number;
  costVariance: number;
}

interface BatchRecord {
  id: string;
  batchNumber: string;
  product: string;
  productionDate: string;
  expiryDate: string;
  quantity: string;
  status: 'Active' | 'Quarantine' | 'Released' | 'Expired';
  quality: 'Passed' | 'Failed' | 'Pending';
}

interface CostAnalysisRow {
  id: string;
  product: string;
  standardMaterial: number;
  actualMaterial: number;
  standardLabor: number;
  actualLabor: number;
  standardOverhead: number;
  actualOverhead: number;
  standardTotal: number;
  actualTotal: number;
  variance: number;
  varianceType: 'favorable' | 'unfavorable';
}

/* ─── Mock Data ───────────────────────────────────────────────────── */

const mockBOMs: BOM[] = [
  {
    id: 'bom-1',
    bomNumber: 'BOM-001',
    product: 'Pizza Sauce',
    category: 'Sauces',
    version: 'v2.1',
    outputQty: '5L batch',
    outputUnit: 'L',
    materialCost: 850,
    laborCost: 200,
    overheadCost: 120,
    totalCost: 1170,
    costPerUnit: 234,
    status: 'Active',
    effectiveDate: '2026-01-15',
    yieldPercentage: 95,
    items: [
      { item: 'Tomato Puree', qty: 3, unit: 'L', unitCost: 120, total: 360, wastage: 2, isSubAssembly: false },
      { item: 'Olive Oil', qty: 0.5, unit: 'L', unitCost: 400, total: 200, wastage: 1, isSubAssembly: false },
      { item: 'Garlic Paste', qty: 0.2, unit: 'kg', unitCost: 300, total: 60, wastage: 3, isSubAssembly: true },
      { item: 'Oregano', qty: 0.05, unit: 'kg', unitCost: 1200, total: 60, wastage: 1, isSubAssembly: false },
      { item: 'Salt', qty: 0.1, unit: 'kg', unitCost: 20, total: 2, wastage: 0, isSubAssembly: false },
      { item: 'Black Pepper', qty: 0.03, unit: 'kg', unitCost: 1800, total: 54, wastage: 1, isSubAssembly: false },
      { item: 'Basil (dried)', qty: 0.04, unit: 'kg', unitCost: 2850, total: 114, wastage: 2, isSubAssembly: false },
    ],
  },
  {
    id: 'bom-2',
    bomNumber: 'BOM-002',
    product: 'Tandoori Marinade',
    category: 'Marinades',
    version: 'v1.3',
    outputQty: '2kg',
    outputUnit: 'kg',
    materialCost: 620,
    laborCost: 150,
    overheadCost: 80,
    totalCost: 850,
    costPerUnit: 425,
    status: 'Active',
    effectiveDate: '2026-02-01',
    yieldPercentage: 93,
    items: [
      { item: 'Yogurt', qty: 1, unit: 'kg', unitCost: 80, total: 80, wastage: 2, isSubAssembly: false },
      { item: 'Kashmiri Chili Powder', qty: 0.15, unit: 'kg', unitCost: 800, total: 120, wastage: 1, isSubAssembly: false },
      { item: 'Ginger-Garlic Paste', qty: 0.2, unit: 'kg', unitCost: 250, total: 50, wastage: 3, isSubAssembly: true },
      { item: 'Garam Masala', qty: 0.1, unit: 'kg', unitCost: 1200, total: 120, wastage: 2, isSubAssembly: false },
      { item: 'Lemon Juice', qty: 0.15, unit: 'L', unitCost: 200, total: 30, wastage: 5, isSubAssembly: false },
      { item: 'Mustard Oil', qty: 0.2, unit: 'L', unitCost: 350, total: 70, wastage: 1, isSubAssembly: false },
      { item: 'Food Color (Red)', qty: 0.01, unit: 'kg', unitCost: 15000, total: 150, wastage: 0, isSubAssembly: false },
    ],
  },
  {
    id: 'bom-3',
    bomNumber: 'BOM-003',
    product: 'Biryani Masala Mix',
    category: 'Spice Blends',
    version: 'v3.0',
    outputQty: '1kg',
    outputUnit: 'kg',
    materialCost: 1450,
    laborCost: 180,
    overheadCost: 100,
    totalCost: 1730,
    costPerUnit: 1730,
    status: 'Active',
    effectiveDate: '2025-11-20',
    yieldPercentage: 97,
    items: [
      { item: 'Cumin Seeds', qty: 0.15, unit: 'kg', unitCost: 600, total: 90, wastage: 1, isSubAssembly: false },
      { item: 'Coriander Seeds', qty: 0.15, unit: 'kg', unitCost: 400, total: 60, wastage: 1, isSubAssembly: false },
      { item: 'Bay Leaves', qty: 0.02, unit: 'kg', unitCost: 2000, total: 40, wastage: 2, isSubAssembly: false },
      { item: 'Cardamom (Green)', qty: 0.05, unit: 'kg', unitCost: 5000, total: 250, wastage: 1, isSubAssembly: false },
      { item: 'Cinnamon Sticks', qty: 0.05, unit: 'kg', unitCost: 1800, total: 90, wastage: 1, isSubAssembly: false },
      { item: 'Star Anise', qty: 0.03, unit: 'kg', unitCost: 3000, total: 90, wastage: 2, isSubAssembly: false },
      { item: 'Mace & Nutmeg Blend', qty: 0.05, unit: 'kg', unitCost: 6000, total: 300, wastage: 1, isSubAssembly: true },
      { item: 'Turmeric Powder', qty: 0.1, unit: 'kg', unitCost: 500, total: 50, wastage: 0, isSubAssembly: false },
      { item: 'Black Pepper', qty: 0.1, unit: 'kg', unitCost: 1800, total: 180, wastage: 1, isSubAssembly: false },
      { item: 'Saffron', qty: 0.002, unit: 'kg', unitCost: 150000, total: 300, wastage: 0, isSubAssembly: false },
    ],
  },
  {
    id: 'bom-4',
    bomNumber: 'BOM-004',
    product: 'Cookie Dough',
    category: 'Bakery',
    version: 'v1.0',
    outputQty: '5kg',
    outputUnit: 'kg',
    materialCost: 780,
    laborCost: 250,
    overheadCost: 150,
    totalCost: 1180,
    costPerUnit: 236,
    status: 'Draft',
    effectiveDate: '2026-03-01',
    yieldPercentage: 92,
    items: [
      { item: 'All-Purpose Flour', qty: 2.5, unit: 'kg', unitCost: 60, total: 150, wastage: 2, isSubAssembly: false },
      { item: 'Butter', qty: 1, unit: 'kg', unitCost: 450, total: 450, wastage: 3, isSubAssembly: false },
      { item: 'Sugar (Powdered)', qty: 0.8, unit: 'kg', unitCost: 50, total: 40, wastage: 1, isSubAssembly: false },
      { item: 'Eggs', qty: 0.3, unit: 'kg', unitCost: 200, total: 60, wastage: 5, isSubAssembly: false },
      { item: 'Vanilla Extract', qty: 0.02, unit: 'L', unitCost: 2000, total: 40, wastage: 1, isSubAssembly: false },
      { item: 'Baking Powder', qty: 0.03, unit: 'kg', unitCost: 400, total: 12, wastage: 0, isSubAssembly: false },
      { item: 'Chocolate Chips', qty: 0.35, unit: 'kg', unitCost: 80, total: 28, wastage: 2, isSubAssembly: false },
    ],
  },
  {
    id: 'bom-5',
    bomNumber: 'BOM-005',
    product: 'Sandwich Bread',
    category: 'Bakery',
    version: 'v2.0',
    outputQty: '20 loaves',
    outputUnit: 'loaves',
    materialCost: 560,
    laborCost: 350,
    overheadCost: 200,
    totalCost: 1110,
    costPerUnit: 55.5,
    status: 'Archived',
    effectiveDate: '2025-06-15',
    yieldPercentage: 90,
    items: [
      { item: 'Bread Flour', qty: 5, unit: 'kg', unitCost: 55, total: 275, wastage: 2, isSubAssembly: false },
      { item: 'Yeast (Active Dry)', qty: 0.1, unit: 'kg', unitCost: 800, total: 80, wastage: 1, isSubAssembly: false },
      { item: 'Sugar', qty: 0.2, unit: 'kg', unitCost: 45, total: 9, wastage: 0, isSubAssembly: false },
      { item: 'Salt', qty: 0.1, unit: 'kg', unitCost: 20, total: 2, wastage: 0, isSubAssembly: false },
      { item: 'Milk Powder', qty: 0.15, unit: 'kg', unitCost: 400, total: 60, wastage: 1, isSubAssembly: false },
      { item: 'Butter', qty: 0.3, unit: 'kg', unitCost: 450, total: 135, wastage: 3, isSubAssembly: false },
    ],
  },
];

const mockProductionOrders: ProductionOrder[] = [
  {
    id: 'po-1',
    orderNumber: 'PRD-2026-001',
    product: 'Pizza Sauce',
    bomRef: 'BOM-001',
    qty: 50,
    unit: 'L',
    plannedDate: '2026-02-25',
    batchNumber: 'BTH-20260225-001',
    status: 'Completed',
    actualYield: 96,
    costVariance: -450,
  },
  {
    id: 'po-2',
    orderNumber: 'PRD-2026-002',
    product: 'Tandoori Marinade',
    bomRef: 'BOM-002',
    qty: 20,
    unit: 'kg',
    plannedDate: '2026-02-26',
    batchNumber: 'BTH-20260226-001',
    status: 'In Progress',
    actualYield: 0,
    costVariance: 0,
  },
  {
    id: 'po-3',
    orderNumber: 'PRD-2026-003',
    product: 'Biryani Masala Mix',
    bomRef: 'BOM-003',
    qty: 10,
    unit: 'kg',
    plannedDate: '2026-02-27',
    batchNumber: 'BTH-20260227-001',
    status: 'Planned',
    actualYield: 0,
    costVariance: 0,
  },
  {
    id: 'po-4',
    orderNumber: 'PRD-2026-004',
    product: 'Cookie Dough',
    bomRef: 'BOM-004',
    qty: 25,
    unit: 'kg',
    plannedDate: '2026-02-28',
    batchNumber: 'BTH-20260228-001',
    status: 'Quality Check',
    actualYield: 91,
    costVariance: 1200,
  },
  {
    id: 'po-5',
    orderNumber: 'PRD-2026-005',
    product: 'Pizza Sauce',
    bomRef: 'BOM-001',
    qty: 100,
    unit: 'L',
    plannedDate: '2026-03-01',
    batchNumber: 'BTH-20260301-001',
    status: 'Released',
    actualYield: 94,
    costVariance: -800,
  },
  {
    id: 'po-6',
    orderNumber: 'PRD-2026-006',
    product: 'Sandwich Bread',
    bomRef: 'BOM-005',
    qty: 200,
    unit: 'loaves',
    plannedDate: '2026-03-02',
    batchNumber: 'BTH-20260302-001',
    status: 'On Hold',
    actualYield: 0,
    costVariance: 0,
  },
];

const mockBatches: BatchRecord[] = [
  {
    id: 'bt-1',
    batchNumber: 'BTH-20260225-001',
    product: 'Pizza Sauce',
    productionDate: '2026-02-25',
    expiryDate: '2026-05-25',
    quantity: '48L',
    status: 'Released',
    quality: 'Passed',
  },
  {
    id: 'bt-2',
    batchNumber: 'BTH-20260226-001',
    product: 'Tandoori Marinade',
    productionDate: '2026-02-26',
    expiryDate: '2026-03-26',
    quantity: '18.6kg',
    status: 'Active',
    quality: 'Pending',
  },
  {
    id: 'bt-3',
    batchNumber: 'BTH-20260220-003',
    product: 'Biryani Masala Mix',
    productionDate: '2026-02-20',
    expiryDate: '2027-02-20',
    quantity: '9.7kg',
    status: 'Released',
    quality: 'Passed',
  },
  {
    id: 'bt-4',
    batchNumber: 'BTH-20260228-001',
    product: 'Cookie Dough',
    productionDate: '2026-02-28',
    expiryDate: '2026-03-14',
    quantity: '23kg',
    status: 'Quarantine',
    quality: 'Pending',
  },
  {
    id: 'bt-5',
    batchNumber: 'BTH-20260215-002',
    product: 'Sandwich Bread',
    productionDate: '2026-02-15',
    expiryDate: '2026-02-19',
    quantity: '180 loaves',
    status: 'Expired',
    quality: 'Passed',
  },
  {
    id: 'bt-6',
    batchNumber: 'BTH-20260210-001',
    product: 'Pizza Sauce',
    productionDate: '2026-02-10',
    expiryDate: '2026-05-10',
    quantity: '45L',
    status: 'Released',
    quality: 'Failed',
  },
];

const mockCostAnalysis: CostAnalysisRow[] = [
  {
    id: 'ca-1',
    product: 'Pizza Sauce (5L)',
    standardMaterial: 850,
    actualMaterial: 820,
    standardLabor: 200,
    actualLabor: 210,
    standardOverhead: 120,
    actualOverhead: 115,
    standardTotal: 1170,
    actualTotal: 1145,
    variance: -25,
    varianceType: 'favorable',
  },
  {
    id: 'ca-2',
    product: 'Tandoori Marinade (2kg)',
    standardMaterial: 620,
    actualMaterial: 680,
    standardLabor: 150,
    actualLabor: 155,
    standardOverhead: 80,
    actualOverhead: 85,
    standardTotal: 850,
    actualTotal: 920,
    variance: 70,
    varianceType: 'unfavorable',
  },
  {
    id: 'ca-3',
    product: 'Biryani Masala Mix (1kg)',
    standardMaterial: 1450,
    actualMaterial: 1380,
    standardLabor: 180,
    actualLabor: 175,
    standardOverhead: 100,
    actualOverhead: 95,
    standardTotal: 1730,
    actualTotal: 1650,
    variance: -80,
    varianceType: 'favorable',
  },
  {
    id: 'ca-4',
    product: 'Cookie Dough (5kg)',
    standardMaterial: 780,
    actualMaterial: 830,
    standardLabor: 250,
    actualLabor: 280,
    standardOverhead: 150,
    actualOverhead: 165,
    standardTotal: 1180,
    actualTotal: 1275,
    variance: 95,
    varianceType: 'unfavorable',
  },
  {
    id: 'ca-5',
    product: 'Sandwich Bread (20 loaves)',
    standardMaterial: 560,
    actualMaterial: 545,
    standardLabor: 350,
    actualLabor: 340,
    standardOverhead: 200,
    actualOverhead: 190,
    standardTotal: 1110,
    actualTotal: 1075,
    variance: -35,
    varianceType: 'favorable',
  },
];

/* ─── Status Badge Helpers ────────────────────────────────────────── */

function getBOMStatusVariant(status: BOM['status']): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'Active': return 'success';
    case 'Draft': return 'warning';
    case 'Archived': return 'default';
  }
}

function getPOStatusVariant(status: ProductionOrder['status']): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'Planned': return 'default';
    case 'In Progress': return 'info';
    case 'Quality Check': return 'warning';
    case 'Completed': return 'success';
    case 'Released': return 'success';
    case 'On Hold': return 'danger';
  }
}

function getQualityVariant(quality: BatchRecord['quality']): 'success' | 'danger' | 'warning' {
  switch (quality) {
    case 'Passed': return 'success';
    case 'Failed': return 'danger';
    case 'Pending': return 'warning';
  }
}

function getBatchStatusVariant(status: BatchRecord['status']): 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case 'Released': return 'success';
    case 'Active': return 'info';
    case 'Quarantine': return 'warning';
    case 'Expired': return 'danger';
  }
}

/* ─── Main Page Component ─────────────────────────────────────────── */

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState('bom');
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [showAddBOM, setShowAddBOM] = useState(false);
  const [showAddPO, setShowAddPO] = useState(false);

  /* ── Add BOM form state ─────────────────────────────────────────── */
  const [bomForm, setBomForm] = useState({
    productName: '',
    category: '',
    version: '',
    outputQty: '',
    outputUnit: '',
    laborCost: '',
    overheadCost: '',
  });
  const [bomItems, setBomItems] = useState([
    { item: '', qty: '', unit: '', unitCost: '', wastage: '' },
  ]);

  /* ── Add Production Order form state ────────────────────────────── */
  const [poForm, setPoForm] = useState({
    bomId: '',
    quantity: '',
    plannedDate: '',
    batchNumber: '',
  });

  const tabs = [
    { id: 'bom', label: 'Bill of Materials', count: 5 },
    { id: 'production', label: 'Production Orders', count: 6 },
    { id: 'batch', label: 'Batch Tracking', count: 6 },
    { id: 'cost', label: 'Cost Analysis', count: 5 },
  ];

  /* ── BOM Columns ────────────────────────────────────────────────── */
  const bomColumns: Column[] = [
    { key: 'bomNumber', label: 'BOM #', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'version', label: 'Version' },
    { key: 'outputQty', label: 'Output Qty' },
    {
      key: 'materialCost',
      label: 'Material Cost',
      sortable: true,
      render: (val) => formatINR(val as number),
    },
    {
      key: 'laborCost',
      label: 'Labor',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'overheadCost',
      label: 'Overhead',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      sortable: true,
      render: (val) => <span className="font-semibold">{formatINR(val as number)}</span>,
    },
    {
      key: 'costPerUnit',
      label: 'Cost/Unit',
      sortable: true,
      render: (val) => formatINR2(val as number),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={getBOMStatusVariant(val as BOM['status'])}>
          {val as string}
        </Badge>
      ),
    },
  ];

  /* ── Production Order Columns ───────────────────────────────────── */
  const poColumns: Column[] = [
    { key: 'orderNumber', label: 'Order #', sortable: true },
    {
      key: 'product',
      label: 'Product (BOM)',
      sortable: true,
      render: (_val, row) => (
        <span>
          {row.product} <span className="text-gray-400 text-xs">({row.bomRef})</span>
        </span>
      ),
    },
    {
      key: 'qty',
      label: 'Qty',
      sortable: true,
      render: (_val, row) => `${row.qty} ${row.unit}`,
    },
    {
      key: 'plannedDate',
      label: 'Planned Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    { key: 'batchNumber', label: 'Batch #' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={getPOStatusVariant(val as ProductionOrder['status'])}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'actualYield',
      label: 'Actual Yield',
      sortable: true,
      render: (val) => (val as number) > 0 ? `${val}%` : '--',
    },
    {
      key: 'costVariance',
      label: 'Cost Variance',
      sortable: true,
      render: (val) => {
        const v = val as number;
        if (v === 0) return '--';
        const color = v < 0 ? 'text-emerald-600' : 'text-red-600';
        return <span className={`font-medium ${color}`}>{v < 0 ? '-' : '+'}{ formatINR(Math.abs(v))}</span>;
      },
    },
  ];

  /* ── Batch Columns ──────────────────────────────────────────────── */
  const batchColumns: Column[] = [
    { key: 'batchNumber', label: 'Batch #', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    {
      key: 'productionDate',
      label: 'Production Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString('en-IN'),
    },
    { key: 'quantity', label: 'Quantity' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <Badge variant={getBatchStatusVariant(val as BatchRecord['status'])}>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'quality',
      label: 'Quality',
      render: (val) => (
        <Badge variant={getQualityVariant(val as BatchRecord['quality'])}>
          {val as string}
        </Badge>
      ),
    },
  ];

  /* ── Cost Analysis Columns ──────────────────────────────────────── */
  const costColumns: Column[] = [
    { key: 'product', label: 'Product', sortable: true },
    {
      key: 'standardMaterial',
      label: 'Std. Material',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'actualMaterial',
      label: 'Act. Material',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'standardLabor',
      label: 'Std. Labor',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'actualLabor',
      label: 'Act. Labor',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'standardOverhead',
      label: 'Std. Overhead',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'actualOverhead',
      label: 'Act. Overhead',
      render: (val) => formatINR(val as number),
    },
    {
      key: 'standardTotal',
      label: 'Std. Total',
      sortable: true,
      render: (val) => <span className="font-semibold">{formatINR(val as number)}</span>,
    },
    {
      key: 'actualTotal',
      label: 'Act. Total',
      sortable: true,
      render: (val) => <span className="font-semibold">{formatINR(val as number)}</span>,
    },
    {
      key: 'variance',
      label: 'Variance',
      sortable: true,
      render: (val, row) => {
        const v = val as number;
        const isFavorable = row.varianceType === 'favorable';
        return (
          <span className={`font-semibold ${isFavorable ? 'text-emerald-600' : 'text-red-600'}`}>
            {isFavorable ? '-' : '+'}{formatINR(Math.abs(v))}
            <span className="text-xs ml-1">({isFavorable ? 'F' : 'U'})</span>
          </span>
        );
      },
    },
  ];

  /* ── Add BOM Item Row ───────────────────────────────────────────── */
  function addBomItemRow() {
    setBomItems([...bomItems, { item: '', qty: '', unit: '', unitCost: '', wastage: '' }]);
  }

  function removeBomItemRow(index: number) {
    if (bomItems.length <= 1) return;
    setBomItems(bomItems.filter((_, i) => i !== index));
  }

  function updateBomItem(index: number, field: string, value: string) {
    const updated = [...bomItems];
    updated[index] = { ...updated[index], [field]: value };
    setBomItems(updated);
  }

  /* ── Form Handlers ──────────────────────────────────────────────── */
  function handleAddBOM() {
    // In a real app this would POST to API
    setShowAddBOM(false);
    setBomForm({ productName: '', category: '', version: '', outputQty: '', outputUnit: '', laborCost: '', overheadCost: '' });
    setBomItems([{ item: '', qty: '', unit: '', unitCost: '', wastage: '' }]);
  }

  function handleAddPO() {
    // In a real app this would POST to API
    setShowAddPO(false);
    setPoForm({ bomId: '', quantity: '', plannedDate: '', batchNumber: '' });
  }

  /* ── Icons ──────────────────────────────────────────────────────── */
  const CubeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const ClipboardIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );

  const ChartIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const CurrencyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manufacturing &amp; Production</h1>
          <p className="text-gray-500 mt-1">BOM management, production tracking &amp; cost analysis</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowAddBOM(true)}>
            + New BOM
          </Button>
          <Button variant="primary" onClick={() => setShowAddPO(true)}>
            + New Production Order
          </Button>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active BOMs"
          value={8}
          subtitle="3 categories"
          color="blue"
          icon={CubeIcon}
        />
        <StatCard
          title="Production Orders"
          value={5}
          subtitle="This month"
          color="green"
          icon={ClipboardIcon}
        />
        <StatCard
          title="Avg Yield"
          value="94%"
          subtitle="Last 30 days"
          trend={{ direction: 'up', percentage: 2.1 }}
          color="purple"
          icon={ChartIcon}
        />
        <StatCard
          title="Cost Variance"
          value={formatINR(12400)}
          subtitle="Under budget"
          trend={{ direction: 'down', percentage: 3.5 }}
          color="yellow"
          icon={CurrencyIcon}
        />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === 'bom' && (
          <DataTable
            columns={bomColumns}
            data={mockBOMs}
            searchable
            searchPlaceholder="Search BOMs by product, category..."
            onRowClick={(row) => setSelectedBOM(row)}
            emptyMessage="No BOMs found."
          />
        )}

        {activeTab === 'production' && (
          <DataTable
            columns={poColumns}
            data={mockProductionOrders}
            searchable
            searchPlaceholder="Search production orders..."
            emptyMessage="No production orders found."
          />
        )}

        {activeTab === 'batch' && (
          <DataTable
            columns={batchColumns}
            data={mockBatches}
            searchable
            searchPlaceholder="Search batches..."
            emptyMessage="No batch records found."
          />
        )}

        {activeTab === 'cost' && (
          <DataTable
            columns={costColumns}
            data={mockCostAnalysis}
            searchable
            searchPlaceholder="Search products..."
            emptyMessage="No cost analysis data."
          />
        )}
      </div>

      {/* ── BOM Detail Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={selectedBOM !== null}
        onClose={() => setSelectedBOM(null)}
        title={`BOM Details - ${selectedBOM?.product || ''}`}
        size="xl"
      >
        {selectedBOM && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">BOM Number</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedBOM.bomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Version</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedBOM.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Effective Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {new Date(selectedBOM.effectiveDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <Badge variant={getBOMStatusVariant(selectedBOM.status)}>{selectedBOM.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Category</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedBOM.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Output Qty</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedBOM.outputQty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Yield</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedBOM.yieldPercentage}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Cost / Unit</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{formatINR2(selectedBOM.costPerUnit)}</p>
              </div>
            </div>

            {/* Ingredient / BOM Items Table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Multi-Level Ingredient Breakdown</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Wastage %</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Sub-Assembly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedBOM.items.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-gray-50 ${item.isSubAssembly ? 'bg-indigo-50/30' : ''}`}>
                        <td className="px-4 py-2.5 text-sm text-gray-900">
                          {item.isSubAssembly && (
                            <span className="inline-block w-4 mr-1 text-indigo-500">&#9656;</span>
                          )}
                          {item.item}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-700 text-right font-mono">{item.qty}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-700">{item.unit}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-700 text-right font-mono">{formatINR2(item.unitCost)}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-900 text-right font-mono font-medium">{formatINR2(item.total)}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{item.wastage}%</td>
                        <td className="px-4 py-2.5 text-sm text-center">
                          {item.isSubAssembly ? (
                            <Badge variant="purple">Yes</Badge>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cost Rollup */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Cost Rollup</h3>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Material Cost</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{formatINR(selectedBOM.materialCost)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">+ Labor</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{formatINR(selectedBOM.laborCost)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">+ Overhead</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{formatINR(selectedBOM.overheadCost)}</p>
                  </div>
                  <div className="text-center border-l-2 border-indigo-300">
                    <p className="text-xs text-indigo-600 uppercase font-semibold">= Total Cost</p>
                    <p className="mt-1 text-lg font-bold text-indigo-700">{formatINR(selectedBOM.totalCost)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yield Percentage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${selectedBOM.yieldPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{selectedBOM.yieldPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add BOM Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddBOM}
        onClose={() => setShowAddBOM(false)}
        title="Create New Bill of Materials"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Product Name"
              value={bomForm.productName}
              onChange={(e) => setBomForm({ ...bomForm, productName: e.target.value })}
              placeholder="e.g., Pizza Sauce"
              required
            />
            <SelectInput
              label="Category"
              value={bomForm.category}
              onChange={(e) => setBomForm({ ...bomForm, category: e.target.value })}
              placeholder="Select category"
              required
              options={[
                { value: 'Sauces', label: 'Sauces' },
                { value: 'Marinades', label: 'Marinades' },
                { value: 'Spice Blends', label: 'Spice Blends' },
                { value: 'Bakery', label: 'Bakery' },
                { value: 'Beverages', label: 'Beverages' },
              ]}
            />
            <TextInput
              label="Version"
              value={bomForm.version}
              onChange={(e) => setBomForm({ ...bomForm, version: e.target.value })}
              placeholder="e.g., v1.0"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Output Quantity"
              value={bomForm.outputQty}
              onChange={(e) => setBomForm({ ...bomForm, outputQty: e.target.value })}
              placeholder="e.g., 5"
              type="number"
              required
            />
            <SelectInput
              label="Unit"
              value={bomForm.outputUnit}
              onChange={(e) => setBomForm({ ...bomForm, outputUnit: e.target.value })}
              placeholder="Select unit"
              required
              options={[
                { value: 'kg', label: 'Kilogram (kg)' },
                { value: 'L', label: 'Litre (L)' },
                { value: 'loaves', label: 'Loaves' },
                { value: 'pcs', label: 'Pieces' },
                { value: 'batch', label: 'Batch' },
              ]}
            />
          </div>

          {/* Dynamic BOM Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">BOM Items</h3>
              <Button variant="ghost" size="sm" onClick={addBomItemRow}>
                + Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {bomItems.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Item</label>}
                    <input
                      type="text"
                      value={row.item}
                      onChange={(e) => updateBomItem(idx, 'item', e.target.value)}
                      placeholder="Item name"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Qty</label>}
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) => updateBomItem(idx, 'qty', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Unit</label>}
                    <select
                      value={row.unit}
                      onChange={(e) => updateBomItem(idx, 'unit', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Unit</option>
                      <option value="kg">kg</option>
                      <option value="L">L</option>
                      <option value="pcs">pcs</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Unit Cost (₹)</label>}
                    <input
                      type="number"
                      value={row.unitCost}
                      onChange={(e) => updateBomItem(idx, 'unitCost', e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && <label className="block text-xs text-gray-500 mb-1">Wastage %</label>}
                    <input
                      type="number"
                      value={row.wastage}
                      onChange={(e) => updateBomItem(idx, 'wastage', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {bomItems.length > 1 && (
                      <button
                        onClick={() => removeBomItemRow(idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labor & Overhead */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Labor Cost (₹)"
              value={bomForm.laborCost}
              onChange={(e) => setBomForm({ ...bomForm, laborCost: e.target.value })}
              placeholder="e.g., 200"
              type="number"
            />
            <TextInput
              label="Overhead Cost (₹)"
              value={bomForm.overheadCost}
              onChange={(e) => setBomForm({ ...bomForm, overheadCost: e.target.value })}
              placeholder="e.g., 120"
              type="number"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowAddBOM(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddBOM}>
              Create BOM
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Add Production Order Modal ────────────────────────────────── */}
      <Modal
        isOpen={showAddPO}
        onClose={() => setShowAddPO(false)}
        title="Create Production Order"
        size="md"
      >
        <div className="space-y-4">
          <SelectInput
            label="Bill of Materials"
            value={poForm.bomId}
            onChange={(e) => setPoForm({ ...poForm, bomId: e.target.value })}
            placeholder="Select BOM"
            required
            options={mockBOMs
              .filter((b) => b.status === 'Active')
              .map((b) => ({
                value: b.id,
                label: `${b.bomNumber} - ${b.product} (${b.outputQty})`,
              }))}
          />
          <TextInput
            label="Quantity"
            value={poForm.quantity}
            onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })}
            placeholder="e.g., 50"
            type="number"
            required
          />
          <TextInput
            label="Planned Date"
            value={poForm.plannedDate}
            onChange={(e) => setPoForm({ ...poForm, plannedDate: e.target.value })}
            type="date"
            required
          />
          <TextInput
            label="Batch Number"
            value={poForm.batchNumber}
            onChange={(e) => setPoForm({ ...poForm, batchNumber: e.target.value })}
            placeholder="e.g., BTH-20260301-001"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowAddPO(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPO}>
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
