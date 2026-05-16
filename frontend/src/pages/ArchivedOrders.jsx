import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getArchivedOrders, getStores, archiveOldOrders } from '../api/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ArchivedOrders = () => {
  const [page, setPage] = useState(1);
  const [storeFilter, setStoreFilter] = useState('');
  const [archiveDays, setArchiveDays] = useState(30);

  const { data: storesData } = useQuery({ queryKey:['stores'], queryFn:()=>getStores().then(r=>r.data.stores) });
  const stores = storesData || [];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['archived-orders', page, storeFilter],
    queryFn: () => getArchivedOrders({ page, limit:10, storeId:storeFilter||undefined }).then(r=>r.data),
    keepPreviousData: true,
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveOldOrders(archiveDays),
    onSuccess: (res) => { toast.success(res.data.message||'Archive complete'); refetch(); },
    onError: () => toast.error('Archive failed'),
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Archived Orders</div><div className="page-subtitle">{total} archived records</div></div>
      </div>

      <div className="card" style={{ marginBottom:20, background:'linear-gradient(135deg,#fafafa,#f5f3ff)', borderColor:'var(--accent)', borderStyle:'dashed' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🗃️ Archive Old Orders</div>
            <div style={{ fontSize:12, color:'var(--text-2)' }}>Move orders older than N days to the archive table to keep your active data lean and performant.</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="number" className="form-input" style={{ width:80 }} min={1} value={archiveDays} onChange={e=>setArchiveDays(Number(e.target.value))} />
            <span style={{ fontSize:12, color:'var(--text-2)', whiteSpace:'nowrap' }}>days old</span>
            <button className="btn btn-primary" onClick={()=>archiveMutation.mutate()} disabled={archiveMutation.isPending}>
              {archiveMutation.isPending ? '⏳ Archiving...' : '🗃️ Run Archive'}
            </button>
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text-2)' }}>🔍 Filter:</span>
        <select className="form-select" value={storeFilter} onChange={e=>{setStoreFilter(e.target.value);setPage(1);}}>
          <option value="">All Stores</option>
          {stores.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {storeFilter && <button className="btn btn-secondary btn-sm" onClick={()=>setStoreFilter('')}>✕ Clear</button>}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Original ID</th><th>Store</th><th>Customer</th><th>Total</th><th>Status</th><th>Original Date</th><th>Archived At</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-2)' }}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-icon">🗃️</div>
                  <div className="empty-title">No archived orders</div>
                  <div className="empty-sub">Run the archive process above to move old orders here</div>
                </div>
              </td></tr>
            ) : orders.map(o=>(
              <tr key={o.id}>
                <td><span className="order-id">#{o.originalId}</span></td>
                <td>Store {o.storeId}</td>
                <td>{o.customer}</td>
                <td style={{ fontWeight:700 }}>${o.totalAmount.toFixed(2)}</td>
                <td><span className={`badge ${o.status}`}>{o.status.replace(/_/g,' ')}</span></td>
                <td style={{ color:'var(--text-2)', fontSize:12 }}>{format(new Date(o.originalCreatedAt),'MMM dd, yyyy')}</td>
                <td style={{ color:'var(--text-2)', fontSize:12 }}>{format(new Date(o.archivedAt),'MMM dd, yyyy hh:mm a')}</td>
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
          <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default ArchivedOrders;
