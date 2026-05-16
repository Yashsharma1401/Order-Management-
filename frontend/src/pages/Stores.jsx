import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStores, createStore, updateStore, deleteStore } from '../api/api';
import toast from 'react-hot-toast';

const StoreModal = ({ store, onClose }) => {
  const qc = useQueryClient();
  const isEdit = !!store?.id;
  const [form, setForm] = useState({ name: store?.name||'', location: store?.location||'', status: store?.status||'active' });

  const mutation = useMutation({
    mutationFn: () => isEdit ? updateStore(store.id, form) : createStore(form),
    onSuccess: () => {
      toast.success(isEdit ? 'Store updated!' : 'Store created!');
      qc.invalidateQueries(['stores']); onClose();
    },
    onError: () => toast.error('Operation failed'),
  });

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? 'Edit Store' : '+ Add New Store'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Store Name *</label>
            <input className="form-input" placeholder="e.g. Store A" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-input" placeholder="e.g. New York, USA" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>mutation.mutate()} disabled={mutation.isPending||!form.name||!form.location}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Store'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Stores = () => {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({ queryKey:['stores'], queryFn:()=>getStores().then(r=>r.data.stores) });
  const stores = data || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteStore(id),
    onSuccess: () => { toast.success('Store deleted'); qc.invalidateQueries(['stores']); },
    onError: () => toast.error('Delete failed — store may have active orders'),
  });

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Stores Management</div><div className="page-subtitle">{stores.length} stores registered</div></div>
        <button className="btn btn-primary" onClick={()=>setModal({})}>+ Add New Store</button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Store ID</th><th>Store Name</th><th>Location</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-2)' }}>Loading...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state"><div className="empty-icon">🏪</div><div className="empty-title">No stores yet</div><div className="empty-sub">Create your first store to get started</div></div>
              </td></tr>
            ) : stores.map(s=>(
              <tr key={s.id}>
                <td><span className="order-id">#{s.id}</span></td>
                <td style={{ fontWeight:600 }}>{s.name}</td>
                <td style={{ color:'var(--text-2)' }}>📍 {s.location}</td>
                <td>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600,
                    background: s.status==='active' ? 'var(--completed-bg)' : 'var(--cancelled-bg)',
                    color: s.status==='active' ? 'var(--completed)' : 'var(--cancelled)',
                  }}>
                    {s.status==='active' ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td style={{ color:'var(--text-2)', fontSize:12 }}>
                  {new Date(s.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                </td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>setModal(s)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>{ if(window.confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id); }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && <StoreModal store={modal} onClose={()=>setModal(null)} />}
    </div>
  );
};

export default Stores;
