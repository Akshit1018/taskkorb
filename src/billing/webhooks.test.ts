import {describe, expect, it} from 'vitest';
import {readPaypalCaptureEvent, verifyPaypalTransmission} from './paypal';
import {phonepeExpectedAuth, readPhonepeCallback, verifyPhonepeCallback} from './phonepe';

describe('billing webhook verification', () => {
  it('accepts a mock PayPal transmission and rejects a missing one in live mode', () => {
    expect(
      verifyPaypalTransmission({
        mode: 'mock',
        headers: {},
        rawBody: '{}',
      }).ok,
    ).toBe(true);
    expect(
      verifyPaypalTransmission({
        mode: 'live',
        headers: {},
        rawBody: '{}',
      }).ok,
    ).toBe(false);
    expect(
      verifyPaypalTransmission({
        mode: 'live',
        headers: {'paypal-transmission-id': 'TXN-1', 'paypal-transmission-sig': 'sig'},
        rawBody: '{"id":"WH-1"}',
        expectedSig: 'sig',
      }).ok,
    ).toBe(true);
  });

  it('accepts a PhonePe checksum that matches the configured secret', () => {
    expect(
      verifyPhonepeCallback({
        mode: 'mock',
        authorization: '',
        rawBody: '{}',
        username: 'hook',
        password: 'secret',
      }).ok,
    ).toBe(true);
    expect(
      verifyPhonepeCallback({
        mode: 'live',
        authorization: 'wrong',
        rawBody: '{"type":"CHECKOUT_ORDER_COMPLETED"}',
        username: 'hook',
        password: 'secret',
      }).ok,
    ).toBe(false);
    const body = '{"type":"CHECKOUT_ORDER_COMPLETED"}';
    expect(
      verifyPhonepeCallback({
        mode: 'live',
        authorization: phonepeExpectedAuth('hook', 'secret', body),
        rawBody: body,
        username: 'hook',
        password: 'secret',
      }).ok,
    ).toBe(true);
  });

  it('reads merchant order ids from official-shaped webhook bodies', () => {
    expect(
      readPaypalCaptureEvent({
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {id: 'CAP-1', invoice_id: 'ord_pp'},
      }),
    ).toEqual({
      event: 'PAYMENT.CAPTURE.COMPLETED',
      merchantOrderId: 'ord_pp',
      providerRef: 'CAP-1',
    });
    expect(
      readPhonepeCallback({
        type: 'CHECKOUT_ORDER_COMPLETED',
        payload: {originalMerchantOrderId: 'ord_pe', orderId: 'OMO1'},
      }),
    ).toEqual({
      type: 'CHECKOUT_ORDER_COMPLETED',
      merchantOrderId: 'ord_pe',
      providerRef: 'OMO1',
    });
  });
});
