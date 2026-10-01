import React, { useState } from 'react';
import { api } from '../services/api';
import { StaffProfile, StaffRole } from '../types';

interface StaffLoginModalProps {
  roleRequired?: StaffRole;
  onLoginSuccess: (profile: StaffProfile) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  roleRequired = 'kitchen',
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both staff email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      // Determine role from input or roleRequired
      const role: StaffRole = email.toLowerCase().includes('owner') ? 'owner' : roleRequired;
      const profile = await api.loginStaff(email.trim(), role);
      onLoginSuccess(profile);
    } catch {
      setError('Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (targetRole: StaffRole) => {
    const demoEmail = targetRole === 'owner' ? 'owner@cafe.local' : 'kitchen@cafe.local';
    const profile = await api.loginStaff(demoEmail, targetRole);
    onLoginSuccess(profile);
  };

  return (
    <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-8 rounded">
      <h2 className="text-xl font-bold text-cafe-accent mb-1">
        Staff Sign In
      </h2>
      <p className="text-xs text-cafe-textMuted mb-6">
        Protected staff portal for kitchen tablets and owner management.
      </p>

      {error && (
        <div className="p-3 bg-cafe-dangerBg border border-cafe-danger text-cafe-danger text-xs rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 mb-6">
        <div>
          <label htmlFor="staff-email" className="block text-xs font-medium text-cafe-text mb-1">
            Staff Email
          </label>
          <input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@cafe.local"
            autoComplete="username"
            className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="staff-password" className="block text-xs font-medium text-cafe-text mb-1">
            Password
          </label>
          <input
            id="staff-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full px-3 py-2 text-sm bg-cafe-surface border border-cafe-border rounded focus-visible:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="touch-target w-full py-2.5 bg-cafe-accent text-white text-xs font-semibold rounded hover:bg-cafe-accentHover disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Quick Access Demo Credentials for local testing */}
      <div className="pt-4 border-t border-cafe-border text-xs text-cafe-textMuted">
        <p className="font-semibold text-cafe-text mb-2">Development Demo Shortcuts:</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('kitchen')}
            className="touch-target flex-1 py-1.5 px-2 bg-cafe-muted hover:bg-cafe-border border border-cafe-border text-cafe-text rounded text-xs transition-colors duration-150"
          >
            Kitchen Staff
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('owner')}
            className="touch-target flex-1 py-1.5 px-2 bg-cafe-muted hover:bg-cafe-border border border-cafe-border text-cafe-text rounded text-xs transition-colors duration-150"
          >
            Cafe Owner
          </button>
        </div>
      </div>
    </div>
  );
};
