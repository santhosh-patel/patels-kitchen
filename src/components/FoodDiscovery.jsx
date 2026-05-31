import React, { useState } from 'react';
import { Search, Flame, Star, Sparkles, Plus, Check, Leaf, Heart } from 'lucide-react';
import { menuData, MENU_CATEGORIES } from '../data/menuData';

export default function FoodDiscovery({ onAddToPlate, activeCategory, setActiveCategory, cart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterSignature, setFilterSignature] = useState(false);

  // Filter logic
  const filteredItems = menuData.filter((item) => {
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
    <section id="menu-section" style={{
      padding: '5rem 2rem',
      backgroundColor: 'var(--ivory)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{
            fontFamily: 'var(--font-headings)',
            color: 'var(--royal-gold)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>
            Explore Our Legacy
          </span>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--font-headings)',
            color: 'var(--deep-charcoal)',
            marginTop: '0.5rem',
            marginBottom: '1rem'
          }}>
            The Royal Menu
          </h2>
          <div className="gold-divider">
            <span className="motif">✦ ❈ ✦</span>
          </div>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            Indulge in a curated symphony of authentic South Indian breakfast delicacies, slow dum-cooked biryanis, and traditional desserts.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: 'var(--pure-white)',
          borderRadius: '24px',
          padding: '1.2rem 2rem',
          boxShadow: 'var(--soft-shadow)',
          border: '1px solid rgba(216, 196, 165, 0.25)',
          marginBottom: '3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? 'var(--royal-gold)' : 'transparent',
                  border: activeCategory === cat.id ? 'none' : '1px solid rgba(184, 138, 59, 0.15)',
                  color: activeCategory === cat.id ? 'var(--pure-white)' : 'var(--deep-charcoal)',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Dietary Toggles & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            flexGrow: 1,
            justifyContent: 'flex-end'
          }}>
            {/* Diet Checkboxes */}
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
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

            {/* Search Input Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--heritage-cream)',
              border: '1.5px solid var(--sandstone)',
              borderRadius: '99px',
              padding: '0.4rem 1rem',
              width: '240px',
              maxWidth: '100%'
            }}>
              <Search size={16} style={{ color: '#888888', marginRight: '0.5rem' }} />
              <input 
                type="text"
                placeholder="Search recipe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--deep-charcoal)'
                }}
              />
            </div>
          </div>
        </div>

        {/* High-End Symmetrical Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="food-grid">
            {filteredItems.map((item, index) => {
              const qtyInCart = getItemQty(item.id);
              
              return (
                <div key={item.id} style={{
                  animation: 'fadeIn 0.6s ease forwards',
                  animationDelay: `${index * 0.02}s`
                }}>
                  <div className="food-card">
                    
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
                          <span>{item.rating.toFixed(1)}</span>
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
                          onClick={() => onAddToPlate(item)}
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
