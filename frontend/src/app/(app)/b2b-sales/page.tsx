'use client';

import React, { useState } from 'react';
import {
  Modal,
  Badge,
  Button,
  Tabs,
  DataTable,
  StatCard,
  TextInput,
  SelectInput,
  TextArea,
} from '@/components/ui';
import type { Column } from '@/components/ui';

/* ─── Currency Formatter ─────────────────────────────────────────── */

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/* ─── Types ──────────────────────────────────────────────────────── */

interface SalesOrderItem {
  product: string;
  qty: number;
  unit: string;
  unitPrice: number;
  gstPercent: number;
  amount: number;
}

interface SalesOrder {
  id: string;
  orderNo: string;
  customer: string;
  customerId: string;
  date: string;
  deliveryDate: string;
  itemsCount: number;
  amount: number;
  status: string;
  items: SalesOrderItem[];
  deliveryAddress: string;
  route: string;
  ewayBill: string;
  notes: string;
  contactPerson: string;
  customerGSTIN: string;
}

interface B2BCustomer {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  outstanding: number;
  creditLimit: number;
  creditDays: number;
  city: string;
  state: string;
  address: string;
}

interface PriceListItem {
  product: string;
  unit: string;
  standardPrice: number;
  moq: number;
}

interface CustomerPricing {
  customer: string;
  product: string;
  specialPrice: number;
  standardPrice: number;
  discount: string;
}

interface DeliverySchedule {
  orderNo: string;
  customer: string;
  deliveryDate: string;
  route: string;
  status: string;
  ewayBill: string;
  itemsCount: number;
}

/* ─── Inline Mock Data ───────────────────────────────────────────── */

