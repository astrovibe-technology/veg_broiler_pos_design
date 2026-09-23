import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import BillingPage from './pages/cashier/BillingPage';
import CategoryPage from './pages/admin/CategoryCreation';
import ProductPage from './pages/admin/ProductCreation';
import ShopPage from './pages/admin/ShopCreation'; // <-- ADD THIS IMPORT

// Temporary placeholders for remaining Admin pages
const DashboardPage = () => <div className="page-card"><h2>Dashboard Content Goes Here</h2></div>;
const ReportsPage = () => <div className="page-card"><h2>Reports Content Goes Here</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Layout role="admin" />}>
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Change this line to use the real ShopPage */}
          <Route path="shop" element={<ShopPage />} /> 
          <Route path="category" element={<CategoryPage />} />
          <Route path="product" element={<ProductPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route path="/cashier" element={<Layout role="cashier" />}>
          <Route path="billing" element={<BillingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;