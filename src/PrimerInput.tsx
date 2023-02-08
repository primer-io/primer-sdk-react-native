import { PrimerHeadlessUniversalCheckoutCardFormUIManager } from './RNTPrimerHeadlessUniversalCheckoutCardFormUIManager';
import React, { useEffect, useRef } from 'react';
import { NativeModules, requireNativeComponent, ViewProps } from 'react-native';


// PrimerCardNumberEditText
export const PrimerCardNumberEditTextRaw = requireNativeComponent<{}>(
  'PrimerCardNumberEditText'
);

type PrimerCardNumberEditTextProps = ViewProps;

const { PrimerRN } = NativeModules;

export const PrimerCardNumberEditText: React.FC<PrimerCardNumberEditTextProps> = (props) => {
  const ref = useRef(React.createRef<any>());

  useEffect(() => {
    const tag = ref.current.current._nativeTag;
    PrimerHeadlessUniversalCheckoutCardFormUIManager.addInput(tag);
    return () => PrimerRN.removeInput(tag);
  }, []);

  const rawComponent = (
    //@ts-ignore
    <PrimerCardNumberEditTextRaw ref={ref.current} {...props} />
  );

  return rawComponent;
};

// PrimerCardholderNameEditText
export const PrimerCardholderNameEditTextRaw = requireNativeComponent<{}>(
  'PrimerCardholderNameEditText'
);

type PrimerCardholderNameEditTextProps = ViewProps;

export const PrimerCardholderNameEditText: React.FC<PrimerCardholderNameEditTextProps> = (
  props
) => {
  const ref = useRef(React.createRef<any>());

  useEffect(() => {
    const tag = ref.current.current._nativeTag;
    PrimerRN.addInput(tag);
    return () => PrimerRN.removeInput(tag);
  }, []);
  //@ts-ignore
  return <PrimerCardholderNameEditTextRaw ref={ref.current} {...props} />;
};

// PrimerExpiryEditText
export const PrimerExpiryEditTextRaw = requireNativeComponent<{}>(
  'PrimerExpiryEditText'
);

type PrimerExpiryEditTextProps = ViewProps;

export const PrimerExpiryEditText: React.FC<PrimerExpiryEditTextProps> = (
  props
) => {
  //@ts-ignore
  return <PrimerExpiryEditTextRaw {...props} />;
};

// cvv
export const PrimerCvvEditTextRaw = requireNativeComponent<{}>(
  'PrimerCvvEditText'
);

type PrimerCvvEditTextProps = ViewProps;

export const PrimerCvvEditText: React.FC<PrimerCvvEditTextProps> = (props) => {
  //@ts-ignore
  return <PrimerCvvEditTextRaw {...props} />;
};
