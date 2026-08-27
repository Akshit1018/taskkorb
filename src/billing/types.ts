export type BillingProvider = 'paypal' | 'phonepe';

export type PlanId = 'monthly_hosted' | 'credit_pack';

export type OrderStatus = 'created' | 'pending' | 'paid' | 'failed' | 'denied';

export type EntitlementKind = 'hosted_month' | 'credits';

export interface PlanQuote {
  planId: PlanId;
  provider: BillingProvider;
  amountMinor: number;
  currency: 'USD' | 'INR';
  periodDays: number;
  creditMinutes: number;
}

export interface BillingOrder {
  id: string;
  provider: BillingProvider;
  planId: PlanId;
  email: string;
  amountMinor: number;
  currency: 'USD' | 'INR';
  status: OrderStatus;
  claimToken: string;
  providerRef?: string;
  createdAt: number;
  paidAt?: number;
  periodDays: number;
  creditMinutes: number;
}

export type ClaimResult =
  | {entitled: false}
  | {
      entitled: true;
      kind: EntitlementKind;
      expiresAt: number;
      creditMinutes: number;
      email: string;
      planId: PlanId;
    };
