declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

function sendGaEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface GaItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
  discount?: number;
}

export interface EcommerceParams {
  currency: string;
  value: number;
  items: GaItem[];
  coupon?: string;
}

export type SleepSeverityLevel = 'mild' | 'moderate' | 'severe';
export type ScrollDepthThreshold = 25 | 50 | 75 | 90;

// ─── E-commerce Events ───────────────────────────────────────────────────────

export function trackViewItem(params: EcommerceParams): void {
  sendGaEvent('view_item', { currency: params.currency, value: params.value, items: params.items });
}

export function trackAddToCart(params: EcommerceParams): void {
  sendGaEvent('add_to_cart', { currency: params.currency, value: params.value, items: params.items });
}

export function trackViewCart(params: EcommerceParams): void {
  sendGaEvent('view_cart', { currency: params.currency, value: params.value, items: params.items });
}

export function trackBeginCheckout(params: EcommerceParams): void {
  sendGaEvent('begin_checkout', {
    currency: params.currency,
    value: params.value,
    items: params.items,
    ...(params.coupon && { coupon: params.coupon }),
  });
}

export interface AddPaymentInfoParams extends EcommerceParams {
  payment_type: string;
}

export function trackAddPaymentInfo(params: AddPaymentInfoParams): void {
  sendGaEvent('add_payment_info', {
    currency: params.currency,
    value: params.value,
    payment_type: params.payment_type,
    items: params.items,
    ...(params.coupon && { coupon: params.coupon }),
  });
}

export interface PurchaseParams {
  transaction_id: string;
  currency: string;
  value: number;
  shipping: number;
  tax?: number;
  coupon?: string;
  items: GaItem[];
}

export function trackPurchase(params: PurchaseParams): void {
  sendGaEvent('purchase', {
    transaction_id: params.transaction_id,
    currency: params.currency,
    value: params.value,
    shipping: params.shipping,
    ...(params.tax !== undefined && { tax: params.tax }),
    ...(params.coupon && { coupon: params.coupon }),
    items: params.items,
  });
}

export interface ViewItemListParams {
  item_list_id?: string;
  item_list_name?: string;
  items: GaItem[];
}

export function trackViewItemList(params: ViewItemListParams): void {
  sendGaEvent('view_item_list', {
    ...(params.item_list_id && { item_list_id: params.item_list_id }),
    ...(params.item_list_name && { item_list_name: params.item_list_name }),
    items: params.items,
  });
}

export function trackSelectItem(params: ViewItemListParams): void {
  sendGaEvent('select_item', {
    ...(params.item_list_id && { item_list_id: params.item_list_id }),
    ...(params.item_list_name && { item_list_name: params.item_list_name }),
    items: params.items,
  });
}

// ─── Auth Events ─────────────────────────────────────────────────────────────

export function trackSignUp(method: string): void {
  sendGaEvent('sign_up', { method });
}

export function trackLogin(method: string): void {
  sendGaEvent('login', { method });
}

// ─── Engagement Events ───────────────────────────────────────────────────────

export function trackSearch(searchTerm: string): void {
  sendGaEvent('search', { search_term: searchTerm });
}

export interface ScrollDepthParams {
  percent_scrolled: ScrollDepthThreshold;
  page_path: string;
}

export function trackScrollDepth(params: ScrollDepthParams): void {
  sendGaEvent(`scroll_${params.percent_scrolled}`, {
    percent_scrolled: params.percent_scrolled,
    page_path: params.page_path,
  });
}

export interface ExitPageParams {
  page_path: string;
  time_on_page_seconds: number;
}

export function trackExitPage(params: ExitPageParams): void {
  sendGaEvent('exit_page', {
    page_path: params.page_path,
    time_on_page_seconds: params.time_on_page_seconds,
  });
}

// ─── Sleep Quiz Events ───────────────────────────────────────────────────────

export function trackQuizStarted(quizName: string): void {
  sendGaEvent('quiz_started', { quiz_name: quizName });
}

export interface QuizQuestionAnsweredParams {
  quiz_name: string;
  question_index: number;
  question_id: string;
  total_questions: number;
}

export function trackQuizQuestionAnswered(params: QuizQuestionAnsweredParams): void {
  sendGaEvent('quiz_question_answered', {
    quiz_name: params.quiz_name,
    question_index: params.question_index,
    question_id: params.question_id,
    total_questions: params.total_questions,
  });
}

export interface QuizCompletedParams {
  quiz_name: string;
  total_questions: number;
  sleep_severity: SleepSeverityLevel;
}

export function trackQuizCompleted(params: QuizCompletedParams): void {
  sendGaEvent('quiz_completed', {
    quiz_name: params.quiz_name,
    total_questions: params.total_questions,
    sleep_severity: params.sleep_severity,
  });
}

export function trackSleepSeverity(severity: SleepSeverityLevel): void {
  sendGaEvent(`sleep_severity_${severity}`, { severity });
}

export interface RecommendationClickedParams {
  recommendation_title: string;
  destination_url: string;
}

export function trackRecommendationClicked(params: RecommendationClickedParams): void {
  sendGaEvent('recommendation_clicked', {
    recommendation_title: params.recommendation_title,
    destination_url: params.destination_url,
  });
}

// ─── Therapy Events ──────────────────────────────────────────────────────────

export interface TherapistParams {
  therapist_id: string;
  therapist_name: string;
}

export interface BookingSlotParams extends TherapistParams {
  slot_time: string;
  slot_date: string;
}

export function trackViewTherapistProfile(params: TherapistParams): void {
  sendGaEvent('view_therapist_profile', {
    therapist_id: params.therapist_id,
    therapist_name: params.therapist_name,
  });
}

export function trackStartBooking(params: TherapistParams): void {
  sendGaEvent('start_booking', {
    therapist_id: params.therapist_id,
    therapist_name: params.therapist_name,
  });
}

export function trackSelectTimeSlot(params: BookingSlotParams): void {
  sendGaEvent('select_time_slot', {
    therapist_id: params.therapist_id,
    therapist_name: params.therapist_name,
    slot_time: params.slot_time,
    slot_date: params.slot_date,
  });
}

export function trackBookingCompleted(params: BookingSlotParams): void {
  sendGaEvent('booking_completed', {
    therapist_id: params.therapist_id,
    therapist_name: params.therapist_name,
    slot_time: params.slot_time,
    slot_date: params.slot_date,
  });
}

export function trackBookingAbandoned(params: TherapistParams): void {
  sendGaEvent('booking_abandoned', {
    therapist_id: params.therapist_id,
    therapist_name: params.therapist_name,
  });
}

export interface PaymentFailedParams {
  order_id: string;
  reason: string;
}

export function trackPaymentFailed(params: PaymentFailedParams): void {
  sendGaEvent('payment_failed', { order_id: params.order_id, reason: params.reason });
}

// ─── Audio / DriftOff Events ─────────────────────────────────────────────────

export interface AudioTrackParams {
  video_id: string;
  video_title: string;
}

export function trackViewAudioPage(): void {
  sendGaEvent('view_audio_page', { page: 'drift_off' });
}

export function trackPreviewPlay(params: AudioTrackParams): void {
  sendGaEvent('preview_play', { video_id: params.video_id, video_title: params.video_title });
}

export function trackAudioCompleted50(params: AudioTrackParams): void {
  sendGaEvent('audio_completed_50', { video_id: params.video_id, video_title: params.video_title });
}

export function trackAudioCompleted100(params: AudioTrackParams): void {
  sendGaEvent('audio_completed_100', { video_id: params.video_id, video_title: params.video_title });
}
