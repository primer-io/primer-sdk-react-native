import React, { useCallback, useState, createContext } from 'react';
import useForm from './FormProvider';

interface SelectedPaymentMethodRepository {
  selectedPaymentMethod: SelectedPaymentMethodConfig | null;
  setSelectedPaymentMethod: (paymentMethod: string) => void;
  validate: (key: string) => void;
}

interface SelectedPaymentMethodConfig {
  type: string;
  inputs: InputConfig[];
}

type ValidationErrorType = 'NOT_STARTED' | 'INVALID' | 'TOO_SHORT';

interface InputConfig {
  type: 'CARD_NUMBER' | 'EXPIRY' | 'CVV' | 'CARDHOLDER_NAME';
  validationError: ValidationErrorType | null;
}

export const SelectedPaymentMethodContext = createContext<SelectedPaymentMethodRepository>(
  {
    selectedPaymentMethod: null,
    setSelectedPaymentMethod: (_) => {},
    validate: (_) => {},
  }
);

export const SelectedPaymentMethodProvider = (props: any) => {
  const [
    selectedPaymentMethod,
    setConfig,
  ] = useState<SelectedPaymentMethodConfig | null>(null);
  const { getFormData } = useForm();

  const setSelectedPaymentMethod = useCallback((paymentMethod: string) => {
    const config: SelectedPaymentMethodConfig = {
      type: paymentMethod,
      inputs: [
        {
          type: 'CARD_NUMBER',
          validationError: null,
        },
        {
          type: 'EXPIRY',
          validationError: null,
        },
        {
          type: 'CVV',
          validationError: null,
        },
      ],
    };

    setConfig(config);
  }, []);

  const validate = (key: string) => {
    if (!selectedPaymentMethod) {
      return;
    }

    const data = getFormData(key);

    console.log('form data', data);

    // todo: refactor to something prettier and more dry...
    if (!data) {
      const inputs: InputConfig[] = [];

      for (
        let index = 0;
        index < selectedPaymentMethod.inputs.length;
        index++
      ) {
        const input = selectedPaymentMethod.inputs[index];

        if (input.type === key) {
          inputs.push({ validationError: 'NOT_STARTED', type: input.type });
          continue;
        }

        inputs.push(input);
      }

      setConfig({
        type: selectedPaymentMethod.type,
        inputs,
      });
    } else {
      const inputs: InputConfig[] = [];

      for (
        let index = 0;
        index < selectedPaymentMethod.inputs.length;
        index++
      ) {
        const input = selectedPaymentMethod.inputs[index];

        if (input.type === key) {
          inputs.push({ validationError: null, type: input.type });
          continue;
        }

        inputs.push(input);
      }

      setConfig({
        type: selectedPaymentMethod.type,
        inputs,
      });
    }
  };

  return (
    <SelectedPaymentMethodContext.Provider
      value={{ selectedPaymentMethod, setSelectedPaymentMethod, validate }}
    >
      {props.children}
    </SelectedPaymentMethodContext.Provider>
  );
};

const useSelectedPaymentMethod = () =>
  React.useContext(SelectedPaymentMethodContext);

export default useSelectedPaymentMethod;
