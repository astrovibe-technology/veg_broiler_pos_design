// import { useState, useEffect, useRef } from 'react';

// export default function BillingPage() {
//   const apiUrl = import.meta.env.VITE_API_URL;
//   const token = localStorage.getItem('token');
//   const storedUser = localStorage.getItem('user');
//   const user = storedUser ? JSON.parse(storedUser) : null;

//   const [cart, setCart] = useState([]);
//   const [search, setSearch] = useState('');
//   const [activeCat, setActiveCat] = useState('All');
//   const [orderType, setOrderType] = useState('Walk-in');
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [discount, setDiscount] = useState(0);
  
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
  
//   const [billNumber, setBillNumber] = useState('Loading...');
//   const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
//   const [customerName, setCustomerName] = useState('Walk-in Customer');
//   const [customerPhone, setCustomerPhone] = useState('');

//   const paymentMethods = ['Cash', 'Card', 'UPI', 'Other'];

//   // --- FETCH CATEGORIES ---
//   const fetchCategories = async () => {
//     try {
//       const response = await fetch(`${apiUrl}/categories/`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (response.ok && data.categories) setCategories(data.categories);
//     } catch (error) { console.error("Failed to fetch categories:", error); }
//   };

//   // --- FETCH PRODUCTS ---
//   const fetchProducts = async () => {
//     if (!user || !user.shop_id) return;
//     try {
//       const response = await fetch(`${apiUrl}/products/?shop_id=${user.shop_id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (response.ok) setProducts(data);
//     } catch (error) { console.error("Failed to fetch products:", error); }
//   };

//   // --- FETCH NEXT BILL NUMBER ---
//   const fetchBillNumber = async () => {
//     if (!user || !user.shop_id) return;
//     try {
//       const response = await fetch(`${apiUrl}/billing/next-bill-number?shop_id=${user.shop_id}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const data = await response.json();
//       if (response.ok && data.next_bill_number) {
//         setBillNumber(data.next_bill_number);
//       }
//     } catch (error) { console.error("Failed to fetch bill number:", error); }
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchBillNumber();
//   }, []);

//   const getAvailableUnits = (baseUnit) => {
//     if (baseUnit === 'kg') return ['kg', 'g'];
//     if (baseUnit === 'pcs') return ['pcs', 'dozen'];
//     return [baseUnit];
//   };

//   const getCategoryName = (catId) => {
//     const cat = categories.find(c => c.id === catId);
//     return cat ? cat.name : 'Other';
//   };

//   const filteredItems = products.filter(item => {
//     const catName = getCategoryName(item.category_id);
//     const matchCat = activeCat === 'All' || catName === activeCat;
//     const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
//     return matchCat && matchSearch;
//   });

//   const categoryPills = ['All', ...categories.map(c => c.name)];

//   const addToCart = (item) => {
//     const existing = cart.find(ci => ci.id === item.id);
//     const units = getAvailableUnits(item.unit);
//     if (existing) {
//       setCart(cart.map(ci => ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
//     } else {
//       setCart([...cart, { ...item, isVeg: item.unit !== 'pcs', cat: getCategoryName(item.category_id), baseUnit: item.unit, units, qty: 1, selectedUnit: units[0] }]);
//     }
//   };

//   const handleQtyChange = (id, value) => {
//     setCart(cart.map(ci => {
//       if (ci.id === id) {
//         let qty = value === '' ? '' : parseFloat(value);
//         if (ci.selectedUnit === 'pcs' || ci.selectedUnit === 'dozen' || ci.selectedUnit === 'g') {
//           qty = isNaN(parseInt(value)) ? '' : parseInt(value);
//         }
//         return { ...ci, qty: isNaN(qty) ? '' : qty };
//       }
//       return ci;
//     }));
//   };

//   const handleUnitChange = (id, newUnit) => {
//     setCart(cart.map(ci => {
//       if (ci.id === id) {
//         let newQty = 1;
//         if (newUnit === 'g') newQty = 500; 
//         return { ...ci, selectedUnit: newUnit, qty: newQty };
//       }
//       return ci;
//     }));
//   };

//   const removeItem = (id) => setCart(cart.filter(ci => ci.id !== id));

//   const getEffectivePrice = (item) => {
//     if (item.selectedUnit === 'g' && item.baseUnit === 'kg') return item.price / 1000;
//     if (item.selectedUnit === 'dozen' && item.baseUnit === 'pcs') return item.price * 12;
//     return item.price;
//   };

