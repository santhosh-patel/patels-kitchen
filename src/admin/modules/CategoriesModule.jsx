import React, { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, X } from 'lucide-react';
import { getCategories, saveCategories, getDishes } from '../../data/store';

export default function CategoriesModule() {
  const [categories, setCategories] = useState(() => {
    const cats = getCategories();
    const dishes = getDishes();
    return cats.filter(c => c.id !== 'all').map(c => ({
      ...c,
      dishCount: dishes.filter(d => d.category === c.id).length
    }));
  });
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formName, setFormName] = useState('');

  const openAdd = () => {
    setEditingCat(null);
    setFormName('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    let updated;
    if (editingCat) {
      updated = categories.map(c =>
        c.id === editingCat.id ? { ...c, name: formName.trim() } : c
      );
    } else {
      updated = [...categories, {
        id: formName.trim().toLowerCase().replace(/\s+/g, ''),
        name: formName.trim(),
        dishCount: 0
      }];
    }
    const allCat = getCategories().find(c => c.id === 'all') || { id: 'all', name: 'Royal Feast' };
    saveCategories([allCat, ...updated.map(({ id, name }) => ({ id, name }))]);

    const dishes = getDishes();
    setCategories(updated.map(c => ({
      ...c,
      dishCount: dishes.filter(d => d.category === c.id).length
    })));
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this category? Dishes in this category will become uncategorized.')) {
      const updated = categories.filter(c => c.id !== id);
      const allCat = getCategories().find(c => c.id === 'all') || { id: 'all', name: 'Royal Feast' };
      saveCategories([allCat, ...updated.map(({ id, name }) => ({ id, name }))]);

      const dishes = getDishes();
      setCategories(updated.map(c => ({
        ...c,
        dishCount: dishes.filter(d => d.category === c.id).length
      })));
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const arr = [...categories];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    const allCat = getCategories().find(c => c.id === 'all') || { id: 'all', name: 'Royal Feast' };
    saveCategories([allCat, ...arr.map(({ id, name }) => ({ id, name }))]);
    setCategories(arr);
  };

  const moveDown = (index) => {
    if (index === categories.length - 1) return;
    const arr = [...categories];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    const allCat = getCategories().find(c => c.id === 'all') || { id: 'all', name: 'Royal Feast' };
    saveCategories([allCat, ...arr.map(({ id, name }) => ({ id, name }))]);
    setCategories(arr);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Categories</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Order</th>
              <th style={{ width: '50px' }}>#</th>
              <th>Category Name</th>
              <th>ID</th>
              <th>Dishes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      ▲
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                      onClick={() => moveDown(index)}
                      disabled={index === categories.length - 1}
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#888' }}>{index + 1}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                </td>
                <td>
                  <code style={{ fontSize: '0.78rem', background: 'var(--heritage-cream)', padding: '2px 6px', borderRadius: '4px' }}>
                    {cat.id}
                  </code>
                </td>
                <td>
                  <span style={{
                    background: 'rgba(184,138,59,0.1)',
                    color: 'var(--royal-gold)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {cat.dishCount} dishes
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(cat.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
            <div className="admin-modal-header">
              <h3>{editingCat ? 'Edit Category' : 'Add Category'}</h3>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Category Name</label>
                <input
                  className="admin-form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Appetizers"
                  autoFocus
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editingCat ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
