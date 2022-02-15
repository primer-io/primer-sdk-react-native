import { useEffect, useRef } from 'react';
import useClientToken from '../providers/ClientTokenProvider';
import useLoading from '../providers/LoadingProvider';
import useSelectedPaymentMethod from '../providers/SelectedPaymentMethodProvider';
import useTokenization from '../providers/TokenizationProvider';
import { Buffer } from 'buffer';
import useConfiguration from '../providers/ConfigurationProvider';

const useComponents = (clientToken: string) => {
  const { setDecodedClientToken } = useClientToken();
  const ref = useRef(useConfiguration());
  const { loading } = useLoading();
  const { paymentMethodToken, createPaymentMethodToken } = useTokenization();
  const {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    validate,
  } = useSelectedPaymentMethod();

  useEffect(() => {
    const decoded = Buffer.from(clientToken.split('.')[1], 'base64').toString(
      'ascii'
    );

    const newDecodedClientToken = JSON.parse(decoded);

    setDecodedClientToken(newDecodedClientToken);
    ref.current.fetchConfiguration();
  }, [clientToken, setDecodedClientToken]);

  const selectPaymentMethod = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  return {
    selectedPaymentMethod,
    selectPaymentMethod,
    paymentMethodToken,
    createPaymentMethodToken,
    validate,
    loading,
  };
};

export default useComponents;
