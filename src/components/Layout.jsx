import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // 1. Added Outlet here
import hariLogo from '../assets/logo.jpg';

export default function Layout({ role = 'admin' }) { // 2. Removed children prop
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    { name: 'Shop Creation', path: '/admin/shop', icon: ShopIcon },
    { name: 'Categories', path: '/admin/category', icon: CategoryIcon },
    { name: 'Products', path: '/admin/product', icon: ProductIcon },
    { name: 'Reports', path: '/admin/reports', icon: ReportIcon },
  ];

  const cashierLinks = [
    { name: 'Billing', path: '/cashier/billing', icon: BillingIcon },
  ];

  const links = role === 'admin' ? adminLinks : cashierLinks;
  const handleLogout = () => navigate('/');

  return (
    <div className="hb-dashboard-layout">
      
      {/* Red Brand Floating Sidebar */}
      <aside className={`hb-sidebar ${isCollapsed ? 'hb-collapsed' : ''}`}>
        <div className="hb-sidebar-brand">
          <div className="hb-sidebar-logo">
            <img src={hariLogo} alt="Haribiriyani Logo" />
          </div>
          {/* Hide text when collapsed */}
          {!isCollapsed && (
            <div>
              <h2>Haribiriyani</h2>
              <span>Food Market</span>
            </div>
          )}
        </div>

        <nav className="hb-sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                className={`hb-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(link.path)}
                title={isCollapsed ? link.name : ''} // Tooltip when collapsed
              >
                <Icon />
                {!isCollapsed && <span>{link.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="hb-sidebar-profile">
          <div className="hb-profile-avatar">A</div>
          {!isCollapsed && (
            <div className="hb-profile-info">
              <span className="hb-profile-name">Admin User</span>
              <button onClick={handleLogout} className="hb-logout-btn">Logout</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`hb-main-content ${isCollapsed ? 'hb-main-expanded' : ''}`}>
        
        {/* Clean White Floating Navbar */}
        <header className="hb-navbar">
          <div className="hb-navbar-left">
            {/* Toggle Button */}
            <button className="hb-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
              <MenuIcon />
            </button>
            <div>
              <h3>{role === 'admin' ? 'Admin Dashboard' : 'Cashier Terminal'}</h3>
              <p>Welcome back, manage your store efficiently</p>
            </div>
          </div>
          
          <div className="hb-navbar-right">
            <div className="hb-search-box">
              <SearchIcon />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="hb-bell-btn">
              <BellIcon />
              <span className="hb-bell-dot"></span>
            </button>
          </div>
        </header>

        {/* 3. Replaced {children} with <Outlet /> */}
        <main className="hb-page-content">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

/* SVG Icons */
const MenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const ShopIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1-5h16l1 5M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M8 13h8"/></svg>;
const CategoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ProductIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const ReportIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const BillingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;