import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Your logo

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use the .env variable here
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      // Save token and user data to localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'superadmin') {
        navigate('/admin/superadmin'); // <-- Added Super Admin Route
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'cashier') {
        navigate('/cashier/billing');
      } else {
        setError('Access denied. Unknown user role.');
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          
          {/* Error Message Display */}
          {error && (
            <div style={{ 
              color: '#dc2626', 
              background: '#fee2e2', 
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              marginBottom: '20px', 
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="hb-form">
            <div className="hb-input-group">
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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