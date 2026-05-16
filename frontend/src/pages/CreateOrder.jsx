import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStores, createOrder } from '../api/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const emptyItem = () => ({ name: '', quantity: 1, unitPrice: '' });

const CreateOrder = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ storeId: '', customer: '', notes: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [errors, setErrors] = useState({});

  const { data: storesData } = useQuery({ queryKey: ['stores'], queryFn: () => getStores().then(r => r.data.stores) });
  const stores = storesData || [];
  const total = items.reduce((s, i) => s + (Number(i.quantity)||0) * (Number(i.unitPrice)||0), 0);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success('Order created successfully! 🎉');
      qc.invalidateQueries(['orders']); qc.invalidateQueries(['overview']);
      setForm({ storeId: '', customer: '', notes: '' }); setItems([emptyItem()]);
    },
    onError: () => toast.error('Failed to create order'),
  });

  const validate = () => {
    const e = {};
    if (!form.storeId) e.storeId = 'Select a store';
    if (!form.customer.trim()) e.customer = 'Required';
    items.forEach((item, i) => {
      if (!item.name.trim()) e[`n${i}`] = 'Required';
      if (!item.unitPrice || Number(item.unitPrice) <= 0) e[`p${i}`] = 'Required';
    });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); if (!validate()) return;
    mutation.mutate({ storeId: Number(form.storeId), customer: form.customer || 'Walk-in Customer',
      items: items.map(i => ({ name: i.name, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })), notes: form.notes });
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => { const n=[...items]; n[idx]={...n[idx],[field]:value}; setItems(n); };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="page-header">
        <div><div className="page-title">Create New Order</div><div className="page-subtitle">Fill in the form to place a new order</div></div>
        <button className="btn btn-secondary" onClick={() => navigate('/orders')}>← Back</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom:16 }}>
          <div className="card">
            <div className="card-title">Store & Customer</div>
            <div className="form-group">
              <label className="form-label">Store *</label>
              <select className="form-select" value={form.storeId} onChange={e=>setForm({...form,storeId:e.target.value})}>
                <option value="">Select a store...</option>
                {stores.map(s=><option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
              </select>
              {errors.storeId && <span style={{color:'var(--cancelled)',fontSize:11}}>{errors.storeId}</span>}
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Customer Name *</label>
              <input className="form-input" placeholder="Walk-in Customer" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})} />
              {errors.customer && <span style={{color:'var(--cancelled)',fontSize:11}}>{errors.customer}</span>}
            </div>
          </div>
          <div className="card" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',background:'linear-gradient(135deg,#f5f3ff,#ede9fe)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Total Amount</div>
            <div style={{fontSize:42,fontWeight:800,color:'var(--accent)'}}>${total.toFixed(2)}</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:4}}>{items.length} item(s)</div>
          </div>
        </div>

        <div className="card" style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div className="card-title" style={{margin:0}}>Order Items</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 80px 100px 36px',gap:8,paddingBottom:8,borderBottom:'1px solid var(--border)',marginBottom:8}}>
            {['Item Name','Qty','Unit Price ($)',''].map(h=><span key={h} className="form-label" style={{margin:0}}>{h}</span>)}
          </div>
          {items.map((item,idx)=>(
            <div key={idx} style={{display:'grid',gridTemplateColumns:'1fr 80px 100px 36px',gap:8,marginBottom:8,alignItems:'start'}}>
              <div>
                <input className="form-input" placeholder="e.g. Burger" value={item.name} onChange={e=>updateItem(idx,'name',e.target.value)} />
                {errors[`n${idx}`]&&<span style={{color:'var(--cancelled)',fontSize:11}}>Required</span>}
              </div>
              <input className="form-input" type="number" min="1" value={item.quantity} onChange={e=>updateItem(idx,'quantity',e.target.value)} />
              <div>
                <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00" value={item.unitPrice} onChange={e=>updateItem(idx,'unitPrice',e.target.value)} />
                {errors[`p${idx}`]&&<span style={{color:'var(--cancelled)',fontSize:11}}>Required</span>}
              </div>
              <button type="button" className="btn btn-danger btn-icon" onClick={()=>items.length>1&&removeItem(idx)} disabled={items.length===1} style={{height:40}}>🗑</button>
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--border)',paddingTop:10,marginTop:4}}>
            {items.filter(i=>i.name).map((item,idx)=>(
              <div key={idx} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-2)',marginBottom:2}}>
                <span>{item.name} × {item.quantity}</span>
                <span style={{fontWeight:600,color:'var(--text)'}}>${((Number(item.quantity)||0)*(Number(item.unitPrice)||0)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{marginBottom:24}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Order Note (Optional)</label>
            <textarea className="form-textarea" placeholder="Add any special instructions..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
          </div>
        </div>

        <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
          <button type="button" className="btn btn-secondary" onClick={()=>{setForm({storeId:'',customer:'',notes:''});setItems([emptyItem()]);}}>Clear</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending} style={{minWidth:140}}>
            {mutation.isPending ? '⏳ Creating...' : '🛒 Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
