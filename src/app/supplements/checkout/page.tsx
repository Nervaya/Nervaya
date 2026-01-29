'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar/LazySidebar';
import PageHeader from '@/components/PageHeader/PageHeader';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import PaymentHandler from '@/components/Checkout/PaymentHandler';
import { useCheckout } from './useCheckout';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';
import { CheckoutSavedAddresses } from './CheckoutSavedAddresses';
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
    formKey,
    handleAddressSubmit,
    handleUseAddress,
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

  return (
    <Sidebar>
      <div className={styles.container}>
        <PageHeader title="Checkout" />
        <div className={styles.content}>
          <div className={styles.formSection}>
            {showSavedAddresses && (
              <CheckoutSavedAddresses addresses={savedAddresses} onUseAddress={handleUseAddress} />
            )}
            <CheckoutForm
              key={formKey}
              onSubmit={handleAddressSubmit}
              loading={creatingOrder}
              initialAddress={selectedAddress}
            />
          </div>
          <div className={styles.summarySection}>
            <CheckoutOrderSummary cart={cart} />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
