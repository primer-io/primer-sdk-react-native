export type ActionRequest = IActionRequest;

interface IActionRequest {
  actions: Action[];
}

type Action = IAction;

interface IAction {
  type: string;
  metadata: any;
}
