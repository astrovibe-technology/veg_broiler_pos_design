import { useState } from 'react';

export default function BillingPage() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [orderType, setOrderType] = useState('Walk-in');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // New State

  const menuItems = [
    { id: 1, name: 'Tomatoes', price: 40, isVeg: true, cat: 'Vegetables', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 2, name: 'Onions', price: 50, isVeg: true, cat: 'Vegetables', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 3, name: 'Potatoes', price: 35, isVeg: true, cat: 'Vegetables', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 4, name: 'Green Chilli', price: 80, isVeg: true, cat: 'Vegetables', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 5, name: 'Whole Chicken', price: 180, isVeg: false, cat: 'Broiler', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 6, name: 'Chicken Breast', price: 220, isVeg: false, cat: 'Broiler', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 7, name: 'Chicken Curry Cut', price: 190, isVeg: false, cat: 'Broiler', baseUnit: 'kg', units: ['kg', 'g'] },
    { id: 8, name: 'Farm Eggs', price: 6, isVeg: false, cat: 'Eggs', baseUnit: 'pcs', units: ['pcs', 'dozen'] },
  ];

  const categories = ['All', 'Vegetables', 'Broiler', 'Eggs'];
  const paymentMethods = ['Cash', 'Card', 'GPay', 'Other']; // Payment Options

  const filteredItems = menuItems.filter(item => 
    (activeCat === 'All' || item.cat === activeCat) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item) => {
    const existing = cart.find(ci => ci.id === item.id);
    if (existing) {
      setCart(cart.map(ci => ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
    } else {
      setCart([...cart, { ...item, qty: 1, selectedUnit: item.units[0] }]);
    }
  };

  const handleQtyChange = (id, value) => {
    setCart(cart.map(ci => {
      if (ci.id === id) {
        let qty = value === '' ? '' : parseFloat(value);
        if (ci.selectedUnit !== 'kg' && ci.selectedUnit !== 'g' && ci.selectedUnit !== 'dozen') {
          qty = isNaN(parseInt(value)) ? '' : parseInt(value);
        }
        return { ...ci, qty: isNaN(qty) ? '' : qty };
      }
      return ci;
    }));
  };

  const handleUnitChange = (id, newUnit) => {
    setCart(cart.map(ci => {
      if (ci.id === id) {
        let newQty = 1;
        if (newUnit === 'g') newQty = 500; 
        return { ...ci, selectedUnit: newUnit, qty: newQty };
      }
      return ci;
    }));
  };

  const removeItem = (id) => setCart(cart.filter(ci => ci.id !== id));

  const getEffectivePrice = (item) => {
    if (item.selectedUnit === 'g' && item.baseUnit === 'kg') return item.price / 1000;
    if (item.selectedUnit === 'dozen' && item.baseUnit === 'pcs') return item.price * 12;
    return item.price;
  };

  const subtotal = cart.reduce((acc, item) => acc + (getEffectivePrice(item) * (item.qty || 0)), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="modern-pos-container">
      
      {/* --- LEFT PANEL: DARK MODE ITEMS --- */}
      <div className="dark-items-panel">
        <div className="dark-header">
          <h2>Select Items</h2>
          <div className="dark-search-box">
            <SearchIcon />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="dark-categories">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`dark-cat-pill ${activeCat === cat ? 'active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="dark-grid">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`glow-tile ${item.isVeg ? 'veg-glow' : 'nonveg-glow'}`}
              onClick={() => addToCart(item)}
            >
              <div className={`dot-indicator ${item.isVeg ? 'veg' : 'nonveg'}`}></div>
              <h4>{item.name}</h4>
              <p>₹{item.price}<span>/{item.baseUnit}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT PANEL: LIGHT MODE CART --- */}
      <div className="light-cart-panel">
        <div className="light-cart-header">
          <div>
            <h2>Invoice #1045</h2>
            <div className="light-toggle">
              <button className={orderType === 'Walk-in' ? 'active' : ''} onClick={() => setOrderType('Walk-in')}>Walk-in</button>
              <button className={orderType === 'Delivery' ? 'active' : ''} onClick={() => setOrderType('Delivery')}>Delivery</button>
            </div>
          </div>
          <button className="light-clear-btn" onClick={() => setCart([])} disabled={cart.length === 0}>Clear</button>
        </div>

        <div className="light-cart-items">
          {cart.length === 0 ? (
            <div className="light-empty-cart">
              <EmptyCartIcon />
              <p>Cart is Empty</p>
            </div>
          ) : (
            cart.map((item) => {
              const effPrice = getEffectivePrice(item);
              return (
                <div key={item.id} className="light-cart-row">
                  <div className="light-cart-left">
                    <h5>{item.name}</h5>
                    <span>₹{effPrice.toFixed(2)} / {item.selectedUnit}</span>
                  </div>
                  <div className="light-cart-right">
                    <div className="sleek-input-group">
                      <input 
                        type="number" 
                        className="sleek-weight-input"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        step={item.selectedUnit === 'g' ? '1' : '0.001'}
                        min="0"
                      />
                      <select 
                        className="sleek-unit-select"
                        value={item.selectedUnit}
                        onChange={(e) => handleUnitChange(item.id, e.target.value)}
                      >
                        {item.units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <span className="sleek-line-total">₹{(effPrice * (item.qty || 0)).toFixed(2)}</span>
                    <button className="sleek-remove-btn" onClick={() => removeItem(item.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- FOOTER: Totals + Payment + Checkout --- */}
        <div className="light-cart-footer">
          <div className="sleek-totals">
            <div className="sleek-total-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="sleek-total-row">
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="sleek-total-row grand">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Pills */}
          <div className="payment-method-container">
            <label>Payment Method</label>
            <div className="payment-pills-row">
              {paymentMethods.map(method => (
                <button 
                  key={method} 
                  className={`payment-pill ${paymentMethod === method ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button className="sleek-pay-btn" disabled={cart.length === 0 || total === 0}>
            <span>Process Payment ({paymentMethod})</span>
            <span>₹{total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* SVG Icons */
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EmptyCartIcon = () => <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;