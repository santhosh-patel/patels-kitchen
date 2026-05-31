import React, { useState } from 'react';
import { Search, Flame, Star, Sparkles, Plus, Check, Leaf, Heart } from 'lucide-react';
import { useDishes, useCategories, useReviews, getDishRating } from '../context/StoreContext';

const CATEGORY_GRADIENTS = {
  breakfast: 'linear-gradient(135deg, #FFF8E7 0%, #F5DEB3 100%)',
  starters: 'linear-gradient(135deg, #FFE4E1 0%, #FFB6A3 100%)',
  biryanis: 'linear-gradient(135deg, #FFF0E0 0%, #E8C99B 100%)',
  maincourse: 'linear-gradient(135deg, #F0FFF0 0%, #C8E6C9 100%)',
  breads: 'linear-gradient(135deg, #FFF8DC 0%, #F0E68C 100%)',
  beverages: 'linear-gradient(135deg, #E8F4FD 0%, #B3D9F2 100%)',
  desserts: 'linear-gradient(135deg, #FFF0F5 0%, #FFB6C1 100%)',
  chefspecials: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)'
};

export default function FoodDiscovery({ onAddToPlate, activeCategory, setActiveCategory, cart }) {
  const allDishes = useDishes();
  const categories = useCategories();
  const reviews = useReviews();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterSignature, setFilterSignature] = useState(false);

  const filteredItems = allDishes.filter((item) => {
    // Category match
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    // Search query match
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Veg match
    const vegMatch = !filterVeg || item.isVeg;
    // Signature match
    const sigMatch = !filterSignature || item.isSignature;

    return categoryMatch && searchMatch && vegMatch && sigMatch;
  });

  // Check item quantity in cart
  const getItemQty = (itemId) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <section id="menu-section" className="page-section" style={{
      backgroundColor: 'var(--ivory)',
      position: 'relative'
    }}>
      <div className="page-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <span className="section-eyebrow">
            Explore Our Legacy
          </span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            The Royal Menu
          </h2>
          <div className="gold-divider">
            <span className="motif">✦ ❈ ✦</span>
          </div>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Indulge in a curated symphony of authentic South Indian breakfast delicacies, slow dum-cooked biryanis, and traditional desserts.
          </p>
        </div>

        <div className="menu-filter-bar">
          <div className="menu-filter-categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`menu-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-filter-controls">
            <div className="menu-filter-toggles">
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--deep-charcoal)',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox"
                  checked={filterVeg}
                  onChange={(e) => setFilterVeg(e.target.checked)}
                  style={{
                    accentColor: 'var(--royal-gold)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <Leaf size={14} style={{ color: '#2E7D32' }} />
                <span>Veg Only</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--deep-charcoal)',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox"
                  checked={filterSignature}
                  onChange={(e) => setFilterSignature(e.target.checked)}
                  style={{
                    accentColor: 'var(--royal-gold)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <Sparkles size={14} style={{ color: 'var(--royal-gold)' }} />
                <span>Signatures Only</span>
              </label>
            </div>

            <div className="menu-filter-search">
              <Search size={16} style={{ color: '#888888', marginRight: '0.5rem', flexShrink: 0 }} aria-hidden="true" />
              <input 
                type="search"
                placeholder="Search recipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search menu items"
              />
            </div>
          </div>
        </div>

        {/* High-End Symmetrical Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="food-grid">
            {filteredItems.map((item, index) => {
              const qtyInCart = getItemQty(item.id);
              const isUnavailable = item.available === false;
              const reviewRating = getDishRating(reviews, item.id);
              const displayRating = reviewRating ?? item.rating;
              
              return (
                <div key={item.id} style={{
                  animation: 'fadeIn 0.6s ease forwards',
                  animationDelay: `${index * 0.02}s`,
                  opacity: isUnavailable ? 0.65 : 1
                }}>
                  <div className="food-card" style={{ position: 'relative' }}>
                    {isUnavailable && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 3,
                        background: '#666',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '99px',
                        textTransform: 'uppercase'
                      }}>
                        Unavailable
                      </span>
                    )}
                    
                    {/* Food Image Wrapper */}
                    <div className="food-img-container">
                      {/* Dietary Labels - EMOJI FREE */}
                      {item.isVeg ? (
                        <span className="food-tag-veg">
                          <Leaf size={12} fill="#2E7D32" stroke="none" />
                          <span>Veg</span>
                        </span>
                      ) : (
                        <span className="food-tag-nonveg">
                          <span>Non-Veg</span>
                        </span>
                      )}

                      {/* Signature Label */}
                      {item.isSignature && (
                        <span className="food-tag-signature">
                          <Sparkles size={12} fill="var(--pure-white)" stroke="none" />
                          <span>Signature</span>
                        </span>
                      )}

                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="food-img"
                        loading="lazy"
                        style={!item.image ? { background: CATEGORY_GRADIENTS[item.category] || '#f5f5f5', objectFit: 'cover' } : undefined}
                      />
                    </div>

                    {/* Food Card Content */}
                    <div className="food-content">
                      <div className="food-title-row">
                        <h4 className="food-title">{item.name}</h4>
                        <span className="food-price">₹{item.price}</span>
                      </div>

                      <p className="food-desc">{item.description}</p>

                      {/* Pairing Suggestion inside the card */}
                      {item.isSignature && item.pairingText && (
                        <div className="pairing-tip">
                          <Heart size={14} fill="var(--royal-gold)" stroke="none" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{item.pairingText}</span>
                        </div>
                      )}

                      {/* Card Footer details */}
                      <div className="food-meta">
                        <div className="food-rating">
                          <Star size={14} fill="var(--royal-gold)" stroke="none" />
                          <span>{displayRating?.toFixed?.(1) ?? item.rating?.toFixed?.(1)}</span>
                        </div>

                        {/* Spice Indicator */}
                        {item.spiceLevel > 0 ? (
                          <div className="food-spices" title={`Spice Level: ${item.spiceLevel}/3`}>
                            {Array.from({ length: item.spiceLevel }).map((_, i) => (
                              <Flame key={i} size={14} fill="currentColor" stroke="none" />
                            ))}
                          </div>
                        ) : (
                          <div style={{ height: '14px' }} />
                        )}

                        {/* Upgraded Better & Efficient Add Button */}
                        <button 
                          onClick={() => !isUnavailable && onAddToPlate(item)}
                          disabled={isUnavailable}
                          className={`btn-add-plate ${qtyInCart > 0 ? 'added' : ''}`}
                          title={qtyInCart > 0 ? `Add one more (Currently ${qtyInCart} on plate)` : 'Add to Plate'}
                          aria-label={`Add ${item.name} to Plate`}
                        >
                          {qtyInCart > 0 ? (
                            <>
                              <Check size={14} />
                              <span>Added ({qtyInCart})</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--pure-white)',
            borderRadius: '24px',
            boxShadow: 'var(--soft-shadow)',
            border: '1px solid rgba(216, 196, 165, 0.2)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-headings)', color: '#888888' }}>
              No dishes found matching your selection.
            </h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Try searching for alternatives or clearing active dietary filters.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
