import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const NAV = [
  {
    section: 'Main', items: [
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/create-order', label: 'Create Order', icon: '➕' },
      { path: '/orders', label: 'Orders', icon: '📦' },
    ]
  },
  {
    section: 'Insights', items: [
      { path: '/analytics', label: 'Analytics', icon: '📈' },
      { path: '/archived', label: 'Archived Orders', icon: '🗃️' },
    ]
  },
  {
    section: 'Management', items: [
      { path: '/stores', label: 'Stores', icon: '🏪' },
    ]
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useAppStore();
  const collapsed = !sidebarOpen;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">O</div>
        {!collapsed && (
          <div>
            <div className="logo-text">OrderManage</div>
            <div className="logo-sub">Multi-Store POS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((section) => (
          <div key={section.section}>
            {!collapsed && <div className="nav-section-label">{section.section}</div>}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div
                  key={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">JD</div>
          {!collapsed && (
            <div>
              <div className="user-name">Yash Sharma</div>
              <div className="user-role">Store Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
