import type { PayHereCheckoutResponse } from '@/services/paymentService';

export const submitPayHereForm = (payload: PayHereCheckoutResponse): void => {
  if (!payload.action || !payload.method || !payload.fields) {
    throw new Error('Payment data is incomplete. Please try again.');
  }

  const form = document.createElement('form');
  form.method = payload.method;
  form.action = payload.action;
  form.style.display = 'none';

  Object.entries(payload.fields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = String(value ?? '');
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};
