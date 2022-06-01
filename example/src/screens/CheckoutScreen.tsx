
import * as React from 'react';
import { Primer } from '@primer-io/react-native';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { createClientSession, createClientSessionRequestBody, createPayment, resumePayment } from '../network/api';
import { styles } from '../styles';
import type { IAppSettings } from '../models/IAppSettings';
import type { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { OnPrimerErrorCallback, OnTokenizeSuccessCallback } from 'lib/typescript/models/primer-callbacks';
import type { IClientSession } from '../models/IClientSession';
import { makeRandomString } from '../helpers/helpers';
import type { IPayment } from '../models/IPayment';
import type { PrimerPaymentMethodIntent } from 'lib/typescript/models/primer-intent';
import type { OnResumeCallback } from 'src/models/primer-callbacks';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';

let currentClientToken: string | null = null;
let paymentId: string | null = null;

const CheckoutScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const appSettings: IAppSettings = props.route.params;
    const clientSessionRequestBody: IClientSessionRequestBody = 
        createClientSessionRequestBody(
            appSettings.amount, 
            appSettings.currencyCode, 
            appSettings.countryCode, 
            appSettings.customerId || null, 
            appSettings.phoneNumber || null, 
            false);

    // const onClientSessionActions: OnClientSessionActionsCallback = async (clientSessionActions, resumeHandler) => {
    //     if (currentClientToken) {
    //         const clientSessionActionsRequestBody: any = {
    //             clientToken: currentClientToken,
    //             actions: clientSessionActions
    //         };

    //         const clientSession: IClientSession = await setClientSessionActions(clientSessionActionsRequestBody);
    //         currentClientToken = clientSession.clientToken;
    //         resumeHandler.handleNewClientToken(currentClientToken);
    //     } else {
    //         const err = new Error("Failed to find client token");
    //         resumeHandler.handleError(err.message);
    //     }
    // }

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (paymentInstrument, resumeHandler) => {
        console.log(`onTokenizeSuccess\npaymentInstrument: ${JSON.stringify(paymentInstrument)}`);
        try {
            const payment: IPayment = await createPayment(paymentInstrument.token);

            if (payment.requiredAction && payment.requiredAction.clientToken) {
                paymentId = payment.id;

                if (payment.requiredAction.name === "3DS_AUTHENTICATION") {
                    console.warn("Make sure you have used a card number that supports 3DS, otherwise the SDK will hang.")
                }
                paymentId = payment.id;
                resumeHandler.handleNewClientToken(payment.requiredAction.clientToken);
            } else {
                props.navigation.navigate('Result', payment);
                resumeHandler.handleSuccess();
            }
        } catch (err) {
            if (resumeHandler) {
                if (err instanceof Error) {
                    //@ts-ignore
                    resumeHandler.handleError(err.message);
                } else if (typeof err === "string") {
                    //@ts-ignore
                    resumeHandler.handleError(err);
                } else {
                    //@ts-ignore
                    resumeHandler.handleError('Unknown error');
                }
            }
        }
    };

    const onVaultSuccess = (paymentInstrument: PaymentInstrumentToken) => {
        console.log(`onVaultSuccess: ${JSON.stringify(paymentInstrument)}`);
    };

    const onResumeSuccess: OnResumeCallback = async (resumeToken, resumeHandler) => {
        console.log(`onResumeSuccess\nresumeToken: ${resumeToken}`);
        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                props.navigation.navigate('Result', payment);

                if (resumeHandler) {
                    resumeHandler.handleSuccess();
                }
            } else {
                const err = new Error("Invalid value for paymentId");
                throw err;
            }
            paymentId = null;

        } catch (err) {
            paymentId = null;

            if (resumeHandler) {
                if (err instanceof Error) {
                    resumeHandler.handleError(err);
                } else if (typeof err === "string") {
                    resumeHandler.handleError(new Error(err));
                } else {
                    resumeHandler.handleError(new Error('Unknown error'));
                }
            }
        }
    };

    const onDismiss = () => {
        console.log(`onDismiss`);
        currentClientToken = null;
    }

    const onError: OnPrimerErrorCallback = async (primerError, _resumeHandler) => {
        console.log(`onError`);
        console.error(primerError.errorDescription);
    };

    const onCheckoutWithApplePayButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                // onClientSessionActions: onClientSessionActions,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            const intent: PrimerPaymentMethodIntent = {
                vault: false,
                paymentMethod: 'APPLE_PAY'
            };

            //@ts-ignore
            Primer.showPaymentMethod(currentClientToken, intent, primerConfig);

        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onCheckoutWithPayPalButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                // onClientSessionActions: onClientSessionActions,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            const intent: PrimerPaymentMethodIntent = {
                vault: false,
                paymentMethod: 'PAYPAL'
            };

            //@ts-ignore
            Primer.showPaymentMethod(currentClientToken, intent, primerConfig);

        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onVaultPayPalButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                // onClientSessionActions: onClientSessionActions,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            const intent: PrimerPaymentMethodIntent = {
                vault: true,
                paymentMethod: 'PAYPAL'
            };

            //@ts-ignore
            Primer.showPaymentMethod(currentClientToken, intent, primerConfig);

        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onVaultKlarnaButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                // onClientSessionActions: onClientSessionActions,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            const intent: PrimerPaymentMethodIntent = {
                vault: true,
                paymentMethod: 'KLARNA'
            };

            //@ts-ignore
            Primer.showPaymentMethod(currentClientToken, intent, primerConfig);

        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "string") {
                setError(new Error(err));
            } else {
                setError(new Error('Unknown error'));
            }
        }
    }

    const onVaultManagerButtonTapped = async () => {
        try {
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig: PrimerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        // is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            //@ts-ignore
            Primer.showVaultManager(currentClientToken, primerConfig);

        } catch (err) {
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
            const clientSession: IClientSession = await createClientSession(clientSessionRequestBody);
            currentClientToken = clientSession.clientToken;

            const primerConfig: PrimerConfig = {
                settings: {
                    options: {
                        isResultScreenEnabled: true,
                        isLoadingScreenEnabled: true,
                        // is3DSDevelopmentModeEnabled: true,
                        ios: {
                            urlScheme: 'primer',
                            merchantIdentifier: 'merchant.checkout.team'
                        },
                        android: {
                            redirectScheme: 'primer'
                        }
                    },
                    business: {
                        name: "Test Merchant"
                    }
                },
                // onClientSessionActions: onClientSessionActions,
                onTokenizeSuccess: onTokenizeSuccess,
                onResumeSuccess: onResumeSuccess,
                onError: onError,
                onDismiss: onDismiss,
                onVaultSuccess: onVaultSuccess
            };

            //@ts-ignore
            Primer.showUniversalCheckout(currentClientToken, primerConfig);

        } catch (err) {
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
                onPress={onCheckoutWithApplePayButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Checkout with Apple Pay
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
                onPress={onCheckoutWithPayPalButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Checkout with PayPal
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
                onPress={onVaultPayPalButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Vault PayPal
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
                onPress={onVaultKlarnaButtonTapped}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Vault Klarna
                </Text>
            </TouchableOpacity>
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
        </View>
    );
};

export default CheckoutScreen;
