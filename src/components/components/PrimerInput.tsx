import React, { useState } from 'react';
import { StyleProp, TextInput, TextStyle } from 'react-native';
import useForm from '../providers/FormProvider';

interface PrimerInputProps {
  placeholder?: string;
  type: string;
  style?: StyleProp<TextStyle>;
  onChange?: () => void;
  onEndEditing?: () => void;
}

const PrimerInput = (props: PrimerInputProps) => {
  const { setFormData } = useForm();
  const [text, setText] = useState('');

  const maxLength = (): number => {
    if (props.type === 'EXPIRY') {
      return 5;
    }

    if (props.type === 'CARD_NUMBER') {
      return 24;
    }

    if (props.type === 'CVV') {
      return 4;
    }

    return 100;
  };

  const maskExpiry = (e: string): string => {
    if (e.length > 2 && e[2] !== '/') {
      var e = e.slice(0, 2) + '/' + e.slice(2);
    }

    return e;
  };

  const maskCardNumber = (e: string): string => {
    if (e.length > 4 && e[4] !== ' ') {
      var e = e.slice(0, 4) + ' ' + e.slice(4);
    }

    if (e.length > 9 && e[9] !== ' ') {
      var e = e.slice(0, 9) + ' ' + e.slice(9);
    }

    if (e.length > 14 && e[14] !== ' ') {
      var e = e.slice(0, 14) + ' ' + e.slice(14);
    }

    return e;
  };

  const onTextDidChange = (e: string) => {
    if (props.type === 'EXPIRY') {
      e = maskExpiry(e);
    }

    if (props.type === 'CARD_NUMBER') {
      e = maskCardNumber(e);
    }

    setText(e);
    setFormData(e, props.type);
    props.onChange?.();
  };

  return (
    <TextInput
      placeholder={props.placeholder}
      style={props.style}
      onChangeText={(t) => {
        onTextDidChange(t);
      }}
      maxLength={maxLength()}
      onEndEditing={(_) => props.onEndEditing?.()}
      value={text}
    />
  );
};

export default PrimerInput;
