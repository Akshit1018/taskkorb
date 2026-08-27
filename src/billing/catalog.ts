import type {BillingProvider, PlanId, PlanQuote} from './types';

const MONTHLY_USD_CENTS = 499;
const MONTHLY_INR_PAISA = 19900;
const CREDIT_USD_CENTS = 299;
const CREDIT_INR_PAISA = 9900;
const CREDIT_MINUTES = 60;
const MONTH_DAYS = 30;

export function quotePlan(planId: PlanId, provider: BillingProvider): PlanQuote {
  switch (planId) {
    case 'monthly_hosted':
      return provider === 'paypal'
        ? {
            planId,
            provider,
            amountMinor: MONTHLY_USD_CENTS,
            currency: 'USD',
            periodDays: MONTH_DAYS,
            creditMinutes: 0,
          }
        : {
            planId,
            provider,
            amountMinor: MONTHLY_INR_PAISA,
            currency: 'INR',
            periodDays: MONTH_DAYS,
            creditMinutes: 0,
          };
    case 'credit_pack':
      return provider === 'paypal'
        ? {
            planId,
            provider,
            amountMinor: CREDIT_USD_CENTS,
            currency: 'USD',
            periodDays: MONTH_DAYS,
            creditMinutes: CREDIT_MINUTES,
          }
        : {
            planId,
            provider,
            amountMinor: CREDIT_INR_PAISA,
            currency: 'INR',
            periodDays: MONTH_DAYS,
            creditMinutes: CREDIT_MINUTES,
          };
    default: {
      const exhaustive: never = planId;
      return exhaustive;
    }
  }
}

export function listPlans(): Array<{planId: PlanId; periodDays: number; creditMinutes: number}> {
  return [
    {planId: 'monthly_hosted', periodDays: MONTH_DAYS, creditMinutes: 0},
    {planId: 'credit_pack', periodDays: MONTH_DAYS, creditMinutes: CREDIT_MINUTES},
  ];
}

export function isPlanId(value: string): value is PlanId {
  return value === 'monthly_hosted' || value === 'credit_pack';
}

export function isProvider(value: string): value is BillingProvider {
  return value === 'paypal' || value === 'phonepe';
}
