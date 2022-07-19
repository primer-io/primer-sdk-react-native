import React, { useEffect, useState, useCallback } from 'react';
import {
  HeadlessUniversalCheckout,
  NativeCardHolderInputElementView,
  NativeCardNumberInputElementView,
  NativeCVVInputElementView,
  NativeExpiryDateInputElementView,
  PrimerCheckoutData,
  PrimerClientSession,
  PrimerError,
  PrimerErrorHandler,
  primerHeadlessCheckoutCardComponentsManager,
  PrimerInputElementType,
  PrimerPaymentMethodTokenData,
  PrimerResumeHandler,
  PrimerSettings,
  PrimerTokenizationHandler
} from '@primer-io/react-native';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { ActivityIndicator } from 'react-native';
import type { PrimerInputElement } from 'src/headless_checkout/NativeCardNumberInputElementView';

let paymentId: string | null = null;
let log: string | undefined;

export const HeadlessCheckoutScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(true);
  // const [headlessCheckoutCardComponentsManager, setHeadlessCheckoutCardComponentsManager] = useState<undefined | PrimerHeadlessCheckoutCardComponentsManager>(undefined);
  const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(undefined);
  const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
  const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
  const [clearLogs, setClearLogs] = useState<boolean>(false);
  const [inputElementsNodes, setInputElementsNodes] = useState<React.ReactNode[] | null>(null);
  const [error, setError] = useState<null | any>(null);
  const [isCardFormValid, setIsCardFormValid] = useState<boolean>(false);

  const updateLogs = (str: string) => {
    const currentLog = log || '';
    const combinedLog = currentLog + '\n' + str;
    log = combinedLog;
  }

  const getLogo = async (identifier: string) => {
    try {
      const assetUrl = await HeadlessUniversalCheckout.getAssetForPaymentMethodType(
        identifier,
        'logo'
      );
      setLocalImageUrl(assetUrl);
    } catch (err) {
      updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
    }
  };

  const onHUCPrepareStart = (paymentMethod: string) => {
    const tmpLog = `\nℹ️ HUC started preparing for ${paymentMethod}`;
    updateLogs(tmpLog);
    console.log(tmpLog);
    setIsLoading(true);
  };

  const onHUCPaymentMethodShow = (paymentMethod: string) => {
    const tmpLog = `\nℹ️ HUC showed ${paymentMethod}`;
    updateLogs(tmpLog);
    console.log(tmpLog);
    setIsLoading(true);
  };

  const onHUCTokenizeStart = (paymentMethod: string) => {
    const tmpLog = `\nℹ️ HUC started tokenization for ${paymentMethod}`;
    updateLogs(tmpLog);
    console.log(tmpLog);
    setIsLoading(true);
  };

  const onHUCAvailablePaymentMethodsLoaded = (paymentMethods: string[]) => {
    const tmpLog = `\nℹ️ HUC did set up client session for payment methods ${JSON.stringify(paymentMethods)}`;
    updateLogs(tmpLog);
    console.log(tmpLog);
    setIsLoading(false);
  };

  const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
    const tmpLog = `\n✅ PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`;
    updateLogs(tmpLog);
    console.log(tmpLog);
    setIsLoading(false);
    props.navigation.navigate('Result', checkoutData);
  };

  const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => {
    updateLogs(`\n✅ onTokenizeSuccess:\n${JSON.stringify(paymentMethodTokenData, null, 2)}`);

    try {
      const payment: IPayment = await createPayment(paymentMethodTokenData.token);

      if (payment.requiredAction && payment.requiredAction.clientToken) {
        paymentId = payment.id;

        if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
          updateLogs("\n🛑 Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
        }
        paymentId = payment.id;
        handler.continueWithNewClientToken(payment.requiredAction.clientToken);
      } else {
        props.navigation.navigate('Result', payment);
        setIsLoading(false);
      }
    } catch (err) {
      updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
      console.error(err);
      setIsLoading(false);
      props.navigation.navigate('Result', err);
    }
  }

  const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
    updateLogs(`\n✅ onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

    try {
      if (paymentId) {
        const payment: IPayment = await resumePayment(paymentId, resumeToken);
        props.navigation.navigate('Result', payment);
        setIsLoading(false);

      } else {
        const err = new Error("Invalid value for paymentId");
        throw err;
      }
      paymentId = null;

    } catch (err) {
      console.error(err);
      paymentId = null;
      props.navigation.navigate('Result', err);
      setIsLoading(false);
    }
  }

  const onError = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => {
    updateLogs(`\n🛑 HUC failed with error:\n\n${JSON.stringify(error, null, 2)}\n\ncheckoutData:\n${JSON.stringify(checkoutData, null, 2)}`);
    console.error(error);
    handler?.showErrorMessage("My RN message");
    setIsLoading(false);
  };

  const onBeforeClientSessionUpdate = () => {
    updateLogs(`\nℹ️ onBeforeClientSessionUpdate`);
  };

  const onClientSessionUpdate = (clientSession: PrimerClientSession) => {
    updateLogs(`\nℹ️ onClientSessionUpdate`);
  }

  let settings: PrimerSettings = {
    paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
    paymentMethodOptions: {
      iOS: {
        urlScheme: 'merchant://primer.io'
      },
    },
    onCheckoutComplete: onCheckoutComplete,
    onTokenizeSuccess: onTokenizeSuccess,
    onResumeSuccess: onResumeSuccess,
    onHUCPrepareStart: onHUCPrepareStart,
    onHUCPaymentMethodShow: onHUCPaymentMethodShow,
    onHUCTokenizeStart: onHUCTokenizeStart,
    onHUCAvailablePaymentMethodsLoaded: onHUCAvailablePaymentMethodsLoaded,
    onBeforeClientSessionUpdate: onBeforeClientSessionUpdate,
    onClientSessionUpdate: onClientSessionUpdate,
    onBeforePaymentCreate: (checkoutPaymentMethodData, handler) => {
      updateLogs(`\nℹ️ onBeforePaymentCreate`);
      handler.continuePaymentCreation();
    },
    onError: onError
  };

  if (appPaymentParameters.merchantName) {
    //@ts-ignore
    settings.paymentMethodOptions.applePayOptions = {
      merchantIdentifier: 'merchant.checkout.team',
      merchantName: appPaymentParameters.merchantName
    }
  }

  useEffect(() => {
    createClientSession()
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
          .then(async (response) => {
            try {
              const listRequiredInputElementTypes = await primerHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes();

              if (listRequiredInputElementTypes.length === 0) { return null; }

              const inputElements: (NativeCardNumberInputElementView | NativeExpiryDateInputElementView | NativeCVVInputElementView | NativeCardHolderInputElementView)[] = [];

              for (var inputElementType of listRequiredInputElementTypes) {
                switch (inputElementType) {
                  case PrimerInputElementType.CardNumber:
                    // const props = {
                    //   style: {
                    //     marginHorizontal: 16,
                    //     marginVertical: 4,
                    //     height: 50,
                    //     flex: 1,
                    //     borderColor: 'black',
                    //     borderWidth: 1,
                    //     borderRadius: 4,
                    //   },
                    //   placeholder: 'e.g. 4242 4242 4242 4242',
                    //   onFocus: () => {
                    //     console.log('CardNumber textField onFocus');
                    //   },
                    //   onValueIsValid: (isValid: boolean) => {
                    //     console.log(`CardNumber textField onValueIsValid: ${isValid}`);
                    //   },
                    //   onValueTypeDetect: (type: string) => {
                    //     console.log(`CardNumber textField onValueTypeDetect: ${type}`);
                    //   }
                    // }

                    const cardNumberInputElementView = <NativeCardNumberInputElementView
                      key={'NativeCardNumberInputElementView'}
                      style={{
                        marginHorizontal: 16,
                        marginVertical: 4,
                        height: 50,
                        flex: 1,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderRadius: 4,
                      }}
                      placeholder={'e.g. 4242 4242 4242 4242'}
                      onFocus={() => {
                        console.log('CardNumber textField onFocus');
                      }}
                        onBlur={() => {
                                              console.log('CardNumber textField onBlur');
                                            }}
                      onValueIsValid={(isValid: boolean) => {
                        console.log(`CardNumber textField onValueIsValid: ${isValid}`);
                      }}
                      onValueTypeDetect={(type: string) => {
                        console.log(`CardNumber textField onValueTypeDetect: ${type}`);
                      }}
                    />

                    inputElements.push(cardNumberInputElementView);
                    break;

                  case PrimerInputElementType.ExpiryDate:
                    const expiryDateInputElementView = <NativeExpiryDateInputElementView
                      key={'NativeExpiryDateInputElementView'}
                      style={{
                        marginHorizontal: 16,
                        marginVertical: 4,
                        height: 50,
                        width: 200,
                        flex: 1,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderRadius: 4,
                      }}
                      placeholder={'e.g. 02/25'}
                      onFocus={() => {
                        console.log('ExpiryDate textField onFocus');
                      }}
                      onValueIsValid={(isValid: boolean) => {
                        console.log(`ExpiryDate textField onValueIsValid: ${isValid}`);
                      }}
                      onValueTypeDetect={(type: string) => {
                        console.log(`ExpiryDate textField onValueTypeDetect: ${type}`);
                      }}
                    />

                    inputElements.push(expiryDateInputElementView);
                    break;

                  case PrimerInputElementType.CVV:
                    const cvvInputElementView = <NativeCVVInputElementView
                      key={'NativeCVVInputElementView'}
                      style={{
                        marginHorizontal: 16,
                        marginVertical: 4,
                        height: 50,
                        flex: 1,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderRadius: 4,
                      }}
                      placeholder={'e.g. 726'}
                      onFocus={() => {
                        console.log('CVV textField onFocus');
                      }}
                      onValueIsValid={(isValid: boolean) => {
                        console.log(`CVV textField onValueIsValid: ${isValid}`);
                      }}
                      onValueTypeDetect={(type: string) => {
                        console.log(`CVV textField onValueTypeDetect: ${type}`);
                      }}
                    />

                    inputElements.push(cvvInputElementView);
                    break;
                                      case PrimerInputElementType.CardholderName:

                         const cardHolderInputElementView = <NativeCardHolderInputElementView
                                          key={'NativeCardHolderInputElementView'}
                                          style={{
                                            marginHorizontal: 16,
                                            marginVertical: 4,
                                            height: 50,
                                            flex: 1,
                                            borderColor: 'black',
                                            borderWidth: 1,
                                            borderRadius: 4,
                                          }}
                                          placeholder={'e.g. John Doe'}
                                          onFocus={() => {
                                            console.log('Cardholder textField onFocus');
                                          }}
                                          onValueIsValid={(isValid: boolean) => {
                                            console.log(`Cardholder textField onValueIsValid: ${isValid}`);
                                          }}
                                          onValueTypeDetect={(type: string) => {
                                            console.log(`Cardholder textField onValueTypeDetect: ${type}`);
                                          }}
                                        />

                                        inputElements.push(cardHolderInputElementView);
                                        break;
                }
              }

              setInputElementsNodes(inputElements);

              primerHeadlessCheckoutCardComponentsManager.onCardFormIsValidValueChange = (isValid) => {
                setIsCardFormValid(isValid);
              }

            } catch (err) {

            }
          })
          .catch((err) => {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
            console.error(err);
            setError(err);
          });
      });

    // getLogo('GOOGLE_PAY')
    //   .then(() => {})
    //   .catch((err) => {});
  }, []);

  const payWithPaymentMethod = (paymentMethod: string) => {
    createClientSession()
      .then((session) => {
        setIsLoading(false);
        HeadlessUniversalCheckout.startWithClientToken(session.clientToken, settings)
          .then((response) => {
            HeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
          })
          .catch((err) => {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
            setError(err);
          });
      });
  };

  const renderPaymentMethods = () => {
    if (!inputElementsNodes) { return null; }

    return (
      <View
        style={{
          backgroundColor: 'red',
          flex: 1
        }}
      >
        {
          inputElementsNodes.map(n => {
            return n;
          })
        }
      </View>
    )

    // if (!paymentMethods) {
    //   return null;
    // } else {
    //   return (
    //     <View>
    //       {paymentMethods.map((pm) => {
    //         return (
    //           <TouchableOpacity
    //             key={pm}
    //             style={{
    //               marginHorizontal: 20,
    //               marginVertical: 4,
    //               height: 50,
    //               backgroundColor: 'black',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //               borderRadius: 4,
    //             }}
    //             onPress={() => {
    //               payWithPaymentMethod(pm);
    //             }}
    //           >
    //             <Text style={{ color: 'white' }}>{pm}</Text>
    //           </TouchableOpacity>
    //         );
    //       })}
    //       <View>
    //         <NativeCardNumberInputElementView
    //           style={{
    //             marginHorizontal: 16,
    //             marginVertical: 4,
    //             height: 50,
    //             flex: 1,
    //             borderColor: 'black',
    //             borderWidth: 1,
    //             borderRadius: 4,
    //           }}
    //           placeholder={'e.g. 4242 4242 4242 4242'}
    //           onFocus={() => {
    //             debugger
    //           }}
    //           onValueIsValid={(isValid: boolean) => {
    //             debugger;
    //           }}
    //           onValueTypeDetect={(type: string) => {
    //             debugger
    //           }}
    //         />
    //         <NativeExpiryDateInputElementView
    //           style={{
    //             marginHorizontal: 16,
    //             marginVertical: 4,
    //             height: 50,
    //             flex: 1,
    //             borderColor: 'black',
    //             borderWidth: 1,
    //             borderRadius: 4,
    //           }}
    //           placeholder={'e.g. 02/25'}
    //           onFocus={() => {
    //             // debugger
    //           }}
    //           onValueIsValid={(isValid: boolean) => {
    //             // debugger;
    //           }}
    //           onValueTypeDetect={(type: string) => {
    //             // debugger
    //           }}
    //         />
    //         <NativeCVVInputElementView
    //           style={{
    //             marginHorizontal: 16,
    //             marginVertical: 4,
    //             height: 50,
    //             flex: 1,
    //             borderColor: 'black',
    //             borderWidth: 1,
    //             borderRadius: 4,
    //           }}
    //           placeholder={'e.g. 726'}
    //           onFocus={() => {
    //             // debugger
    //           }}
    //           onValueIsValid={(isValid: boolean) => {
    //             // debugger;
    //           }}
    //           onValueTypeDetect={(type: string) => {
    //             // debugger
    //           }}
    //         />
    //         <NativeCardHolderInputElementView
    //           style={{
    //             marginHorizontal: 16,
    //             marginVertical: 4,
    //             height: 50,
    //             flex: 1,
    //             borderColor: 'black',
    //             borderWidth: 1,
    //             borderRadius: 4,
    //           }}
    //           placeholder={'e.g. John Smith'}
    //           onFocus={() => {
    //             // debugger
    //           }}
    //           onValueIsValid={(isValid: boolean) => {
    //             // debugger;
    //           }}
    //           onValueTypeDetect={(type: string) => {
    //             // debugger
    //           }}
    //         />
    //       </View>
    //     </View>
    //   );
    // }
  };

  const renderCardPaymentButton = () => {
    if (isCardFormValid) {
      return (
        <TouchableOpacity
          key={'card-payment'}
          style={{
            marginHorizontal: 20,
            marginVertical: 4,
            height: 50,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
          }}
          onPress={() => {
            primerHeadlessCheckoutCardComponentsManager.tokenize();
          }}
        >
          <Text style={{ color: 'black' }}>Pay with card</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          key={'card-payment'}
          style={{
            marginHorizontal: 20,
            marginVertical: 4,
            height: 50,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
          }}
          onPress={() => {

          }}
        >
          <Text style={{ color: 'black' }}>Card form is not valid</Text>
        </TouchableOpacity>
      );
    }
  }

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

  const renderLoadingOverlay = () => {
    if (!isLoading) {
      return null;
    } else {
      return <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        zIndex: 1000
      }}>
        <ActivityIndicator size='small' />
      </View>
    }
  };

  return (
    <View style={{ paddingHorizontal: 24, flex: 1 }}>
      {renderPaymentMethods()}
      {renderCardPaymentButton()}
      <TouchableOpacity
        key={'clear-logs'}
        style={{
          marginHorizontal: 20,
          marginVertical: 4,
          height: 50,
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: 'black',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
        }}
        onPress={() => {
          log = undefined;
          setClearLogs(!clearLogs);
        }}
      >
        <Text style={{ color: 'black' }}>Clear Logs</Text>
      </TouchableOpacity>
      {renderTestImage()}
      {renderResponse()}
      {renderError()}
      <ScrollView
        key={`${clearLogs}`}
        style={{ backgroundColor: 'lightgrey', marginVertical: 10, marginBottom: 40 }}
      >
        <Text>
          {log}
        </Text>
      </ScrollView>
      {renderLoadingOverlay()}
    </View>
  );
};
