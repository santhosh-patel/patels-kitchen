import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import Receipt from './Receipt';
import AIAssistant from './AIAssistant';
import { useOrdering } from '../context/OrderingContext';

export default function OrderingOverlays() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    completedOrderData,
    selectedPackaging,
    activeCoupon,
    setActiveCoupon,
    handleUpdateQty,
    handleRemoveItem,
    handleOrderComplete,
    handleCloseReceipt,
    handleBackFromReceipt,
    handleOrderAgain,
    handleCheckout,
    handleAddToPlate,
    minOrderMet,
    minOrderShortfall,
    minOrder
  } = useOrdering();

  return (
    <>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        activeCoupon={activeCoupon}
        setActiveCoupon={setActiveCoupon}
        onCheckout={handleCheckout}
        minOrderMet={minOrderMet}
        minOrderShortfall={minOrderShortfall}
        minOrder={minOrder}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        activeCoupon={activeCoupon}
        setActiveCoupon={setActiveCoupon}
        onOrderComplete={handleOrderComplete}
        initialPackaging={selectedPackaging}
      />

      <Receipt
        orderData={completedOrderData}
        onHome={handleCloseReceipt}
        onBack={handleBackFromReceipt}
        onOrderAgain={handleOrderAgain}
      />

      <AIAssistant
        onAddToPlate={handleAddToPlate}
        isOpen={isAIAssistantOpen}
        setIsOpen={setIsAIAssistantOpen}
      />
    </>
  );
}
