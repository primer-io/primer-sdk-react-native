export type PrimerException =
  | PrimerNativeException
  | PrimerReactNativeException;

export interface PrimerNativeException {
  name: 'ParseJsonFailed';
  description: String;
}

export interface PrimerReactNativeException {
  name: 'ParseJsonFailed';
  description?: String;
}
