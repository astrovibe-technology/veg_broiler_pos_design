import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import hariLogo from '../assets/logo.jpg';

export default function Layout({ role = 'admin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const [expandedMenu, setExpandedMenu] = useState(null); // State for accordion

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Map string icon names from DB to actual SVG components
  const iconMap = {
    'DashboardIcon': DashboardIcon,
    'ShopIcon': ShopIcon,
    'UsersIcon': UsersIcon,
    'CategoryIcon': CategoryIcon,
    'ProductIcon': ProductIcon,
    'ReportIcon': ReportIcon,
    'BillingIcon': BillingIcon,
    'SuperAdminIcon': SuperAdminIcon
  };

  // Fetch Sidebar Menus based on User Permissions
  useEffect(() => {
    const fetchSidebar = async () => {
      if (!user || !user.id || !token) {
        navigate('/'); // Redirect if not logged in
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/menus/user/${user.id}/sidebar`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.data) {
          setSidebarLinks(data.data); // Set the hierarchical menu data
        } else {
          console.error("Failed to fetch sidebar");
        }
      } catch (error) {
        console.error("Error fetching sidebar:", error);
      }
    };

    fetchSidebar();
  }, [navigate, token, user?.id]); // FIX: Used user?.id to prevent infinite loop

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="hb-dashboard-layout">
      
      {/* Red Brand Floating Sidebar */}
      <aside className={`hb-sidebar ${isCollapsed ? 'hb-collapsed' : ''}`}>
        <div className="hb-sidebar-brand">
          <div className="hb-sidebar-logo">
            <img src={hariLogo} alt="Haribiriyani Logo" />
          </div>
          {!isCollapsed && (
            <div>
              <h2>Haribiriyani</h2>
              <span>Food Market</span>
            </div>
          )}
        </div>

        <nav className="hb-sidebar-nav">
          {sidebarLinks.map((link) => {
            const IconComponent = iconMap[link.icon] || DashboardIcon;
            const isActive = location.pathname === link.path;
            const hasChildren = link.children && link.children.length > 0;
            const isExpanded = expandedMenu === link.id;

            return (
              <div className="hb-nav-group" key={link.id}>
                <button
                  className={`hb-nav-item ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                  onClick={() => {
                    if (hasChildren && !isCollapsed) {
                      setExpandedMenu(isExpanded ? null : link.id);
                    } else {
                      navigate(link.path);
                    }
                  }}
                  title={isCollapsed ? link.menu_name : ''} 
                >
                  <IconComponent />
                  {!isCollapsed && <span>{link.menu_name}</span>}
                  
                  {/* Dropdown Chevron */}
                  {hasChildren && !isCollapsed && (
                    <svg className={`hb-chevron ${isExpanded ? 'expanded' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {/* Child Menu Accordion */}
                {hasChildren && isExpanded && !isCollapsed && (
                  <div className="hb-nav-children">
                    {link.children.map((child) => {
                      const ChildIcon = iconMap[child.icon] || DashboardIcon;
                      const isChildActive = location.pathname === child.path;
                      return (
                        <button
                          key={child.id}
                          className={`hb-nav-item child ${isChildActive ? 'active' : ''}`}
                          onClick={() => navigate(child.path)}
                        >
                          <ChildIcon />
                          <span>{child.menu_name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hb-sidebar-profile">
          <div className="hb-profile-avatar">
            {user && user.name ? user.name.charAt(0) : 'A'}
          </div>
          {!isCollapsed && (
            <div className="hb-profile-info">
              <span className="hb-profile-name">{user && user.name ? user.name : 'Admin User'}</span>
              {/* Premium Glassmorphism Logout Button */}
              <button className="hb-logout-premium" onClick={handleLogout}>
                <LogoutIcon /> Logout
              </button>
            </div>
          )}
          
          {/* Show only icon when collapsed */}
          {isCollapsed && (
            <button className="hb-logout-icon-only" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </button>
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
              <h3>{user && user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Panel` : 'Dashboard'}</h3>
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
            {/* Sleek Navbar Logout Icon Button */}
            <button className="hb-logout-icon-btn" onClick={handleLogout} title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </header>

        {/* Replaced {children} with <Outlet /> */}
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
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CategoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const ProductIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const ReportIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>;
const BillingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const SuperAdminIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
// Sleek Power Off Icon
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;