const mockSalesOrders: SalesOrder[] = [
  {
    id: 'so-1',
    orderNo: 'SO-2026-001',
    customer: 'Hotel Grand Palace',
    customerId: 'cust-1',
    date: '2026-02-20',
    deliveryDate: '2026-02-22',
    itemsCount: 5,
    amount: 245000,
    status: 'Delivered',
    items: [
      { product: 'Paneer Tikka (Bulk)', qty: 50, unit: 'kg', unitPrice: 520, gstPercent: 12, amount: 29120 },
      { product: 'Butter Chicken Gravy', qty: 40, unit: 'kg', unitPrice: 380, gstPercent: 12, amount: 17024 },
      { product: 'Dal Makhani', qty: 30, unit: 'kg', unitPrice: 220, gstPercent: 12, amount: 7392 },
      { product: 'Assorted Naan', qty: 500, unit: 'pcs', unitPrice: 18, gstPercent: 5, amount: 9450 },
      { product: 'Gulab Jamun', qty: 200, unit: 'pcs', unitPrice: 25, gstPercent: 12, amount: 5600 },
    ],
    deliveryAddress: '42, MG Road, Bangalore - 560001',
    route: 'Route A - South Bangalore',
    ewayBill: 'EWB-2026-4521',
    notes: 'Wedding banquet order - priority delivery',
    contactPerson: 'Rajesh Kumar',
    customerGSTIN: '29AADCH1234F1ZH',
  },
  {
    id: 'so-2',
    orderNo: 'SO-2026-002',
    customer: 'Spice Garden Restaurant',
    customerId: 'cust-2',
    date: '2026-02-22',
    deliveryDate: '2026-02-24',
    itemsCount: 4,
    amount: 128500,
    status: 'Invoiced',
    items: [
      { product: 'Chicken Biryani Mix', qty: 25, unit: 'kg', unitPrice: 650, gstPercent: 12, amount: 18200 },
      { product: 'Tandoori Marinade', qty: 20, unit: 'kg', unitPrice: 340, gstPercent: 18, amount: 8024 },
      { product: 'Raita Mix', qty: 15, unit: 'kg', unitPrice: 180, gstPercent: 12, amount: 3024 },
      { product: 'Basmati Rice (Aged)', qty: 100, unit: 'kg', unitPrice: 120, gstPercent: 5, amount: 12600 },
    ],
    deliveryAddress: '15, Brigade Road, Bangalore - 560025',
    route: 'Route B - Central Bangalore',
    ewayBill: 'EWB-2026-4535',
    notes: 'Weekly standing order',
    contactPerson: 'Priya Sharma',
    customerGSTIN: '29AABCS5678G1ZK',
  },
  {
    id: 'so-3',
    orderNo: 'SO-2026-003',
    customer: 'Royal Caterers',
    customerId: 'cust-3',
    date: '2026-02-24',
    deliveryDate: '2026-02-27',
    itemsCount: 6,
    amount: 385000,
    status: 'In Production',
    items: [
      { product: 'Paneer Tikka (Bulk)', qty: 80, unit: 'kg', unitPrice: 500, gstPercent: 12, amount: 44800 },
      { product: 'Butter Chicken Gravy', qty: 60, unit: 'kg', unitPrice: 370, gstPercent: 12, amount: 24864 },
      { product: 'Veg Biryani Mix', qty: 50, unit: 'kg', unitPrice: 280, gstPercent: 12, amount: 15680 },
      { product: 'Assorted Naan', qty: 1000, unit: 'pcs', unitPrice: 16, gstPercent: 5, amount: 16800 },
      { product: 'Gulab Jamun', qty: 500, unit: 'pcs', unitPrice: 22, gstPercent: 12, amount: 12320 },
      { product: 'Raita Mix', qty: 30, unit: 'kg', unitPrice: 175, gstPercent: 12, amount: 5880 },
    ],
    deliveryAddress: '88, Residency Road, Bangalore - 560025',
    route: 'Route A - South Bangalore',
    ewayBill: '',
    notes: 'Corporate event - 500 pax',
    contactPerson: 'Mohammed Irfan',
    customerGSTIN: '29AABCR9012H1ZP',
  },
  {
    id: 'so-4',
    orderNo: 'SO-2026-004',
    customer: 'Metro Supermart',
    customerId: 'cust-4',
    date: '2026-02-25',
    deliveryDate: '2026-02-28',
    itemsCount: 3,
    amount: 92000,
    status: 'Confirmed',
    items: [
      { product: 'Ready-to-Eat Paneer Butter Masala', qty: 200, unit: 'pcs', unitPrice: 180, gstPercent: 12, amount: 40320 },
      { product: 'Ready-to-Eat Dal Makhani', qty: 150, unit: 'pcs', unitPrice: 150, gstPercent: 12, amount: 25200 },
      { product: 'Frozen Kebab Pack', qty: 100, unit: 'pcs', unitPrice: 250, gstPercent: 12, amount: 28000 },
    ],
    deliveryAddress: '22, Koramangala 4th Block, Bangalore - 560034',
    route: 'Route C - East Bangalore',
    ewayBill: '',
    notes: 'Monthly retail supply',
    contactPerson: 'Anita Desai',
    customerGSTIN: '29AABCM3456J1ZR',
  },
  {
    id: 'so-5',
    orderNo: 'SO-2026-005',
    customer: 'Taj Residency',
    customerId: 'cust-5',
    date: '2026-02-25',
    deliveryDate: '2026-03-01',
    itemsCount: 4,
    amount: 178000,
    status: 'Draft',
    items: [
      { product: 'Paneer Tikka (Bulk)', qty: 40, unit: 'kg', unitPrice: 530, gstPercent: 12, amount: 23744 },
      { product: 'Chicken Biryani Mix', qty: 35, unit: 'kg', unitPrice: 660, gstPercent: 12, amount: 25872 },
      { product: 'Assorted Naan', qty: 800, unit: 'pcs', unitPrice: 18, gstPercent: 5, amount: 15120 },
      { product: 'Special Dessert Platter', qty: 100, unit: 'pcs', unitPrice: 350, gstPercent: 12, amount: 39200 },
    ],
    deliveryAddress: '1, Palace Road, Bangalore - 560001',
    route: 'Route A - South Bangalore',
    ewayBill: '',
    notes: 'Luxury banquet requirements',
    contactPerson: 'Sunil Menon',
    customerGSTIN: '29AADCT7890K1ZT',
  },
  {
    id: 'so-6',
    orderNo: 'SO-2026-006',
    customer: 'Annapurna Mess Chain',
    customerId: 'cust-6',
    date: '2026-02-23',
    deliveryDate: '2026-02-25',
    itemsCount: 3,
    amount: 56000,
    status: 'Dispatched',
    items: [
      { product: 'Dal Makhani', qty: 40, unit: 'kg', unitPrice: 210, gstPercent: 12, amount: 9408 },
      { product: 'Veg Biryani Mix', qty: 50, unit: 'kg', unitPrice: 270, gstPercent: 12, amount: 15120 },
      { product: 'Assorted Naan', qty: 600, unit: 'pcs', unitPrice: 15, gstPercent: 5, amount: 9450 },
    ],
    deliveryAddress: '55, Jayanagar 9th Block, Bangalore - 560041',
    route: 'Route B - Central Bangalore',
    ewayBill: 'EWB-2026-4580',
    notes: 'Regular weekly supply',
    contactPerson: 'Lakshmi Devi',
    customerGSTIN: '29AABCA2345L1ZV',
  },
  {
    id: 'so-7',
    orderNo: 'SO-2026-007',
    customer: 'Hotel Grand Palace',
    customerId: 'cust-1',
    date: '2026-02-26',
    deliveryDate: '2026-02-28',
    itemsCount: 5,
    amount: 215000,
    status: 'Confirmed',
    items: [
      { product: 'Butter Chicken Gravy', qty: 50, unit: 'kg', unitPrice: 380, gstPercent: 12, amount: 21280 },
      { product: 'Paneer Tikka (Bulk)', qty: 45, unit: 'kg', unitPrice: 520, gstPercent: 12, amount: 26208 },
      { product: 'Chicken Biryani Mix', qty: 30, unit: 'kg', unitPrice: 650, gstPercent: 12, amount: 21840 },
      { product: 'Gulab Jamun', qty: 300, unit: 'pcs', unitPrice: 25, gstPercent: 12, amount: 8400 },
      { product: 'Basmati Rice (Aged)', qty: 75, unit: 'kg', unitPrice: 120, gstPercent: 5, amount: 9450 },
    ],
    deliveryAddress: '42, MG Road, Bangalore - 560001',
    route: 'Route A - South Bangalore',
    ewayBill: '',
    notes: 'Conference catering - 300 pax',
    contactPerson: 'Rajesh Kumar',
    customerGSTIN: '29AADCH1234F1ZH',
  },
  {
    id: 'so-8',
    orderNo: 'SO-2026-008',
    customer: 'Spice Garden Restaurant',
    customerId: 'cust-2',
    date: '2026-02-21',
    deliveryDate: '2026-02-23',
    itemsCount: 3,
    amount: 67500,
    status: 'Cancelled',
    items: [
      { product: 'Tandoori Marinade', qty: 25, unit: 'kg', unitPrice: 340, gstPercent: 18, amount: 10030 },
      { product: 'Butter Chicken Gravy', qty: 20, unit: 'kg', unitPrice: 380, gstPercent: 12, amount: 8512 },
      { product: 'Dal Makhani', qty: 15, unit: 'kg', unitPrice: 220, gstPercent: 12, amount: 3696 },
    ],
    deliveryAddress: '15, Brigade Road, Bangalore - 560025',
    route: 'Route B - Central Bangalore',
    ewayBill: '',
    notes: 'Cancelled due to event postponement',
    contactPerson: 'Priya Sharma',
    customerGSTIN: '29AABCS5678G1ZK',
  },
];

