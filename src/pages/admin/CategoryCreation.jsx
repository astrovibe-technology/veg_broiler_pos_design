import { useState } from 'react';

export default function CategoryPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Vegetables', shop: 'Hari Vegetables', status: 'Active' },
    { id: 2, name: 'Broiler', shop: 'Hari Broilers', status: 'Active' },
    { id: 3, name: 'Eggs', shop: 'Hari Eggs', status: 'Active' },
  ]);

  const availableShops = ['Hari Vegetables', 'Hari Broilers', 'Hari Eggs', 'Hari Fruits & Nuts'];

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(availableShops[0]);
  const [categoryNames, setCategoryNames] = useState(['']);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: '', shop: '' });

  // --- ADD MODAL LOGIC ---
  const handleOpenAddModal = () => {
    setSelectedShop(availableShops[0]);
    setCategoryNames(['']);
    setIsAddModalOpen(true);
  };

  const handleAddRow = () => setCategoryNames([...categoryNames, '']);

  const handleRemoveRow = (index) => {
    const list = [...categoryNames];
    list.splice(index, 1);
    setCategoryNames(list);
  };

  const handleRowChange = (index, value) => {
    const list = [...categoryNames];
    list[index] = value;
    setCategoryNames(list);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const validNames = categoryNames.filter(name => name.trim() !== '');
    if (validNames.length === 0) return;

    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCategories = validNames.map((name, i) => ({
      id: newId + i,
      name: name,
      shop: selectedShop,
      status: 'Active'
    }));

    setCategories([...categories, ...newCategories]);
    setIsAddModalOpen(false);
  };

  // --- EDIT MODAL LOGIC ---
  const handleEditClick = (cat) => {
    setEditData({ id: cat.id, name: cat.name, shop: cat.shop });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setCategories(categories.map(cat => 
      cat.id === editData.id ? { ...cat, name: editData.name, shop: editData.shop } : cat
    ));
    setIsEditModalOpen(false);
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
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
              <th>Shop Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>#{cat.id}</td>
                <td>
                  <div className="table-name-cell">
                    {cat.name}
                  </div>
                </td>
                <td>{cat.shop}</td>
                <td>
                  <span className="status-badge active">{cat.status}</span>
                </td>
                <td>
                  <div className="table-action-btns">
                    {/* Added onClick to Edit Button */}
                    <button className="edit-btn" onClick={() => handleEditClick(cat)}>
                      <EditIcon />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(cat.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD CATEGORIES MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Categories</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Select Shop</label>
                <select 
                  className="modal-select"
                  value={selectedShop} 
                  onChange={(e) => setSelectedShop(e.target.value)}
                >
                  {availableShops.map(shop => (
                    <option key={shop} value={shop}>{shop}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category Names</label>
                <div className="dynamic-fields-container">
                  {categoryNames.map((name, index) => (
                    <div className="dynamic-field-row" key={index}>
                      <input 
                        type="text" 
                        placeholder={`Category ${index + 1} (e.g. Leafy Greens)`} 
                        value={name}
                        onChange={(e) => handleRowChange(index, e.target.value)}
                        required
                      />
                      {categoryNames.length > 1 && (
                        <button type="button" className="remove-row-btn" onClick={() => handleRemoveRow(index)}>
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="button" className="add-row-btn" onClick={handleAddRow}>
                <PlusIcon /> Add Another Category
              </button>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save All</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Shop Name</label>
                <select 
                  className="modal-select"
                  value={editData.shop}
                  onChange={(e) => handleEditChange('shop', e.target.value)}
                >
                  {availableShops.map(shop => (
                    <option key={shop} value={shop}>{shop}</option>
                  ))}
                </select>
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