//   const subtotal = cart.reduce((acc, item) => acc + (getEffectivePrice(item) * (item.qty || 0)), 0);
//   // Removed 5% Tax to match backend logic (Total = Subtotal - Discount)
//   const total = subtotal - (parseFloat(discount) || 0);

//   // --- CHECKOUT / CREATE BILL ---
//   const handleCheckout = async () => {
//     if (cart.length === 0 || total <= 0) return;
    
//     try {
//       const payload = {
//         shop_id: user.shop_id,
//         customer_name: customerName || "Walk-in Customer",
//         customer_phone: customerPhone || null,
//         discount: parseFloat(discount) || 0,
//         payment_mode: paymentMethod,
//         items: cart.map(item => {
//           let baseQty = parseFloat(item.qty);
//           if (item.selectedUnit === 'g') baseQty = parseFloat(item.qty) / 1000;
//           if (item.selectedUnit === 'dozen') baseQty = parseFloat(item.qty) * 12;
//           return { product_id: item.id, quantity: baseQty };
//         })
//       };

//       const response = await fetch(`${apiUrl}/billing/create`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert(`Bill created successfully! Bill No: ${data.bill_no}`);
//         setCart([]);
//         setDiscount(0);
//         setCustomerName('Walk-in Customer');
//         setCustomerPhone('');
//         fetchBillNumber(); // Fetch the next bill number
//       } else {
//         alert(data.detail || "Failed to create bill");
//       }
//     } catch (error) {
//       alert("Error connecting to API");
//     }
//   };

//   // --- SPACEBAR EVENT LISTENER ---
//   // Use a ref to always have the latest checkout function without re-adding the event listener constantly
//   const checkoutRef = useRef(handleCheckout);
//   useEffect(() => { checkoutRef.current = handleCheckout; });

//   useEffect(() => {
//     const handleSpacePress = (e) => {
//       // If spacebar is pressed and the user is NOT typing in an input/select/textarea
//       if (e.code === 'Space' && e.target.tagName.toLowerCase() === 'body') {
//         e.preventDefault(); // Prevent scrolling down
//         checkoutRef.current(); // Trigger checkout
//       }
//     };

//     window.addEventListener('keydown', handleSpacePress);
//     return () => window.removeEventListener('keydown', handleSpacePress);
//   }, []);


//   return (
//     <div className="modern-pos-container">
      
//       {/* --- LEFT PANEL: DARK MODE ITEMS --- */}
//       <div className="dark-items-panel">
//         <div className="dark-header">
//           <h2>Select Items</h2>
//           <div className="dark-search-box">
//             <SearchIcon />
//             <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
//           </div>
//         </div>

//         <div className="dark-categories">
//           {categoryPills.map(cat => (
//             <button key={cat} className={`dark-cat-pill ${activeCat === cat ? 'active' : ''}`} onClick={() => setActiveCat(cat)}>
//               {cat}
//             </button>
//           ))}
//         </div>

//         <div className="dark-grid">
//           {filteredItems.map((item) => {
//             const isVeg = item.unit !== 'pcs';
//             return (
//               <div key={item.id} className={`glow-tile ${isVeg ? 'veg-glow' : 'nonveg-glow'}`} onClick={() => addToCart(item)}>
//                 <div className={`dot-indicator ${isVeg ? 'veg' : 'nonveg'}`}></div>
//                 <h4>{item.name}</h4>
//                 <p>₹{item.price}<span>/{item.unit}</span></p>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* --- RIGHT PANEL: LIGHT MODE CART --- */}
//       <div className="light-cart-panel">
//         <div className="light-cart-header">
//           <div>
//             <h2>Invoice {billNumber}</h2>
//             <div className="light-toggle">
//               <button className={orderType === 'Walk-in' ? 'active' : ''} onClick={() => setOrderType('Walk-in')}>Walk-in</button>
//               <button className={orderType === 'Delivery' ? 'active' : ''} onClick={() => setOrderType('Delivery')}>Delivery</button>
//             </div>
//           </div>
          
//           <div style={{ display: 'flex', gap: '8px' }}>
//             <button className="light-clear-btn" onClick={() => setIsCustomerModalOpen(true)}>
//               Customer Details
//             </button>
//             <button className="light-clear-btn" onClick={() => setCart([])} disabled={cart.length === 0}>
//               Clear
//             </button>
//           </div>
//         </div>