const mockCustomers: B2BCustomer[] = [
  {
    id: 'cust-1',
    name: 'Hotel Grand Palace',
    type: 'Hotel',
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@grandpalace.in',
    phone: '9876543210',
    gstin: '29AADCH1234F1ZH',
    outstanding: 145000,
    creditLimit: 500000,
    creditDays: 30,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '42, MG Road, Bangalore - 560001',
  },
  {
    id: 'cust-2',
    name: 'Spice Garden Restaurant',
    type: 'Restaurant',
    contactPerson: 'Priya Sharma',
    email: 'priya@spicegarden.in',
    phone: '9876543211',
    gstin: '29AABCS5678G1ZK',
    outstanding: 62000,
    creditLimit: 200000,
    creditDays: 15,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '15, Brigade Road, Bangalore - 560025',
  },
  {
    id: 'cust-3',
    name: 'Royal Caterers',
    type: 'Caterer',
    contactPerson: 'Mohammed Irfan',
    email: 'irfan@royalcaterers.in',
    phone: '9876543212',
    gstin: '29AABCR9012H1ZP',
    outstanding: 85000,
    creditLimit: 400000,
    creditDays: 21,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '88, Residency Road, Bangalore - 560025',
  },
  {
    id: 'cust-4',
    name: 'Metro Supermart',
    type: 'Retailer',
    contactPerson: 'Anita Desai',
    email: 'anita@metrosupermart.in',
    phone: '9876543213',
    gstin: '29AABCM3456J1ZR',
    outstanding: 42000,
    creditLimit: 150000,
    creditDays: 7,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '22, Koramangala 4th Block, Bangalore - 560034',
  },
  {
    id: 'cust-5',
    name: 'Taj Residency',
    type: 'Hotel',
    contactPerson: 'Sunil Menon',
    email: 'sunil@tajresidency.in',
    phone: '9876543214',
    gstin: '29AADCT7890K1ZT',
    outstanding: 28000,
    creditLimit: 600000,
    creditDays: 30,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '1, Palace Road, Bangalore - 560001',
  },
  {
    id: 'cust-6',
    name: 'Annapurna Mess Chain',
    type: 'Institution',
    contactPerson: 'Lakshmi Devi',
    email: 'lakshmi@annapurna.in',
    phone: '9876543215',
    gstin: '29AABCA2345L1ZV',
    outstanding: 20000,
    creditLimit: 100000,
    creditDays: 10,
    city: 'Bangalore',
    state: 'Karnataka',
    address: '55, Jayanagar 9th Block, Bangalore - 560041',
  },
];

