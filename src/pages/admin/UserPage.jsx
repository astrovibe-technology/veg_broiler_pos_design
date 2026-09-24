import { useState } from 'react';

export default function UserPage() {
  // Mock Shops for Dropdown
  const availableShops = ['Hari Vegetables', 'Hari Broilers', 'Hari Eggs'];
  // Roles based on your User model
  const availableRoles = ['Admin', 'Manager', 'Cashier'];

  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', username: 'admin', email: 'admin@hari.com', phone: '9876500000', role: 'Admin', shop: 'Hari Vegetables', password: 'pass123', status: 'Active' },
    { id: 2, name: 'Rahul Sharma', username: 'rahul', email: 'rahul@hari.com', phone: '9876511111', role: 'Manager', shop: 'Hari Broilers', password: 'pass456', status: 'Active' },
    { id: 3, name: 'Anjali Verma', username: 'anjali', email: 'anjali@hari.com', phone: '9876522222', role: 'Cashier', shop: 'Hari Vegetables', password: 'pass789', status: 'Inactive' },
  ]);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', phone: '', password: '', role: 'Cashier', shop: availableShops[0], status: 'Active'
  });
  const [showPassword, setShowPassword] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // --- EXPORT LOGIC ---
  const handleExportExcel = () => {
    const headers = ["ID", "Name", "Username", "Email", "Phone", "Role", "Shop", "Status"];
    const rows = users.map(u => [u.id, u.name, u.username, u.email, u.phone, u.role, u.shop, u.status]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Users_List.csv";
    link.click();
  };

  const handleExportPDF = () => window.print();

  // --- ADD LOGIC ---
  const handleOpenAddModal = () => {
    setFormData({ name: '', username: '', email: '', phone: '', password: '', role: 'Cashier', shop: availableShops[0], status: 'Active' });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { ...formData, id: newId }]);
    setIsAddModalOpen(false);
  };

  // --- EDIT LOGIC ---
  const handleEditClick = (user) => {
    setEditData(user);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => setEditData({ ...editData, [field]: value });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editData.id ? editData : u));
    setIsEditModalOpen(false);
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id) => setUsers(users.filter(u => u.id !== id));

  return (
    <div className="page-card-full">
      
      <div className="page-card-header">
        <div>
          <h2>User Management</h2>
          <p>Create and manage Managers and Cashiers</p>
        </div>
        <div className="header-actions">
          <button className="export-btn excel" onClick={handleExportExcel}><ExcelIcon /> Excel</button>
          <button className="export-btn pdf" onClick={handleExportPDF}><PdfIcon /> PDF</button>
          <button className="primary-btn" onClick={handleOpenAddModal}><PlusIcon /> Add User</button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-wrapper">
        <table className="modern-data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Shop</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td><div className="table-name-cell">{user.name}</div></td>
                <td>{user.username}</td>
                <td>
                  <span className={`status-badge ${user.role === 'Admin' ? 'out-of-stock' : user.role === 'Manager' ? 'available' : 'inactive'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.shop}</td>
                <td>
                  <span className={`status-badge ${user.status === 'Active' ? 'available' : 'out-of-stock'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="table-action-btns">
                    <button className="edit-btn" onClick={() => handleEditClick(user)}><EditIcon /></button>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}><TrashIcon /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- ADD USER MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}><CloseIcon /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="e.g. Rahul Sharma" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <PhoneIcon />
                    <input type="tel" placeholder="9876543210" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <MailIcon />
                    <input type="email" placeholder="user@hari.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" placeholder="e.g. rahul123" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} required />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter password" 
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="modal-select" value={formData.role} onChange={(e) => handleInputChange('role', e.target.value)}>
                    {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Assign to Shop</label>
                  <select className="modal-select" value={formData.shop} onChange={(e) => handleInputChange('shop', e.target.value)}>
                    {availableShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="add-status" value="Active" checked={formData.status === 'Active'} onChange={(e) => handleInputChange('status', e.target.value)} />
                      <span>Active</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="add-status" value="Inactive" checked={formData.status === 'Inactive'} onChange={(e) => handleInputChange('status', e.target.value)} />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {isEditModalOpen && editData && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User Details</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}><CloseIcon /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={editData.name} onChange={(e) => handleEditChange('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <PhoneIcon />
                    <input type="tel" value={editData.phone} onChange={(e) => handleEditChange('phone', e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <MailIcon />
                    <input type="email" value={editData.email} onChange={(e) => handleEditChange('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={editData.username} onChange={(e) => handleEditChange('username', e.target.value)} required />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showEditPassword ? "text" : "password"} 
                      value={editData.password}
                      onChange={(e) => handleEditChange('password', e.target.value)}
                      required
                    />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowEditPassword(!showEditPassword)}>
                      {showEditPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select className="modal-select" value={editData.role} onChange={(e) => handleEditChange('role', e.target.value)}>
                    {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Assign to Shop</label>
                  <select className="modal-select" value={editData.shop} onChange={(e) => handleEditChange('shop', e.target.value)}>
                    {availableShops.map(shop => <option key={shop} value={shop}>{shop}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="edit-status" value="Active" checked={editData.status === 'Active'} onChange={(e) => handleEditChange('status', e.target.value)} />
                      <span>Active</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="edit-status" value="Inactive" checked={editData.status === 'Inactive'} onChange={(e) => handleEditChange('status', e.target.value)} />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Update User</button>
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
const EyeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ExcelIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const PdfIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>;
const PhoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MailIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;