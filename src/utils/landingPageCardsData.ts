import { IMAGES } from './imageConstants';

export interface LandingPageCard {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
  badge?: string;
}

export const landingPageCardsData: LandingPageCard[] = [
  {
    id: 1,
    image: IMAGES.CARD_THERAPY_SESSION,
    title: 'Therapy',
    description:
      'Trouble unwinding at night? Our expert therapists gently help you release anxiety & stress, restore your natural sleep rhythm, and wake up feeling lighter and more refreshed all day.',
    buttonText: 'Book Now',
    href: '/therapy-corner',
  },
  {
    id: 2,
    image: IMAGES.CARD_DRIFT_OFF,
    title: 'Drift Off',
    description:
      "Tailor-made sessions crafted just for you by blending guided hypnosis & meditation to help you release the day's burdens and drift into a quieter, more peaceful dimension. Wake up rejuvenated every morning.",
    buttonText: 'Explore Now',
    href: '/drift-off',
  },
  {
    id: 3,
    image: IMAGES.CARD_SLEEP_SUPPLEMENTS,
    title: 'Sleep Elixir',
    description:
      'Our non-habit-forming, fast-absorbing formula helps you unwind naturally and drift into deep, restorative sleep — waking refreshed, never dependent.',
    buttonText: 'Shop Now',
    href: '/sleep-elixir',
    badge: 'Coming Soon',
  },
];
