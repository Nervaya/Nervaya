import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { promoApi } from '@/lib/api/promo';
import type { Cart, Order, ShippingAddress, SavedAddress } from '@/types/supplement.types';
import { getShippingCost, type DeliveryMethod } from '@/utils/shipping.util';

export { getShippingCost };

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
  const [editingAddress, setEditingAddress] = useState(true);
  const [formKey, setFormKey] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

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

  const handleAddressSubmit = useCallback(async (address: ShippingAddress, saveAddress: boolean, label: string) => {
    if (saveAddress) {
      try {
        await api.post('/users/address', { ...address, label, isDefault: false });
      } catch (err) {
        console.error('Failed to save address', err);
      }
    }
    setSelectedAddress(address);
    setEditingAddress(false);
    setFormKey((prev) => prev + 1);
  }, []);

  const handleUseAddress = useCallback((addr: SavedAddress) => {
    const { _id, label: _label, isDefault: _isDefault, ...shippingAddr } = addr;
    setSelectedAddress(shippingAddr as ShippingAddress);
    setEditingAddress(false);
    setFormKey((prev) => prev + 1);
  }, []);

  const handleEditAddress = useCallback(() => {
    setEditingAddress(true);
  }, []);

  const handleDeliveryMethodSelect = useCallback((method: DeliveryMethod) => {
    setSelectedDeliveryMethod(method);
  }, []);

  const mapPromoErrorMessage = useCallback((message: string): string => {
    if (message.toLowerCase().includes('expired')) return 'This promo code has expired';
    if (message.toLowerCase().includes('usage limit') || message.toLowerCase().includes('exhausted')) {
      return 'This promo code has reached its usage limit';
    }
    if (message.toLowerCase().includes('minimum purchase') || message.toLowerCase().includes('minimum order')) {
      return 'Minimum order amount not met for this code';
    }
    if (message.toLowerCase().includes('invalid')) return 'Invalid promo code';
    return message;
  }, []);

  const handlePromoCodeApply = useCallback(
    async (code: string) => {
      if (!cart?._id) return;
      setPromoLoading(true);
      setPromoError(null);
      try {
        const result = await promoApi.apply(code, cart._id, cart.totalAmount);
        setAppliedPromoCode(code);
        setPromoDiscount(result.discount ?? 0);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Invalid or expired promo code';
        setPromoError(mapPromoErrorMessage(msg));
        setAppliedPromoCode(null);
        setPromoDiscount(0);
      } finally {
        setPromoLoading(false);
      }
    },
    [cart?._id, cart?.totalAmount, mapPromoErrorMessage],
  );

  const handlePromoCodeRemove = useCallback(() => {
    setAppliedPromoCode(null);
    setPromoDiscount(0);
    setPromoError(null);
  }, []);

  const handleProceedToPayment = useCallback(async () => {
    if (!cart || !selectedAddress) {
      setError('Please enter your shipping address');
      return;
    }
    setCreatingOrder(true);
    setError(null);
    try {
      const orderPayload = {
        shippingAddress: selectedAddress,
        ...(appliedPromoCode && { promoCode: appliedPromoCode, promoDiscount }),
        ...(selectedDeliveryMethod && { deliveryMethod: selectedDeliveryMethod }),
      };
      const orderResponse = (await api.post('/orders', orderPayload)) as OrderResponse;
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
  }, [cart, selectedAddress, selectedDeliveryMethod, appliedPromoCode, promoDiscount]);

  return {
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
    setSelectedAddress,
    setFormKey,
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
  };
}
