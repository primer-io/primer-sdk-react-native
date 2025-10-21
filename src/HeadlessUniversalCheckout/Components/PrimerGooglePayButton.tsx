import { requireNativeComponent } from 'react-native';
import type { ViewProps } from 'react-native';

interface PrimerGooglePayButtonProps extends ViewProps {}

export const PrimerGooglePayButton = requireNativeComponent<PrimerGooglePayButtonProps>('PrimerGooglePayButton');
