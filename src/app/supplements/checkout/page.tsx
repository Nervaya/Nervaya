'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import PaymentHandler from '@/components/Checkout/PaymentHandler';
import { useCheckout } from './useCheckout';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import { CheckoutSavedAddresses } from './CheckoutSavedAddresses';
import { AddressCard } from './AddressCard';
import { DeliveryOptions } from './DeliveryOptions';
import { PromoCode } from './PromoCode';
import { FaChevronLeft } from 'react-icons/fa6';
import styles from './styles.module.css';

export default function CheckoutPage() {
  const {
    cart,
    order,
    loading,
    error,
    creatingOrder,
    savedAddresses,
    showSavedAddresses,
    selectedAddress,
    editingAddress,
    formKey,
    handleAddressSubmit,
    handleUseAddress,
    handleEditAddress,
    selectedDeliveryMethod,
    handleDeliveryMethodSelect,
    promoCode,
    setPromoCode,
    appliedPromoCode,
    promoDiscount,
    promoLoading,
    promoError,
    handlePromoCodeApply,
    handlePromoCodeRemove,
    handleProceedToPayment,
    razorpayOrderId,
    razorpayKeyId,
  } = useCheckout();

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.loading}>Loading checkout...</div>
        </div>
      </Sidebar>
    );
  }

  if (error && !order) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </Sidebar>
    );
  }

  if (razorpayOrderId && order && razorpayKeyId) {
    return (
      <Sidebar>
        <PaymentHandler
          orderId={order._id}
          amount={order.totalAmount}
          razorpayOrderId={razorpayOrderId}
          razorpayKeyId={razorpayKeyId}
        />
      </Sidebar>
    );
  }

  if (!cart) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.error}>Cart not found</div>
        </div>
      </Sidebar>
    );
  }

  const showForm = !selectedAddress || editingAddress;

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader title="Checkout" />
        <Link href="/supplements/cart" className={styles.backToCartLink}>
          <FaChevronLeft aria-hidden />
          Back to cart
        </Link>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.content}>
          <div className={styles.formSection}>
            {selectedAddress && !editingAddress && (
              <AddressCard
                address={selectedAddress}
                label="Home Address"
                isDefault={false}
                onEdit={handleEditAddress}
              />
            )}
            {showSavedAddresses && showForm && (
              <CheckoutSavedAddresses addresses={savedAddresses} onUseAddress={handleUseAddress} />
            )}
            {showForm && (
              <CheckoutForm
                key={formKey}
                onSubmit={handleAddressSubmit}
                loading={false}
                initialAddress={selectedAddress}
              />
            )}
            <DeliveryOptions
              selectedMethod={selectedDeliveryMethod}
              onSelect={handleDeliveryMethodSelect}
              subtotal={cart.totalAmount}
            />
          </div>
          <div className={styles.summarySection}>
            <CheckoutOrderSummary
              cart={cart}
              deliveryMethod={selectedDeliveryMethod}
              promoDiscount={promoDiscount}
              onProceedToPayment={handleProceedToPayment}
              loading={creatingOrder}
            />
            <PromoCode
              code={promoCode}
              onCodeChange={setPromoCode}
              onApply={handlePromoCodeApply}
              onRemove={handlePromoCodeRemove}
              appliedCode={appliedPromoCode}
              discount={promoDiscount}
              loading={promoLoading}
              error={promoError}
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
