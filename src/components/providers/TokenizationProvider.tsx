import React, { useState } from 'react';
import useClientToken from './ClientTokenProvider';
import useError from './ErrorProvider';
import useForm from './FormProvider';
import useLoading from './LoadingProvider';
import useSelectedPaymentMethod from './SelectedPaymentMethodProvider';

interface TokenizationRepository {
  paymentMethodToken?: string;
  createPaymentMethodToken?: () => Promise<void>;
}

const TokenizationContext = React.createContext<TokenizationRepository>({});

export const TokenizationProvider = (props: any) => {
  const [paymentMethodToken, setPaymentMethodToken] = useState<string>();
  const { getDecodedClientToken } = useClientToken();
  const { setLoading } = useLoading();
  const { setError } = useError();
  const { selectedPaymentMethod } = useSelectedPaymentMethod();
  const { getPaymentInstrumentData } = useForm();

  const createPaymentMethodToken = async () => {
    // const allValid = formRepository?.validate('hello');

    // if (!allValid) {
    //   return;
    // }

    setLoading(true);

    // if (!clientTokenRepository?.decodedClientToken) {
    //   throw Error('client token undefined, please provide a client token.');
    // }

    // if (!formRepository?.data) {
    //   throw Error('form data was not provided, please input form data.');
    // }

    // setError(Error('form data was not provided, please input form data.'));

    // 2. get payment instrument data in json format.

    // 3. get access token.

    const accessToken = getDecodedClientToken()?.accessToken;

    if (!accessToken) {
      return setError(Error('client token is required'));
    }

    const response = await fetch(
      'https://sdk.api.sandbox.primer.io/payment-instruments',
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Primer-SDK-Version': '0.11.0',
          'Primer-SDK-Client': 'ANDROID_NATIVE',
          'primer-client-token': accessToken,
          'X-Api-Version': '2021-12-10',
        },
        body: JSON.stringify({
          paymentInstrument: {
            cardholderName: 'John Doe',
            number: '4242424242424242',
            expirationMonth: '01',
            expirationYear: '2025',
            cvv: 257,
          },
        }),
      }
    );

    const data = await response.json();

    console.log(data.token);

    setPaymentMethodToken(data.token);

    setLoading(false);
  };

  return (
    <TokenizationContext.Provider
      value={{ paymentMethodToken, createPaymentMethodToken }}
    >
      {props.children}
    </TokenizationContext.Provider>
  );
};

const useTokenization = () => React.useContext(TokenizationContext);

export default useTokenization;
