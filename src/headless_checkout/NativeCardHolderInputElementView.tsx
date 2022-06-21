import React from 'react';
import {
    requireNativeComponent,
    ViewProps,
    NativeSyntheticEvent
} from 'react-native';

interface NativeCardHolderInputElementViewGeneralProps {
    placeholder?: string;
}

interface NativeCardHolderInputElementViewCallbacks {
    onFocus?: () => void;
    onBlur?: () => void;
    onValueChange?: () => void;
    onValueIsValid?: (isValid: boolean) => void;
    onValueTypeDetect?: (type: string) => void;
}

const NativeCardHolderInputElementViewRaw = requireNativeComponent('NativeCardHolderInputElementView');

type NativeCardHolderInputElementViewProps = ViewProps & NativeCardHolderInputElementViewCallbacks & NativeCardHolderInputElementViewGeneralProps;

export class NativeCardHolderInputElementView extends React.PureComponent<NativeCardHolderInputElementViewProps, any> {
    _onFocus = (event: any) => {
        if (!this.props.onFocus) {
            return;
        }
        this.props.onFocus()
    }

    _onBlur = (event: any) => {
        if (!this.props.onBlur) {
            return;
        }
        this.props.onBlur()
    }

    _onValueChange = (event: any) => {
        if (!this.props.onValueChange) {
            return;
        }
        this.props.onValueChange()
    }

    _onValueIsValid = (event: NativeSyntheticEvent<{isValid: boolean, target: number}>) => {
        if (!this.props.onValueIsValid) {
            return;
        }
        this.props.onValueIsValid(event.nativeEvent.isValid)
    }

    _onValueTypeDetect = (event: NativeSyntheticEvent<{type: string, target: number}>) => {
        if (!this.props.onValueTypeDetect) {
            return;
        }
        this.props.onValueTypeDetect(event.nativeEvent.type)
    }

    render() {
        // Re-assign callbacks to the private callbacks and store them in `nativeProps`
        const nativeProps = {
            ...this.props,
            onFocus: this._onFocus,
            onBlur: this._onBlur,
            onValueChange: this._onValueChange,
            onValueIsValid: this._onValueIsValid,
            onValueTypeDetect: this._onValueTypeDetect,
        }

        return (
            <NativeCardHolderInputElementViewRaw
                {...nativeProps}
            />
        )
    }
}
