import React, { useState, useMemo } from 'react';
import { Star, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { getReviews, saveReview } from '../../data/store';

export default function ReviewsModule() {
  const [reviewList, setReviewList] = useState(() => getReviews());
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return reviewList.filter(r => {
      const matchRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchRating && matchStatus;
    });
  }, [reviewList, ratingFilter, statusFilter]);

  const avgRating = reviewList.length > 0
    ? (reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length).toFixed(1)
    : 0;

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviewList.filter(r => r.rating === star).length,
    pct: reviewList.length > 0 ? (reviewList.filter(r => r.rating === star).length / reviewList.length) * 100 : 0
  }));

  const handleApprove = (id) => {
    const review = reviewList.find(r => r.id === id);
    if (review) {
      saveReview({ ...review, status: 'Approved' });
      setReviewList(getReviews());
    }
  };

  const handleFlag = (id) => {
    const review = reviewList.find(r => r.id === id);
    if (review) {
      saveReview({ ...review, status: 'Flagged' });
      setReviewList(getReviews());
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this review?')) {
      const updated = getReviews().filter(r => r.id !== id);
      localStorage.setItem('pk_reviews', JSON.stringify(updated));
      setReviewList(getReviews());
    }
  };

  const renderStars = (rating) => (
    <div className="admin-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={14} className={`admin-star ${s <= rating ? 'filled' : ''}`} fill={s <= rating ? 'var(--royal-gold)' : 'none'} />
      ))}
    </div>
  );

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Reviews & Ratings</h2>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>{reviewList.length} total reviews</span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="admin-chart-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--royal-gold)' }}>{avgRating}</div>
          <div style={{ marginBottom: '0.5rem' }}>{renderStars(Math.round(avgRating))}</div>
          <p style={{ fontSize: '0.78rem', color: '#888' }}>Average Rating ({reviewList.length} reviews)</p>
        </div>
        <div className="admin-chart-card">
          <h3>Rating Distribution</h3>
          {ratingDist.map(({ star, count, pct }) => (
            <div className="admin-rating-bar" key={star}>
              <span style={{ width: '20px', fontWeight: 700 }}>{star}</span>
              <Star size={12} fill="var(--royal-gold)" color="var(--royal-gold)" />
              <div className="admin-rating-bar-track">
                <div className="admin-rating-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span style={{ width: '40px', textAlign: 'right', color: '#888' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <select className="admin-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} Star{s > 1 ? 's' : ''}</option>)}
        </select>
        <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Flagged">Flagged</option>
        </select>
        <span style={{ fontSize: '0.82rem', color: '#888' }}>{filtered.length} reviews shown</span>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Dish</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((review) => (
              <tr key={review.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{review.customerName}</div>
                  <div style={{ fontSize: '0.72rem', color: '#888' }}>Order: {review.orderId}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{review.dishName}</td>
                <td>{renderStars(review.rating)}</td>
                <td style={{ maxWidth: '300px', fontSize: '0.82rem', color: '#555' }}>
                  {review.comment}
                </td>
                <td style={{ fontSize: '0.78rem' }}>{formatDate(review.timestamp)}</td>
                <td>
                  <span className={`admin-badge ${review.status.toLowerCase()}`}>
                    {review.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {review.status !== 'Approved' && (
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleApprove(review.id)} title="Approve">
                        <CheckCircle size={13} />
                      </button>
                    )}
                    {review.status !== 'Flagged' && (
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => handleFlag(review.id)} title="Flag" style={{ color: '#FF9800' }}>
                        <AlertTriangle size={13} />
                      </button>
                    )}
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(review.id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
