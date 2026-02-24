'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Table, Badge, StatCard, Spinner } from '@/components/Card';
import { api, formatINR, formatINR2 } from '@/lib/api';

type Tab = 'accounts' | 'journal' | 'trial-balance' | 'balance-sheet' | 'ledger' | 'day-book';

export default function AccountingPage() {
  const [tab, setTab] = useState<Tab>('accounts');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'accounts', label: 'Chart of Accounts' },
    { key: 'journal', label: 'Journal Entries' },
    { key: 'trial-balance', label: 'Trial Balance' },
    { key: 'balance-sheet', label: 'Balance Sheet' },
    { key: 'ledger', label: 'Ledger' },
    { key: 'day-book', label: 'Day Book' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Accounting</h1>
        <p className="text-gray-500 mt-1">Tally-equivalent double-entry accounting system</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'accounts' && <ChartOfAccounts />}
      {tab === 'journal' && <JournalEntries />}
      {tab === 'trial-balance' && <TrialBalance />}
      {tab === 'balance-sheet' && <BalanceSheetView />}
      {tab === 'ledger' && <LedgerView />}
      {tab === 'day-book' && <DayBookView />}
    </div>
  );
}

function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAccounts().then((res) => { setAccounts(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const typeColors: Record<string, string> = {
    ASSET: 'info', LIABILITY: 'danger', EQUITY: 'purple', REVENUE: 'success', EXPENSE: 'warning',
  };

  const grouped = accounts.reduce((acc: Record<string, any[]>, a: any) => {
    (acc[a.type] = acc[a.type] || []).push(a);
    return acc;
  }, {});

  const filtered = filter
    ? accounts.filter((a: any) => a.name.toLowerCase().includes(filter.toLowerCase()) || a.code.includes(filter))
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chart of Accounts</h2>
            <p className="text-sm text-gray-500">{accounts.length} accounts configured</p>
          </div>
          <input
            type="text"
            placeholder="Search accounts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {filtered ? (
          <Table headers={['Code', 'Name', 'Type', 'Sub Type', 'Balance']}>
            {filtered.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm">{a.code}</td>
                <td className="py-3 px-4 font-medium">{a.name}</td>
                <td className="py-3 px-4"><Badge text={a.type} variant={typeColors[a.type]} /></td>
                <td className="py-3 px-4 text-gray-500 text-xs">{a.subType?.replace(/_/g, ' ')}</td>
                <td className="py-3 px-4 text-right font-mono">{formatINR(a.balance || 0)}</td>
              </tr>
            ))}
          </Table>
        ) : (
          Object.entries(grouped).map(([type, accts]) => (
            <div key={type} className="border-b border-gray-100 last:border-b-0">
              <div className="px-6 py-3 bg-gray-50 flex items-center gap-2">
                <Badge text={type} variant={typeColors[type]} />
                <span className="text-sm text-gray-500">{(accts as any[]).length} accounts</span>
              </div>
              <Table headers={['Code', 'Name', 'Sub Type', 'Balance']}>
                {(accts as any[]).map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-mono text-sm">{a.code}</td>
                    <td className="py-2.5 px-4">{a.name}</td>
                    <td className="py-2.5 px-4 text-gray-500 text-xs">{a.subType?.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{a.balance ? formatINR(a.balance) : '-'}</td>
                  </tr>
                ))}
              </Table>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}

function JournalEntries() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.getJournalEntries().then((res) => { setEntries(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Journal Entries</h2>
        <p className="text-sm text-gray-500">{entries.length} entries</p>
      </CardHeader>
      <CardBody className="p-0">
        <Table headers={['#', 'Date', 'Source', 'Description', 'Amount', 'Status']}>
          {entries.map((e: any) => (
            <>
              <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                <td className="py-3 px-4 font-mono text-sm">{e.entryNumber}</td>
                <td className="py-3 px-4">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                <td className="py-3 px-4"><Badge text={e.source} variant="info" /></td>
                <td className="py-3 px-4">{e.description}</td>
                <td className="py-3 px-4 text-right font-mono font-medium">{formatINR(e.totalDebit)}</td>
                <td className="py-3 px-4"><Badge text={e.status} variant={e.status === 'POSTED' ? 'success' : 'default'} /></td>
              </tr>
              {expanded === e.id && (
                <tr key={`${e.id}-lines`}>
                  <td colSpan={6} className="bg-gray-50 px-8 py-4">
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-gray-500"><th className="text-left py-1">Account</th><th className="text-left py-1">Description</th><th className="text-right py-1">Debit</th><th className="text-right py-1">Credit</th></tr></thead>
                      <tbody>
                        {e.lines?.map((l: any, i: number) => (
                          <tr key={i} className="border-t border-gray-200">
                            <td className="py-2 font-mono">{l.accountCode} - {l.accountName}</td>
                            <td className="py-2 text-gray-600">{l.description}</td>
                            <td className="py-2 text-right font-mono">{l.debit > 0 ? formatINR2(l.debit) : '-'}</td>
                            <td className="py-2 text-right font-mono">{l.credit > 0 ? formatINR2(l.credit) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </>
          ))}
        </Table>
      </CardBody>
    </Card>
  );
}

function TrialBalance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrialBalance('2025-26').then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500">No data</p>;

  const accounts = data.accounts || data.lines || [];
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Trial Balance</h2>
        <p className="text-sm text-gray-500">FY 2025-26</p>
      </CardHeader>
      <CardBody className="p-0">
        <Table headers={['Account Code', 'Account Name', 'Type', 'Debit', 'Credit']}>
          {accounts.filter((a: any) => a.debit > 0 || a.credit > 0).map((a: any, i: number) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="py-3 px-4 font-mono">{a.code}</td>
              <td className="py-3 px-4 font-medium">{a.name}</td>
              <td className="py-3 px-4"><Badge text={a.type} variant={a.type === 'EXPENSE' ? 'warning' : a.type === 'LIABILITY' ? 'danger' : 'info'} /></td>
              <td className="py-3 px-4 text-right font-mono">{a.debit > 0 ? formatINR2(a.debit) : '-'}</td>
              <td className="py-3 px-4 text-right font-mono">{a.credit > 0 ? formatINR2(a.credit) : '-'}</td>
            </tr>
          ))}
        </Table>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between font-bold">
          <span>TOTAL</span>
          <div className="flex gap-24">
            <span className="font-mono">{formatINR2(data.totalDebit)}</span>
            <span className="font-mono">{formatINR2(data.totalCredit)}</span>
          </div>
        </div>
        <div className="px-6 py-3 text-center">
          {data.totalDebit === data.totalCredit ? (
            <Badge text="BALANCED" variant="success" />
          ) : (
            <Badge text="UNBALANCED" variant="danger" />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function BalanceSheetView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBalanceSheet(new Date().toISOString().split('T')[0])
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-gray-500">No data</p>;

  const Section = ({ title, section, color }: { title: string; section: any; color: string }) => (
    <Card className="flex-1">
      <CardHeader className={color}>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-white/80 text-2xl font-bold mt-1">{formatINR(section?.total || 0)}</p>
      </CardHeader>
      <CardBody className="p-0">
        {(section?.items || section?.accounts || []).map((a: any, i: number) => (
          <div key={i} className="flex justify-between px-6 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
            <span className="text-sm">{a.name || a.accountName}</span>
            <span className="font-mono text-sm font-medium">{formatINR(a.balance || 0)}</span>
          </div>
        ))}
      </CardBody>
    </Card>
  );

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Balance Sheet</h2>
        <p className="text-sm text-gray-500">As of {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Assets" section={data.assets} color="bg-blue-600" />
        <Section title="Liabilities" section={data.liabilities} color="bg-red-600" />
        <Section title="Equity" section={data.equity} color="bg-purple-600" />
      </div>
    </div>
  );
}

function LedgerView() {
  const [code, setCode] = useState('6000');
  const [from, setFrom] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const accountOptions = [
    { code: '6000', name: 'Payroll Expenses' },
    { code: '1130', name: 'Payroll Bank Account' },
    { code: '2210', name: 'PF Payable' },
    { code: '2220', name: 'ESI Payable' },
    { code: '2230', name: 'TDS Payable' },
    { code: '2240', name: 'Professional Tax Payable' },
    { code: '6600', name: 'Employer PF Contribution' },
    { code: '6700', name: 'Employer ESI Contribution' },
    { code: '1110', name: 'Cash on Hand' },
    { code: '1120', name: 'Primary Bank Account' },
  ];

  const fetchLedger = () => {
    setLoading(true);
    api.getLedger(code, from, to).then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  return (
    <div>
      <Card className="mb-6">
        <CardBody>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {accountOptions.map((a) => <option key={a.code} value={a.code}>{a.code} - {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={fetchLedger} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              View Ledger
            </button>
          </div>
        </CardBody>
      </Card>

      {loading && <Spinner />}
      {data && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{data.accountName} ({data.accountType})</h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="px-6 py-3 bg-blue-50 flex justify-between">
              <span className="font-medium text-blue-800">Opening Balance</span>
              <span className="font-mono font-bold text-blue-800">{formatINR2(data.openingBalance || 0)}</span>
            </div>
            <Table headers={['Date', 'Entry #', 'Description', 'Debit', 'Credit', 'Balance']}>
              {data.entries?.map((e: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2.5 px-4">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-2.5 px-4 font-mono text-xs">{e.entryNumber}</td>
                  <td className="py-2.5 px-4">{e.description}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{e.debit > 0 ? formatINR2(e.debit) : '-'}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{e.credit > 0 ? formatINR2(e.credit) : '-'}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium">{formatINR2(e.runningBalance)}</td>
                </tr>
              ))}
            </Table>
            <div className="px-6 py-3 bg-green-50 flex justify-between">
              <span className="font-medium text-green-800">Closing Balance</span>
              <span className="font-mono font-bold text-green-800">{formatINR2(data.closingBalance || 0)}</span>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function DayBookView() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.getDayBook(date).then((res) => {
      const entries = Array.isArray(res.data) ? res.data : res.data?.entries || [];
      setData(entries);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  return (
    <div>
      <Card className="mb-6">
        <CardBody>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={fetch} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              View Day Book
            </button>
          </div>
        </CardBody>
      </Card>

      {loading && <Spinner />}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Day Book - {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
          </CardHeader>
          <CardBody className="p-0">
            <Table headers={['Entry #', 'Source', 'Description', 'Total Amount', 'Status']}>
              {data.map((e: any) => (
                <tr key={e.id || e.entryNumber} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{e.entryNumber}</td>
                  <td className="py-3 px-4"><Badge text={e.source} variant="info" /></td>
                  <td className="py-3 px-4">{e.description}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium">{formatINR(e.totalDebit || 0)}</td>
                  <td className="py-3 px-4"><Badge text={e.status} variant={e.status === 'POSTED' ? 'success' : 'default'} /></td>
                </tr>
              ))}
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
