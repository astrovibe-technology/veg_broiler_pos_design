import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import BillingPage from './pages/cashier/BillingPage';
import CategoryPage from './pages/admin/CategoryCreation'; // (Or CategoryCreation depending on your file name)
import ProductPage from './pages/admin/ProductCreation'; // (Or ProductCreation)
import ShopPage from './pages/admin/ShopCreation'; // (Or ShopCreation)
import DashboardPage from './pages/admin/Dashboard'; // (Or Dashboard)
import SuperAdminPage from './pages/SuperAdminPage'; // <-- 1. ADD THIS IMPORT
import UserPage from './pages/admin/UserPage';
// Temporary placeholders for remaining Admin pages
const ReportsPage = () => <div className="page-card"><h2>Reports Content Goes Here</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Layout role="admin" />}>
          <Route path="dashboard" element={<DashboardPage />} /> 
          <Route path="shop" element={<ShopPage />} />
          <Route path="users" element={<UserPage />} /> {/* Assuming you have this */}
          <Route path="category" element={<CategoryPage />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="reports" element={<ReportsPage />} />
          {/* 2. ADD THIS ROUTE */}
          <Route path="superadmin" element={<SuperAdminPage />} /> 
        </Route>

        {/* Cashier Routes */}
        <Route path="/cashier" element={<Layout role="cashier" />}>
          <Route path="billing" element={<BillingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;