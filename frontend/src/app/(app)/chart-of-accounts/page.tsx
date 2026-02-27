'use client';

import { useState, useMemo } from 'react';
import { Modal, Badge, Button, Tabs, TextInput, SelectInput, TextArea } from '@/components/ui';

/* ─── Types ──────────────────────────────────────────────────────── */

type AccountType = 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
type AccountStatus = 'Active' | 'Inactive';

interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subType: string;
  balance: number;
  status: AccountStatus;
  parentId: string | null;
  description: string;
}

/* ─── Mock Data ──────────────────────────────────────────────────── */

const ACCOUNTS: Account[] = [
  // ASSETS
  { id: 'a1', code: '1000', name: 'Cash on Hand', type: 'Assets', subType: 'Current Asset', balance: 185400, status: 'Active', parentId: null, description: 'Petty cash and register cash across all outlets' },
  { id: 'a2', code: '1010', name: 'HDFC Bank', type: 'Assets', subType: 'Current Asset', balance: 1247830, status: 'Active', parentId: null, description: 'HDFC Bank current account for daily operations' },
  { id: 'a3', code: '1020', name: 'ICICI Bank', type: 'Assets', subType: 'Current Asset', balance: 832500, status: 'Active', parentId: null, description: 'ICICI Bank savings account for reserves' },
  { id: 'a4', code: '1100', name: 'Accounts Receivable', type: 'Assets', subType: 'Current Asset', balance: 456200, status: 'Active', parentId: null, description: 'Outstanding payments from corporate clients and aggregators' },
  { id: 'a5', code: '1200', name: 'Food Inventory', type: 'Assets', subType: 'Inventory', balance: 328750, status: 'Active', parentId: null, description: 'Raw food materials and ingredients stock' },
  { id: 'a6', code: '1210', name: 'Beverage Inventory', type: 'Assets', subType: 'Inventory', balance: 215600, status: 'Active', parentId: 'a5', description: 'Beverage and drink stocks including soft drinks and juices' },
  { id: 'a7', code: '1220', name: 'Packaging Inventory', type: 'Assets', subType: 'Inventory', balance: 87300, status: 'Active', parentId: 'a5', description: 'Takeaway containers, bags, and packaging materials' },
  { id: 'a8', code: '1300', name: 'Kitchen Equipment', type: 'Assets', subType: 'Fixed Asset', balance: 1450000, status: 'Active', parentId: null, description: 'Commercial ovens, fryers, grills, and refrigeration units' },
  { id: 'a9', code: '1310', name: 'Furniture & Fixtures', type: 'Assets', subType: 'Fixed Asset', balance: 875000, status: 'Active', parentId: 'a8', description: 'Dining tables, chairs, bar counters, and interior fixtures' },

  // LIABILITIES
  { id: 'l1', code: '2000', name: 'Accounts Payable', type: 'Liabilities', subType: 'Current Liability', balance: 534200, status: 'Active', parentId: null, description: 'Outstanding payments to food and beverage suppliers' },
  { id: 'l2', code: '2100', name: 'GST Payable', type: 'Liabilities', subType: 'Tax Liability', balance: 189750, status: 'Active', parentId: null, description: 'Goods & Services Tax collected and payable to government' },
  { id: 'l3', code: '2110', name: 'TDS Payable', type: 'Liabilities', subType: 'Tax Liability', balance: 67800, status: 'Active', parentId: 'l2', description: 'Tax Deducted at Source on salaries and vendor payments' },
  { id: 'l4', code: '2200', name: 'Salary Payable', type: 'Liabilities', subType: 'Current Liability', balance: 412000, status: 'Active', parentId: null, description: 'Accrued salaries and wages for current period' },
  { id: 'l5', code: '2300', name: 'Rent Payable', type: 'Liabilities', subType: 'Current Liability', balance: 175000, status: 'Active', parentId: null, description: 'Outstanding rent for restaurant and kitchen premises' },

  // EQUITY
  { id: 'e1', code: '3000', name: "Owner's Capital", type: 'Equity', subType: 'Capital', balance: 3500000, status: 'Active', parentId: null, description: 'Capital invested by the business owner' },
  { id: 'e2', code: '3100', name: 'Retained Earnings', type: 'Equity', subType: 'Retained Earnings', balance: 1285430, status: 'Active', parentId: null, description: 'Accumulated profits retained in the business' },

  // REVENUE
  { id: 'r1', code: '4000', name: 'Dine-in Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 2845600, status: 'Active', parentId: null, description: 'Revenue from dine-in customers across all outlets' },
  { id: 'r2', code: '4010', name: 'Delivery Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 1567800, status: 'Active', parentId: 'r1', description: 'Revenue from direct delivery orders' },
  { id: 'r3', code: '4020', name: 'Takeaway Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 723400, status: 'Active', parentId: 'r1', description: 'Revenue from takeaway and pickup orders' },
  { id: 'r4', code: '4030', name: 'Aggregator Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 1134500, status: 'Active', parentId: 'r1', description: 'Revenue via Swiggy, Zomato, and other aggregator platforms' },
  { id: 'r5', code: '4040', name: 'Catering Revenue', type: 'Revenue', subType: 'Operating Revenue', balance: 456000, status: 'Active', parentId: null, description: 'Revenue from catering orders and events' },
  { id: 'r6', code: '4100', name: 'Other Income', type: 'Revenue', subType: 'Non-Operating Revenue', balance: 32500, status: 'Active', parentId: null, description: 'Interest income, scrap sale, and miscellaneous revenue' },

  // EXPENSES
  { id: 'x1', code: '5000', name: 'Food Cost', type: 'Expenses', subType: 'Cost of Goods Sold', balance: 1523400, status: 'Active', parentId: null, description: 'Cost of raw food materials consumed' },
  { id: 'x2', code: '5010', name: 'Beverage Cost', type: 'Expenses', subType: 'Cost of Goods Sold', balance: 487200, status: 'Active', parentId: 'x1', description: 'Cost of beverages and drink ingredients consumed' },
  { id: 'x3', code: '5020', name: 'Packaging Cost', type: 'Expenses', subType: 'Cost of Goods Sold', balance: 134500, status: 'Active', parentId: 'x1', description: 'Cost of packaging materials used for delivery and takeaway' },
  { id: 'x4', code: '5100', name: 'Salaries & Wages', type: 'Expenses', subType: 'Operating Expense', balance: 1245000, status: 'Active', parentId: null, description: 'Staff salaries, wages, and overtime payments' },
  { id: 'x5', code: '5200', name: 'Rent Expense', type: 'Expenses', subType: 'Operating Expense', balance: 525000, status: 'Active', parentId: null, description: 'Monthly rent for restaurant and kitchen premises' },
  { id: 'x6', code: '5300', name: 'Utilities', type: 'Expenses', subType: 'Operating Expense', balance: 187500, status: 'Active', parentId: null, description: 'Electricity, water, gas, and internet expenses' },
  { id: 'x7', code: '5400', name: 'Marketing', type: 'Expenses', subType: 'Operating Expense', balance: 145000, status: 'Active', parentId: null, description: 'Social media, promotions, and advertising expenses' },
  { id: 'x8', code: '5500', name: 'Aggregator Commission', type: 'Expenses', subType: 'Operating Expense', balance: 298700, status: 'Active', parentId: null, description: 'Commission paid to Swiggy, Zomato, and other platforms' },
  { id: 'x9', code: '5600', name: 'Depreciation', type: 'Expenses', subType: 'Non-Cash Expense', balance: 232500, status: 'Active', parentId: null, description: 'Depreciation on kitchen equipment and fixtures' },
];

/* ─── Helpers ────────────────────────────────────────────────────── */

const ACCOUNT_TYPES: AccountType[] = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];

const SUB_TYPES: Record<AccountType, string[]> = {
  Assets: ['Current Asset', 'Inventory', 'Fixed Asset', 'Intangible Asset'],
  Liabilities: ['Current Liability', 'Tax Liability', 'Long-Term Liability'],
  Equity: ['Capital', 'Retained Earnings', 'Drawings'],
  Revenue: ['Operating Revenue', 'Non-Operating Revenue'],
  Expenses: ['Cost of Goods Sold', 'Operating Expense', 'Non-Cash Expense'],
};

const TYPE_BADGE_VARIANT: Record<AccountType, 'info' | 'danger' | 'purple' | 'success' | 'warning'> = {
  Assets: 'info',
  Liabilities: 'danger',
  Equity: 'purple',
  Revenue: 'success',
  Expenses: 'warning',
};

function formatINR(amount: number): string {
  const formatted = amount.toLocaleString('en-IN');
  return `\u20B9${formatted}`;
}

const EMPTY_FORM = {
  code: '',
  name: '',
  type: '' as AccountType | '',
  subType: '',
  parentId: '',
  description: '',
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Assets: true,
    Liabilities: true,
    Equity: true,
    Revenue: true,
    Expenses: true,
  });

  /* ── Tab definitions ────────────────────────────────────────────── */

  const tabs = useMemo(() => {
    const countByType = accounts.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'all', label: 'All', count: accounts.length },
      ...ACCOUNT_TYPES.map((t) => ({ id: t, label: t, count: countByType[t] || 0 })),
    ];
  }, [accounts]);

  /* ── Filtered accounts ──────────────────────────────────────────── */

  const filteredAccounts = useMemo(() => {
    let result = accounts;

    if (activeTab !== 'all') {
      result = result.filter((a) => a.type === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.subType.toLowerCase().includes(q)
      );
    }

    return result;
  }, [accounts, activeTab, search]);

  /* ── Build tree structure ───────────────────────────────────────── */

  const accountTree = useMemo(() => {
    const grouped: Record<string, Account[]> = {};
    ACCOUNT_TYPES.forEach((t) => {
      grouped[t] = [];
    });

    const typeAccounts = filteredAccounts.reduce<Record<string, Account[]>>((acc, a) => {
      if (!acc[a.type]) acc[a.type] = [];
      acc[a.type].push(a);
      return acc;
    }, {});

    // For each type, build parent-children tree
    const tree: Record<string, { account: Account; children: Account[] }[]> = {};

    for (const type of ACCOUNT_TYPES) {
      const accts = typeAccounts[type] || [];
      const parentAccounts = accts.filter((a) => !a.parentId);
      const childAccounts = accts.filter((a) => a.parentId);

      tree[type] = parentAccounts.map((parent) => ({
        account: parent,
        children: childAccounts.filter((c) => c.parentId === parent.id),
      }));

      // Add orphan children (whose parent is filtered out) as top-level
      const assignedChildIds = new Set(
        parentAccounts.flatMap((p) =>
          childAccounts.filter((c) => c.parentId === p.id).map((c) => c.id)
        )
      );
      const orphans = childAccounts.filter((c) => !assignedChildIds.has(c.id));
      orphans.forEach((o) => {
        tree[type].push({ account: o, children: [] });
      });
    }

    return tree;
  }, [filteredAccounts]);

  /* ── Totals by type ────────────────────────────────────────────── */

  const typeTotals = useMemo(() => {
    return ACCOUNT_TYPES.reduce<Record<string, number>>((acc, type) => {
      acc[type] = accounts
        .filter((a: Account) => a.type === type)
        .reduce((sum: number, a: Account) => sum + a.balance, 0);
      return acc;
    }, {});
  }, [accounts]);

  /* ── Modal handlers ─────────────────────────────────────────────── */

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(account: Account) {
    setEditingId(account.id);
    setForm({
      code: account.code,
      name: account.name,
      type: account.type,
      subType: account.subType,
      parentId: account.parentId || '',
      description: account.description,
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.code || !form.name || !form.type) return;

    if (editingId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                code: form.code,
                name: form.name,
                type: form.type as AccountType,
                subType: form.subType,
                parentId: form.parentId || null,
                description: form.description,
              }
            : a
        )
      );
    } else {
      const newAccount: Account = {
        id: `new-${Date.now()}`,
        code: form.code,
        name: form.name,
        type: form.type as AccountType,
        subType: form.subType,
        balance: 0,
        status: 'Active',
        parentId: form.parentId || null,
        description: form.description,
      };
      setAccounts((prev) => [...prev, newAccount]);
    }

    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function toggleGroup(type: string) {
    setExpandedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  /* ── Parent account options for the form ────────────────────────── */

  const parentOptions = useMemo(() => {
    if (!form.type) return [];
    return accounts
      .filter((a) => a.type === form.type && a.id !== editingId && !a.parentId)
      .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }));
  }, [accounts, form.type, editingId]);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-500 mt-1">
            Manage your F&B accounting structure with {accounts.length} accounts
          </p>
        </div>
        <Button onClick={openAddModal}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {ACCOUNT_TYPES.map((type) => (
          <div
            key={type}
            className={`bg-white rounded-xl border border-gray-200 p-4 cursor-pointer transition-all duration-150 hover:shadow-md ${
              activeTab === type ? 'ring-2 ring-indigo-500 border-indigo-500' : ''
            }`}
            onClick={() => setActiveTab(activeTab === type ? 'all' : type)}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={TYPE_BADGE_VARIANT[type]}>{type}</Badge>
              <span className="text-xs text-gray-400">
                {accounts.filter((a) => a.type === type).length}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatINR(typeTotals[type])}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 pt-4 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          <div className="pb-3 sm:pb-0 sm:mb-[-1px]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150"
              />
            </div>
          </div>
        </div>

        {/* Tree-style Table */}
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-40">
                  Sub-Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-36">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(() => {
                const typesToShow =
                  activeTab === 'all'
                    ? ACCOUNT_TYPES
                    : ACCOUNT_TYPES.filter((t) => t === activeTab);

                const hasResults = typesToShow.some(
                  (type) => accountTree[type] && accountTree[type].length > 0
                );

                if (!hasResults) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No accounts found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </td>
                    </tr>
                  );
                }

                return typesToShow.map((type) => {
                  const items = accountTree[type] || [];
                  if (items.length === 0) return null;
                  const isExpanded = expandedGroups[type] !== false;

                  return (
                    <GroupSection
                      key={type}
                      type={type}
                      items={items}
                      isExpanded={isExpanded}
                      onToggle={() => toggleGroup(type)}
                      onEdit={openEditModal}
                      total={typeTotals[type]}
                    />
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {search.trim() && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Showing {filteredAccounts.length} of {accounts.length} account
              {accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm(EMPTY_FORM);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Account' : 'Add New Account'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Account Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. 1000"
              required
            />
            <TextInput
              label="Account Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cash on Hand"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as AccountType, subType: '', parentId: '' })
              }
              options={ACCOUNT_TYPES.map((t) => ({ value: t, label: t }))}
              placeholder="Select account type"
              required
            />
            <SelectInput
              label="Sub-Type"
              value={form.subType}
              onChange={(e) => setForm({ ...form, subType: e.target.value })}
              options={
                form.type
                  ? SUB_TYPES[form.type as AccountType].map((s) => ({ value: s, label: s }))
                  : []
              }
              placeholder="Select sub-type"
              disabled={!form.type}
            />
          </div>

          <SelectInput
            label="Parent Account"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            options={[{ value: '', label: 'None (Top-level account)' }, ...parentOptions]}
            placeholder="Select parent account (optional)"
            disabled={!form.type}
          />

          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this account..."
            rows={3}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setForm(EMPTY_FORM);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.code || !form.name || !form.type}
            >
              {editingId ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Group Section Sub-Component ────────────────────────────────── */

function GroupSection({
  type,
  items,
  isExpanded,
  onToggle,
  onEdit,
  total,
}: {
  type: AccountType;
  items: { account: Account; children: Account[] }[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (account: Account) => void;
  total: number;
}) {
  return (
    <>
      {/* Group Header */}
      <tr
        className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-100"
        onClick={onToggle}
      >
        <td colSpan={5} className="px-6 py-3">
          <div className="flex items-center gap-3">
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Badge variant={TYPE_BADGE_VARIANT[type]}>{type}</Badge>
            <span className="text-sm text-gray-500">
              {items.reduce((c, i) => c + 1 + i.children.length, 0)} accounts
            </span>
          </div>
        </td>
        <td className="px-6 py-3 text-right font-mono text-sm font-semibold text-gray-700">
          {formatINR(total)}
        </td>
        <td></td>
      </tr>

      {/* Account Rows */}
      {isExpanded &&
        items.map(({ account, children }) => (
          <AccountRows
            key={account.id}
            account={account}
            children={children}
            onEdit={onEdit}
            depth={0}
          />
        ))}
    </>
  );
}

/* ─── Account Row Sub-Component ──────────────────────────────────── */

function AccountRows({
  account,
  children,
  onEdit,
  depth,
}: {
  account: Account;
  children: Account[];
  onEdit: (account: Account) => void;
  depth: number;
}) {
  return (
    <>
      <tr className="hover:bg-indigo-50/40 transition-colors duration-100">
        <td className="px-6 py-3 font-mono text-sm text-gray-600">{account.code}</td>
        <td className="px-6 py-3">
          <div className="flex items-center">
            {depth === 0 && children.length > 0 && (
              <span className="mr-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </span>
            )}
            <span className="text-sm font-medium text-gray-900">{account.name}</span>
          </div>
          {account.description && (
            <p className="text-xs text-gray-400 mt-0.5 ml-0">{account.description}</p>
          )}
        </td>
        <td className="px-6 py-3">
          <Badge variant={TYPE_BADGE_VARIANT[account.type]}>{account.type}</Badge>
        </td>
        <td className="px-6 py-3 text-xs text-gray-500">{account.subType}</td>
        <td className="px-6 py-3 text-right font-mono text-sm font-medium text-gray-900">
          {formatINR(account.balance)}
        </td>
        <td className="px-6 py-3 text-center">
          <Badge variant={account.status === 'Active' ? 'success' : 'default'}>
            {account.status}
          </Badge>
        </td>
        <td className="px-6 py-3 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(account);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
            title="Edit account"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        </td>
      </tr>

      {/* Child Accounts (indented) */}
      {children.map((child) => (
        <tr key={child.id} className="hover:bg-indigo-50/40 transition-colors duration-100 bg-gray-50/30">
          <td className="px-6 py-2.5 font-mono text-sm text-gray-500">{child.code}</td>
          <td className="px-6 py-2.5">
            <div className="flex items-center pl-8">
              <span className="mr-2 text-gray-300">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 0v8h8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm text-gray-700">{child.name}</span>
            </div>
          </td>
          <td className="px-6 py-2.5">
            <Badge variant={TYPE_BADGE_VARIANT[child.type]}>{child.type}</Badge>
          </td>
          <td className="px-6 py-2.5 text-xs text-gray-500">{child.subType}</td>
          <td className="px-6 py-2.5 text-right font-mono text-sm text-gray-700">
            {formatINR(child.balance)}
          </td>
          <td className="px-6 py-2.5 text-center">
            <Badge variant={child.status === 'Active' ? 'success' : 'default'}>
              {child.status}
            </Badge>
          </td>
          <td className="px-6 py-2.5 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(child);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
              title="Edit account"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
