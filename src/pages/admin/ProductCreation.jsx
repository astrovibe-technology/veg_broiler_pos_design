import { useState } from 'react';

export default function ProductPage() {
  // Mock Categories (In a real app, you would fetch these from your database)
  const availableCategories = ['Vegetables', 'Broiler', 'Eggs', 'Fruits & Nuts'];

  const [products, setProducts] = useState([
    { id: 1, name: 'Tomatoes', category: 'Vegetables', price: 40, unit: 'kg', available: true },
    { id: 2, name: 'Whole Chicken', category: 'Broiler', price: 180, unit: 'kg', available: true },
    { id: 3, name: 'Farm Eggs', category: 'Eggs', price: 6, unit: 'pcs', available: false },
  ]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: availableCategories[0], price: '', unit: 'kg', available: true
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // --- ADD LOGIC ---
  const handleOpenAddModal = () => {
    setFormData({ name: '', category: availableCategories[0], price: '', unit: 'kg', available: true });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      ...formData,
      id: newId,
      price: parseFloat(formData.price) || 0
    };
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
  };

  // --- EDIT LOGIC ---
  const handleEditClick = (product) => {
    setEditData(product);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setProducts(products.map(p => 
      p.id === editData.id ? { ...editData, price: parseFloat(editData.price) || 0 } : p
    ));
    setIsEditModalOpen(false);
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td>#{prod.id}</td>
                <td><div className="table-name-cell">{prod.name}</div></td>
                <td>{prod.category}</td>
                <td>₹{prod.price}</td>
                <td>{prod.unit}</td>
                <td>
                  <span className={`status-badge ${prod.available ? 'available' : 'out-of-stock'}`}>
                    {prod.available ? 'Available' : 'Out of Stock'}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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

              {/* Category Dropdown */}
              <div className="form-group">
                <label>Category</label>
                <select 
                  className="modal-select"
                  value={formData.category} 
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
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

              {/* Available Status Toggle */}
              <div className="form-group">
                <label>Availability Status</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="add-available" 
                      value="true" 
                      checked={formData.available === true} 
                      onChange={() => handleInputChange('available', true)}
                    />
                    <span>Available</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="add-available" 
                      value="false" 
                      checked={formData.available === false} 
                      onChange={() => handleInputChange('available', false)}
                    />
                    <span>Out of Stock</span>
                  </label>
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="modal-select"
                  value={editData.category} 
                  onChange={(e) => handleEditChange('category', e.target.value)}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
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
                <label>Availability Status</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-available" 
                      checked={editData.available === true} 
                      onChange={() => handleEditChange('available', true)}
                    />
                    <span>Available</span>
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="edit-available" 
                      checked={editData.available === false} 
                      onChange={() => handleEditChange('available', false)}
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