import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminPage() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('menus');
  
  // --- MENUS STATE ---
  const [menus, setMenus] = useState([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  // Added parent_id to the form data state
  const [menuFormData, setMenuFormData] = useState({ menu_name: '', menu_code: '', path: '', icon: '', parent_id: null, sort_order: 1, is_active: true });
  const [editingMenuId, setEditingMenuId] = useState(null);

  // --- USERS & PERMISSIONS STATE ---
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // --- FETCH MENUS ---
  const fetchMenus = async () => {
    try {
      const response = await fetch(`${apiUrl}/menus/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setMenus(data.data);
    } catch (error) { console.error("Failed to fetch menus:", error); }
  };

  // --- FETCH USERS ---
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users);
        if (data.users.length > 0) setSelectedUserId(data.users[0].id);
      }
    } catch (error) { console.error("Failed to fetch users:", error); }
  };

  // --- FETCH PERMISSIONS FOR SELECTED USER ---
  const fetchPermissions = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`${apiUrl}/menus/permissions/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const merged = menus.map(menu => {
          const perm = data.data.find(p => p.menu_id === menu.id);
          return perm ? { ...perm, menu_name: menu.menu_name } : {
            id: null, menu_id: menu.id, menu_name: menu.menu_name,
            can_view: false, can_add: false, can_edit: false, can_delete: false, is_active: true
          };
        });
        setPermissions(merged);
      }
    } catch (error) { console.error("Failed to fetch permissions:", error); }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchMenus();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId && menus.length > 0) {
      fetchPermissions(selectedUserId);
    }
  }, [selectedUserId, menus]);

  // --- MENU CRUD LOGIC ---
  const handleOpenAddMenu = () => {
    // Reset form including parent_id
    setMenuFormData({ menu_name: '', menu_code: '', path: '', icon: '', parent_id: null, sort_order: 1, is_active: true });
    setEditingMenuId(null);
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (menu) => {
    // Populate form with existing menu data, ensure parent_id is handled
    setMenuFormData({ ...menu, parent_id: menu.parent_id || null });
    setEditingMenuId(menu.id);
    setIsMenuModalOpen(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMenuId ? `${apiUrl}/menus/${editingMenuId}` : `${apiUrl}/menus/create`;
      const method = editingMenuId ? 'PUT' : 'POST';
      
      // Convert empty string parent_id to null if needed
      const payload = { ...menuFormData, parent_id: menuFormData.parent_id || null };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) { setIsMenuModalOpen(false); fetchMenus(); }
      else { const errorData = await response.json(); alert(errorData.detail || 'Failed to save menu'); }
    } catch (error) { alert('Error connecting to API'); }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return;
    try {
      const response = await fetch(`${apiUrl}/menus/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchMenus();
    } catch (error) { alert('Error connecting to API'); }
  };

  // --- PERMISSION TOGGLE LOGIC ---
  const handlePermissionChange = async (perm, field) => {
    setPermissions(permissions.map(p => 
      p.menu_id === perm.menu_id ? { ...p, [field]: !p[field] } : p
    ));

    try {
      if (perm.id) {
        const updatedData = { ...perm, [field]: !perm[field] };
        await fetch(`${apiUrl}/menus/permissions/${perm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(updatedData)
        });
      } else {
        const newPerm = {
          user_id: selectedUserId,
          menu_id: perm.menu_id,
          can_view: field === 'can_view' ? true : perm.can_view,
          can_add: field === 'can_add' ? true : perm.can_add,
          can_edit: field === 'can_edit' ? true : perm.can_edit,
          can_delete: field === 'can_delete' ? true : perm.can_delete,
          is_active: true
        };
        const response = await fetch(`${apiUrl}/menus/permissions/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(newPerm)
        });
        if (response.ok) fetchPermissions(selectedUserId);
      }
    } catch (error) {
      console.error("Failed to update permission", error);
      fetchPermissions(selectedUserId);
    }
  };

  return (
    <div className="page-card-full">
      
      <div className="page-card-header">
        <div>
          <h2>Super Admin Control Panel</h2>
          <p>Manage system menus and user permissions</p>
        </div>
        <button className="logout-btn-clean" onClick={handleLogout}>
          <LogoutIcon /> Logout
        </button>
      </div>

      <div className="super-admin-tabs">
        <button className={`tab-btn ${activeTab === 'menus' ? 'active' : ''}`} onClick={() => setActiveTab('menus')}>
          Menu Management
        </button>
        <button className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>
          Role Permissions
        </button>
      </div>

      {/* --- MENUS TAB --- */}
      {activeTab === 'menus' && (
        <div className="tab-content">
          <div className="table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Menu Name</th><th>Code</th><th>Path</th><th>Icon</th><th>Parent</th><th>Sort</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.id}>
                    <td>#{menu.id}</td>
                    <td><div className="table-name-cell">{menu.menu_name}</div></td>
                    <td>{menu.menu_code}</td>
                    <td className="truncate-cell">{menu.path}</td>
                    <td>{menu.icon ? menu.icon : '—'}</td>
                    <td>{menu.parent_id ? `#${menu.parent_id}` : 'Root'}</td>
                    <td>{menu.sort_order}</td>
                    <td><span className={`status-badge ${menu.is_active ? 'available' : 'out-of-stock'}`}>{menu.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="table-action-btns">
                        <button className="edit-btn" onClick={() => handleOpenEditMenu(menu)}><EditIcon /></button>
                        <button className="delete-btn" onClick={() => handleDeleteMenu(menu.id)}><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="primary-btn" style={{ marginTop: '20px' }} onClick={handleOpenAddMenu}><PlusIcon /> Add New Menu</button>
        </div>
      )}

      {/* --- PERMISSIONS TAB --- */}
      {activeTab === 'permissions' && (
        <div className="tab-content">
          <div className="form-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
            <label>Select User to Manage Permissions</label>
            <select 
              className="modal-select" 
              value={selectedUserId || ''} 
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>Menu Name</th><th>Can View</th><th>Can Add</th><th>Can Edit</th><th>Can Delete</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', color: '#64748b'}}>Select a user to view permissions</td></tr>
                ) : (
                  permissions.map((perm) => (
                    <tr key={perm.menu_id}>
                      <td><div className="table-name-cell">{perm.menu_name}</div></td>
                      <td><label className="switch"><input type="checkbox" checked={perm.can_view} onChange={() => handlePermissionChange(perm, 'can_view')} /><span className="slider round"></span></label></td>
                      <td><label className="switch"><input type="checkbox" checked={perm.can_add} onChange={() => handlePermissionChange(perm, 'can_add')} /><span className="slider round"></span></label></td>
                      <td><label className="switch"><input type="checkbox" checked={perm.can_edit} onChange={() => handlePermissionChange(perm, 'can_edit')} /><span className="slider round"></span></label></td>
                      <td><label className="switch"><input type="checkbox" checked={perm.can_delete} onChange={() => handlePermissionChange(perm, 'can_delete')} /><span className="slider round"></span></label></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT MENU MODAL --- */}
      {isMenuModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsMenuModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMenuId ? 'Edit Menu' : 'Add New Menu'}</h3>
              <button className="modal-close-btn" onClick={() => setIsMenuModalOpen(false)}><CloseIcon /></button>
            </div>

            <form onSubmit={handleMenuSubmit} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Menu Name</label>
                  <input type="text" placeholder="e.g. Add Category" value={menuFormData.menu_name} onChange={(e) => setMenuFormData({ ...menuFormData, menu_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Menu Code</label>
                  <input type="text" placeholder="e.g. CAT" value={menuFormData.menu_code} onChange={(e) => setMenuFormData({ ...menuFormData, menu_code: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label>Path (Route URL)</label>
                <input type="text" placeholder="/admin/category" value={menuFormData.path} onChange={(e) => setMenuFormData({ ...menuFormData, path: e.target.value })} />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Parent Menu (Optional)</label>
                  <select 
                    className="modal-select"
                    value={menuFormData.parent_id || ''} 
                    onChange={(e) => setMenuFormData({ ...menuFormData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">None (Root Menu)</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>{m.menu_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Icon (SVG Name)</label>
                  <input type="text" placeholder="e.g. CategoryIcon" value={menuFormData.icon} onChange={(e) => setMenuFormData({ ...menuFormData, icon: e.target.value })} />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Sort Order</label>
                  <input type="number" value={menuFormData.sort_order} onChange={(e) => setMenuFormData({ ...menuFormData, sort_order: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input type="radio" name="menu-status" checked={menuFormData.is_active === true} onChange={() => setMenuFormData({ ...menuFormData, is_active: true })} />
                      <span>Active</span>
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="menu-status" checked={menuFormData.is_active === false} onChange={() => setMenuFormData({ ...menuFormData, is_active: false })} />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsMenuModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">{editingMenuId ? 'Update Menu' : 'Save Menu'}</button>
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
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;