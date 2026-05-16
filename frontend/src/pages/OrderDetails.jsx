import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, updateOrderStatus } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STEPS = ['PLACED','PREPARING','OUT_FOR_DELIVERY','COMPLETED'];
const STATUSES = ['PLACED','PREPARING','OUT_FOR_DELIVERY','COMPLETED','CANCELLED'];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showUpdate, setShowUpdate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id).then(r => r.data.order),
    refetchInterval: 15000,
  });

  const mutation = useMutation({
    mutationFn: () => updateOrderStatus(id, { status: newStatus, notes }),
    onSuccess: () => {
      toast.success(`Status updated to ${newStatus}`);
      qc.invalidateQueries(['order', id]);
      qc.invalidateQueries(['orders']);
      setShowUpdate(false); setNotes('');
    },
    onError: () => toast.error('Update failed'),
  });

  if (isLoading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:300 }}>
      <div style={{ textAlign:'center', color:'var(--text-2)' }}>⏳ Loading order details...</div>
    </div>
  );

  if (!data) return (
    <div className="empty-state">
      <div className="empty-icon">🔍</div>
      <div className="empty-title">Order not found</div>
      <button className="btn btn-primary" onClick={() => navigate('/orders')}>← Back to Orders</button>
    </div>
  );

  const order = data;
  const items = Array.isArray(order.items) ? order.items : [];
  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="page-title">Order #{order.id}</div>
            <StatusBadge status={order.status} />
          </div>
          <div className="page-subtitle">
            {order.store?.name} · {format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>← Back</button>
          <button className="btn btn-primary" onClick={() => { setNewStatus(order.status); setShowUpdate(true); }}>
            ✏️ Update Status
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom:16 }}>
        {/* Order Info */}
        <div className="card">
          <div className="card-title">Order Information</div>
          {[
            ['Order ID', `#${order.id}`],
            ['Store', order.store?.name || `Store ${order.storeId}`],
            ['Customer', order.customer],
            ['Total Amount', `$${order.totalAmount.toFixed(2)}`],
            ['Status', <StatusBadge status={order.status} />],
            ['Created', format(new Date(order.createdAt), 'MMM dd, yyyy hh:mm a')],
            ['Updated', format(new Date(order.updatedAt), 'MMM dd, yyyy hh:mm a')],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ color:'var(--text-2)', fontWeight:500 }}>{label}</span>
              <span style={{ fontWeight:600 }}>{value}</span>
            </div>
          ))}
          {order.notes && (
            <div style={{ marginTop:12, padding:10, background:'var(--bg)', borderRadius:'var(--radius-sm)', fontSize:13 }}>
              <span style={{ color:'var(--text-2)', fontWeight:500 }}>Note: </span>{order.notes}
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="card">
          <div className="card-title">Order Timeline</div>
          <div className="timeline">
            {STEPS.map((step, i) => {
              const done = i < stepIdx;
              const active = i === stepIdx;
              const pending = i > stepIdx;
              return (
                <div key={step} className="timeline-item">
                  <div className={`timeline-dot ${active ? 'active' : done ? 'done' : ''}`} />
                  <div className={`timeline-label ${pending ? '' : ''}`} style={{ color: pending ? 'var(--text-3)' : 'var(--text)' }}>
                    {step.replace(/_/g, ' ')}
                  </div>
                  <div className="timeline-sub">
                    {active && `Current status · ${format(new Date(order.updatedAt), 'hh:mm a')}`}
                    {done && '✓ Completed'}
                    {pending && 'Pending...'}
                  </div>
                </div>
              );
            })}
            {order.status === 'CANCELLED' && (
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background:'var(--cancelled)', borderColor:'var(--cancelled)' }} />
                <div className="timeline-label" style={{ color:'var(--cancelled)' }}>CANCELLED</div>
                <div className="timeline-sub">{format(new Date(order.updatedAt), 'hh:mm a')}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="card-title">Order Items</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.unitPrice).toFixed(2)}</td>
                  <td style={{ fontWeight:700, color:'var(--accent)' }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign:'right', fontWeight:700, padding:'12px 16px', fontSize:14 }}>Total</td>
                <td style={{ fontWeight:800, color:'var(--accent)', fontSize:16, padding:'12px 16px' }}>${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUpdate(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Update Order #{order.id}</div>
              <button className="modal-close" onClick={() => setShowUpdate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Current Status</label>
                <StatusBadge status={order.status} />
              </div>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Note (Optional)</label>
                <textarea className="form-textarea" placeholder="Add a note..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight:60 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUpdate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
