import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const BREADCRUMBS = {
  '/': 'Dashboard',
  '/create-order': 'Create Order',
  '/orders': 'Orders',
  '/analytics': 'Analytics',
  '/archived': 'Archived Orders',
  '/stores': 'Stores',
};

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar, notifications } = useAppStore();
  const pageTitle = BREADCRUMBS[location.pathname] || 'Order Details';
  const unread = notifications.length;

  return (
    <header className="topbar">
      <button className="topbar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{pageTitle}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn" title="Notifications" onClick={() => navigate('/orders')}>
          🔔
          {unread > 0 && <span className="notif-dot" />}
        </button>

        <button className="topbar-btn" title="Settings">⚙️</button>

        <div className="topbar-user">
          <div className="user-info">
            <div className="name">Yash Sharma</div>
            <div className="role">Admin</div>
          </div>
          <div className="avatar">JD</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
