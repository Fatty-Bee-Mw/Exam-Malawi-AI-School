/**
 * Single source of truth for usage limits (frontend).
 * Keep in sync with backend/limits_config.py
 */

export const FREE_TRIAL_DAYS = 5;

export const PLAN_LIMITS = {
  free: {
    questionsPerDay: 5,
    examsPerDay: 1,
  },
  freeExtended: {
    questionsPerDay: 1,
    examsPerDay: 1,
  },
  daily: {
    questionsPerDay: 15,
    examsPerDay: 5,
  },
  weekly: {
    questionsPerDay: 25,
    examsPerDay: 10,
  },
  monthly: {
    questionsPerDay: 45,
    examsPerDay: 20,
  },
  premium: {
    questionsPerDay: 45,
    examsPerDay: 20,
  },
};

/** Map frontend plan keys to backend rate-limiter plan keys */
export const BACKEND_PLAN_MAP = {
  free: 'free',
  freeExtended: 'free_extended',
  premium: 'pro',
};

export function getPlanKey(isPremium, daysOfFreeUse, subscription = null) {
  if (subscription?.active) {
    if (subscription.plan_id === 'monthly') {
      return 'monthly';
    }
    if (subscription.plan_id === 'weekly') {
      return 'weekly';
    }
    if (subscription.plan_id === 'daily') {
      return 'daily';
    }
  }
  if (isPremium) return 'premium';
  if (daysOfFreeUse >= FREE_TRIAL_DAYS) return 'freeExtended';
  return 'free';
}

export function getBackendPlanKey(planKey, subscription = null) {
  if (subscription?.active && subscription.rate_plan) {
    return subscription.rate_plan;
  }
  return BACKEND_PLAN_MAP[planKey] || 'free';
}
