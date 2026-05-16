import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getStores, updateOrderStatus } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['PLACED','PREPARING','OUT_FOR_DELIVERY','COMPLETED','CANCELLED'];

const UpdateModal = ({ order, onClose }) => {
  const qc = useQueryClient();
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState('');
  const mutation = useMutation({
    mutationFn: () => updateOrderStatus(order.id, { status, notes }),
    onSuccess: () => { toast.success(`Order #${order.id} updated to ${status}`); qc.invalidateQueries(['orders']); qc.invalidateQueries(['overview']); onClose(); },
    onError: () => toast.error('Update failed'),
  });
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Update Order Status</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{marginBottom:16,padding:'12px 16px',background:'var(--bg)',borderRadius:'var(--radius-sm)'}}>
            <div style={{fontSize:12,color:'var(--text-2)'}}>Order <strong style={{color:'var(--accent)'}}>#{order.id}</strong> · {order.store?.name}</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>Customer: {order.customer} · ${order.totalAmount.toFixed(2)}</div>
            <div style={{marginTop:6}}><StatusBadge status={order.status} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Current Status</label>
            <div><StatusBadge status={order.status} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
              {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Note (Optional)</label>
            <textarea className="form-textarea" placeholder="e.g. Order completed and delivered successfully." value={notes} onChange={e=>setNotes(e.target.value)} style={{minHeight:60}} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending?'Updating...':'Update Status'}</button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: storesData } = useQuery({ queryKey: ['stores'], queryFn: () => getStores().then(r=>r.data.stores) });
  const stores = storesData || [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['orders', page, storeFilter, statusFilter],
    queryFn: () => getOrders({ page, limit:10, storeId:storeFilter||undefined, status:statusFilter||undefined }).then(r=>r.data),
    keepPreviousData: true,
    refetchInterval: 20000,
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Orders</div><div className="page-subtitle">{total} total orders</div></div>
        <button className="btn btn-primary" onClick={()=>navigate('/create-order')}>➕ New Order</button>
      </div>

      <div className="filter-bar">
        <span style={{fontSize:13,fontWeight:600,color:'var(--text-2)'}}>🔍 Filter:</span>
        <select className="form-select" value={storeFilter} onChange={e=>{setStoreFilter(e.target.value);setPage(1);}}>
          <option value="">All Stores</option>
          {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
        {(storeFilter||statusFilter) && (
          <button className="btn btn-secondary btn-sm" onClick={()=>{setStoreFilter('');setStatusFilter('');setPage(1);}}>✕ Clear</button>
        )}
        {isFetching && <span style={{fontSize:11,color:'var(--text-2)'}}>⟳ Refreshing...</span>}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Store</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--text-2)'}}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No orders found</div><div className="empty-sub">Try adjusting your filters</div></div></td></tr>
            ) : orders.map(o=>(
              <tr key={o.id}>
                <td><span className="order-id" style={{cursor:'pointer'}} onClick={()=>navigate(`/orders/${o.id}`)}>#{o.id}</span></td>
                <td>{o.store?.name || `Store ${o.storeId}`}</td>
                <td>{o.customer}</td>
                <td style={{color:'var(--text-2)'}}>{Array.isArray(o.items)?o.items.length:0} items</td>
                <td style={{fontWeight:700}}>${o.totalAmount.toFixed(2)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td style={{color:'var(--text-2)',fontSize:12}}>{format(new Date(o.createdAt),'MMM dd, hh:mm a')}</td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>navigate(`/orders/${o.id}`)}>👁</button>
                    <button className="btn btn-primary btn-sm" onClick={()=>setSelectedOrder(o)}>✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
          {Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1).map(p=>(
            <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={()=>setPage(p)}>{p}</button>
          ))}
          {totalPages>7&&<span style={{padding:'0 4px',color:'var(--text-2)'}}>...</span>}
          <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
        </div>
      )}

      {selectedOrder && <UpdateModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} />}
    </div>
  );
};

export default Orders;
