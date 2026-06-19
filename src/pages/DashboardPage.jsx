// ============================================================
//  src/pages/DashboardPage.jsx
//  Overview: total invoices, amounts, and per-customer summary
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customersApi, invoicesApi } from '../services/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [customers, setCustomers] = useState([]);
  const [allStats, setAllStats]   = useState({});
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [custs, invData] = await Promise.all([
          customersApi.list(),
          invoicesApi.list({ limit: 8 }),
        ]);
        setCustomers(custs);
        setRecent(invData.invoices || []);

        // Load stats for each customer
        const stats = {};
        await Promise.all(custs.map(async c => {
          try { stats[c._id] = await invoicesApi.stats(c._id); }
          catch { stats[c._id] = { pending:0, submitted:0, accepted:0, rejected:0 }; }
        }));
        setAllStats(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate totals across all customers
  const totals = Object.values(allStats).reduce(
    (acc, s) => ({
      pending:   acc.pending   + (s.pending  || 0),
      submitted: acc.submitted + (s.submitted|| 0),
      accepted:  acc.accepted  + (s.accepted || 0),
      rejected:  acc.rejected  + (s.rejected || 0),
    }),
    { pending: 0, submitted: 0, accepted: 0, rejected: 0 }
  );
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div className="spinner"/></div>;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
          Overview of all customers · {format(new Date(), 'dd MMMM yyyy')}
        </p>
      </div>

      {/* Summary stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total invoices</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accepted by FBR</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{totals.accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending sync</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{totals.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rejected</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{totals.rejected}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent invoices */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent invoices</h2>
            <Link to="/invoices" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div className="table-wrap">
            {recent.length === 0 ? (
              <div className="empty-state"><p>No invoices yet. Upload an Excel file to get started.</p></div>
            ) : (
              <table>
                <thead><tr>
                  <th>Invoice No</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {recent.map(inv => (
                    <tr key={inv._id}>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{inv.invoiceNumber}</td>
                      <td>{inv.customerId?.businessName || '—'}</td>
                      <td style={{ fontWeight:500 }}>PKR {inv.totalAmount?.toLocaleString()}</td>
                      <td style={{ color:'var(--text-muted)' }}>{inv.invoiceDate ? format(new Date(inv.invoiceDate),'dd/MM/yyyy') : '—'}</td>
                      <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Customer list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Customers</h2>
            <Link to="/customers" style={{ fontSize: 12, color: 'var(--accent)' }}>Manage →</Link>
          </div>
          {customers.length === 0 ? (
            <div className="empty-state"><p>No customers added yet.</p></div>
          ) : (
            customers.map((c, i) => {
              const s = allStats[c._id] || {};
              const tot = (s.pending||0)+(s.submitted||0)+(s.accepted||0)+(s.rejected||0);
              return (
                <div key={c._id} style={{
                  padding: '14px 20px',
                  borderBottom: i < customers.length-1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--accent-lt)', color: 'var(--accent-dk)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {c.businessName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight:500, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.businessName}</div>
                    <div style={{ fontSize:11, color:'var(--text-light)', fontFamily:'var(--font-mono)' }}>{c.ntn}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{tot}</div>
                    <div style={{ fontSize:11, color:'var(--text-light)' }}>invoices</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
