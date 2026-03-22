'use client';

import { useState, useSyncExternalStore, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { ICON_PLAY } from '@/constants/icons';
import { DRIFT_OFF_LANDING_VIDEO_URL, DRIFT_OFF_SESSION_IMAGE } from '@/lib/constants/driftOff.constants';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { cartApi } from '@/lib/api/cart';
import { ITEM_TYPE } from '@/lib/constants/enums';
import { toast } from 'sonner';
import { RazorpayCheckoutScript } from '@/components/common';
import type { VideoPlayerProps } from '../VideoPlayer';
import styles from './styles.module.css';

const VideoPlayerDynamic = dynamic(() => import('../VideoPlayer'), {
  ssr: false,
}) as React.ComponentType<VideoPlayerProps>;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const DriftOffLandingHero = () => {
  const hasMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();
  const [playing, setPlaying] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [sessionPrice, setSessionPrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch dynamic price from backend config
    fetch('/api/deep-rest/plan')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && typeof res.data?.price === 'number') {
          setSessionPrice(res.data.price);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login?redirect=/deep-rest');
      return;
    }

    setIsAdding(true);
    try {
      if (sessionPrice === null) {
        toast.error('Could not load session price. Please try again.');
        return;
      }
      const response = await cartApi.add(
        'drift-off-session',
        1,
        'DriftOff',
        'Deep Rest Session',
        sessionPrice,
        DRIFT_OFF_SESSION_IMAGE,
      );
      if (response.success) {
        refreshCart();
        toast.success('Added to cart!');
      } else {
        toast.error(`Failed to add to cart: ${response.message}`);
      }
    } catch (_err) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDirectBuy = async () => {
    if (!user) {
      router.push('/login?redirect=/deep-rest');
      return;
    }

    setIsAdding(true);
    try {
      if (sessionPrice === null) {
        toast.error('Could not load session price.');
        return;
      }

      const orderRes = await fetch('/api/orders/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: ITEM_TYPE.DRIFT_OFF,
          itemId: 'drift-off-session',
          quantity: 1,
          price: sessionPrice,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) throw new Error(orderData.message || 'Failed to create order');

      const orderId = orderData.data._id;
      const amount = orderData.data.totalAmount;

      const rzpRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok || !rzpData.success) throw new Error(rzpData.message || 'Failed to initialize payment');

      if (!window.Razorpay) throw new Error('Payment gateway not loaded. Please try again.');

      const options = {
        key: rzpData.data.key_id,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Nervaya',
        description: 'Deep Rest Session',
        order_id: rzpData.data.id,
        prefill: { name: user?.name || '', email: user?.email || '', contact: '' },
        theme: { color: '#7c3aed' },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                paymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push(`/order-success/${orderId}`);
            } else {
              throw new Error(verifyData.message || 'Verification failed');
            }
          } catch (err) {
            const error = err as Error;
            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (_err) {
      const error = _err as Error;
      toast.error(error.message || 'Failed to initiate purchase');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className={styles.hero} aria-label="Deep Rest hero">
      <RazorpayCheckoutScript />
      <div className={styles.heroLeft}>
        <p className={styles.description}>
          No more longing for the right session. You are as unique as your needs and our specialists will curate a 25
          min Deep Rest Session for you targeting your special mental needs.
        </p>
        <div className={styles.actions}>
          <button onClick={handleAddToCart} className={styles.btnOutline} disabled={isAdding}>
            Add to Cart
          </button>
          <button onClick={handleDirectBuy} className={styles.btnPrimary} disabled={isAdding}>
            Buy Audio
          </button>
          <Link href="/deep-rest/sessions" className={styles.btnOutline}>
            View My Sessions
          </Link>
          <Link href="/deep-rest/about" className={styles.btnOutline}>
            What are Deep Rest sessions?
          </Link>
        </div>
      </div>

      <div className={styles.heroRight}>
        <div className={styles.videoCard}>
          <div className={styles.videoWrapper}>
            {hasMounted && (
              <VideoPlayerDynamic
                url={DRIFT_OFF_LANDING_VIDEO_URL}
                width="100%"
                height="100%"
                playing={playing}
                controls
                className={styles.playerAbsolute}
                onPlay={() => setPlaying(true)}
              />
            )}
            {!playing && (
              <button
                type="button"
                className={styles.playButton}
                onClick={() => setPlaying(true)}
                aria-label="Play sample video"
              >
                <Icon icon={ICON_PLAY} width={18} height={18} aria-hidden />
              </button>
            )}
          </div>
          <div className={styles.videoMeta}>
            <span className={styles.videoTitle}>
              Sample Guided Meditation <span className={styles.dot}>●</span>
            </span>
            <span className={styles.videoAuthor}>By Practia</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriftOffLandingHero;
