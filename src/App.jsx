import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import BillingPage from './pages/cashier/BillingPage';
import CategoryCreation from './pages/admin/CategoryCreation';
import ProductCreation from './pages/admin/ProductCreation';
import ShopCreation from './pages/admin/ShopCreation';
import Dashboard from './pages/admin/Dashboard'; 
import UserCreation from './pages/admin/UserPage'; 

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
          <Route path="dashboard" element={<Dashboard />} /> 
          <Route path="shop" element={<ShopCreation />} />
          {/* ADDED USER ROUTE */}
          <Route path="users" element={<UserCreation />} />
          <Route path="category" element={<CategoryCreation />} />
          <Route path="product" element={<ProductCreation />} />
          <Route path="reports" element={<ReportsPage />} />
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