const mockPriceList: PriceListItem[] = [
  { product: 'Paneer Tikka (Bulk)', unit: 'kg', standardPrice: 520, moq: 10 },
  { product: 'Butter Chicken Gravy', unit: 'kg', standardPrice: 380, moq: 10 },
  { product: 'Chicken Biryani Mix', unit: 'kg', standardPrice: 650, moq: 10 },
  { product: 'Dal Makhani', unit: 'kg', standardPrice: 220, moq: 10 },
  { product: 'Veg Biryani Mix', unit: 'kg', standardPrice: 280, moq: 10 },
  { product: 'Tandoori Marinade', unit: 'kg', standardPrice: 340, moq: 5 },
  { product: 'Raita Mix', unit: 'kg', standardPrice: 180, moq: 5 },
  { product: 'Assorted Naan', unit: 'pcs', standardPrice: 18, moq: 100 },
  { product: 'Gulab Jamun', unit: 'pcs', standardPrice: 25, moq: 50 },
  { product: 'Basmati Rice (Aged)', unit: 'kg', standardPrice: 120, moq: 25 },
  { product: 'Ready-to-Eat Paneer Butter Masala', unit: 'pcs', standardPrice: 180, moq: 50 },
  { product: 'Ready-to-Eat Dal Makhani', unit: 'pcs', standardPrice: 150, moq: 50 },
  { product: 'Frozen Kebab Pack', unit: 'pcs', standardPrice: 250, moq: 25 },
  { product: 'Special Dessert Platter', unit: 'pcs', standardPrice: 350, moq: 20 },
];

const mockCustomerPricing: CustomerPricing[] = [
  { customer: 'Hotel Grand Palace', product: 'Paneer Tikka (Bulk)', specialPrice: 500, standardPrice: 520, discount: '3.8%' },
  { customer: 'Hotel Grand Palace', product: 'Butter Chicken Gravy', specialPrice: 370, standardPrice: 380, discount: '2.6%' },
  { customer: 'Royal Caterers', product: 'Paneer Tikka (Bulk)', specialPrice: 500, standardPrice: 520, discount: '3.8%' },
  { customer: 'Royal Caterers', product: 'Assorted Naan', specialPrice: 16, standardPrice: 18, discount: '11.1%' },
  { customer: 'Royal Caterers', product: 'Gulab Jamun', specialPrice: 22, standardPrice: 25, discount: '12.0%' },
  { customer: 'Annapurna Mess Chain', product: 'Dal Makhani', specialPrice: 210, standardPrice: 220, discount: '4.5%' },
  { customer: 'Annapurna Mess Chain', product: 'Veg Biryani Mix', specialPrice: 270, standardPrice: 280, discount: '3.6%' },
  { customer: 'Annapurna Mess Chain', product: 'Assorted Naan', specialPrice: 15, standardPrice: 18, discount: '16.7%' },
];

const mockDeliverySchedule: DeliverySchedule[] = [
  { orderNo: 'SO-2026-003', customer: 'Royal Caterers', deliveryDate: '2026-02-27', route: 'Route A - South Bangalore', status: 'Scheduled', ewayBill: '', itemsCount: 6 },
  { orderNo: 'SO-2026-006', customer: 'Annapurna Mess Chain', deliveryDate: '2026-02-25', route: 'Route B - Central Bangalore', status: 'In Transit', ewayBill: 'EWB-2026-4580', itemsCount: 3 },
  { orderNo: 'SO-2026-004', customer: 'Metro Supermart', deliveryDate: '2026-02-28', route: 'Route C - East Bangalore', status: 'Scheduled', ewayBill: '', itemsCount: 3 },
  { orderNo: 'SO-2026-007', customer: 'Hotel Grand Palace', deliveryDate: '2026-02-28', route: 'Route A - South Bangalore', status: 'Scheduled', ewayBill: '', itemsCount: 5 },
  { orderNo: 'SO-2026-001', customer: 'Hotel Grand Palace', deliveryDate: '2026-02-22', route: 'Route A - South Bangalore', status: 'Delivered', ewayBill: 'EWB-2026-4521', itemsCount: 5 },
  { orderNo: 'SO-2026-002', customer: 'Spice Garden Restaurant', deliveryDate: '2026-02-24', route: 'Route B - Central Bangalore', status: 'Delivered', ewayBill: 'EWB-2026-4535', itemsCount: 4 },
];