//         <div className="light-cart-items">
//           {cart.length === 0 ? (
//             <div className="light-empty-cart">
//               <EmptyCartIcon />
//               <p>Cart is Empty</p>
//             </div>
//           ) : (
//             cart.map((item) => {
//               const effPrice = getEffectivePrice(item);
//               return (
//                 <div key={item.id} className="light-cart-row">
//                   <div className="light-cart-left">
//                     <h5>{item.name}</h5>
//                     <span>₹{effPrice.toFixed(2)} / {item.selectedUnit}</span>
//                   </div>
//                   <div className="light-cart-right">
//                     <div className="sleek-input-group">
//                       <input type="number" className="sleek-weight-input" value={item.qty} onChange={(e) => handleQtyChange(item.id, e.target.value)} step={item.selectedUnit === 'g' ? '1' : '1'} min="0" />
//                       <select className="sleek-unit-select" value={item.selectedUnit} onChange={(e) => handleUnitChange(item.id, e.target.value)}>
//                         {item.units.map(u => <option key={u} value={u}>{u}</option>)}
//                       </select>
//                     </div>
//                     <span className="sleek-line-total">₹{(effPrice * (item.qty || 0)).toFixed(2)}</span>
//                     <button className="sleek-remove-btn" onClick={() => removeItem(item.id)}><TrashIcon /></button>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {/* --- FOOTER --- */}
//         <div className="light-cart-footer">
//           <div className="sleek-totals">
//             <div className="sleek-total-row">
//               <span>Subtotal</span>
//               <span>₹{subtotal.toFixed(2)}</span>
//             </div>
            
//             <div className="sleek-total-row discount-row">
//               <span>Discount</span>
//               <input type="number" className="discount-input" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" />
//             </div>

//             <div className="sleek-total-row grand">
//               <span>Total Amount</span>
//               <span>₹{total.toFixed(2)}</span>
//             </div>
//           </div>

//           <div className="payment-method-container">
//             <label>Payment Method</label>
//             <div className="payment-pills-row">
//               {paymentMethods.map(method => (
//                 <button key={method} className={`payment-pill ${paymentMethod === method ? 'active' : ''}`} onClick={() => setPaymentMethod(method)}>
//                   {method}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <button className="sleek-pay-btn" disabled={cart.length === 0 || total <= 0} onClick={handleCheckout}>
//             <span>Process Payment ({paymentMethod})</span>
//             <span>₹{total.toFixed(2)}</span>
//           </button>
//         </div>
//       </div>

//       {/* --- CUSTOMER DETAILS MODAL --- */}
//       {isCustomerModalOpen && (
//         <div className="modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
//           <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>Customer Details</h3>
//               <button className="modal-close-btn" onClick={() => setIsCustomerModalOpen(false)}><CloseIcon /></button>
//             </div>
//             <form onSubmit={(e) => { e.preventDefault(); setIsCustomerModalOpen(false); }} className="modal-form">
//               <div className="form-group">
//                 <label>Customer Name</label>
//                 <input 
//                   type="text" 
//                   value={customerName} 
//                   onChange={(e) => setCustomerName(e.target.value)} 
//                   placeholder="e.g. Rahul Sharma" 
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Phone Number</label>
//                 <input 
//                   type="tel" 
//                   value={customerPhone} 
//                   onChange={(e) => setCustomerPhone(e.target.value)} 
//                   placeholder="e.g. 9876543210" 
//                 />
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="modal-cancel-btn" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button>
//                 <button type="submit" className="primary-btn">Save Details</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// /* SVG Icons */
// const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
// const EmptyCartIcon = () => <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
// const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
import { useState, useEffect, useRef } from 'react';

