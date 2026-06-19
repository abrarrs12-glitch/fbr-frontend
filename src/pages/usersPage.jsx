import { useState, useEffect } from 'react';
import API, { customersApi } from '../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', email: '', password: '', role: 'client', customerId: '',
};

export default function UsersPage() {
  const [users, setUsers]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, custsRes] = await Promise.all([
        API.get('/users').then(r => r.data),
        customersApi.list(),
      ]);
      setUsers(usersRes);
      setCustomers(custsRes);
    } catch { toast.error('Data load nahi hua'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (u) => {
    setEditing(u._id);
    setForm({
      name: u.name, email: u.email, password: '',
      role: u.role, customerId: u.customerId?._id || u.customerId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast.error('Naam aur email zaroori hain'); return; }
    if (!editing && !form.password) { toast.error('Password zaroori hai'); return; }
    if (form.role === 'client' && !form.customerId) {
      toast.error('Client ke liye Customer select karo'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/users/${editing}`, form);
        toast.success('User update ho gaya!');
      } else {
        await API.post('/users', form);
        toast.success('User ban gaya!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save nahi hua');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" ko remove karo?`)) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User remove ho gaya');
      loadData();
    } catch { toast.error('Delete nahi hua'); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
      <div className="spinner"/>
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>Users</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:2 }}>
            Client accounts manage karo
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New User</button>
      </div>

      {users.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>Koi user nahi hai. "New User" click karo.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table>
            <thead><tr>
              <th>Naam</th><th>Email</th><th>Role</th><th>Client</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight:500 }}>{u.name}</td>
                  <td style={{ color:'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role==='admin' ? 'badge-accepted' : 'badge-info'}`}>
                      {u.role === 'admin' ? 'Admin' : 'Client'}
                    </span>
                  </td>
                  <td>{u.customerId?.businessName || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id, u.name)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <h2 className="modal-title">{editing ? 'User Edit karo' : 'Naya User banao'}</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Naam *</label>
                <input className="input" value={form.name}
                  onChange={e => setForm(f=>({...f,name:e.target.value}))}
                  placeholder="Ali Ahmed" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="input" type="email" value={form.email}
                  onChange={e => setForm(f=>({...f,email:e.target.value}))}
                  placeholder="ali@gmail.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Password {editing ? '(khali chhodo agar change nahi karna)' : '*'}
                </label>
                <input className="input" type="password" value={form.password}
                  onChange={e => setForm(f=>({...f,password:e.target.value}))}
                  placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="input" value={form.role}
                  onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {form.role === 'client' && (
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="input" value={form.customerId}
                  onChange={e => setForm(f=>({...f,customerId:e.target.value}))}>
                  <option value="">-- Customer select karo --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.businessName} — {c.ntn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }}/> Saving...</>
                  : (editing ? 'Save Changes' : 'User Banao')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}