/* ─── Status Helpers ─────────────────────────────────────────────── */

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

function getOrderStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Draft: 'default',
    Confirmed: 'info',
    'In Production': 'purple',
    Dispatched: 'warning',
    Delivered: 'success',
    Invoiced: 'success',
    Cancelled: 'danger',
  };
  return map[status] || 'default';
}

function getCustomerTypeVariant(type: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Restaurant: 'info',
    Hotel: 'purple',
    Caterer: 'warning',
    Retailer: 'success',
    Distributor: 'default',
    Institution: 'danger',
  };
  return map[type] || 'default';
}

function getDeliveryStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Scheduled: 'info',
    'In Transit': 'warning',
    Delivered: 'success',
  };
  return map[status] || 'default';
}

/* ─── Tab Definitions ────────────────────────────────────────────── */

const tabList = [
  { id: 'orders', label: 'Sales Orders', count: 8 },
  { id: 'customers', label: 'Customers', count: 6 },
  { id: 'pricelists', label: 'Price Lists' },
  { id: 'delivery', label: 'Delivery', count: 4 },
];

/* ─── New Order Form Item ────────────────────────────────────────── */

interface OrderFormItem {
  product: string;
  qty: string;
  unit: string;
  unitPrice: string;
  gstPercent: string;
}

const emptyOrderItem: OrderFormItem = {
  product: '',
  qty: '',
  unit: 'kg',
  unitPrice: '',
  gstPercent: '12',
};

/* ═══════════════════════════════════════════════════════════════════
   B2B Sales & Distribution Page
   ═══════════════════════════════════════════════════════════════════ */

