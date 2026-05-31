import { useEffect } from 'react';
import Header from '../components/Header';
import FoodDiscovery from '../components/FoodDiscovery';
import PackagingShowcase from '../components/PackagingShowcase';
import OrderingOverlays from '../components/OrderingOverlays';
import SiteFooter from '../components/SiteFooter';
import { useOrdering } from '../context/OrderingContext';

export default function MenuPage() {
  const {
    cart,
    activeCategory,
    setActiveCategory,
    selectedPackaging,
    setSelectedPackaging,
    setIsCartOpen,
    handleAddToPlate
  } = useOrdering();

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat) setActiveCategory(cat);
  }, [setActiveCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        variant="menu"
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <main style={{ flex: 1 }}>
        <FoodDiscovery
          onAddToPlate={handleAddToPlate}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          cart={cart}
        />

        <PackagingShowcase
          selectedPackaging={selectedPackaging}
          setSelectedPackaging={setSelectedPackaging}
        />
      </main>

      <SiteFooter compact />
      <OrderingOverlays />
    </div>
  );
}
