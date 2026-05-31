import React, { useState } from 'react';
import { Plus, Trash2, X, Tag, Percent, Pencil } from 'lucide-react';
import { getCoupons, saveCoupon, deleteCoupon } from '../../data/store';

export default function OffersModule() {
  const [couponList, setCouponList] = useState(() => getCoupons());
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '',
    expiryDate: '', usageLimit: '', description: ''
  });

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiryDate: '', usageLimit: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrder),
      maxDiscount: String(coupon.maxDiscount),
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 10) : '',
      usageLimit: String(coupon.usageLimit),
      description: coupon.description || ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.value) return;

    const couponData = {
      id: editingCoupon?.id || `coup-${Date.now()}`,
      code: formData.code.toUpperCase().replace(/\s/g, ''),
      type: formData.type,
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: parseFloat(formData.maxDiscount) || 999,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : new Date(2026, 11, 31).toISOString(),
      usageLimit: parseInt(formData.usageLimit) || 100,
      usageCount: editingCoupon?.usageCount || 0,
      isActive: editingCoupon?.isActive ?? true,
      description: formData.description
    };

    saveCoupon(couponData);
    setCouponList(getCoupons());
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', expiryDate: '', usageLimit: '', description: '' });
  };

  const toggleActive = (id) => {
    const coupon = couponList.find(c => c.id === id);
    if (coupon) {
      saveCoupon({ ...coupon, isActive: !coupon.isActive });
      setCouponList(getCoupons());
    }
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm('Delete this coupon?')) {
      deleteCoupon(id);
      setCouponList(getCoupons());
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Offers & Coupons</h2>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {couponList.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={14} style={{ color: 'var(--royal-gold)' }} />
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.88rem' }}>
                      {coupon.code}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>{coupon.description}</div>
                </td>
                <td>
                  <span className={`admin-badge ${coupon.type === 'percentage' ? 'accepted' : 'new'}`}>
                    {coupon.type === 'percentage' ? <Percent size={10} /> : '₹'}
                    {' '}{coupon.type === 'percentage' ? 'Percentage' : 'Flat'}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem' }}>₹{coupon.minOrder}</td>
                <td>
                  <div style={{ fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 700 }}>{coupon.usageCount}</span>
                    <span style={{ color: '#888' }}> / {coupon.usageLimit}</span>
                  </div>
                  <div style={{
                    width: '80px', height: '4px', background: 'var(--heritage-cream)',
                    borderRadius: '2px', marginTop: '4px', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(coupon.usageCount / coupon.usageLimit) * 100}%`,
                      height: '100%', background: 'var(--royal-gold)', borderRadius: '2px'
                    }} />
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>
                  {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  {isExpired(coupon.expiryDate) ? (
                    <span className="admin-badge expired">Expired</span>
                  ) : (
                    <span className={`admin-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <label className="admin-toggle" style={{ marginRight: '0.3rem' }}>
                      <input type="checkbox" checked={coupon.isActive} onChange={() => toggleActive(coupon.id)} />
                      <span className="admin-toggle-slider" />
                    </label>
                    <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(coupon)}>
                      <Pencil size={13} />
                    </button>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Coupon Code</label>
                <input
                  className="admin-form-input"
                  value={formData.code}
                  onChange={(e) => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER30"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Discount Type</label>
                  <select
                    className="admin-form-input"
                    value={formData.type}
                    onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {formData.type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
                  </label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData(f => ({ ...f, value: e.target.value }))}
                    placeholder={formData.type === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Min Order (₹)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="e.g. 300"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Max Discount (₹)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData(f => ({ ...f, maxDiscount: e.target.value }))}
                    placeholder="e.g. 200"
                  />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Expiry Date</label>
                  <input
                    className="admin-form-input"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(f => ({ ...f, expiryDate: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Usage Limit</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData(f => ({ ...f, usageLimit: e.target.value }))}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <input
                  className="admin-form-input"
                  value={formData.description}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. 30% off on summer orders"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
