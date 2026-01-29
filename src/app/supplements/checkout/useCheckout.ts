import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import type { Cart, Order, ShippingAddress, SavedAddress } from '@/types/supplement.types';

interface PaymentCreateResponse {
  success: boolean;
  data?: { id: string; key_id: string };
}

interface OrderResponse {
  success: boolean;
  data?: Order;
}

export function useCheckout() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await api.get('/cart')) as { success: boolean; data: Cart };
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
  }, [router]);

  const fetchSavedAddresses = useCallback(async () => {
    try {
      const response = (await api.get('/users/address')) as { success: boolean; data: SavedAddress[] };
      if (response.success && response.data?.length) {
        setSavedAddresses(response.data);
        setShowSavedAddresses(true);
      }
    } catch (err) {
      console.error('Failed to fetch saved addresses', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchSavedAddresses();
  }, [fetchCart, fetchSavedAddresses]);

  const handleAddressSubmit = useCallback(
    async (address: ShippingAddress, saveAddress: boolean, label: string) => {
      if (!cart) return;
      setCreatingOrder(true);
      setError(null);
      try {
        if (saveAddress) {
          try {
            await api.post('/users/address', { ...address, label, isDefault: false });
          } catch (err) {
            console.error('Failed to save address', err);
          }
        }
        const orderResponse = (await api.post('/orders', { shippingAddress: address })) as OrderResponse;
        if (!orderResponse.success || !orderResponse.data) {
          setError('Failed to create order');
          return;
        }
        setOrder(orderResponse.data);
        const paymentResponse = (await api.post('/payments/create-order', {
          orderId: orderResponse.data._id,
          amount: orderResponse.data.totalAmount,
        })) as PaymentCreateResponse;
        if (paymentResponse.success && paymentResponse.data) {
          setRazorpayOrderId(paymentResponse.data.id);
          if (paymentResponse.data.key_id) setRazorpayKeyId(paymentResponse.data.key_id);
        } else {
          setError('Failed to initialize payment');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process order');
      } finally {
        setCreatingOrder(false);
      }
    },
    [cart],
  );

  const handleUseAddress = useCallback((addr: SavedAddress) => {
    const { _id, label, isDefault, ...shippingAddr } = addr;
    setSelectedAddress(shippingAddr as ShippingAddress);
    setFormKey((prev) => prev + 1);
  }, []);

  return {
    cart,
    order,
    loading,
    error,
    creatingOrder,
    savedAddresses,
    showSavedAddresses,
    selectedAddress,
    formKey,
    setSelectedAddress,
    setFormKey,
    handleAddressSubmit,
    handleUseAddress,
    razorpayOrderId,
    razorpayKeyId,
  };
}
