import React, { useEffect, useRef, useState } from 'react';
import { HeadlessUniversalCheckout, PrimerCheckoutData, PrimerError, PrimerErrorHandler, PrimerPaymentMethodTokenData, PrimerResumeHandler, PrimerSettings, PrimerTokenizationHandler } from '@primer-io/react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { createClientSession, createPayment, resumePayment } from '../network/API';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IAppSettings } from '../models/IAppSettings';
import { makeRandomString } from '../helpers/helpers';
import type { IPayment } from '../models/IPayment';

let paymentId: string | null = null;

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(
    undefined
  );
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  const [error, setError] = useState<null | any>(null);

  const getLogo = async (identifier: string) => {
    try {
      const assetUrl = await HeadlessUniversalCheckout.getAssetForPaymentMethod(
        identifier,
        'logo'
      );
      setLocalImageUrl(assetUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => {
    console.log(`onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData)}`);

    try {
      const payment: IPayment = await createPayment(paymentMethodTokenData.token);

      if (payment.requiredAction && payment.requiredAction.clientToken) {
        paymentId = payment.id;

        if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
          console.warn("Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
        }
        paymentId = payment.id;
        handler.continueWithNewClientToken(payment.requiredAction.clientToken);
      } else {
        props.navigation.navigate('Result', payment);
        handler.handleSuccess();
      }
    } catch (err) {
      console.error(err);
      handler.handleFailure("RN app error");
    }
  }

  const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
    console.log(`onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

    try {
      if (paymentId) {
        const payment: IPayment = await resumePayment(paymentId, resumeToken);
        props.navigation.navigate('Result', payment);
        handler.handleSuccess();
      } else {
        const err = new Error("Invalid value for paymentId");
        throw err;
      }
      paymentId = null;

    } catch (err) {
      console.error(err);
      paymentId = null;
      handler.handleFailure("RN app error");
    }
  }

  const onError = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => {
    console.log(`HUC failed with error ${JSON.stringify(error)}`);
    console.error(error);
    handler?.showErrorMessage("My RN message");
  };

  const settings: PrimerSettings = {
    paymentHandling: 'AUTO',
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://test.io'
      },
      applePayOptions: {
        merchantIdentifier: 'merchant.checkout.team',
        merchantName: 'Primer Merchant'
      }
    },
    onCheckoutComplete: (checkoutData) => {
      setPaymentResponse(JSON.stringify(checkoutData));
    },
    onTokenizeSuccess: onTokenizeSuccess,
    onResumeSuccess: onResumeSuccess,
    onHUCPrepareStart: (paymentMethod) => {
      console.log(`HUC started preparing for ${paymentMethod}`);
    },
    onHUCPaymentMethodPresent: (paymentMethod) => {
      console.log(`HUC presented ${paymentMethod}`);
    },
    onHUCTokenizeStart: (paymentMethod) => {
      console.log(`HUC started tokenization for ${paymentMethod}`);
    },
    onHUCClientSessionSetup: (paymentMethods) => {
      console.log(`HUC did set up client session for payment methods ${JSON.stringify(paymentMethods)}`);
    },
    onError: onError
  };

  const appSettings: IAppSettings = props.route.params;
  const clientSessionRequestBody: IClientSessionRequestBody = {
    customerId: appSettings.customerId,
    orderId: 'rn-test-' + makeRandomString(8),
    currencyCode: appSettings.currencyCode,
    order: {
      countryCode: appSettings.countryCode,
      lineItems: [
        {
          amount: appSettings.amount,
          quantity: 1,
          itemId: 'item-123',
          description: 'this item',
          discountAmount: 0,
        },
      ],
    },
    customer: {
      emailAddress: 'test@mail.com',
      mobileNumber: appSettings.phoneNumber,
      firstName: 'John',
      lastName: 'Doe',
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345',
        addressLine1: '1 test',
        addressLine2: undefined,
        countryCode: appSettings.countryCode,
        city: 'test',
        state: 'test',
      },
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '1 test',
        postalCode: '12345',
        city: 'test',
        state: 'test',
        countryCode: appSettings.countryCode,
      },
      nationalDocumentId: '9011211234567',
    },
    paymentMethod: {
      vaultOnSuccess: false,
      // options: {
      //     GOOGLE_PAY: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     ADYEN_IDEAL: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     ADYEN_SOFORT: {
      //         surcharge: {
      //             amount: 50,
      //         },
      //     },
      //     APPLE_PAY: {
      //         surcharge: {
      //             amount: 150,
      //         },
      //     },
      //     PAYMENT_CARD: {
      //         networks: {
      //             VISA: {
      //                 surcharge: {
      //                     amount: 100,
      //                 },
      //             },
      //             MASTERCARD: {
      //                 surcharge: {
      //                     amount: 200,
      //                 },
      //             },
      //         },
      //     },
      // },
    },
  };

  useEffect(() => {
    createClientSession(clientSessionRequestBody)
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
          .then((response) => {
            console.log(`Available payment methods: ${JSON.stringify(response.paymentMethodTypes)}`);
            setPaymentMethods(response.paymentMethodTypes);
          })
          .catch((err) => {
            console.error(err);
            setError(err);
          });
      });

    // getLogo('GOOGLE_PAY')
    //   .then(() => {})
    //   .catch((err) => {});
  }, []);

  const payWithPaymentMethod = (paymentMethod: string) => {
    createClientSession(clientSessionRequestBody)
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(
          session.clientToken,
          settings
        )
          .then((response) => {
            HeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
          })
          .catch((err) => {
            console.error(err);
            setError(err);
          });
      });
  };

  const renderPaymentMethods = () => {
    if (!paymentMethods) {
      return null;
    } else {
      return (
        <View>
          {paymentMethods.map((pm) => {
            return (
              <TouchableOpacity
                key={pm}
                style={{
                  marginHorizontal: 20,
                  marginVertical: 4,
                  height: 50,
                  backgroundColor: 'black',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 4,
                }}
                onPress={() => {
                  payWithPaymentMethod(pm);
                }}
              >
                <Text style={{ color: 'white' }}>{pm}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
  };

  const renderResponse = () => {
    if (!paymentResponse) {
      return null;
    } else {
      return (
        <Text style={{ color: 'black' }}>
          {JSON.stringify(paymentResponse)}
        </Text>
      );
    }
  };

  const renderTestImage = () => {
    if (!localImageUrl) {
      return null;
    } else {
      return (
        <Image
          style={{ width: 300, height: 150 }}
          source={{ uri: localImageUrl }}
        />
      );
    }
  };

  const renderError = () => {
    if (!error) {
      return null;
    } else {
      return <Text style={{ color: 'red' }}>{JSON.stringify(error)}</Text>;
    }
  };

  return (
    <View style={(styles.sectionContainer)}>
      {/* <PrimerCardNumberEditText style={{width: 300, height: 50, backgroundColor: 'red'}} /> */}
      {renderPaymentMethods()}
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
    </View>
  );
};
