import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getOverview, getOrdersPerDay, getRecentOrders } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => getOverview().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ['orders-per-day'],
    queryFn: () => getOrdersPerDay(7).then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => getRecentOrders(6).then(r => r.data.orders),
    refetchInterval: 15000,
  });

  const statusDist = overview?.statusDistribution || {};
  const pieData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Orders', value: overview?.totalOrders ?? 0, icon: '📦', color: 'purple', change: '+12.5%', up: true },
    { label: 'Total Revenue', value: `$${(overview?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: '💰', color: 'green', change: '+16.7%', up: true },
    { label: 'Orders Today', value: overview?.ordersToday ?? 0, icon: '🗓️', color: 'blue', change: '+3.2%', up: true },
    { label: 'Active Stores', value: overview?.activeStores ?? 0, icon: '🏪', color: 'orange', change: '+2 this week', up: true },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">A modern, clean and responsive overview of your order system</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-order')}>
          ➕ New Order
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{ovLoading ? '—' : s.value}</div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? '↑' : '↓'} {s.change}
            </div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Orders Overview line chart */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Orders Overview (Last 7 Days)</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [v, n === 'orders' ? 'Orders' : 'Revenue']} />
              <Line type="monotone" dataKey="orders" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status pie */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">Orders by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={10} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="card-title" style={{ margin: 0 }}>Recent Orders</div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/orders')}>View All →</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Store</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-2)', padding: 32 }}>No recent orders</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td><span className="order-id">#{o.id}</span></td>
                  <td>{o.store?.name || `Store ${o.storeId}`}</td>
                  <td>{o.customer}</td>
                  <td style={{ fontWeight: 600 }}>${o.totalAmount.toFixed(2)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ color: 'var(--text-2)' }}>{format(new Date(o.createdAt), 'MMM dd, hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
