import { useState, useEffect } from 'react';

export default function ProductPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category_id: '', price: '', unit: 'kg', shop_ids: [], is_active: true
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- FETCH PRODUCTS ---
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/products/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(Array.isArray(data) ? data : (data.products || []));
      }
    } catch (error) { console.error("Failed to fetch products:", error); }
  };

  // --- FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || data);
      }
    } catch (error) { console.error("Failed to fetch categories:", error); }
  };

  // --- FETCH SHOPS ---
  const fetchShops = async () => {
    try {
      const response = await fetch(`${apiUrl}/shops/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        if (data.shops) setShops(data.shops);
        else if (Array.isArray(data)) setShops(data);
      }
    } catch (error) { console.error("Failed to fetch shops:", error); }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchShops();
  }, []);

  // --- ADD LOGIC ---
  const handleOpenAddModal = () => {
    setFormData({ name: '', category_id: '', price: '', unit: 'kg', shop_ids: [], is_active: true });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleShopToggle = (shopId) => {
    setFormData(prev => {
      const isSelected = prev.shop_ids.includes(shopId);
      return {
        ...prev,
        shop_ids: isSelected ? prev.shop_ids.filter(id => id !== shopId) : [...prev.shop_ids, shopId]
      };
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (formData.shop_ids.length === 0) {
      alert("Please select at least one shop.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        unit: formData.unit,
        price: parseFloat(formData.price),
        shop_ids: formData.shop_ids
      };

      const response = await fetch(`${apiUrl}/products/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to create product");
      }
    } catch (error) {
      alert("Error connecting to API");
    }
  };

  // --- EDIT LOGIC ---
  const handleEditClick = (product) => {
    setEditData({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      unit: product.unit,
      shop_ids: product.shop_ids || [],
      is_active: product.is_active
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditShopToggle = (shopId) => {
    setEditData(prev => {
      const isSelected = prev.shop_ids.includes(shopId);
      return {
        ...prev,
        shop_ids: isSelected ? prev.shop_ids.filter(id => id !== shopId) : [...prev.shop_ids, shopId]
      };
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editData.shop_ids.length === 0) {
      alert("Please select at least one shop.");
      return;
    }

    try {
      const payload = {
        name: editData.name,
        category_id: parseInt(editData.category_id),
        unit: editData.unit,
        price: parseFloat(editData.price),
        shop_ids: editData.shop_ids,
        is_active: editData.is_active
      };

      const response = await fetch(`${apiUrl}/products/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update product");
      }
    } catch (error) {
      alert("Error connecting to API");
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchProducts();
    } catch (error) { alert("Error connecting to API"); }
  };

  // Helpers to display names in table
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : '—';
  };

  const getShopNames = (shopIds) => {
    if (!Array.isArray(shops) || shops.length === 0) return 'Loading...';
    const names = shopIds.map(id => {
      const shop = shops.find(s => s.id === id);
      return shop ? shop.name : null;
    }).filter(Boolean);
    return names.length > 0 ? names.join(', ') : '—';
  };

  return (
    <div className="page-card-full">
      
      {/* Page Header */}
      <div className="page-card-header">
        <div>
          <h2>Product Management</h2>
          <p>Create and manage your shop inventory</p>
        </div>
        <button className="primary-btn" onClick={handleOpenAddModal}>
          <PlusIcon /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="table-wrapper">
        <table className="modern-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Assigned Shops</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="8" style={{textAlign: 'center', color: '#64748b'}}>No products found</td></tr>
            ) : (
              products.map((prod) => (
                <tr key={prod.id}>
                  <td>#{prod.id}</td>
                  <td><div className="table-name-cell">{prod.name}</div></td>
                  <td>{getCategoryName(prod.category_id)}</td>
                  <td>₹{prod.price}</td>
                  <td>{prod.unit}</td>
                  <td>{getShopNames(prod.shop_ids)}</td>
                  <td>
                    <span className={`status-badge ${prod.is_active ? 'available' : 'out-of-stock'}`}>
                      {prod.is_active ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="table-action-btns">
                      <button className="edit-btn" onClick={() => handleEditClick(prod)}>
                        <EditIcon />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(prod.id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Carrots" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="modal-select"
                    value={formData.category_id} 
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select 
                    className="modal-select"
                    value={formData.unit} 
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 50" 
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>

              {/* Multi-Select Shops */}
              <div className="form-group">
                <label>Assign to Shops (Multi-Select)</label>
                <div className="menu-checkbox-grid">
                  {shops.map(shop => (
                    <label className="premium-check-card" key={shop.id}>
                      <input
                        type="checkbox"
                        checked={formData.shop_ids.includes(shop.id)}
                        onChange={() => handleShopToggle(shop.id)}
                      />
                      <span className="check-text">{shop.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {isEditModalOpen && editData && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="modal-select"
                    value={editData.category_id} 
                    onChange={(e) => handleEditChange('category_id', e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select 
                    className="modal-select"
                    value={editData.unit} 
                    onChange={(e) => handleEditChange('unit', e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => handleEditChange('price', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assigned Shops (Multi-Select)</label>
                <div className="menu-checkbox-grid">
                  {shops.map(shop => (
                    <label className="premium-check-card" key={shop.id}>
                      <input
                        type="checkbox"
                        checked={editData.shop_ids.includes(shop.id)}
                        onChange={() => handleEditShopToggle(shop.id)}
                      />
                      <span className="check-text">{shop.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Availability Status</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-available" 
                      checked={editData.is_active === true} 
                      onChange={() => handleEditChange('is_active', true)}
                    />
                    <span>Available</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-available" 
                      checked={editData.is_active === false} 
                      onChange={() => handleEditChange('is_active', false)}
                    />
                    <span>Out of Stock</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* SVG Icons */
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;