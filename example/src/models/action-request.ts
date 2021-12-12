import type { ClientSessionActionsRequest } from 'src/models/client-session-actions-request';

type ActionRequest = IActionRequest;

interface IActionRequest {
  clientToken: string;
  actions: Action[];
}

interface Action {
  type: ActionType;
  params?: IActionParams;
}

type ActionType = 'SELECT_PAYMENT_METHOD' | 'UNSELECT_PAYMENT_METHOD';

interface IActionParams {
  paymentMethodType: string;
  binData?: Record<string, any>;
}

export const buildActionRequest = (
  clientSessionActionsRequest: ClientSessionActionsRequest,
  clientToken: string
): ActionRequest => {
  console.log(
    'actions received:',
    JSON.stringify(clientSessionActionsRequest.actions)
  );

  const action = clientSessionActionsRequest.actions[0];
  const type = action.type;

  switch (type) {
    case 'SET_PAYMENT_METHOD':
      const request = {
        clientToken,
        actions: [
          {
            type: 'SELECT_PAYMENT_METHOD',
            params: {
              paymentMethodType: action.paymentMethodType,
            },
          },
        ],
      } as ActionRequest;

      if (action.paymentMethodType == 'PAYMENT_CARD') {
        request.actions[0].params!.binData = {
          network: action.network,
          // product_code: action.network,
          // product_name: action.network,
          // product_usage_type: 'UNKNOWN',
          // account_number_type: 'UNKNOWN',
          // account_funding_type: 'UNKNOWN',
          // regional_restriction: 'UNKNOWN',
          // prepaid_reloadable_indicator: 'NOT_APPLICABLE',
        };
      }

      return request;
    case 'UNSET_PAYMENT_METHOD':
      return {
        clientToken,
        actions: [
          {
            type: 'UNSELECT_PAYMENT_METHOD',
          },
        ],
      };
    default:
      throw new Error('unrecognised action sent from SDK!');
  }
};
