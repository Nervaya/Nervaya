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
import { Icon } from '@iconify/react';
import { ICON_ARROW_LEFT } from '@/constants/icons';
import LottieLoader from '@/components/common/LottieLoader';
import Modal from '@/components/common/Modal';
import styles from './styles.module.css';
import type { BreadcrumbItem } from '@/components/common/Breadcrumbs';

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
    isAddressModalOpen,
    handleCloseAddressModal,
    handleAddNewAddress,
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
          <div className={styles.loadingContainer} aria-busy="true" aria-live="polite">
            <LottieLoader width={200} height={200} />
          </div>
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

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Supplements', href: '/supplements' },
    { label: 'Cart', href: '/supplements/cart' },
    { label: 'Checkout' },
  ];

  return (
    <Sidebar hideGlobalBreadcrumbs>
      <div className={styles.container}>
        <PageHeader title="Checkout" breadcrumbs={breadcrumbs} />
        <Link href="/supplements/cart" className={styles.backToCartLink}>
          <Icon icon={ICON_ARROW_LEFT} aria-hidden />
          Back to cart
        </Link>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.content}>
          <div className={styles.formSection}>
            {showSavedAddresses && (
              <CheckoutSavedAddresses
                addresses={savedAddresses}
                onUseAddress={handleUseAddress}
                onAddNew={handleAddNewAddress}
              />
            )}

            {selectedAddress && (
              <div className={styles.selectedAddressWrapper}>
                <AddressCard
                  address={selectedAddress}
                  label="Shipping Address"
                  isDefault={false}
                  onEdit={handleEditAddress}
                />
              </div>
            )}

            <DeliveryOptions
              selectedMethod={selectedDeliveryMethod}
              onSelect={handleDeliveryMethodSelect}
              subtotal={cart.totalAmount}
            />
          </div>

          <Modal
            isOpen={isAddressModalOpen}
            onClose={handleCloseAddressModal}
            title={selectedAddress ? 'Edit Address' : 'Add New Address'}
          >
            <CheckoutForm onSubmit={handleAddressSubmit} loading={false} initialAddress={selectedAddress} />
          </Modal>
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
