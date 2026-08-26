import type { EmitterSubscription } from 'react-native';
import type {
  PrimerComponentDataValidationError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
} from '../../../../models/PrimerComponentDataValidation';
import type { PrimerError } from '../../../../models/PrimerError';
import type { NamedComponentValidatableData } from '../../../../models/NamedComponentValidatableData';
import type { EventType } from './EventType';

export interface ComponentEventProps<TStep, TValidatableData extends NamedComponentValidatableData> {
  onStep?: (data: TStep) => void;
  onError?: (error: PrimerError) => void;
  onInvalid?: (data: PrimerInvalidComponentData<TValidatableData>) => void;
  onValid?: (data: PrimerValidComponentData<TValidatableData>) => void;
  onValidating?: (data: PrimerValidatingComponentData<TValidatableData>) => void;
  onValidationError?: (data: PrimerComponentDataValidationError<TValidatableData>) => void;
}

type AddListener = (eventType: EventType, listener: (...args: any[]) => any) => Promise<EmitterSubscription>;

export async function subscribeToComponentEvents<TStep, TValidatableData extends NamedComponentValidatableData>(
  props: ComponentEventProps<TStep, TValidatableData>,
  addListener: AddListener
): Promise<EmitterSubscription[]> {
  const subscriptions: EmitterSubscription[] = [];

  if (props.onStep) {
    subscriptions.push(await addListener('onStep', (data: TStep) => props.onStep?.(data)));
  }

  if (props.onInvalid) {
    subscriptions.push(
      await addListener('onInvalid', (data: PrimerInvalidComponentData<TValidatableData>) => props.onInvalid?.(data))
    );
  }

  if (props.onError) {
    subscriptions.push(await addListener('onError', (error: PrimerError) => props.onError?.(error)));
  }

  if (props.onValid) {
    subscriptions.push(
      await addListener('onValid', (data: PrimerValidComponentData<TValidatableData>) => props.onValid?.(data))
    );
  }

  if (props.onValidating) {
    subscriptions.push(
      await addListener('onValidating', (data: PrimerValidatingComponentData<TValidatableData>) =>
        props.onValidating?.(data)
      )
    );
  }

  if (props.onValidationError) {
    subscriptions.push(
      await addListener('onValidationError', (data: PrimerComponentDataValidationError<TValidatableData>) =>
        props.onValidationError?.(data)
      )
    );
  }

  return subscriptions;
}