export default function BillingPage() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem('token');

  const storedUser = localStorage.getItem('user');

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  // ============================================================
  // STATE
  // ============================================================

  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState('');

  const [activeCat, setActiveCat] = useState('All');

  const [orderType, setOrderType] = useState('Walk-in');

  const [paymentMethod, setPaymentMethod] =
    useState('Cash');

  const [discount, setDiscount] =
    useState(0);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [billNumber, setBillNumber] =
    useState('Loading...');

  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState(false);

  const [customerName, setCustomerName] =
    useState('Walk-in Customer');

  const [customerPhone, setCustomerPhone] =
    useState('');

  const [isProcessing, setIsProcessing] =
    useState(false);

  const paymentMethods = [
    'Cash',
    'Card',
    'UPI',
    'Other'
  ];

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/categories/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        data.categories
      ) {
        setCategories(
          data.categories
        );
      }

    } catch (error) {
      console.error(
        'Failed to fetch categories:',
        error
      );
    }
  };

  // ============================================================
  // FETCH PRODUCTS
  // ============================================================

  const fetchProducts = async () => {
    if (!user || !user.shop_id) {
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/products/?shop_id=${user.shop_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      }

    } catch (error) {
      console.error(
        'Failed to fetch products:',
        error
      );
    }
  };

  // ============================================================
  // FETCH NEXT BILL NUMBER
  // ============================================================

   // ============================================================
  // FETCH NEXT BILL NUMBER
  // ============================================================

  // ============================================================
  // FETCH NEXT BILL NUMBER
  // ============================================================

  const fetchBillNumber = async () => {
    if (!user || !user.shop_id) {
      setBillNumber('No Shop Assigned');
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/billing/next-bill-number?shop_id=${user.shop_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      
      // Add this console.log to see exactly what the backend is returning
      console.log("Bill number API response:", data);

      if (response.ok) {
        // Check multiple possible field names to be safe
        const fetchedNumber = data.next_bill_number || data.bill_number || data.bill_no;
        
        if (fetchedNumber) {
          setBillNumber(fetchedNumber);
        } else {
          // If the backend returned 200 OK but didn't include the bill number
          setBillNumber('Error: No bill number in response');
        }
      } else {
        setBillNumber(`Error: ${data.detail || 'Failed to fetch'}`);
      }

    } catch (error) {
      console.error('Failed to fetch bill number:', error);
      setBillNumber('Network Error');
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBillNumber();
  }, []);

  // ============================================================
  // AVAILABLE UNITS
  // ============================================================

  const getAvailableUnits = (baseUnit) => {
    if (baseUnit === 'kg') {
      return [
        'kg',
        'g'
      ];
    }

    if (baseUnit === 'pcs') {
      return [
        'pcs',
        'dozen'
      ];
    }

    return [
      baseUnit
    ];
  };

  // ============================================================
  // CATEGORY NAME
  // ============================================================

  const getCategoryName = (catId) => {
    const cat = categories.find(
      c => c.id === catId
    );

    return cat
      ? cat.name
      : 'Other';
  };

  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredItems = products.filter(
    item => {
      const catName =
        getCategoryName(
          item.category_id
        );

      const matchCat =
        activeCat === 'All' ||
        catName === activeCat;

      const matchSearch =
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchCat &&
        matchSearch
      );
    }
  );

  // ============================================================
  // CATEGORY PILLS
  // ============================================================

  const categoryPills = [
    'All',
    ...categories.map(
      c => c.name
    )
  ];

  // ============================================================
  // ADD TO CART
  // ============================================================

  const addToCart = (item) => {
    const existing =
      cart.find(
        ci => ci.id === item.id
      );

    const units =
      getAvailableUnits(
        item.unit
      );

    if (existing) {

      setCart(
        cart.map(
          ci =>
            ci.id === item.id
              ? {
                  ...ci,
                  qty:
                    ci.qty + 1
                }
              : ci
        )
      );

    } else {

      setCart([
        ...cart,
        {
          ...item,

          isVeg:
            item.unit !== 'pcs',

          cat:
            getCategoryName(
              item.category_id
            ),

          baseUnit:
            item.unit,

          units,

          qty: 1,

          selectedUnit:
            units[0]
        }
      ]);
    }
  };

  // ============================================================
  // QUANTITY CHANGE
  // ============================================================

  const handleQtyChange = (
    id,
    value
  ) => {

    setCart(
      cart.map(
        ci => {

          if (ci.id !== id) {
            return ci;
          }

          let qty =
            value === ''
              ? ''
              : parseFloat(value);

          if (
            ci.selectedUnit === 'pcs' ||
            ci.selectedUnit === 'dozen' ||
            ci.selectedUnit === 'g'
          ) {

            qty =
              isNaN(
                parseInt(value)
              )
                ? ''
                : parseInt(value);
          }

          return {
            ...ci,
            qty:
              isNaN(qty)
                ? ''
                : qty
          };
        }
      )
    );
  };

  // ============================================================
  // UNIT CHANGE
  // ============================================================

  const handleUnitChange = (
    id,
    newUnit
  ) => {

    setCart(
      cart.map(
        ci => {

          if (ci.id !== id) {
            return ci;
          }

          let newQty = 1;

          if (
            newUnit === 'g'
          ) {
            newQty = 500;
          }

          return {
            ...ci,
            selectedUnit:
              newUnit,
            qty:
              newQty
          };
        }
      )
    );
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const removeItem = (
    id
  ) => {

    setCart(
      cart.filter(
        ci => ci.id !== id
      )
    );
  };

  // ============================================================
  // EFFECTIVE PRICE
  // ============================================================

  const getEffectivePrice = (
    item
  ) => {

    if (
      item.selectedUnit === 'g' &&
      item.baseUnit === 'kg'
    ) {

      return (
        item.price / 1000
      );
    }

    if (
      item.selectedUnit === 'dozen' &&
      item.baseUnit === 'pcs'
    ) {

      return (
        item.price * 12
      );
    }

    return item.price;
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal =
    cart.reduce(
      (
        acc,
        item
      ) => {

        const effectivePrice =
          getEffectivePrice(
            item
          );

        const quantity =
          item.qty || 0;

        return (
          acc +
          (
            effectivePrice *
            quantity
          )
        );
      },
      0
    );

  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    subtotal -
    (
      parseFloat(discount) || 0
    );

  // ============================================================
  // SEND BILL TO LOCAL EXE
  // ============================================================

  const sendBillToPrinter = async (
    billData
  ) => {

    /*
     * IMPORTANT:
     *
     * This request goes to the Windows
     * printer EXE running on the POS computer.
     *
     * Backend:
     * https://veg.haribiriyani.org
     *
     * Printer EXE:
     * http://127.0.0.1:8001
     */

    const printerPayload = {

      // --------------------------------------------------------
      // BILL INFORMATION
      // --------------------------------------------------------

      inv_number:
        billData.bill_no,

      bill_no:
        billData.bill_no,

      sale_id:
        billData.sale_id,

      shop_id:
        billData.shop_id,

      // --------------------------------------------------------
      // SHOP INFORMATION
      // --------------------------------------------------------

      shop_name:
        billData.shop_name ||
        user?.shop_name ||
        '',

      shop_address:
        billData.shop_address ||
        user?.shop_address ||
        '',

      shop_mobile:
        billData.shop_mobile ||
        user?.shop_mobile ||
        '',

      // --------------------------------------------------------
      // CUSTOMER INFORMATION
      // --------------------------------------------------------

      customer_name:
        billData.customer_name ||
        'Walk-in Customer',

      customer_phone:
        billData.customer_phone ||
        '',

      // --------------------------------------------------------
      // ORDER INFORMATION
      // --------------------------------------------------------

      order_type:
        billData.order_type ||
        orderType,

      // --------------------------------------------------------
      // ITEMS
      // --------------------------------------------------------

      items:
        (billData.items || []).map(
          item => ({

            product_id:
              item.product_id,

            name:
              item.product_name ||
              item.name,

            product_name:
              item.product_name ||
              item.name,

            quantity:
              item.quantity,

            unit_price:
              item.unit_price,

            total_price:
              item.total_price
          })
        ),

      // --------------------------------------------------------
      // TOTALS
      // --------------------------------------------------------

      subtotal:
        billData.subtotal,

      discount:
        billData.discount,

      grand_total:
        billData.grand_total,

      total:
        billData.grand_total,

      // --------------------------------------------------------
      // PAYMENT
      // --------------------------------------------------------

      payment_mode:
        billData.payment_mode,

      // --------------------------------------------------------
      // STATUS
      // --------------------------------------------------------

      status:
        billData.status || 'completed'
    };

    console.log(
      'Sending bill to local printer EXE:',
      printerPayload
    );

    const printResponse =
      await fetch(
        'http://127.0.0.1:8001/print',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(
              printerPayload
            )
        }
      );

    let printData = {};

    try {

      printData =
        await printResponse.json();

    } catch (error) {

      console.warn(
        'Printer returned non-JSON response'
      );
    }

    if (
      !printResponse.ok
    ) {

      throw new Error(
        printData.detail ||
        printData.message ||
        `Printer returned HTTP ${printResponse.status}`
      );
    }

    return printData;
  };

  // ============================================================
  // CHECKOUT / CREATE BILL / PRINT
  // ============================================================

  const handleCheckout = async () => {

    if (
      cart.length === 0 ||
      total <= 0 ||
      isProcessing
    ) {
      return;
    }

    setIsProcessing(true);

    try {

      // ========================================================
      // 1. CREATE BILL PAYLOAD
      // ========================================================

      const payload = {

        shop_id:
          user.shop_id,

        customer_name:
          customerName ||
          'Walk-in Customer',

        customer_phone:
          customerPhone ||
          null,

        // IMPORTANT:
        // Send the selected order type
        order_type:
          orderType,

        discount:
          parseFloat(discount) ||
          0,

        payment_mode:
          paymentMethod,

        items:
          cart.map(
            item => {

              let baseQty =
                parseFloat(
                  item.qty
                );

              if (
                item.selectedUnit === 'g'
              ) {

                baseQty =
                  parseFloat(
                    item.qty
                  ) / 1000;
              }

              if (
                item.selectedUnit === 'dozen'
              ) {

                baseQty =
                  parseFloat(
                    item.qty
                  ) * 12;
              }

              return {

                product_id:
                  item.id,

                quantity:
                  baseQty
              };
            }
          )
      };

      console.log(
        'Creating bill:',
        payload
      );

      // ========================================================
      // 2. CREATE BILL IN BACKEND
      // ========================================================

      const response =
        await fetch(
          `${apiUrl}/billing/create`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              'Authorization':
                `Bearer ${token}`
            },

            body:
              JSON.stringify(
                payload
              )
          }
        );

      const data =
        await response.json();

      // ========================================================
      // 3. BACKEND ERROR
      // ========================================================

      if (
        !response.ok
      ) {

        alert(
          data.detail ||
          'Failed to create bill'
        );

        return;
      }

      console.log(
        'Bill created successfully:',
        data
      );

      // ========================================================
      // 4. SEND BILL TO LOCAL EXE
      // ========================================================

      let printSuccess = false;

      try {

        await sendBillToPrinter(
          data
        );

        printSuccess = true;

        console.log(
          'Bill sent to printer successfully'
        );

      } catch (printError) {

        console.error(
          'Local printer EXE error:',
          printError
        );

        /*
         * IMPORTANT:
         *
         * The bill has ALREADY been created
         * in the database.
         *
         * We DO NOT call /billing/create again.
         *
         * This prevents duplicate bills.
         */

        alert(
          `Bill ${data.bill_no} created successfully.\n\n` +
          `However, the local printer EXE could not be reached.\n\n` +
          `Please make sure the HariPOS printer application is running.`
        );
      }

      // ========================================================
      // 5. SUCCESS MESSAGE
      // ========================================================

      if (printSuccess) {

        alert(
          `Bill created and printed successfully!\n\n` +
          `Bill No: ${data.bill_no}`
        );
      }

      // ========================================================
      // 6. CLEAR CART
      // ========================================================

      setCart([]);

      setDiscount(0);

      setCustomerName(
        'Walk-in Customer'
      );

      setCustomerPhone('');

      setOrderType(
        'Walk-in'
      );

      setPaymentMethod(
        'Cash'
      );

      // ========================================================
      // 7. GET NEXT BILL NUMBER
      // ========================================================

      fetchBillNumber();

    } catch (error) {

      console.error(
        'Checkout error:',
        error
      );

      alert(
        'Error connecting to billing API.\n\n' +
        'Please check your internet connection and try again.'
      );

    } finally {

      setIsProcessing(false);
    }
  };

  // ============================================================
  // SPACEBAR CHECKOUT
  // ============================================================

  const checkoutRef =
    useRef(
      handleCheckout
    );

  useEffect(() => {

    checkoutRef.current =
      handleCheckout;

  });

  useEffect(() => {

    const handleSpacePress =
      (e) => {

        const tagName =
          e.target.tagName.toLowerCase();

        if (
          e.code === 'Space' &&
          tagName === 'body'
        ) {

          e.preventDefault();

          checkoutRef.current();
        }
      };

    window.addEventListener(
      'keydown',
      handleSpacePress
    );

    return () => {

      window.removeEventListener(
        'keydown',
        handleSpacePress
      );
    };

  }, []);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="modern-pos-container">

      {/* ======================================================
          LEFT PANEL
      ====================================================== */}

      <div className="dark-items-panel">

        <div className="dark-header">

          <h2>
            Select Items
          </h2>

          <div className="dark-search-box">

            <SearchIcon />

            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={
                (e) =>
                  setSearch(
                    e.target.value
                  )
              }
            />

          </div>

        </div>

        {/* ====================================================
            CATEGORIES
        ==================================================== */}

        <div className="dark-categories">

          {categoryPills.map(
            cat => (

              <button
                key={cat}
                className={
                  `dark-cat-pill ${
                    activeCat === cat
                      ? 'active'
                      : ''
                  }`
                }
                onClick={
                  () =>
                    setActiveCat(cat)
                }
              >
                {cat}
              </button>

            )
          )}

        </div>

        {/* ====================================================
            PRODUCTS
        ==================================================== */}

        <div className="dark-grid">

          {filteredItems.map(
            item => {

              const isVeg =
                item.unit !== 'pcs';

              return (

                <div
                  key={item.id}
                  className={
                    `glow-tile ${
                      isVeg
                        ? 'veg-glow'
                        : 'nonveg-glow'
                    }`
                  }
                  onClick={
                    () =>
                      addToCart(item)
                  }
                >

                  <div
                    className={
                      `dot-indicator ${
                        isVeg
                          ? 'veg'
                          : 'nonveg'
                      }`
                    }
                  />

                  <h4>
                    {item.name}
                  </h4>

                  <p>
                    ₹
                    {item.price}

                    <span>
                      /{item.unit}
                    </span>
                  </p>

                </div>

              );
            }
          )}

        </div>

      </div>

      {/* ======================================================
          RIGHT PANEL
      ====================================================== */}

      <div className="light-cart-panel">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="light-cart-header">

          <div>

            <h2>
              Invoice {billNumber}
            </h2>

            <div className="light-toggle">

              <button
                className={
                  orderType === 'Walk-in'
                    ? 'active'
                    : ''
                }
                onClick={
                  () =>
                    setOrderType(
                      'Walk-in'
                    )
                }
              >
                Walk-in
              </button>

              <button
                className={
                  orderType === 'Delivery'
                    ? 'active'
                    : ''
                }
                onClick={
                  () =>
                    setOrderType(
                      'Delivery'
                    )
                }
              >
                Delivery
              </button>

            </div>

          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >

            {/* CUSTOMER BUTTON */}

            <button
              className="light-clear-btn"
              onClick={
                () =>
                  setIsCustomerModalOpen(
                    true
                  )
              }
            >
              Customer Details
            </button>

            {/* CLEAR BUTTON */}

            <button
              className="light-clear-btn"
              onClick={
                () =>
                  setCart([])
              }
              disabled={
                cart.length === 0
              }
            >
              Clear
            </button>

          </div>

        </div>

        {/* ====================================================
            CART ITEMS
        ==================================================== */}

        <div className="light-cart-items">

          {cart.length === 0 ? (

            <div className="light-empty-cart">

              <EmptyCartIcon />

              <p>
                Cart is Empty
              </p>

            </div>

          ) : (

            cart.map(
              item => {

                const effPrice =
                  getEffectivePrice(
                    item
                  );

                return (

                  <div
                    key={item.id}
                    className="light-cart-row"
                  >

                    <div className="light-cart-left">

                      <h5>
                        {item.name}
                      </h5>

                      <span>
                        ₹
                        {effPrice.toFixed(2)}
                        {' '}
                        /
                        {' '}
                        {item.selectedUnit}
                      </span>

                    </div>

                    <div className="light-cart-right">

                      <div className="sleek-input-group">

                        <input
                          type="number"
                          className="sleek-weight-input"
                          value={item.qty}
                          onChange={
                            (e) =>
                              handleQtyChange(
                                item.id,
                                e.target.value
                              )
                          }
                          step={
                            item.selectedUnit === 'g'
                              ? '1'
                              : '1'
                          }
                          min="0"
                        />

                        <select
                          className="sleek-unit-select"
                          value={
                            item.selectedUnit
                          }
                          onChange={
                            (e) =>
                              handleUnitChange(
                                item.id,
                                e.target.value
                              )
                          }
                        >

                          {item.units.map(
                            u => (

                              <option
                                key={u}
                                value={u}
                              >
                                {u}
                              </option>

                            )
                          )}

                        </select>

                      </div>

                      <span
                        className="sleek-line-total"
                      >
                        ₹
                        {
                          (
                            effPrice *
                            (
                              item.qty || 0
                            )
                          ).toFixed(2)
                        }
                      </span>

                      <button
                        className="sleek-remove-btn"
                        onClick={
                          () =>
                            removeItem(
                              item.id
                            )
                        }
                      >
                        <TrashIcon />
                      </button>

                    </div>

                  </div>

                );
              }
            )

          )}

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="light-cart-footer">

          {/* ==================================================
              TOTALS
          ================================================== */}

          <div className="sleek-totals">

            <div className="sleek-total-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {subtotal.toFixed(2)}
              </span>

            </div>

            <div
              className={
                "sleek-total-row discount-row"
              }
            >

              <span>
                Discount
              </span>

              <input
                type="number"
                className="discount-input"
                value={discount}
                onChange={
                  (e) =>
                    setDiscount(
                      e.target.value
                    )
                }
                placeholder="0.00"
                min="0"
              />

            </div>

            <div
              className={
                "sleek-total-row grand"
              }
            >

              <span>
                Total Amount
              </span>

              <span>
                ₹
                {total.toFixed(2)}
              </span>

            </div>

          </div>

          {/* ==================================================
              PAYMENT METHOD
          ================================================== */}

          <div
            className={
              "payment-method-container"
            }
          >

            <label>
              Payment Method
            </label>

            <div
              className={
                "payment-pills-row"
              }
            >

              {paymentMethods.map(
                method => (

                  <button
                    key={method}
                    className={
                      `payment-pill ${
                        paymentMethod === method
                          ? 'active'
                          : ''
                      }`
                    }
                    onClick={
                      () =>
                        setPaymentMethod(
                          method
                        )
                    }
                  >
                    {method}
                  </button>

                )
              )}

            </div>

          </div>

          {/* ==================================================
              PROCESS PAYMENT
          ================================================== */}

          <button
            className="sleek-pay-btn"
            disabled={
              cart.length === 0 ||
              total <= 0 ||
              isProcessing
            }
            onClick={
              handleCheckout
            }
          >

            <span>

              {isProcessing
                ? 'Processing...'
                : `Process Payment (${paymentMethod})`
              }

            </span>

            <span>
              ₹
              {total.toFixed(2)}
            </span>

          </button>

        </div>

      </div>

      {/* ======================================================
          CUSTOMER MODAL
      ====================================================== */}

      {isCustomerModalOpen && (

        <div
          className="modal-backdrop"
          onClick={
            () =>
              setIsCustomerModalOpen(
                false
              )
          }
        >

          <div
            className="modal-card"
            onClick={
              (e) =>
                e.stopPropagation()
            }
          >

            <div
              className="modal-header"
            >

              <h3>
                Customer Details
              </h3>

              <button
                className={
                  "modal-close-btn"
                }
                onClick={
                  () =>
                    setIsCustomerModalOpen(
                      false
                    )
                }
              >
                <CloseIcon />
              </button>

            </div>

            <form
              onSubmit={
                (e) => {

                  e.preventDefault();

                  setIsCustomerModalOpen(
                    false
                  );
                }
              }
              className="modal-form"
            >

              {/* CUSTOMER NAME */}

              <div className="form-group">

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  value={
                    customerName
                  }
                  onChange={
                    (e) =>
                      setCustomerName(
                        e.target.value
                      )
                  }
                  placeholder="e.g. Rahul Sharma"
                />

              </div>

              {/* CUSTOMER PHONE */}

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={
                    customerPhone
                  }
                  onChange={
                    (e) =>
                      setCustomerPhone(
                        e.target.value
                      )
                  }
                  placeholder="e.g. 9876543210"
                />

              </div>

              {/* MODAL FOOTER */}

              <div
                className="modal-footer"
              >

                <button
                  type="button"
                  className={
                    "modal-cancel-btn"
                  }
                  onClick={
                    () =>
                      setIsCustomerModalOpen(
                        false
                      )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    "primary-btn"
                  }
                >
                  Save Details
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* ============================================================
   SVG ICONS
============================================================ */

const SearchIcon = () => (

  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >

    <circle
      cx="11"
      cy="11"
      r="8"
    />

    <line
      x1="21"
      y1="21"
      x2="16.65"
      y2="16.65"
    />

  </svg>
);


const TrashIcon = () => (

  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >

    <polyline
      points="3 6 5 6 21 6"
    />

    <path
      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
    />

  </svg>
);


const EmptyCartIcon = () => (

  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e2e8f0"
    strokeWidth="1.5"
  >

    <circle
      cx="9"
      cy="21"
      r="1"
    />

    <circle
      cx="20"
      cy="21"
      r="1"
    />

    <path
      d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
    />

  </svg>
);


const CloseIcon = () => (

  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >

    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
    />

    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
    />

  </svg>
);