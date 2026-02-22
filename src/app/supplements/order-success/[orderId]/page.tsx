'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaGlobe, FaTruck, FaEnvelope, FaBox, FaCalendarDay, FaHouse } from 'react-icons/fa6';
import { Order, OrderItem } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import { ordersApi } from '@/lib/api/orders';
import { useAuth } from '@/hooks/useAuth';
import { getShippingCost } from '@/utils/shipping.util';
import { trackPurchase } from '@/utils/analytics';
import Sidebar from '@/components/Sidebar/LazySidebar';
import styles from './styles.module.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

function getSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function formatOrderDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatOrderNumber(orderId: string): string {
  const year = new Date().getFullYear();
  const short = orderId.replace(/-/g, '').slice(-8).toUpperCase();
  return `NS-${year}-${short}`;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : (params.orderId?.[0] ?? '');
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confettiData, setConfettiData] = useState<object | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersApi.getForUser();
      if (response.success && response.data) {
        const foundOrder = response.data.find((o) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          const subtotalForShipping = foundOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const deliveryMethod = foundOrder.deliveryMethod ?? 'standard';
          const shippingCost = getShippingCost(deliveryMethod, subtotalForShipping);
          trackPurchase({
            transaction_id: foundOrder._id,
            currency: 'INR',
            value: foundOrder.totalAmount,
            shipping: shippingCost,
            ...(foundOrder.promoCode ? { coupon: foundOrder.promoCode } : {}),
            items: foundOrder.items.map((item) => ({
              item_id: typeof item.supplementId === 'string' ? item.supplementId : String(item.supplementId),
              item_name: item.name,
              item_category: 'Supplements',
              price: item.price,
              quantity: item.quantity,
            })),
          });
        } else {
          setError('Order not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  useEffect(() => {
    fetch('/success confetti.json')
      .then((res) => res.json())
      .then(setConfettiData)
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.loading}>Loading order details...</div>
        </div>
      </Sidebar>
    );
  }

  if (error || !order) {
    return (
      <Sidebar>
        <div className={styles.container}>
          <div className={styles.error} role="alert">
            {error || 'Order not found'}
          </div>
          <Link href="/supplements" className={styles.link}>
            Continue Shopping
          </Link>
        </div>
      </Sidebar>
    );
  }

  const subtotal = getSubtotal(order.items);
  const deliveryMethod = order.deliveryMethod ?? 'standard';
  const shipping = getShippingCost(deliveryMethod, subtotal);
  const promoDiscount = order.promoDiscount ?? 0;
  const orderDate = formatOrderDate(order.createdAt);
  const orderNumber = formatOrderNumber(order._id);
  const userEmail = user?.email ?? 'your email';

  return (
    <Sidebar>
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successAnimation} aria-hidden>
            {confettiData ? (
              <Lottie animationData={confettiData} loop={false} />
            ) : (
              <div className={styles.successIconFallback}>
                <span>✓</span>
              </div>
            )}
          </div>
          <h1 className={styles.title}>Payment Successful!</h1>
          <p className={styles.message}>Thank you for your order. Your purchase has been confirmed.</p>

          <div className={styles.orderSummary}>
            <div className={styles.orderHeader}>
              <div className={styles.orderHeaderGroup}>
                <span className={styles.orderHeaderLabel}>Order Number</span>
                <span className={styles.orderHeaderValue}>{orderNumber}</span>
              </div>
              <div className={styles.orderHeaderGroup}>
                <span className={styles.orderHeaderLabel}>Order Date</span>
                <span className={styles.orderHeaderValue}>{orderDate}</span>
              </div>
            </div>

            <div className={styles.orderSection}>
              <h3 className={styles.sectionTitle}>
                <FaGlobe className={styles.sectionIcon} aria-hidden />
                Order Items
              </h3>
              <ul className={styles.itemsList} aria-label="Order items">
                {order.items.map((item) => (
                  <li key={`${item.name}-${item.quantity}`} className={styles.itemRow}>
                    <span>{item.name}</span>
                    <span>Quantity: {item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.orderSection}>
              <h3 className={styles.sectionTitle}>
                <FaTruck className={styles.sectionIcon} aria-hidden />
                Shipping Address
              </h3>
              <address className={styles.address}>
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>
                    <br />
                    {order.shippingAddress.addressLine2}
                  </>
                )}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
              </address>
            </div>

            <div className={styles.financialSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipment</span>
                <span className={shipping === 0 ? styles.shipFree : undefined}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {promoDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discount}>−{formatPrice(promoDiscount)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <section className={styles.whatsNext} aria-labelledby="whats-next-heading">
            <h2 id="whats-next-heading" className={styles.whatsNextTitle}>
              What&apos;s Next?
            </h2>
            <div className={styles.nextSteps}>
              <div className={styles.nextStepCard}>
                <div className={styles.stepIcon} aria-hidden>
                  <FaEnvelope />
                </div>
                <p>We&apos;ve sent a confirmation email to {userEmail}.</p>
              </div>
              <div className={styles.nextStepCard}>
                <div className={styles.stepIcon} aria-hidden>
                  <FaBox />
                </div>
                <p>Your order is being prepared and will ship within 1–2 business days.</p>
              </div>
              <div className={styles.nextStepCard}>
                <div className={styles.stepIcon} aria-hidden>
                  <FaCalendarDay />
                </div>
                <p>Expected arrival in 5–7 business days.</p>
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <Link href="/supplements" className={styles.primaryButton}>
              <FaHouse aria-hidden />
              Continue Shopping
            </Link>
            <p className={styles.supportText}>
              Need help with your order?{' '}
              <Link href="/support" className={styles.supportLink}>
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
