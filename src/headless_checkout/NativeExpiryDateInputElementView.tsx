import React from 'react';
import {
    findNodeHandle,
    requireNativeComponent,
    ViewProps,
    NativeSyntheticEvent
} from 'react-native';
import { PrimerInputElement } from './NativeCardNumberInputElementView';
import { primerHeadlessCheckoutCardComponentsManager } from './PrimerHeadlessCheckoutCardComponentsManager';
import { PrimerInputElementType } from './PrimerInputElementType';

interface NativeExpiryDateElementViewGeneralProps {
    placeholder?: string;
}

interface NativeExpiryDateInputElementViewCallbacks {
    onFocus?: () => void;
    onBlur?: () => void;
    onValueChange?: () => void;
    onValueIsValid?: (isValid: boolean) => void;
    onValueTypeDetect?: (type: string) => void;
}

const NativeExpiryDateInputElementViewRaw = requireNativeComponent('NativeExpiryDateInputElementView');

type NativeExpiryDateInputElementViewProps = ViewProps & NativeExpiryDateInputElementViewCallbacks & NativeExpiryDateElementViewGeneralProps;

export class NativeExpiryDateInputElementView extends PrimerInputElement {

    type: PrimerInputElementType = PrimerInputElementType.ExpiryDate;

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        this.reactTag = findNodeHandle(this);
        console.log(`reactTag: ${this.reactTag}`);
        primerHeadlessCheckoutCardComponentsManager.registerInputElement(this);
    }

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
            <NativeExpiryDateInputElementViewRaw
                {...nativeProps}
            />
        )
    }
}
