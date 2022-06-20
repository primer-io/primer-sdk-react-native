import React from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';

export const NativeCardNumberInputElementViewRaw = requireNativeComponent<{}>(
    'NativeCardNumberInputElementView'
);

type NativeCardNumberInputElementViewProps = ViewProps;

export const NativeCardNumberInputElementView: React.FC<NativeCardNumberInputElementViewProps> = (
    props: NativeCardNumberInputElementViewProps
) => {
    return <NativeCardNumberInputElementViewRaw {...props} />;
}