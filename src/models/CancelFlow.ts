/** The type of a cancel flow question. */
export type CancelFlowQuestionType = 'single_select' | 'free_text';

/** The type of retention offer. */
export type CancelFlowOfferType =
  | 'discount'
  | 'free_trial'
  | 'free_extension';

/** How the pause duration is specified. */
export type CancelFlowPauseDurationType = 'days' | 'fixed_date';

/** The outcome of a cancel flow for analytics/reporting. */
export type CancelFlowOutcome =
  | 'cancelled'
  | 'retained'
  | 'paused'
  | 'dismissed';

/**
 * The outcome of a cancel flow presentation.
 *
 * Returned as a string from native: "cancelled", "retained", "dismissed",
 * or "paused:<ISO8601>" for pause results.
 */
export type CancelFlowResult =
  | 'cancelled'
  | 'retained'
  | 'dismissed'
  | `paused:${string}`;

/** An answer option for a single-select question. */
export interface CancelFlowOption {
  id: number;
  order: number;
  label: string;
  /** Optional SF Symbol name displayed as a leading icon pill. */
  iconName: string | null;
  /** Optional subtext displayed below the label. */
  subtitle: string | null;
  triggersOffer: boolean;
  triggersPause: boolean;
}

/** A single question in the cancel flow questionnaire. */
export interface CancelFlowQuestion {
  id: number;
  order: number;
  questionText: string;
  questionType: CancelFlowQuestionType;
  isRequired: boolean;
  options: CancelFlowOption[];
}

/** Save offer configuration shown to retain the user. */
export interface CancelFlowOffer {
  enabled: boolean;
  title: string;
  body: string;
  ctaText: string;
  type: CancelFlowOfferType | string;
  value: string;
  /** Duration of the offer in months. `null` when not configured. */
  durationMonths: number | null;
}

/** A selectable pause duration option. */
export interface CancelFlowPauseOption {
  id: number;
  order: number;
  label: string;
  durationType: CancelFlowPauseDurationType;
  durationDays: number | null;
  /** When the subscription resumes (ISO 8601). */
  resumeDate: string | null;
}

/** Pause configuration for the retention page. */
export interface CancelFlowPauseConfig {
  enabled: boolean;
  title: string;
  body: string;
  ctaText: string;
  options: CancelFlowPauseOption[];
}

/** Configuration returned by the backend for presenting the cancel flow. */
export interface CancelFlowConfig {
  /** Whether the cancel flow is enabled for this app. */
  enabled: boolean;
  /** Ordered list of questions to present. */
  questions: CancelFlowQuestion[];
  /** Optional save offer to show (if `offer.enabled` is true). */
  offer: CancelFlowOffer | null;
  /** Optional pause configuration for the retention page. */
  pause: CancelFlowPauseConfig | null;
  /** A/B experiment variant identifier. */
  variantId: number | null;
}

/** A single answer to a cancel flow question. */
export interface CancelFlowAnswer {
  /** The question ID this answer corresponds to. */
  questionId: number;
  /** The selected option ID (for single-select questions). */
  selectedOptionId: number | null;
  /** The free text response (for free-text questions). */
  freeText: string | null;
}

/** Analytics payload submitted after a cancel flow completes. */
export interface CancelFlowResponse {
  /** The product the user was cancelling. */
  productId: string;
  /** Your app's user identifier. */
  userId: string;
  /** The final outcome of the cancel flow. */
  outcome: CancelFlowOutcome;
  /** The user's answers to questionnaire questions. */
  answers: CancelFlowAnswer[];
  /** Whether the save offer was shown to the user. */
  offerShown: boolean;
  /** Whether the user accepted the save offer. */
  offerAccepted: boolean;
  /** Whether the pause option was shown to the user. */
  pauseShown: boolean;
  /** Whether the user accepted the pause option. */
  pauseAccepted: boolean;
  /** The selected pause duration in days (if pause was accepted). */
  pauseDurationDays: number | null;
}

/** Result returned after a save offer is successfully applied. */
export interface SaveOfferResult {
  /** Human-readable description of the applied offer. */
  message: string;
  /** Discount percentage, if the offer type is a percentage discount. */
  discountPercent: number | null;
  /** Duration of the discount in months, if applicable. */
  durationMonths: number | null;
}
