import type {BillingOrder} from './types';

export interface BillingStore {
  put(order: BillingOrder): void;
  get(id: string): BillingOrder | undefined;
  getByClaim(claimToken: string): BillingOrder | undefined;
}

export class MemoryBillingStore implements BillingStore {
  private readonly byId = new Map<string, BillingOrder>();
  private readonly byClaim = new Map<string, string>();

  put(order: BillingOrder): void {
    this.byId.set(order.id, order);
    this.byClaim.set(order.claimToken, order.id);
  }

  get(id: string): BillingOrder | undefined {
    return this.byId.get(id);
  }

  getByClaim(claimToken: string): BillingOrder | undefined {
    const id = this.byClaim.get(claimToken);
    return id ? this.byId.get(id) : undefined;
  }
}
