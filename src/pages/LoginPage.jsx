// ============================================================
//  src/pages/LoginPage.jsx
//  Admin login screen. Connects to POST /api/auth/login
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email || !password) { toast.error('Email aur password dalo'); return; }
  setLoading(true);
  try {
    const user = await login(email, password);
    toast.success('Welcome!');
    if (user?.role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/invoices');
    }
  } catch (err) {
    toast.error(err.response?.data?.error || 'Email ya password galat hai');
  } finally {
    setLoading(false);
  }
};
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-sidebar)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>FBR Invoice Portal</h1>
          <p style={{ color: '#666', fontSize: 13 }}>Sign in to your admin account</p>
        </div>

        {/* Form */}
        <div style={{
          background: '#222', border: '1px solid #333',
          borderRadius: 16, padding: 28,
        }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#999' }}>Email address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                style={{ background: '#2a2a2a', border: '1px solid #333', color: '#fff' }}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#999' }}>Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ background: '#2a2a2a', border: '1px solid #333', color: '#fff' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '11px 16px', fontSize: 14 }}
            >
              {loading ? <><span className="spinner" style={{ width:16, height:16, borderWidth:2 }}/> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#444', fontSize: 12, marginTop: 20 }}>
          FBR Digital Invoice System · Pakistan
        </p>
      </div>
    </div>
  );
}
