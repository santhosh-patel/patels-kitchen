import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { saveDish, deleteDish } from '../../data/store';

export default function MenuModule() {
  const { dishes, categories: storeCategories, refresh } = useStore();
  const categories = storeCategories.filter(c => c.id !== 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'breakfast', description: '', price: '', isVeg: true, available: true
  });

  const filtered = useMemo(() => {
    return dishes.filter(dish => {
      const matchSearch = !searchTerm ||
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || dish.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [dishes, searchTerm, categoryFilter]);

  const openAdd = () => {
    setEditingDish(null);
    setFormData({ name: '', category: 'breakfast', description: '', price: '', isVeg: true, available: true });
    setShowModal(true);
  };

  const openEdit = (dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      category: dish.category,
      description: dish.description,
      price: dish.price.toString(),
      isVeg: dish.isVeg,
      available: dish.available
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingDish) {
      const updatedDish = { ...editingDish, ...formData, price: parseFloat(formData.price) };
      saveDish(updatedDish);
    } else {
      const newDish = {
        id: `dish-${Date.now()}`,
        ...formData,
        price: parseFloat(formData.price),
        image: null,
        rating: 0,
        spiceLevel: 1,
        isSignature: false
      };
      saveDish(newDish);
    }
    refresh();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      deleteDish(id);
      refresh();
    }
  };

  const toggleAvailability = (id) => {
    const dish = dishes.find(d => d.id === id);
    if (dish) {
      saveDish({ ...dish, available: !dish.available });
      refresh();
    }
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Menu Management</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="text"
          placeholder="Search dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>{filtered.length} dishes</span>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Type</th>
              <th>Rating</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dish) => (
              <tr key={dish.id} style={{ opacity: dish.available ? 1 : 0.5 }}>
                <td>
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '8px',
                      background: 'var(--heritage-cream)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#888'
                    }}>
                      N/A
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{dish.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#888', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dish.description}
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {categories.find(c => c.id === dish.category)?.name || dish.category}
                </td>
                <td>
                  <span style={{ fontWeight: 700 }}>₹{dish.price}</span>
                </td>
                <td>
                  <span className={`admin-badge ${dish.isVeg ? 'veg' : 'nonveg'}`}>
                    {dish.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem' }}>
                    {dish.rating > 0 ? `${dish.rating}/5` : '-'}
                  </span>
                </td>
                <td>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={dish.available}
                      onChange={() => toggleAvailability(dish.id)}
                    />
                    <span className="admin-toggle-slider" />
                  </label>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openEdit(dish)}
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(dish.id)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingDish ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setShowModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Dish Name</label>
                <input
                  className="admin-form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Chicken Biryani"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (₹)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 320"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description of the dish..."
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Type</label>
                  <select
                    className="admin-form-input"
                    value={formData.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setFormData(f => ({ ...f, isVeg: e.target.value === 'veg' }))}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Available</label>
                  <select
                    className="admin-form-input"
                    value={formData.available ? 'yes' : 'no'}
                    onChange={(e) => setFormData(f => ({ ...f, available: e.target.value === 'yes' }))}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editingDish ? 'Save Changes' : 'Add Dish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
