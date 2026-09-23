import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Your logo

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      // API CALL WILL GO HERE
      const role = username.toLowerCase() === 'admin' ? 'admin' : 'cashier';
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/cashier/billing');
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="hb-login-container">
      <div className="hb-login-card">
        
        {/* Top Branding Section */}
        <div className="hb-brand-section">
          <div className="hb-logo-wrapper">
            <div className="hb-logo-circle">
              <img src={logo} alt="Haribiriyani Logo" />
            </div>
            {/* <span className="hb-since-badge">SINCE 2017</span> */}
          </div>
          <h1 className="hb-title">Haribiriyani Food Market Vegetable POS</h1>
          {/* <p className="hb-slogan">Managing food, bills, and customers with speed and elegance.</p> */}
        </div>

        {/* Form Section */}
        <div className="hb-form-section">
         
          
          <form onSubmit={handleLogin} className="hb-form">
            <div className="hb-input-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="hb-input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

           

            <button type="submit" className="hb-signin-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="hb-copyright">
          © 2026 Haribiriyani Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}