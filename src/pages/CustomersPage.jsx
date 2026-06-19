// ============================================================
//  src/pages/CustomersPage.jsx
//  Add, view, edit, and delete your client businesses.
// ============================================================

import { useState, useEffect } from 'react';
import { customersApi } from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  businessName: '', ntn: '', strn: '', address: '', province: '',
  contactEmail: '', contactPhone: '',
  fbrCredentials: { token: '' },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);  // null = creating new
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.list();
      setCustomers(data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCustomers(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      businessName: c.businessName || '', ntn: c.ntn || '', strn: c.strn || '',
      address: c.address || '',
      province: c.province || '',
      contactEmail: c.contactEmail || '', contactPhone: c.contactPhone || '',
     fbrCredentials: { token: c.fbrCredentials?.token || '' },
    });
    setShowModal(true);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setFbr   = (key, val) => setForm(f => ({ ...f, fbrCredentials: { ...f.fbrCredentials, [key]: val } }));

  const handleSave = async () => {
    if (!form.businessName || !form.ntn) { toast.error('Business name and NTN are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await customersApi.update(editing, form);
        toast.success('Customer updated');
      } else {
        await customersApi.create(form);
        toast.success('Customer added');
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}"? Their invoices will remain in the database.`)) return;
    try {
      await customersApi.remove(id);
      toast.success('Customer removed');
      loadCustomers();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div className="spinner"/></div>;

  return (
    <div className="page-enter">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>Customers</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:2 }}>Manage your client businesses</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add customer</button>
      </div>

      {customers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>No customers yet. Click "Add customer" to get started.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table>
            <thead><tr>
              <th>Business name</th><th>NTN</th><th>STRN</th><th>Contact</th><th>FBR Username</th><th></th>
            </tr></thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:32, height:32, borderRadius:8,
                        background:'var(--accent-lt)', color:'var(--accent-dk)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:11, fontWeight:700, flexShrink:0,
                      }}>
                        {c.businessName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight:500 }}>{c.businessName}</div>
                        {c.address && <div style={{ fontSize:12, color:'var(--text-muted)' }}>{c.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{c.ntn}</td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{c.strn || '—'}</td>
                  <td>
                    {c.contactEmail && <div style={{ fontSize:12 }}>{c.contactEmail}</div>}
                    {c.contactPhone && <div style={{ fontSize:12, color:'var(--text-muted)' }}>{c.contactPhone}</div>}
                  </td>
                  <td style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{c.fbrCredentials?.username || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c._id, c.businessName)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if(e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxHeight:'90vh', overflowY:'auto' }}>
            <h2 className="modal-title">{editing ? 'Edit customer' : 'Add new customer'}</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Business name *</label>
                <input className="input" value={form.businessName} onChange={e => setField('businessName', e.target.value)} placeholder="Al-Habib Traders" />
              </div>
              <div className="form-group">
                <label className="form-label">NTN *</label>
                <input className="input" value={form.ntn} onChange={e => setField('ntn', e.target.value)} placeholder="1234567-8" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">STRN</label>
                <input className="input" value={form.strn} onChange={e => setField('strn', e.target.value)} placeholder="STR-88001" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact phone</label>
                <input className="input" value={form.contactPhone} onChange={e => setField('contactPhone', e.target.value)} placeholder="+92 300 0000000" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact email</label>
              <input className="input" type="email" value={form.contactEmail} onChange={e => setField('contactEmail', e.target.value)} placeholder="accounts@business.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="input" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Shop #1, Main Market, Lahore" />
            </div>
            <div className="form-group">
  <label className="form-label">Province</label>
  <select className="input" value={form.province} onChange={e => setField('province', e.target.value)}>
    <option value="">-- Select Province --</option>
    <option value="Islamabad">Islamabad (Federal)</option>
    <option value="Punjab">Punjab</option>
    <option value="Sindh">Sindh</option>
    <option value="KPK">Khyber Pakhtunkhwa</option>
    <option value="Balochistan">Balochistan</option>
    <option value="AJK">AJK</option>
    <option value="GB">Gilgit Baltistan</option>
  </select>
</div>

           <div style={{ marginTop:8, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius)', marginBottom:4 }}>
             <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.05em' }}>FBR Security Token</div>
              <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Token (IRIS portal se milega)</label>
               <textarea className="input" rows={3}
                value={form.fbrCredentials.token}
                onChange={e => setFbr('token', e.target.value)}
                placeholder="FBR se mila hua security token yahan paste karo" />
            </div>
          </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width:14, height:14, borderWidth:2 }}/> Saving…</> : (editing ? 'Save changes' : 'Add customer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
