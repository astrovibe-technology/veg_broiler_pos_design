import { useState, useEffect, useRef } from 'react';

export default function BillingPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [orderType, setOrderType] = useState('Walk-in');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [billNumber, setBillNumber] = useState('Loading...');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');

  const paymentMethods = ['Cash', 'Card', 'UPI', 'Other'];

  // --- FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.categories) setCategories(data.categories);
    } catch (error) { console.error("Failed to fetch categories:", error); }
  };

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    if (!user || !user.shop_id) return;
    try {
      const response = await fetch(`${apiUrl}/products/?shop_id=${user.shop_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (error) { console.error("Failed to fetch products:", error); }
  };

  // --- FETCH NEXT BILL NUMBER ---
  const fetchBillNumber = async () => {
    if (!user || !user.shop_id) return;
    try {
      const response = await fetch(`${apiUrl}/billing/next-bill-number?shop_id=${user.shop_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.next_bill_number) {
        setBillNumber(data.next_bill_number);
      }
    } catch (error) { console.error("Failed to fetch bill number:", error); }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBillNumber();
  }, []);

  const getAvailableUnits = (baseUnit) => {
    if (baseUnit === 'kg') return ['kg', 'g'];
    if (baseUnit === 'pcs') return ['pcs', 'dozen'];
    return [baseUnit];
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Other';
  };

  const filteredItems = products.filter(item => {
    const catName = getCategoryName(item.category_id);
    const matchCat = activeCat === 'All' || catName === activeCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryPills = ['All', ...categories.map(c => c.name)];

  const addToCart = (item) => {
    const existing = cart.find(ci => ci.id === item.id);
    const units = getAvailableUnits(item.unit);
    if (existing) {
      setCart(cart.map(ci => ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
    } else {
      setCart([...cart, { ...item, isVeg: item.unit !== 'pcs', cat: getCategoryName(item.category_id), baseUnit: item.unit, units, qty: 1, selectedUnit: units[0] }]);
    }
  };

  const handleQtyChange = (id, value) => {
    setCart(cart.map(ci => {
      if (ci.id === id) {
        let qty = value === '' ? '' : parseFloat(value);
        if (ci.selectedUnit === 'pcs' || ci.selectedUnit === 'dozen' || ci.selectedUnit === 'g') {
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
  // Removed 5% Tax to match backend logic (Total = Subtotal - Discount)
  const total = subtotal - (parseFloat(discount) || 0);

  // --- CHECKOUT / CREATE BILL ---
  const handleCheckout = async () => {
    if (cart.length === 0 || total <= 0) return;
    
    try {
      const payload = {
        shop_id: user.shop_id,
        customer_name: customerName || "Walk-in Customer",
        customer_phone: customerPhone || null,
        discount: parseFloat(discount) || 0,
        payment_mode: paymentMethod,
        items: cart.map(item => {
          let baseQty = parseFloat(item.qty);
          if (item.selectedUnit === 'g') baseQty = parseFloat(item.qty) / 1000;
          if (item.selectedUnit === 'dozen') baseQty = parseFloat(item.qty) * 12;
          return { product_id: item.id, quantity: baseQty };
        })
      };

      const response = await fetch(`${apiUrl}/billing/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Bill created successfully! Bill No: ${data.bill_no}`);
        setCart([]);
        setDiscount(0);
        setCustomerName('Walk-in Customer');
        setCustomerPhone('');
        fetchBillNumber(); // Fetch the next bill number
      } else {
        alert(data.detail || "Failed to create bill");
      }
    } catch (error) {
      alert("Error connecting to API");
    }
  };

  // --- SPACEBAR EVENT LISTENER ---
  // Use a ref to always have the latest checkout function without re-adding the event listener constantly
  const checkoutRef = useRef(handleCheckout);
  useEffect(() => { checkoutRef.current = handleCheckout; });

  useEffect(() => {
    const handleSpacePress = (e) => {
      // If spacebar is pressed and the user is NOT typing in an input/select/textarea
      if (e.code === 'Space' && e.target.tagName.toLowerCase() === 'body') {
        e.preventDefault(); // Prevent scrolling down
        checkoutRef.current(); // Trigger checkout
      }
    };

    window.addEventListener('keydown', handleSpacePress);
    return () => window.removeEventListener('keydown', handleSpacePress);
  }, []);


  return (
    <div className="modern-pos-container">
      
      {/* --- LEFT PANEL: DARK MODE ITEMS --- */}
      <div className="dark-items-panel">
        <div className="dark-header">
          <h2>Select Items</h2>
          <div className="dark-search-box">
            <SearchIcon />
            <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="dark-categories">
          {categoryPills.map(cat => (
            <button key={cat} className={`dark-cat-pill ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div className="dark-grid">
          {filteredItems.map((item) => {
            const isVeg = item.unit !== 'pcs';
            return (
              <div key={item.id} className={`glow-tile ${isVeg ? 'veg-glow' : 'nonveg-glow'}`} onClick={() => addToCart(item)}>
                <div className={`dot-indicator ${isVeg ? 'veg' : 'nonveg'}`}></div>
                <h4>{item.name}</h4>
                <p>₹{item.price}<span>/{item.unit}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- RIGHT PANEL: LIGHT MODE CART --- */}
      <div className="light-cart-panel">
        <div className="light-cart-header">
          <div>
            <h2>Invoice {billNumber}</h2>
            <div className="light-toggle">
              <button className={orderType === 'Walk-in' ? 'active' : ''} onClick={() => setOrderType('Walk-in')}>Walk-in</button>
              <button className={orderType === 'Delivery' ? 'active' : ''} onClick={() => setOrderType('Delivery')}>Delivery</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="light-clear-btn" onClick={() => setIsCustomerModalOpen(true)}>
              Customer Details
            </button>
            <button className="light-clear-btn" onClick={() => setCart([])} disabled={cart.length === 0}>
              Clear
            </button>
          </div>
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
                      <input type="number" className="sleek-weight-input" value={item.qty} onChange={(e) => handleQtyChange(item.id, e.target.value)} step={item.selectedUnit === 'g' ? '1' : '1'} min="0" />
                      <select className="sleek-unit-select" value={item.selectedUnit} onChange={(e) => handleUnitChange(item.id, e.target.value)}>
                        {item.units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <span className="sleek-line-total">₹{(effPrice * (item.qty || 0)).toFixed(2)}</span>
                    <button className="sleek-remove-btn" onClick={() => removeItem(item.id)}><TrashIcon /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="light-cart-footer">
          <div className="sleek-totals">
            <div className="sleek-total-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="sleek-total-row discount-row">
              <span>Discount</span>
              <input type="number" className="discount-input" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" />
            </div>

            <div className="sleek-total-row grand">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-method-container">
            <label>Payment Method</label>
            <div className="payment-pills-row">
              {paymentMethods.map(method => (
                <button key={method} className={`payment-pill ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>
                  {method}
                </button>
              ))}
            </div>
          </div>

          <button className="sleek-pay-btn" disabled={cart.length === 0 || total <= 0} onClick={handleCheckout}>
            <span>Process Payment ({paymentMethod})</span>
            <span>₹{total.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* --- CUSTOMER DETAILS MODAL --- */}
      {isCustomerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="modal-close-btn" onClick={() => setIsCustomerModalOpen(false)}><CloseIcon /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsCustomerModalOpen(false); }} className="modal-form">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  placeholder="e.g. Rahul Sharma" 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  placeholder="e.g. 9876543210" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* SVG Icons */
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EmptyCartIcon = () => <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;