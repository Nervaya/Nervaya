/**
 * Image Constants - Cloudinary URLs
 *
 * Simply paste your Cloudinary image URLs here.
 *
 * To get optimized URLs from Cloudinary:
 * 1. Upload image to Cloudinary
 * 2. In Cloudinary dashboard, use URL builder or copy the URL
 * 3. Add transformations like: f_auto,q_auto for automatic format/quality
 *
 * Example URL format:
 * https://res.cloudinary.com/{cloud-name}/image/upload/f_auto,q_auto/{folder}/{image-name}
 */

export const IMAGES = {
  // Background Images
  BACKGROUND_MAIN: 'https://res.cloudinary.com/disrq2eh8/image/upload/background_dediox.png',

  // Landing Page Cards
  CARD_THERAPY_SESSION: 'https://res.cloudinary.com/disrq2eh8/image/upload/therapy_session_szvksr.png',
  CARD_DRIFT_OFF: 'https://res.cloudinary.com/disrq2eh8/image/upload/drift_off.png',
  CARD_SLEEP_SUPPLEMENTS: 'https://res.cloudinary.com/disrq2eh8/image/upload/sleep_supplements_apjqre.png',

  // Auth Page Illustrations
  AUTH_LOGIN_ILLUSTRATION: 'https://res.cloudinary.com/disrq2eh8/image/upload/LoginIllustration_hk3kuy.png',
  AUTH_SIGNUP_ILLUSTRATION:
    'https://res.cloudinary.com/disrq2eh8/image/upload/Mental_Health_Illustrations_by_Muhammed_Sajid_i7fn0x.jpg',

  // Add more images here as needed
} as const;
