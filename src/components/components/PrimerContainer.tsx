import React from 'react';
import { ClientTokenProvider } from '../providers/ClientTokenProvider';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { ErrorProvider } from '../providers/ErrorProvider';
import { FormDataProvider } from '../providers/FormProvider';
import { LoadingProvider } from '../providers/LoadingProvider';
import { SelectedPaymentMethodProvider } from '../providers/SelectedPaymentMethodProvider';
import { TokenizationProvider } from '../providers/TokenizationProvider';

const PrimerContainer = (props: any) => {
  console.log('PrimerContainer');
  return (
    <ErrorProvider>
      <LoadingProvider>
        <ClientTokenProvider>
          <ConfigurationProvider>
            <FormDataProvider>
              <SelectedPaymentMethodProvider>
                <TokenizationProvider>{props.children}</TokenizationProvider>
              </SelectedPaymentMethodProvider>
            </FormDataProvider>
          </ConfigurationProvider>
        </ClientTokenProvider>
      </LoadingProvider>
    </ErrorProvider>
  );
};

export default PrimerContainer;
