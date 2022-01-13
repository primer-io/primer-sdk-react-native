export type ClientSessionActionsRequest = IClientSessionActionsRequest;

interface IClientSessionActionsRequest {
  actions: ClientSessionAction[];
}

type ClientSessionAction = IClientSessionAction;

interface IClientSessionAction {
  type:
    | 'SELECT_PAYMENT_METHOD'
    | 'UNSELECT_PAYMENT_METHOD'
    | 'SET_BILLING_ADDRESS';
  paymentMethodType?: string;
  network?: string;
  params?: IActionParams;
}

interface IActionParams {
  billingAddress: Record<string, string | null>;
}
