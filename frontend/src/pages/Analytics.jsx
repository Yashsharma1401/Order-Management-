import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOverview, getOrdersPerDay, getRevenuePerStore, getTopItems } from '../api/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ef4444'];
const STATUS_COLORS = { PLACED:'#3b82f6', PREPARING:'#f59e0b', OUT_FOR_DELIVERY:'#8b5cf6', COMPLETED:'#10b981', CANCELLED:'#ef4444' };

const KPICard = ({ label, value, icon, color, change }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-change up">{change}</div>
    <div className="stat-icon">{icon}</div>
  </div>
);

const Analytics = () => {
  const { data: overview } = useQuery({ queryKey:['overview'], queryFn:()=>getOverview().then(r=>r.data.data), refetchInterval:30000 });
  const { data: daily=[] } = useQuery({ queryKey:['orders-per-day'], queryFn:()=>getOrdersPerDay(7).then(r=>r.data.data) });
  const { data: storeRevenue=[] } = useQuery({ queryKey:['revenue-per-store'], queryFn:()=>getRevenuePerStore().then(r=>r.data.data) });
  const { data: topItems=[] } = useQuery({ queryKey:['top-items'], queryFn:()=>getTopItems(5).then(r=>r.data.data) });

  const statusDist = overview?.statusDistribution || {};
  const pieData = Object.entries(statusDist).map(([name,value])=>({ name, value }));
  const avgOrderValue = overview?.totalOrders ? (overview.totalRevenue / overview.totalOrders) : 0;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Analytics Dashboard</div><div className="page-subtitle">Business insights and performance metrics</div></div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <KPICard label="Total Revenue" value={`$${(overview?.totalRevenue||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`} icon="💰" color="green" change="↑ 9.7% vs last period" />
        <KPICard label="Total Orders" value={overview?.totalOrders||0} icon="📦" color="purple" change="↑ 13.5% vs last period" />
        <KPICard label="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} icon="📊" color="blue" change="↑ 4.2% vs last period" />
        <KPICard label="Active Stores" value={overview?.activeStores||0} icon="🏪" color="orange" change="↑ 2 new stores" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">📅 Orders Per Day</span>
            <span style={{ fontSize:11, color:'var(--text-2)' }}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize:11 }} tickFormatter={d=>d.slice(5)} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#7c3aed" strokeWidth={2.5} dot={{ r:4, fill:'#7c3aed' }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">💸 Revenue Per Day</span>
            <span style={{ fontSize:11, color:'var(--text-2)' }}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize:11 }} tickFormatter={d=>d.slice(5)} />
              <YAxis tick={{ fontSize:11 }} tickFormatter={v=>`$${v}`} />
              <Tooltip formatter={v=>[`$${v.toFixed(2)}`,'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">🏪 Revenue Per Store</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storeRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize:11 }} tickFormatter={v=>`$${v}`} />
              <YAxis type="category" dataKey="storeName" tick={{ fontSize:11 }} width={60} />
              <Tooltip formatter={v=>[`$${Number(v).toFixed(2)}`,'Revenue']} />
              <Bar dataKey="totalRevenue" radius={[0,4,4,0]} name="Revenue">
                {storeRevenue.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">📊 Orders by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={85} innerRadius={45}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((entry,i)=><Cell key={i} fill={STATUS_COLORS[entry.name]||COLORS[i%COLORS.length]} />)}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={10} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Top Selling Items */}
        <div className="card">
          <div className="card-title">🔥 Top Selling Items</div>
          {topItems.length === 0 ? (
            <div className="empty-state" style={{ padding:24 }}><div className="empty-icon">🍽️</div><div className="empty-sub">No data yet</div></div>
          ) : topItems.map((item, i) => (
            <div key={item.name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < topItems.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:`linear-gradient(135deg, ${COLORS[i]}, ${COLORS[(i+1)%COLORS.length]})`,
                display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{item.name}</div>
                <div style={{ fontSize:11, color:'var(--text-2)' }}>{item.count} units sold</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)' }}>${item.revenue.toFixed(2)}</div>
              </div>
              <div style={{ width:60 }}>
                <div style={{ height:6, background:'var(--bg)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${Math.min(100,(item.count/(topItems[0]?.count||1))*100)}%`,
                    background:`linear-gradient(90deg,${COLORS[i]},${COLORS[(i+1)%COLORS.length]})`, borderRadius:3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Store Performance Table */}
        <div className="card">
          <div className="card-title">🏆 Store Performance</div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Store</th><th>Orders</th><th>Revenue</th><th>Completed</th></tr></thead>
              <tbody>
                {storeRevenue.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign:'center', padding:24, color:'var(--text-2)' }}>No data</td></tr>
                ) : storeRevenue.map(s=>(
                  <tr key={s.storeId}>
                    <td style={{ fontWeight:600 }}>{s.storeName}</td>
                    <td>{s.totalOrders}</td>
                    <td style={{ fontWeight:700, color:'var(--completed)' }}>${s.totalRevenue.toFixed(2)}</td>
                    <td>{s.completedOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
