export type ClientSessionActionsRequest = IClientSessionActionsRequest;

interface IClientSessionActionsRequest {
  actions: ClientSessionAction[];
}

type ClientSessionAction = IClientSessionAction;

interface IClientSessionAction {
  type: 'SET_PAYMENT_METHOD' | 'UNSET_PAYMENT_METHOD' | 'SET_BILLING_ADDRESS';
  paymentMethodType?: string;
  network?: string;
  params?: IActionParams;
}

interface IActionParams {
  billingAddress: Record<string, string | null>;
}
