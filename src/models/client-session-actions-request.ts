export type ClientSessionActionsRequest = IClientSessionActionsRequest;

interface IClientSessionActionsRequest {
  actions: ClientSessionAction[];
}

type ClientSessionAction = IClientSessionAction;

interface IClientSessionAction {
  type: 'SET_PAYMENT_METHOD' | 'UNSET_PAYMENT_METHOD';
  paymentMethodType?: string;
  network?: string;
}
