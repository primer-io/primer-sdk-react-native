import React, { useState } from 'react';
import useClientToken from './ClientTokenProvider';
import useError from './ErrorProvider';
import useLoading from './LoadingProvider';

interface Configuration {
  paymentMethods: PaymentMethod[];
}

interface PaymentMethod {
  type: string;
}

interface ConfigurationRepository {
  configuration?: Configuration;
  fetchConfiguration: () => Promise<void>;
}

const ConfigurationContext = React.createContext<ConfigurationRepository>({
  fetchConfiguration: async () => {},
});

export const ConfigurationProvider = (props: any) => {
  const [configuration, setConfiguration] = useState<Configuration>();
  const { getDecodedClientToken } = useClientToken();
  const { setError } = useError();
  // const decodedClientToken = useClientToken();
  const { setLoading } = useLoading();

  const fetchConfiguration = async () => {
    setLoading(true);

    const url = 'https://api.sandbox.primer.io/client-sdk/configuration';

    const accessToken = getDecodedClientToken()?.accessToken;

    if (!accessToken) {
      return setError(Error('client token is required'));
    }

    const response = await fetch(url, {
      method: 'get',
      headers: {
        'Primer-SDK-Version': '0.11.0',
        'Primer-SDK-Client': 'ANDROID_NATIVE',
        'Primer-Client-Token': accessToken,
        'X-Api-Version': '2021-10-19',
      },
    });

    const data = await response.json();

    console.log('configuration', data);

    setConfiguration(data);

    console.log('fetched configuration');

    setLoading(false);
  };

  return (
    <ConfigurationContext.Provider
      value={{ configuration, fetchConfiguration }}
    >
      {props.children}
    </ConfigurationContext.Provider>
  );
};

const useConfiguration = () => React.useContext(ConfigurationContext);

export default useConfiguration;
