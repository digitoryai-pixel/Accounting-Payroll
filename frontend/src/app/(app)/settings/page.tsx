'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui';

const orgInfo = {
  name: 'Spice Garden Restaurant Group',
  legalName: 'Spice Garden Foods Pvt. Ltd.',
  gstin: '27AABCS1234A1Z5',
  pan: 'AABCS1234A',
  tan: 'MUMS12345A',
  address: '123, Andheri West, Mumbai',
  state: 'Maharashtra',
  pincode: '400058',
  phone: '+91 22 2634 5678',
  email: 'accounts@spicegarden.in',
  website: 'www.spicegarden.in',
  financialYear: 'April - March',
  baseCurrency: 'INR',
};

const outlets = [
  { id: '1', name: 'Spice Garden Andheri', type: 'Restaurant', city: 'Mumbai', gstin: '27AABCS1234A1Z5', status: 'Active' },
  { id: '2', name: 'Spice Garden BKC', type: 'QSR', city: 'Mumbai', gstin: '27AABCS1234A2Z4', status: 'Active' },
  { id: '3', name: 'Cloud Kitchen Powai', type: 'Cloud Kitchen', city: 'Mumbai', gstin: '27AABCS1234A3Z3', status: 'Active' },
];

const users = [
  { name: 'Rajesh Kumar', email: 'rajesh@spicegarden.in', role: 'Super Admin', lastLogin: '27 Feb 2026, 09:15 AM', status: 'Active' },
  { name: 'Priya Sharma', email: 'priya@spicegarden.in', role: 'Accountant', lastLogin: '27 Feb 2026, 08:45 AM', status: 'Active' },
  { name: 'Vikram Singh', email: 'vikram@spicegarden.in', role: 'Manager', lastLogin: '26 Feb 2026, 06:30 PM', status: 'Active' },
  { name: 'Chef Arun', email: 'arun@spicegarden.in', role: 'Kitchen Head', lastLogin: '25 Feb 2026, 02:00 PM', status: 'Active' },
  { name: 'Neha Patel', email: 'neha@spicegarden.in', role: 'Outlet Manager', lastLogin: '26 Feb 2026, 11:00 AM', status: 'Active' },
];

const integrations = [
  { name: 'Petpooja POS', category: 'POS', status: 'Connected', lastSync: '27 Feb 2026, 09:00 AM', icon: '📟' },
  { name: 'Swiggy Partner', category: 'Aggregator', status: 'Connected', lastSync: '27 Feb 2026, 08:30 AM', icon: '🍊' },
  { name: 'Zomato Partner', category: 'Aggregator', status: 'Connected', lastSync: '27 Feb 2026, 08:30 AM', icon: '🔴' },
  { name: 'HDFC Bank Feed', category: 'Banking', status: 'Connected', lastSync: '27 Feb 2026, 06:00 AM', icon: '🏦' },
  { name: 'ICICI Bank Feed', category: 'Banking', status: 'Connected', lastSync: '27 Feb 2026, 06:00 AM', icon: '🏦' },
  { name: 'GST Portal (NIC)', category: 'Compliance', status: 'Connected', lastSync: '25 Feb 2026', icon: '🏛️' },
  { name: 'Razorpay', category: 'Payments', status: 'Connected', lastSync: '27 Feb 2026, 09:00 AM', icon: '💳' },
  { name: 'WhatsApp Business', category: 'Communication', status: 'Pending Setup', lastSync: '-', icon: '💬' },
  { name: 'Tally Import/Export', category: 'Migration', status: 'Available', lastSync: '-', icon: '📊' },
];

