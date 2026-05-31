import { useState, useDeferredValue } from 'react';
import { Search, Flame, Star, Sparkles, Plus, Minus, Leaf, Heart, X } from 'lucide-react';
import { useDishes, useCategories, useReviews, getDishRating } from '../context/StoreContext';
import { getDishImage, getDishGradient } from '../lib/dishImage';

const PACKAGING_LABELS = {
  box: { name: 'Heritage Box', fee: 30 },
  bag: { name: 'Sandstone Bag', fee: 15 }
};

function getReviewCount(reviews, dishId) {
  return reviews.filter((r) => r.dishId === dishId && r.status === 'Approved').length;
}

function RatingDisplay({ item, reviews }) {
  const reviewCount = getReviewCount(reviews, item.id);
  const reviewRating = getDishRating(reviews, item.id);
  const displayRating = reviewRating ?? item.rating;

  if (reviewCount > 0) {
    return (
      <div className="food-rating">
        <Star size={14} fill="var(--royal-gold)" stroke="none" />
        <span>{displayRating?.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
      </div>
    );
  }

  if (displayRating != null && displayRating < 3.5) {
    return (
      <div className="food-rating food-rating-new">
        <span>New</span>
      </div>
    );
  }

  return (
    <div className="food-rating">
      <Star size={14} fill="var(--royal-gold)" stroke="none" />
      <span>{displayRating?.toFixed?.(1) ?? '—'}</span>
    </div>
  );
}

export default function FoodDiscovery({
  onAddToPlate,
  onUpdateQty,
  activeCategory,
  setActiveCategory,
  cart,
  selectedPackaging,
  onDismissPackagingBanner
}) {
  const allDishes = useDishes();
  const categories = useCategories();
  const reviews = useReviews();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterSignature, setFilterSignature] = useState(false);
  const [packagingBannerDismissed, setPackagingBannerDismissed] = useState(false);

  const filteredItems = allDishes.filter((item) => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const q = deferredSearch.toLowerCase();
    const searchMatch = !q ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    const vegMatch = !filterVeg || item.isVeg;
    const sigMatch = !filterSignature || item.isSignature;
    return categoryMatch && searchMatch && vegMatch && sigMatch;
  });

  const getItemQty = (itemId) => {
    const found = cart.find((i) => i.id === itemId);
    return found ? found.quantity : 0;
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setFilterVeg(false);
    setFilterSignature(false);
  };

  const packagingInfo = selectedPackaging !== 'none' ? PACKAGING_LABELS[selectedPackaging] : null;
  const showPackagingBanner = packagingInfo && !packagingBannerDismissed;
  const hasActiveFilters =
    activeCategory !== 'all' || searchQuery || filterVeg || filterSignature;

  return (
    <section id="menu-section" className="page-section menu-discovery-section">
      <div className="page-container">
        <div className="menu-section-header">
          <span className="section-eyebrow">Explore Our Legacy</span>
          <h2 className="section-title">The Royal Menu</h2>
          <div className="gold-divider">
            <span className="motif">✦ ❈ ✦</span>
          </div>
          <p className="menu-section-desc">
            Indulge in a curated symphony of authentic South Indian breakfast delicacies, slow dum-cooked biryanis, and traditional desserts.
          </p>
        </div>

        {showPackagingBanner && (
          <div className="packaging-selection-banner" role="status">
            <span>
              {packagingInfo.name} selected · +₹{packagingInfo.fee} · Change at checkout
            </span>
            <button
              type="button"
              className="packaging-banner-dismiss"
              onClick={() => {
                setPackagingBannerDismissed(true);
                onDismissPackagingBanner?.();
              }}
              aria-label="Dismiss packaging notice"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="menu-filter-bar">
          <div className="menu-filter-search">
            <Search size={16} className="menu-filter-search-icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button
                type="button"
                className="menu-filter-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="menu-filter-categories" role="tablist" aria-label="Menu categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`menu-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-filter-secondary">
            <div className="menu-filter-chips">
              <button
                type="button"
                className={`menu-filter-chip menu-filter-chip-veg ${filterVeg ? 'active' : ''}`}
                aria-pressed={filterVeg}
                onClick={() => setFilterVeg((v) => !v)}
              >
                <Leaf size={13} aria-hidden="true" />
                <span>Veg</span>
              </button>
              <button
                type="button"
                className={`menu-filter-chip ${filterSignature ? 'active' : ''}`}
                aria-pressed={filterSignature}
                onClick={() => setFilterSignature((v) => !v)}
              >
                <Sparkles size={13} aria-hidden="true" />
                <span>Signatures</span>
              </button>
            </div>

            <div className="menu-filter-meta">
              <span className="menu-filter-count">
                {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
              </span>
              {hasActiveFilters && (
                <button type="button" className="menu-filter-clear" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="food-grid">
            {filteredItems.map((item, index) => {
              const qtyInCart = getItemQty(item.id);
              const isUnavailable = item.available === false;
              const dishImage = getDishImage(item);
              const gradient = getDishGradient(item.category);

              return (
                <div
                  key={item.id}
                  className="food-grid-item"
                  style={{
                    animationDelay: `${index * 0.02}s`,
                    opacity: isUnavailable ? 0.65 : 1
                  }}
                >
                  <div className="food-card">
                    {isUnavailable && (
                      <span className="food-unavailable-badge">Unavailable</span>
                    )}

                    <div className="food-img-container">
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

                      {item.isSignature && (
                        <span className="food-tag-signature">
                          <Sparkles size={12} fill="var(--pure-white)" stroke="none" />
                          <span>Signature</span>
                        </span>
                      )}

                      {dishImage ? (
                        <img
                          src={dishImage}
                          alt={item.name}
                          className="food-img"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="food-img food-img-placeholder"
                          style={{ background: gradient }}
                          aria-label={item.name}
                        >
                          <span className="food-img-initial">{item.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="food-content">
                      <div className="food-title-row">
                        <h4 className="food-title">{item.name}</h4>
                        <span className="food-price">₹{item.price}</span>
                      </div>

                      <p className="food-desc">{item.description}</p>

                      {item.isSignature && item.pairingText && (
                        <div className="pairing-tip">
                          <Heart size={14} fill="var(--royal-gold)" stroke="none" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{item.pairingText}</span>
                        </div>
                      )}

                      <div className="food-meta">
                        <RatingDisplay item={item} reviews={reviews} />

                        {item.spiceLevel > 0 ? (
                          <div className="food-spices" title={`Spice Level: ${item.spiceLevel}/3`}>
                            {Array.from({ length: item.spiceLevel }).map((_, i) => (
                              <Flame key={i} size={14} fill="currentColor" stroke="none" />
                            ))}
                          </div>
                        ) : (
                          <div style={{ height: '14px' }} />
                        )}

                        {qtyInCart > 0 ? (
                          <div className="food-qty-stepper">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => onUpdateQty(item.id, qtyInCart - 1)}
                              disabled={isUnavailable}
                              aria-label={`Decrease ${item.name} quantity`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-val">{qtyInCart}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => !isUnavailable && onAddToPlate(item)}
                              disabled={isUnavailable}
                              aria-label={`Increase ${item.name} quantity`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => !isUnavailable && onAddToPlate(item)}
                            disabled={isUnavailable}
                            className="btn-add-plate"
                            aria-label={`Add ${item.name} to Plate`}
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="menu-empty-state">
            <h3>No dishes found matching your selection.</h3>
            <p>Try searching for alternatives or clearing active dietary filters.</p>
            <button type="button" className="btn-secondary" onClick={clearFilters} style={{ marginTop: '1rem' }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
