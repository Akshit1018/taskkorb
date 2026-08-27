import {describe, expect, it} from 'vitest';
import {listPlans, quotePlan} from './catalog';

describe('billing catalog', () => {
  it('quotes monthly hosted access in USD for PayPal and INR for PhonePe', () => {
    expect(quotePlan('monthly_hosted', 'paypal')).toEqual({
      planId: 'monthly_hosted',
      provider: 'paypal',
      amountMinor: 499,
      currency: 'USD',
      periodDays: 30,
      creditMinutes: 0,
    });
    expect(quotePlan('monthly_hosted', 'phonepe')).toEqual({
      planId: 'monthly_hosted',
      provider: 'phonepe',
      amountMinor: 19900,
      currency: 'INR',
      periodDays: 30,
      creditMinutes: 0,
    });
  });

  it('quotes a credit pack on both rails', () => {
    expect(quotePlan('credit_pack', 'paypal').creditMinutes).toBe(60);
    expect(quotePlan('credit_pack', 'phonepe').amountMinor).toBe(9900);
  });

  it('lists both plans for the pay sheet', () => {
    const plans = listPlans();
    expect(plans.map((plan) => plan.planId)).toEqual(['monthly_hosted', 'credit_pack']);
  });
});
