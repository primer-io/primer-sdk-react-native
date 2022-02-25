import React, { useEffect, useRef } from 'react';
import { NativeModules, requireNativeComponent, ViewProps } from 'react-native';

// PrimerCardNumberEditText
export const PrimerCardNumberEditTextRaw = requireNativeComponent<{}>(
  'PrimerCardNumberEditText'
);

type PrimerCardNumberEditTextProps = ViewProps;

const { PrimerRN } = NativeModules;

export const PrimerCardNumberEditText: React.FC<PrimerCardNumberEditTextProps> = (
  props
) => {
  // const ref = useRef(React.createRef<any>());

  // useEffect(() => {
  //   const currentRef = ref.current;
  //   console.log('🔥', currentRef);
  //   PrimerRN.registerComponent(currentRef);

  //   return () => {
  //     PrimerRN.deregisterComponent(currentRef);
  //   };
  // }, []);

  const rawComponent = <PrimerCardNumberEditTextRaw {...props} />;

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
  return <PrimerCardholderNameEditTextRaw {...props} />;
};

// PrimerExpiryEditText
export const PrimerExpiryEditTextRaw = requireNativeComponent<{}>(
  'PrimerExpiryEditText'
);

type PrimerExpiryEditTextProps = ViewProps;

export const PrimerExpiryEditText: React.FC<PrimerExpiryEditTextProps> = (
  props
) => {
  return <PrimerExpiryEditTextRaw {...props} />;
};

// cvv
export const PrimerCvvEditTextRaw = requireNativeComponent<{}>(
  'PrimerCvvEditText'
);

type PrimerCvvEditTextProps = ViewProps;

export const PrimerCvvEditText: React.FC<PrimerCvvEditTextProps> = (props) => {
  return <PrimerCvvEditTextRaw {...props} />;
};