export default function B2BSalesPage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  /* ── New Order Form State ───────────────────────────────────────── */
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState('');
  const [newOrderDeliveryAddress, setNewOrderDeliveryAddress] = useState('');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<OrderFormItem[]>([{ ...emptyOrderItem }]);

  /* ── New Customer Form State ────────────────────────────────────── */
  const [newCustName, setNewCustName] = useState('');
  const [newCustType, setNewCustType] = useState('');
  const [newCustContact, setNewCustContact] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGSTIN, setNewCustGSTIN] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustState, setNewCustState] = useState('');
  const [newCustCreditDays, setNewCustCreditDays] = useState('');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState('');

  /* ── Order Form Handlers ────────────────────────────────────────── */

  function handleOrderItemChange(index: number, field: keyof OrderFormItem, value: string) {
    setNewOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addOrderItemRow() {
    setNewOrderItems((prev) => [...prev, { ...emptyOrderItem }]);
  }

  function removeOrderItemRow(index: number) {
    setNewOrderItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetOrderForm() {
    setNewOrderCustomer('');
    setNewOrderDeliveryDate('');
    setNewOrderDeliveryAddress('');
    setNewOrderNotes('');
    setNewOrderItems([{ ...emptyOrderItem }]);
  }

  function resetCustomerForm() {
    setNewCustName('');
    setNewCustType('');
    setNewCustContact('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustGSTIN('');
    setNewCustAddress('');
    setNewCustCity('');
    setNewCustState('');
    setNewCustCreditDays('');
    setNewCustCreditLimit('');
  }

  function handleSubmitOrder() {
    // In a real app, this would call an API
    alert('Sales order created successfully!');
    resetOrderForm();
    setShowAddOrderModal(false);
  }

  function handleSubmitCustomer() {
    // In a real app, this would call an API
    alert('Customer created successfully!');
    resetCustomerForm();
    setShowAddCustomerModal(false);
  }

  /* ── Sales Orders Table Columns ─────────────────────────────────── */

  const salesOrderColumns: Column[] = [
    {
      key: 'orderNo',
      label: 'Order #',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-indigo-600">{value as string}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600">
          {new Date(value as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600">
          {new Date(value as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'itemsCount',
      label: 'Items',
      sortable: true,
      render: (value) => <span className="font-mono">{value as number}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-gray-900">{formatINR(value as number)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge variant={getOrderStatusVariant(value as string)}>{value as string}</Badge>,
    },
  ];

  /* ── Customers Table Columns ────────────────────────────────────── */

  const customerColumns: Column[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => <Badge variant={getCustomerTypeVariant(value as string)}>{value as string}</Badge>,
    },
    {
      key: 'contactPerson',
      label: 'Contact',
      render: (_, row) => {
        const r = row as unknown as B2BCustomer;
        return (
          <div>
            <div className="text-sm text-gray-900">{r.contactPerson}</div>
            <div className="text-xs text-gray-500">{r.phone}</div>
          </div>
        );
      },
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      sortable: true,
      render: (value) => (
        <span className={`font-mono font-medium ${(value as number) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatINR(value as number)}
        </span>
      ),
    },
    {
      key: 'creditLimit',
      label: 'Credit Limit',
      sortable: true,
      render: (value) => <span className="font-mono text-gray-700">{formatINR(value as number)}</span>,
    },
    {
      key: 'creditDays',
      label: 'Credit Days',
      sortable: true,
      render: (value) => <span className="text-gray-600">{value as number} days</span>,
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
  ];

  /* ── Price List Table Columns ───────────────────────────────────── */

  const priceListColumns: Column[] = [
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'unit',
      label: 'Unit',
    },
    {
      key: 'standardPrice',
      label: 'Standard Price',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-gray-900">{formatINR(value as number)}</span>,
    },
    {
      key: 'moq',
      label: 'MOQ',
      sortable: true,
      render: (value) => <span className="font-mono text-gray-600">{value as number}</span>,
    },
  ];

  /* ── Customer Pricing Table Columns ─────────────────────────────── */

  const customerPricingColumns: Column[] = [
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'product',
      label: 'Product',
      sortable: true,
    },
    {
      key: 'standardPrice',
      label: 'Standard Price',
      render: (value) => <span className="font-mono text-gray-400 line-through">{formatINR(value as number)}</span>,
    },
    {
      key: 'specialPrice',
      label: 'Special Price',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-green-700">{formatINR(value as number)}</span>,
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (value) => <Badge variant="success">{value as string}</Badge>,
    },
  ];

  /* ── Delivery Table Columns ─────────────────────────────────────── */

  const deliveryColumns: Column[] = [
    {
      key: 'orderNo',
      label: 'Order #',
      sortable: true,
      render: (value) => <span className="font-mono font-medium text-indigo-600">{value as string}</span>,
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value as string}</span>,
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      sortable: true,
      render: (value) => (
        <span className="text-gray-600">
          {new Date(value as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (value) => <span className="text-gray-600 text-xs">{value as string}</span>,
    },
    {
      key: 'itemsCount',
      label: 'Items',
      render: (value) => <span className="font-mono">{value as number}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <Badge variant={getDeliveryStatusVariant(value as string)}>{value as string}</Badge>,
    },
    {
      key: 'ewayBill',
      label: 'E-Way Bill',
      render: (value) => {
        const v = value as string;
        return v ? (
          <span className="font-mono text-xs text-gray-700">{v}</span>
        ) : (
          <span className="text-xs text-gray-400">--</span>
        );
      },
    },
  ];

  /* ── Compute new order totals ───────────────────────────────────── */

  function computeItemAmount(item: OrderFormItem): number {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  }

  function computeItemGST(item: OrderFormItem): number {
    const base = computeItemAmount(item);
    const gst = parseFloat(item.gstPercent) || 0;
    return base * (gst / 100);
  }

  const orderSubtotal = newOrderItems.reduce((sum, item) => sum + computeItemAmount(item), 0);
  const orderGST = newOrderItems.reduce((sum, item) => sum + computeItemGST(item), 0);
  const orderTotal = orderSubtotal + orderGST;

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">B2B Sales &amp; Distribution</h1>
          <p className="text-gray-500 mt-1">Manage bulk orders, customers, pricing and deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowAddCustomerModal(true)}>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              New Customer
            </span>
          </Button>
          <Button variant="primary" onClick={() => setShowAddOrderModal(true)}>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Sales Order
            </span>
          </Button>
        </div>
      </div>

      {/* ─── Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total B2B Revenue"
          value="₹12,45,000"
          subtitle="This month"
          trend={{ direction: 'up', percentage: 18 }}
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Active Customers"
          value="15"
          subtitle="Across all channels"
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Pending Orders"
          value="4"
          subtitle="Awaiting dispatch"
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Outstanding"
          value="₹3,82,000"
          subtitle="From 6 customers"
          trend={{ direction: 'up', percentage: 5 }}
          color="red"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────────── */}
      <Tabs tabs={tabList} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      <div className="mt-4">
        {/* ── Sales Orders Tab ────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sales Orders</h2>
                <p className="text-sm text-gray-500">Click a row to view order details</p>
              </div>
            </div>
            <DataTable
              columns={salesOrderColumns}
              data={mockSalesOrders}
              onRowClick={(row) => setSelectedOrder(row as unknown as SalesOrder)}
              searchable
              searchPlaceholder="Search orders by number, customer, or status..."
            />
          </div>
        )}

        {/* ── Customers Tab ───────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">B2B Customers</h2>
                <p className="text-sm text-gray-500">Manage your business customers and credit terms</p>
              </div>
            </div>
            <DataTable
              columns={customerColumns}
              data={mockCustomers}
              searchable
              searchPlaceholder="Search customers by name, type, or city..."
            />
          </div>
        )}

        {/* ── Price Lists Tab ─────────────────────────────────────────── */}
        {activeTab === 'pricelists' && (
          <div className="space-y-6">
            {/* Standard Price List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Standard Price List</h2>
                <p className="text-sm text-gray-500">Base pricing for all B2B products</p>
              </div>
              <DataTable
                columns={priceListColumns}
                data={mockPriceList}
                searchable
                searchPlaceholder="Search products..."
              />
            </div>

            {/* Customer-Specific Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customer-Specific Pricing</h2>
                <p className="text-sm text-gray-500">Special pricing overrides for specific customers</p>
              </div>
              <DataTable
                columns={customerPricingColumns}
                data={mockCustomerPricing}
                searchable
                searchPlaceholder="Search by customer or product..."
              />
            </div>
          </div>
        )}

        {/* ── Delivery Tab ────────────────────────────────────────────── */}
        {activeTab === 'delivery' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delivery Schedule</h2>
                <p className="text-sm text-gray-500">Track dispatch and delivery of orders</p>
              </div>
            </div>
            <DataTable
              columns={deliveryColumns}
              data={mockDeliverySchedule}
              searchable
              searchPlaceholder="Search by order, customer, or route..."
            />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         Sales Order Detail Modal
         ═══════════════════════════════════════════════════════════════ */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Sales Order - ${selectedOrder.orderNo}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Order Info Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{selectedOrder.orderNo}</h3>
                  <Badge variant={getOrderStatusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{selectedOrder.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatINR(selectedOrder.amount)}</p>
                <p className="text-xs text-gray-500">Total Amount</p>
              </div>
            </div>

            {/* Customer & Date Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Customer</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedOrder.customer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Contact</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedOrder.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Order Date</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Delivery Date</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {new Date(selectedOrder.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* GSTIN */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">GSTIN:</span>
              <span className="font-mono text-gray-900">{selectedOrder.customerGSTIN}</span>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Order Items</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">GST %</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">{item.qty}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono text-gray-700">{formatINR(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">{item.gstPercent}%</td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-medium text-gray-900">{formatINR(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-mono text-gray-900">
                    {formatINR(selectedOrder.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST</span>
                  <span className="font-mono text-gray-900">
                    {formatINR(selectedOrder.items.reduce((sum, item) => sum + (item.qty * item.unitPrice * item.gstPercent / 100), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="font-mono text-gray-900">{formatINR(selectedOrder.amount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-blue-600 uppercase font-medium">Delivery Address</p>
                <p className="text-sm text-gray-900 mt-0.5">{selectedOrder.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase font-medium">Route</p>
                <p className="text-sm text-gray-900 mt-0.5">{selectedOrder.route}</p>
              </div>
              {selectedOrder.ewayBill && (
                <div>
                  <p className="text-xs text-blue-600 uppercase font-medium">E-Way Bill</p>
                  <p className="text-sm font-mono text-gray-900 mt-0.5">{selectedOrder.ewayBill}</p>
                </div>
              )}
              {selectedOrder.notes && (
                <div>
                  <p className="text-xs text-blue-600 uppercase font-medium">Notes</p>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         Add Sales Order Modal
         ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showAddOrderModal}
        onClose={() => {
          setShowAddOrderModal(false);
          resetOrderForm();
        }}
        title="New Sales Order"
        size="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitOrder();
          }}
          className="space-y-6"
        >
          {/* Customer & Delivery Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              label="Customer"
              value={newOrderCustomer}
              onChange={(e) => {
                setNewOrderCustomer(e.target.value);
                const cust = mockCustomers.find((c) => c.id === e.target.value);
                if (cust) setNewOrderDeliveryAddress(cust.address);
              }}
              options={mockCustomers.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Select customer..."
              required
            />
            <TextInput
              label="Delivery Date"
              type="date"
              value={newOrderDeliveryDate}
              onChange={(e) => setNewOrderDeliveryDate(e.target.value)}
              required
            />
          </div>

          {/* Delivery Address */}
          <TextInput
            label="Delivery Address"
            value={newOrderDeliveryAddress}
            onChange={(e) => setNewOrderDeliveryAddress(e.target.value)}
            placeholder="Enter delivery address"
            required
          />

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Order Items</h4>
              <Button variant="ghost" size="sm" onClick={addOrderItemRow}>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </span>
              </Button>
            </div>

            <div className="space-y-3">
              {newOrderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded-lg p-3">
                  <div className="col-span-12 md:col-span-3">
                    <SelectInput
                      label={index === 0 ? 'Product' : undefined}
                      value={item.product}
                      onChange={(e) => {
                        handleOrderItemChange(index, 'product', e.target.value);
                        const pl = mockPriceList.find((p) => p.product === e.target.value);
                        if (pl) {
                          handleOrderItemChange(index, 'unit', pl.unit);
                          handleOrderItemChange(index, 'unitPrice', String(pl.standardPrice));
                        }
                      }}
                      options={mockPriceList.map((p) => ({ value: p.product, label: p.product }))}
                      placeholder="Select..."
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <TextInput
                      label={index === 0 ? 'Qty' : undefined}
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleOrderItemChange(index, 'qty', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <SelectInput
                      label={index === 0 ? 'Unit' : undefined}
                      value={item.unit}
                      onChange={(e) => handleOrderItemChange(index, 'unit', e.target.value)}
                      options={[
                        { value: 'kg', label: 'kg' },
                        { value: 'pcs', label: 'pcs' },
                        { value: 'litre', label: 'litre' },
                        { value: 'box', label: 'box' },
                      ]}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <TextInput
                      label={index === 0 ? 'Unit Price' : undefined}
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleOrderItemChange(index, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <SelectInput
                      label={index === 0 ? 'GST %' : undefined}
                      value={item.gstPercent}
                      onChange={(e) => handleOrderItemChange(index, 'gstPercent', e.target.value)}
                      options={[
                        { value: '0', label: '0%' },
                        { value: '5', label: '5%' },
                        { value: '12', label: '12%' },
                        { value: '18', label: '18%' },
                        { value: '28', label: '28%' },
                      ]}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-1 flex items-end justify-end pb-1">
                    {newOrderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderItemRow(index)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

            {/* Order Totals Summary */}
            {orderSubtotal > 0 && (
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-1.5 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono">{formatINR(orderSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST</span>
                    <span className="font-mono">{formatINR(orderGST)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-1.5">
                    <span>Total</span>
                    <span className="font-mono">{formatINR(orderTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <TextArea
            label="Notes"
            value={newOrderNotes}
            onChange={(e) => setNewOrderNotes(e.target.value)}
            placeholder="Any special instructions or notes..."
            rows={3}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddOrderModal(false);
                resetOrderForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Sales Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
         Add Customer Modal
         ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showAddCustomerModal}
        onClose={() => {
          setShowAddCustomerModal(false);
          resetCustomerForm();
        }}
        title="New B2B Customer"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitCustomer();
          }}
          className="space-y-4"
        >
          {/* Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Business Name"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="Enter business name"
              required
            />
            <SelectInput
              label="Type"
              value={newCustType}
              onChange={(e) => setNewCustType(e.target.value)}
              options={[
                { value: 'Restaurant', label: 'Restaurant' },
                { value: 'Hotel', label: 'Hotel' },
                { value: 'Caterer', label: 'Caterer' },
                { value: 'Retailer', label: 'Retailer' },
                { value: 'Distributor', label: 'Distributor' },
                { value: 'Institution', label: 'Institution' },
              ]}
              placeholder="Select type..."
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="Contact Person"
              value={newCustContact}
              onChange={(e) => setNewCustContact(e.target.value)}
              placeholder="Primary contact name"
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={newCustEmail}
              onChange={(e) => setNewCustEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <TextInput
              label="Phone"
              type="tel"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="10-digit phone number"
              required
            />
          </div>

          {/* GSTIN */}
          <TextInput
            label="GSTIN"
            value={newCustGSTIN}
            onChange={(e) => setNewCustGSTIN(e.target.value)}
            placeholder="22AAAAA0000A1Z5"
            required
          />

          {/* Address */}
          <TextInput
            label="Address"
            value={newCustAddress}
            onChange={(e) => setNewCustAddress(e.target.value)}
            placeholder="Full business address"
            required
          />

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="City"
              value={newCustCity}
              onChange={(e) => setNewCustCity(e.target.value)}
              placeholder="City"
              required
            />
            <TextInput
              label="State"
              value={newCustState}
              onChange={(e) => setNewCustState(e.target.value)}
              placeholder="State"
              required
            />
          </div>

          {/* Credit Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Credit Days"
              type="number"
              value={newCustCreditDays}
              onChange={(e) => setNewCustCreditDays(e.target.value)}
              placeholder="e.g. 30"
            />
            <TextInput
              label="Credit Limit (₹)"
              type="number"
              value={newCustCreditLimit}
              onChange={(e) => setNewCustCreditLimit(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddCustomerModal(false);
                resetCustomerForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
