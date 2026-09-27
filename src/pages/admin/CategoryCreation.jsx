import { useState, useEffect } from 'react';

export default function CategoryPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', shop_ids: [] });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: '', description: '', shop_ids: [], is_active: true });

  // --- FETCH SHOPS ---
  const fetchShops = async () => {
    try {
      const response = await fetch(`${apiUrl}/shops/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // Extract array safely
        if (data.shops) setShops(data.shops);
        else if (Array.isArray(data)) setShops(data);
      }
    } catch (error) { console.error("Failed to fetch shops:", error); }
  };

  // --- FETCH CATEGORIES ---
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) { console.error("Failed to fetch categories:", error); }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchCategories();
    fetchShops();
  }, []);

  // --- ADD LOGIC ---
  const handleOpenAddModal = () => {
    setFormData({ name: '', description: '', shop_ids: [] });
    setIsAddModalOpen(true);
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
      // Match Pydantic CreateCategoryRequest
      const payload = {
        name: formData.name,
        description: formData.description || null,
        shop_ids: formData.shop_ids
      };

      const response = await fetch(`${apiUrl}/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to create category");
      }
    } catch (error) {
      alert("Error connecting to API");
    }
  };

  // --- EDIT LOGIC ---
  const handleEditClick = (cat) => {
    setEditData({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      shop_ids: cat.shop_ids || [],
      is_active: cat.is_active
    });
    setIsEditModalOpen(true);
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
      // Match Pydantic UpdateCategoryRequest
      const payload = {
        name: editData.name,
        description: editData.description || null,
        is_active: editData.is_active,
        shop_ids: editData.shop_ids
      };

      const response = await fetch(`${apiUrl}/categories/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to update category");
      }
    } catch (error) {
      alert("Error connecting to API");
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`${apiUrl}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchCategories();
    } catch (error) { alert("Error connecting to API"); }
  };

  // Helper to display shop names in table safely
  const getShopNames = (shopIds) => {
    if (!Array.isArray(shops) || shops.length === 0) return 'Loading...';
    const names = shopIds.map(id => {
      const shop = shops.find(s => s.id === id);
      return shop ? shop.name : null; // Uses shop.name
    }).filter(Boolean);
    return names.length > 0 ? names.join(', ') : '—';
  };

  return (
    <div className="page-card-full">
      
      {/* Page Header */}
      <div className="page-card-header">
        <div>
          <h2>Category Management</h2>
          <p>Create and manage your product categories</p>
        </div>
        <button className="primary-btn" onClick={handleOpenAddModal}>
          <PlusIcon /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="table-wrapper">
        <table className="modern-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th>Assigned Shops</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', color: '#64748b'}}>No categories found</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td><div className="table-name-cell">{cat.name}</div></td>
                  <td className="truncate-cell">{cat.description || '—'}</td>
                  <td>{getShopNames(cat.shop_ids)}</td>
                  <td>
                    <span className={`status-badge ${cat.is_active ? 'available' : 'out-of-stock'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-action-btns">
                      <button className="edit-btn" onClick={() => handleEditClick(cat)}>
                        <EditIcon />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(cat.id)}>
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

      {/* --- ADD CATEGORY MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Leafy Greens" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Short description" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

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
                <button type="submit" className="primary-btn">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
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
                <label>Status</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-cat-status" 
                      checked={editData.is_active === true} 
                      onChange={() => setEditData({ ...editData, is_active: true })}
                    />
                    <span>Active</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-cat-status" 
                      checked={editData.is_active === false} 
                      onChange={() => setEditData({ ...editData, is_active: false })}
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Update Category</button>
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