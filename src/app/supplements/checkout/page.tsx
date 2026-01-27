'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar/LazySidebar';
import { Cart, ShippingAddress, Order, SavedAddress } from '@/types/supplement.types';
import CheckoutForm from '@/components/Checkout/CheckoutForm';
import PaymentHandler from '@/components/Checkout/PaymentHandler';
import { formatPrice } from '@/utils/cart.util';
import api from '@/lib/axios';
import styles from './styles.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | undefined>(undefined);
  // Add a key to force re-render when address is selected
  const [formKey, setFormKey] = useState(0);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get('/cart')) as {
        success: boolean;
        data: Cart;
      };
      if (response.success && response.data) {
        setCart(response.data);
        if (response.data.items.length === 0) {
          router.push('/supplements/cart');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // ... (skipping context, multiple edits needs MultiReplaceFileContent actually?)
  // Wait, I can't do multiple replace in parallel on same file?
  // Tools definition says: "Do NOT make multiple parallel calls ... for the same file."
  // I must use multi_replace_file_content.
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  const fetchSavedAddresses = async () => {
    try {
      const response = (await api.get('/users/address')) as {
        success: boolean;
        data: SavedAddress[];
      };
      if (response.success && response.data) {
        setSavedAddresses(response.data);
        if (response.data.length > 0) {
          setShowSavedAddresses(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch saved addresses', err);
    }
  };

  const handleAddressSubmit = async (address: ShippingAddress, saveAddress: boolean, label: string) => {
    if (!cart) {
      return;
    }

    setCreatingOrder(true);
    setError(null);

    try {
      // Save address if requested
      if (saveAddress) {
        try {
          (await api.post('/users/address', {
            ...address,
            label,
            isDefault: false,
          })) as { success: boolean; data: unknown };
        } catch (err) {
          console.error('Failed to save address', err);
          // Don't block order creation if address save fails
        }
      }

      const orderResponse = (await api.post('/orders', {
        shippingAddress: address,
      })) as { success: boolean; data: Order };

      if (orderResponse.success && orderResponse.data) {
        setOrder(orderResponse.data);

        const paymentResponse = (await api.post('/payments/create-order', {
          orderId: orderResponse.data._id,
          amount: orderResponse.data.totalAmount,
        })) as { success: boolean; data: { id: string; key_id: string } };

        if (paymentResponse.success && paymentResponse.data) {
          setRazorpayOrderId(paymentResponse.data.id);
          if (paymentResponse.data.key_id) {
            setRazorpayKeyId(paymentResponse.data.key_id);
          }
        } else {
          setError('Failed to initialize payment');
        }
      } else {
        setError('Failed to create order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process order');
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchSavedAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const shipping = cart.totalAmount > 500 ? 0 : 50;
  const total = cart.totalAmount + shipping;

  return (
    <Sidebar>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Checkout</h1>
        </header>
        <div className={styles.content}>
          <div className={styles.formSection}>
            {showSavedAddresses && savedAddresses.length > 0 && (
              <div className={styles.savedAddresses}>
                <h3 className={styles.sectionTitle}>Saved Addresses</h3>
                <div className={styles.addressGrid}>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={styles.addressCard}
                      onClick={() => {
                        // Logic to pre-fill form - implementing later or passing initialData
                        // For now just showing them
                        // Ideally we'd pass a selected address state to CheckoutForm
                      }}
                    >
                      <div className={styles.addressHeader}>
                        <span className={styles.addressLabel}>{addr.label}</span>
                        {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>
                      <p className={styles.addressName}>{addr.name}</p>
                      <p className={styles.addressText}>{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className={styles.addressText}>{addr.addressLine2}</p>}
                      <p className={styles.addressText}>
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className={styles.addressText}>{addr.phone}</p>
                      <button
                        className={styles.useButton}
                        onClick={() => {
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { _id, label, isDefault, ...shippingAddr } = addr;
                          setSelectedAddress(shippingAddr);
                          setFormKey((prev) => prev + 1);
                        }}
                      >
                        Use this address
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <CheckoutForm
              key={formKey}
              onSubmit={handleAddressSubmit}
              loading={creatingOrder}
              initialAddress={selectedAddress}
            />
          </div>
          <div className={styles.summarySection}>
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                {cart.totalAmount < 500 && (
                  <div className={styles.freeShipping}>
                    Add {formatPrice(500 - cart.totalAmount)} more for free shipping!
                  </div>
                )}
                <div className={styles.divider}></div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
