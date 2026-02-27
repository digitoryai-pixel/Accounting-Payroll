'use client';

import { useState, FormEvent } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';

// Generate a demo JWT token client-side for standalone testing
function generateDemoToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: 'demo-user-001',
    organizationId: 'org-spicegarden-001',
    outletIds: ['outlet-andheri-001', 'outlet-bkc-002', 'outlet-powai-003'],
    role: 'SUPER_ADMIN',
    permissions: ['*'],
    name: 'Rajesh Kumar',
    email: 'admin@spicegarden.in',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }));
  const signature = btoa('demo-signature');
  return `${header}.${payload}.${signature}`;
}

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.data.token);
      } else {
        setError(data.error?.message || 'Invalid credentials');
      }
    } catch {
      // Backend not available - use demo token for standalone testing
      if (email === 'admin@spicegarden.in' && password === 'admin123') {
        login(generateDemoToken());
      } else if (email === 'admin@digitory.com' && password === 'admin123') {
        login(generateDemoToken());
      } else {
        setError('Invalid credentials. Use demo credentials below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = () => {
    login(generateDemoToken());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Spice Garden</h1>
          <p className="text-sm text-gray-500 mt-1">F&B Accounting System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Manage your restaurant finances, inventory, and operations.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@spicegarden.in"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 uppercase tracking-wide">or</span>
            </div>
          </div>

          {/* Quick demo login */}
          <button
            type="button"
            onClick={quickLogin}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            Quick Demo Login (No Backend Required)
          </button>

          {/* Demo credentials hint */}
          <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3">
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Demo credentials</p>
            <p className="text-sm text-indigo-700 font-mono">admin@spicegarden.in / admin123</p>
            <p className="text-xs text-indigo-500 mt-1">Or click Quick Demo Login above</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs text-gray-600">Accounting</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-lg mb-1">🍽️</div>
            <div className="text-xs text-gray-600">F&B Operations</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-lg mb-1">📈</div>
            <div className="text-xs text-gray-600">GST Compliance</div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Spice Garden F&B Accounting System &mdash; Modern Tally Replacement
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
