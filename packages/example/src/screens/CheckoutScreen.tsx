
import * as React from 'react';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { styles } from '../styles';
import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import type { IClientSession } from '../models/IClientSession';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { createClientSession, createPayment, resumePayment } from '../network/api';
import {
    CheckoutAdditionalInfo,
    CheckoutData,
    CheckoutPaymentMethodData,
    ClientSession,
    ErrorHandler,
    PaymentCreationHandler,
    Primer,
    PrimerError,
    PrimerPaymentMethodTokenData,
    PrimerSettings,
    ResumeHandler,
    TokenizationHandler
} from '@primer-io/react-native';

let clientToken: string | null = null;
let paymentId: string | null = null;
let logs: Log[] = [];
let merchantCheckoutData: CheckoutData | null = null;
let merchantCheckoutAdditionalInfo: CheckoutAdditionalInfo | null = null;
let merchantPayment: IPayment | null = null;
let merchantPrimerError: Error | unknown | null = null;

interface Log {
    event: string;
    value?: any;
}

const CheckoutScreen = (props: any) => {

    const isDarkMode = useColorScheme() === 'dark';
    //@ts-ignore
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    //@ts-ignore
    const [loadingMessage, setLoadingMessage] = React.useState<string | undefined>('undefined');
    //@ts-ignore
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const updateLogs = (log: Log) => {
        console.log(JSON.stringify(log));
        logs.push(log);
    }

    const onBeforeClientSessionUpdate = () => {
        updateLogs({ event: "onBeforeClientSessionUpdate" });
        setIsLoading(true);
        setLoadingMessage('onBeforeClientSessionUpdate');
    }

    const onClientSessionUpdate = (clientSession: ClientSession) => {
        updateLogs({ event: "onClientSessionUpdate", value: clientSession });
        setLoadingMessage('onClientSessionUpdate');
    }

    const onBeforePaymentCreate = (checkoutPaymentMethodData: CheckoutPaymentMethodData, handler: PaymentCreationHandler) => {
        updateLogs({ event: "onBeforePaymentCreate", value: { "checkoutPaymentMethodData": checkoutPaymentMethodData } });
        handler.continuePaymentCreation();
        setLoadingMessage('onBeforePaymentCreate');
    }

    const onCheckoutComplete = (checkoutData: CheckoutData) => {
        updateLogs({ event: "onCheckoutComplete", value: { "checkoutData": checkoutData } });
        merchantCheckoutData = checkoutData;

        setLoadingMessage(undefined);
        setIsLoading(false);

        props.navigation.navigate(
            'Result',
            {
                merchantCheckoutData: merchantCheckoutData,
                merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                merchantPayment: merchantPayment,
                merchantPrimerError: merchantPrimerError,
                logs: logs
            });
    };

    const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: TokenizationHandler) => {
        updateLogs({ event: "onTokenizeSuccess", value: { "paymentMethodTokenData": paymentMethodTokenData } });

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
                merchantPayment = payment;

                handler.handleSuccess();
                setLoadingMessage(undefined);
                setIsLoading(false);

                props.navigation.navigate(
                    'Result',
                    {
                        merchantCheckoutData: merchantCheckoutData,
                        merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                        merchantPayment: merchantPayment,
                        merchantPrimerError: merchantPrimerError,
                        logs: logs
                    });
            }
        } catch (err) {
            merchantPrimerError = err;

            console.error(err);
            handler.handleFailure("Merchant error");
            setLoadingMessage(undefined);
            setIsLoading(false);

            props.navigation.navigate(
                'Result',
                {
                    merchantCheckoutData: merchantCheckoutData,
                    merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                    merchantPayment: merchantPayment,
                    merchantPrimerError: merchantPrimerError,
                    logs: logs
                });
        }
    }

    const onResumeSuccess = async (resumeToken: string, handler: ResumeHandler) => {
        updateLogs({ event: "onResumeSuccess", value: { "resumeToken": resumeToken } });

        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                merchantPayment = payment;

                handler.handleSuccess();
                setLoadingMessage(undefined);
                setIsLoading(false);

                props.navigation.navigate(
                    'Result',
                    {
                        merchantCheckoutData: merchantCheckoutData,
                        merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                        merchantPayment: merchantPayment,
                        merchantPrimerError: merchantPrimerError,
                        logs: logs
                    });

            } else {
                const err = new Error("Invalid value for paymentId");
                throw err;
            }
            paymentId = null;

        } catch (err) {
            merchantPrimerError = err;

            paymentId = null;
            handler.handleFailure("RN app error");
            setLoadingMessage(undefined);
            setIsLoading(false);

            props.navigation.navigate(
                'Result',
                {
                    merchantCheckoutData: merchantCheckoutData,
                    merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                    merchantPayment: merchantPayment,
                    merchantPrimerError: merchantPrimerError,
                    logs: logs
                });
        }
    }

    const onResumePending = async (additionalInfo: CheckoutAdditionalInfo) => {
        updateLogs({ event: "onResumePending", value: { "additionalInfo": additionalInfo } });
    }

    const onCheckoutReceivedAdditionalInfo = async (additionalInfo: CheckoutAdditionalInfo) => {
        updateLogs({ event: "onCheckoutReceivedAdditionalInfo", value: { "additionalInfo": additionalInfo } });
    }

    const onError = (error: PrimerError, checkoutData: CheckoutData | null, handler: ErrorHandler | undefined) => {
        merchantPrimerError = error;
        merchantCheckoutData = checkoutData;

        updateLogs({ event: "onError", value: { "error": error, "checkoutData": checkoutData } });
        handler?.showErrorMessage("My RN message");
        setLoadingMessage(undefined);
        setIsLoading(false);

        props.navigation.navigate(
            'Result',
            {
                merchantCheckoutData: merchantCheckoutData,
                merchantCheckoutAdditionalInfo: merchantCheckoutAdditionalInfo,
                merchantPayment: merchantPayment,
                merchantPrimerError: merchantPrimerError,
                logs: logs
            });
    };

    const onDismiss = () => {
        updateLogs({ event: "onDismiss" });
        clientToken = null;
        setLoadingMessage(undefined);
        setIsLoading(false);
    };

    let settings: PrimerSettings = {
        paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
        paymentMethodOptions: {
            iOS: {
                urlScheme: 'merchant://primer.io'
            },
            cardPaymentOptions: {
                is3DSOnVaultingEnabled: false
            },
            klarnaOptions: {
                recurringPaymentDescription: "Recurring payment description"
            },
            applePayOptions: {
                merchantIdentifier: "merchant.checkout.team",
                merchantName: appPaymentParameters.merchantName || "Merchant name",
                isCaptureBillingAddressEnabled: true,
                isCaptureShippingAddressEnabled: true,
                showApplePayForUnsupportedDevice: true,
                checkProvidedNetworks: false
            },
            googlePayOptions: {
             isCaptureBillingAddressEnabled: true,
             isExistingPaymentMethodRequired: true,
            },
            threeDsOptions: {
                iOS: {
                    threeDsAppRequestorUrl: "https://primer.io"
                },
                android: {
                    threeDsAppRequestorUrl: "https://primer.io"
                }
            }
        },
        uiOptions: {
            isInitScreenEnabled: true,
            isSuccessScreenEnabled: true,
            isErrorScreenEnabled: true,
            theme: {
                colors: {
                    mainColor: {
                        red: 214,
                        green: 255,
                        blue: 1,
                        alpha: 255
                    },
                    background: {
                        red: 255,
                        green: 214,
                        blue: 1,
                        alpha: 255
                    }
                },
                darkModeColors: {
                    mainColor: {
                        red: 1,
                        green: 255,
                        blue: 1,
                        alpha: 255
                    },
                    background: {
                        red: 255,
                        green: 1,
                        blue: 255,
                        alpha: 255
                    }
                }
            }
        },
        debugOptions: {
            is3DSSanityCheckEnabled: false
        },
        primerCallbacks: {
            onBeforeClientSessionUpdate: onBeforeClientSessionUpdate,
            onClientSessionUpdate: onClientSessionUpdate,
            onBeforePaymentCreate: onBeforePaymentCreate,
            onCheckoutComplete: onCheckoutComplete,
            onTokenizeSuccess: onTokenizeSuccess,
            onResumeSuccess: onResumeSuccess,
            onResumePending: onResumePending,
            onCheckoutReceivedAdditionalInfo: onCheckoutReceivedAdditionalInfo,
            onError: onError,
            onDismiss: onDismiss,
        }
    };

    if (appPaymentParameters.merchantName) {
        //@ts-ignore
        settings.paymentMethodOptions.applePayOptions = {
            merchantIdentifier: 'merchant.checkout.team',
            merchantName: appPaymentParameters.merchantName
        };
    }

    const onVaultManagerButtonTapped = async () => {
        try {
            setIsLoading(true);
            const clientSession: IClientSession = await createClientSession();
            clientToken = clientSession.clientToken;
            await Primer.configure(settings);
            await Primer.showVaultManager(clientToken);

        } catch (err) {
            setIsLoading(false);

            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onUniversalCheckoutButtonTapped = async () => {
        try {
            setIsLoading(true);
            const clientSession: IClientSession = await createClientSession();
            clientToken = clientSession.clientToken;
            await Primer.configure(settings);
            await Primer.showUniversalCheckout(clientToken);

        } catch (err) {
            setIsLoading(false);

            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onApplePayButtonTapped = async () => {
        try {
            setIsLoading(true);
            const clientSession: IClientSession = await createClientSession();
            clientToken = clientSession.clientToken;
            await Primer.configure(settings);
            await Primer.showPaymentMethod("APPLE_PAY", "CHECKOUT", clientToken)

        } catch (err) {
            setIsLoading(false);

            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onGooglePayButtonTapped = async () => {
          try {
              setIsLoading(true);
              const clientSession: IClientSession = await createClientSession();
              clientToken = clientSession.clientToken;
              await Primer.configure(settings);
              await Primer.showPaymentMethod("GOOGLE_PAY", "CHECKOUT", clientToken)

          } catch (err) {
              setIsLoading(false);

              if (err instanceof Error) {
                  setError(err);
              } else if (typeof err === "string") {
                  setError(new Error(err));
              } else {
                  setError(new Error('Unknown error'));
              }
          }
      }

    return (
        <View style={backgroundStyle}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
                onPress={onVaultManagerButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Vault Manager
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginBottom: 20, marginTop: 5, backgroundColor: 'black' }}
                onPress={onUniversalCheckoutButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Universal Checkout
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
                onPress={onApplePayButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20,  marginVertical: 5, backgroundColor: 'black' }}
                onPress={onGooglePayButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Google Pay
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CheckoutScreen;