const tabs = ['Organization', 'Outlets', 'Users & Roles', 'Integrations', 'Tax Settings', 'Preferences'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Organization');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 flex-wrap border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Organization' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(orgInfo).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Edit Details
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              Upload Logo
            </button>
          </div>
        </div>
      )}

      {activeTab === 'Outlets' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Outlets</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Add Outlet
            </button>
          </div>
          <div className="space-y-4">
            {outlets.map(outlet => (
              <div key={outlet.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{outlet.name}</div>
                  <div className="text-sm text-gray-500">{outlet.city} &middot; GSTIN: {outlet.gstin}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{outlet.type}</Badge>
                  <Badge variant="success">{outlet.status}</Badge>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Users & Roles' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Users & Access Control</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Invite User
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Last Login</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.email} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{user.email}</td>
                  <td className="py-3 px-4"><Badge variant="purple">{user.role}</Badge></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="py-3 px-4"><Badge variant="success">{user.status}</Badge></td>
                  <td className="py-3 px-4">
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 mr-3">Edit</button>
                    <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Available Roles</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div><strong>Super Admin</strong> - Full access</div>
              <div><strong>Accountant</strong> - Financial modules</div>
              <div><strong>Manager</strong> - Operations & reports</div>
              <div><strong>Kitchen Head</strong> - Recipes & inventory</div>
              <div><strong>Outlet Manager</strong> - Single outlet</div>
              <div><strong>Cashier</strong> - Sales & POS</div>
              <div><strong>Viewer</strong> - Read-only reports</div>
              <div><strong>CA/Auditor</strong> - Compliance & audit</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Integrations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(int => (
              <div key={int.name} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{int.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{int.name}</div>
                    <div className="text-xs text-gray-500">{int.category}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant={int.status === 'Connected' ? 'success' : int.status === 'Pending Setup' ? 'warning' : 'info'}>
                    {int.status}
                  </Badge>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700">
                    {int.status === 'Connected' ? 'Configure' : 'Setup'}
                  </button>
                </div>
                {int.lastSync !== '-' && (
                  <div className="text-xs text-gray-400 mt-2">Last sync: {int.lastSync}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Tax Settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">GST Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Composition Scheme</div>
                <div className="font-medium mt-1">Not opted</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Default GST Rate (Restaurant)</div>
                <div className="font-medium mt-1">5% (Non-AC, No Liquor)</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">E-Invoice Applicable</div>
                <div className="font-medium mt-1">Yes (Turnover &gt; ₹5 Cr)</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">E-Way Bill Threshold</div>
                <div className="font-medium mt-1">₹50,000</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">TDS Configuration</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-500">Section</th>
                  <th className="text-left py-2 px-3 text-gray-500">Description</th>
                  <th className="text-left py-2 px-3 text-gray-500">Rate</th>
                  <th className="text-left py-2 px-3 text-gray-500">Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">194C</td><td className="py-2 px-3">Contractors</td><td className="py-2 px-3">1% / 2%</td><td className="py-2 px-3">₹30,000 / ₹1,00,000</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">194J</td><td className="py-2 px-3">Professional Services</td><td className="py-2 px-3">10%</td><td className="py-2 px-3">₹30,000</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">194Q</td><td className="py-2 px-3">Purchase of Goods</td><td className="py-2 px-3">0.1%</td><td className="py-2 px-3">₹50,00,000</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">194I</td><td className="py-2 px-3">Rent</td><td className="py-2 px-3">10%</td><td className="py-2 px-3">₹2,40,000</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Display Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div><div className="font-medium text-sm">Date Format</div><div className="text-xs text-gray-500">How dates appear across the app</div></div>
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div><div className="font-medium text-sm">Number Format</div><div className="text-xs text-gray-500">Indian numbering system (lakhs, crores)</div></div>
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  <option>Indian (12,34,567)</option>
                  <option>International (1,234,567)</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div><div className="font-medium text-sm">Language</div><div className="text-xs text-gray-500">Interface language</div></div>
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <div><div className="font-medium text-sm">Dark Mode</div><div className="text-xs text-gray-500">Switch between light and dark themes</div></div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <div><div className="font-medium text-sm">Keyboard Shortcuts (Tally Mode)</div><div className="text-xs text-gray-500">Enable Tally-style keyboard shortcuts for data entry</div></div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-3">
              {['Low Stock Alerts', 'Payment Due Reminders', 'GST Filing Deadlines', 'Daily Sales Summary', 'Anomaly Detection Alerts', 'Payroll Processing Reminders'].map(pref => (
                <div key={pref} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{pref}</span>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600" /> Email
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600" /> Push
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" className="rounded border-gray-300 text-indigo-600" /> WhatsApp
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Data Management</h2>
            <div className="flex gap-3 flex-wrap">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Export All Data (CSV)</button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Export to Tally XML</button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Import from Tally</button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Backup Database</button>
              <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50">Reset Demo Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
