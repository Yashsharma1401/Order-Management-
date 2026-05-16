import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import useSocket from './hooks/useSocket';
import useAppStore from './store/useAppStore';

import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Analytics from './pages/Analytics';
import ArchivedOrders from './pages/ArchivedOrders';
import Stores from './pages/Stores';

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5000 } },
});

const AppInner = () => {
  useSocket(); // Connect socket globally
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="app-layout">
      <Sidebar />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
      <div className="main-content">
        <TopBar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/archived" element={<ArchivedOrders />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="*" element={
              <div className="empty-state" style={{ marginTop:60 }}>
                <div className="empty-icon">🔍</div>
                <div className="empty-title">404 — Page not found</div>
                <div className="empty-sub">The page you're looking for doesn't exist</div>
              </div>
            } />
          </Routes>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius:10, fontFamily:'Inter,sans-serif', fontSize:13, boxShadow:'0 4px 16px rgba(0,0,0,.15)' },
          success: { iconTheme:{ primary:'#10b981', secondary:'#fff' } },
        }}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={qc}>
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
