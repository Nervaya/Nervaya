'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Order } from '@/types/supplement.types';
import { formatPrice } from '@/utils/cart.util';
import api from '@/lib/axios';
import Pagination from '@/components/common/Pagination';
import { PAGE_SIZE_5 } from '@/lib/constants/pagination.constants';
import styles from './styles.module.css';
import { Icon } from '@iconify/react';
import { ICON_SHOPPING_BAG, ICON_GLOBE, ICON_TRUCK, ICON_X } from '@/constants/icons';
import { getShippingCost } from '@/utils/shipping.util';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);

  const limit = PAGE_SIZE_5;
  const total = orders.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedOrders = useMemo(() => orders.slice((page - 1) * limit, page * limit), [orders, page, limit]);

  useEffect(() => {
    setMounted(true);
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await api.get('/orders')) as {
          success: boolean;
          data: Order[];
        };
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.heading}>My Orders</h2>
        <div className={styles.emptyState}>
          <div className={styles.iconWrapper}>
            <Icon icon={ICON_SHOPPING_BAG} className={styles.icon} />
          </div>
          <h3 className={styles.emptyTitle}>No orders yet</h3>
          <p className={styles.emptyText}>Your product purchases will appear here</p>
          <Link href="/supplements" className={styles.shopLink}>
            Browse Supplements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Orders</h2>
      <p className={styles.subheading}>Track and manage your recent orders</p>

      <ul className={styles.ordersList} aria-label="Order history">
        {paginatedOrders.map((order) => {
          const firstItem = order.items?.[0] || { name: 'Order Items', quantity: 1, price: 0 };

          return (
            <li key={order._id} className={styles.orderCard}>
              <div className={styles.orderImagePlaceholder}>
                {firstItem.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={firstItem.image} alt={firstItem.name} className={styles.productImage} />
                ) : null}
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.orderHeaderMain}>
                  <h3 className={styles.productTitle}>{firstItem.name}</h3>
                  <p className={styles.productSubtitle}>
                    {order.items.length > 1 ? `+ ${order.items.length - 1} more items` : 'Supplement'}
                  </p>
                  <p className={styles.productDescription}>
                    Your ordered items are currently being processed. Total amount: {formatPrice(order.totalAmount)}.
                  </p>
                </div>

                <div className={styles.infoChips}>
                  <div className={styles.chip}>
                    <div className={styles.chipIconWrapper}>
                      <Icon icon="lucide:calendar" className={styles.chipIcon} />
                    </div>
                    <div className={styles.chipText}>
                      <span className={styles.chipLabel}>Order Date</span>
                      <span className={styles.chipValue}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.chip}>
                    <div className={styles.chipIconWrapper}>
                      <Icon icon="heroicons:hashtag" className={styles.chipIcon} />
                    </div>
                    <div className={styles.chipText}>
                      <span className={styles.chipLabel}>Order ID</span>
                      <span className={styles.chipValue}>{order._id.slice(-8)}</span>
                    </div>
                  </div>

                  <div className={styles.chip}>
                    <div className={styles.chipIconWrapper}>
                      <Icon icon="lucide:map-pin" className={styles.chipIcon} />
                    </div>
                    <div className={styles.chipText}>
                      <span className={styles.chipLabel}>Tracking ID</span>
                      <span className={styles.chipValue}>
                        {order._id.slice(-8)}
                        <button className={styles.copyBtn} aria-label="Copy tracking ID">
                          <Icon icon="lucide:copy" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button onClick={() => setSelectedOrder(order)} className={styles.viewOrderLink}>
                    View Order Details <Icon icon="lucide:chevron-right" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {total >= 0 && (
        <div className={styles.paginationWrap}>
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            ariaLabel="My orders pagination"
          />
        </div>
      )}

      {mounted &&
        selectedOrder &&
        createPortal(
          <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Order Details</h3>
                <button
                  className={styles.modalCloseBtn}
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close order details"
                >
                  <Icon icon={ICON_X} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.orderSummary}>
                  <div className={styles.orderHeaderSection}>
                    <div className={styles.orderHeaderGroup}>
                      <span className={styles.orderHeaderLabel}>Order Number</span>
                      <span className={styles.orderHeaderValue}>
                        NS-{new Date().getFullYear()}-{selectedOrder._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.orderHeaderGroup}>
                      <span className={styles.orderHeaderLabel}>Order Date</span>
                      <span className={styles.orderHeaderValue}>
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderSection}>
                    <h3 className={styles.sectionTitle}>
                      <Icon icon={ICON_GLOBE} className={styles.sectionIcon} aria-hidden />
                      Order Items
                    </h3>
                    <ul className={styles.itemsList} aria-label="Order items">
                      {selectedOrder.items.map((item) => (
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
                      <Icon icon={ICON_TRUCK} className={styles.sectionIcon} aria-hidden />
                      Shipping Address
                    </h3>
                    <address className={styles.address}>
                      {selectedOrder.shippingAddress.name}
                      <br />
                      {selectedOrder.shippingAddress.addressLine1}
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <>
                          <br />
                          {selectedOrder.shippingAddress.addressLine2}
                        </>
                      )}
                      <br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.zipCode}
                      <br />
                      {selectedOrder.shippingAddress.country}
                    </address>
                  </div>

                  <div className={styles.financialSummary}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>
                        {formatPrice(selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                      </span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Shipment</span>
                      <span
                        className={
                          getShippingCost(
                            selectedOrder.deliveryMethod ?? 'standard',
                            selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                          ) === 0
                            ? styles.shipFree
                            : undefined
                        }
                      >
                        {getShippingCost(
                          selectedOrder.deliveryMethod ?? 'standard',
                          selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                        ) === 0
                          ? 'FREE'
                          : formatPrice(
                              getShippingCost(
                                selectedOrder.deliveryMethod ?? 'standard',
                                selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                              ),
                            )}
                      </span>
                    </div>
                    {(selectedOrder.promoDiscount ?? 0) > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Discount</span>
                        <span className={styles.discount}>−{formatPrice(selectedOrder.promoDiscount ?? 0)}</span>
                      </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
