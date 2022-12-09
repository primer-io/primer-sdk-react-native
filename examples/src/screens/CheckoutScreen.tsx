
import * as React from 'react';
import {
    PrimerCheckoutData,
    PrimerCheckoutPaymentMethodData,
    Primer,
    PrimerErrorHandler,
    PrimerPaymentCreationHandler,
    PrimerSessionIntent,
    PrimerSettings,
    PrimerResumeHandler,
    PrimerPaymentMethodTokenData,
    PrimerTokenizationHandler,
    PrimerClientSession,
    PrimerError,
    PrimerCheckoutAdditionalInfo
} from '@primer-io/react-native';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { styles } from '../styles';
import { appPaymentParameters, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IClientSession } from '../models/IClientSession';
import type { IPayment } from '../models/IPayment';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { createClientSession, createPayment, resumePayment } from '../network/api';

let clientToken: string | null = null;

const CheckoutScreen = (props: any) => {
    const isDarkMode = useColorScheme() === 'dark';
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | undefined>('undefined');
    const [error, setError] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    let paymentId: string | null = null;

    const onBeforeClientSessionUpdate = () => {
        console.log(`onBeforeClientSessionUpdate`);
        setIsLoading(true);
        setLoadingMessage('onBeforeClientSessionUpdate');
    }

    const onClientSessionUpdate = (clientSession: PrimerClientSession) => {
        console.log(`onClientSessionUpdate\n${JSON.stringify(clientSession)}`);;
        setLoadingMessage('onClientSessionUpdate');
    }

    const onBeforePaymentCreate = (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => {
        console.log(`onBeforePaymentCreate\n${JSON.stringify(checkoutPaymentMethodData)}`);
        handler.continuePaymentCreation();
        setLoadingMessage('onBeforePaymentCreate');
    }

    const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
        console.log(`PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
        setLoadingMessage(undefined);
        setIsLoading(false);
        props.navigation.navigate('Result', checkoutData);
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
                setLoadingMessage(undefined);
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            handler.handleFailure("Merchant error");
            setLoadingMessage(undefined);
            setIsLoading(false);
            props.navigation.navigate('Result', err);
        }
    }

    const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
        console.log(`onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                props.navigation.navigate('Result', payment);
                handler.handleSuccess();
                setLoadingMessage(undefined);
                setIsLoading(false);
            } else {
                const err = new Error("Invalid value for paymentId");
                throw err;
            }
            paymentId = null;

        } catch (err) {
            console.error(err);
            paymentId = null;
            handler.handleFailure("RN app error");
            setLoadingMessage(undefined);
            setIsLoading(false);
            props.navigation.navigate('Result', err);
        }
    }

    const onResumePending = async (additionalInfo: PrimerCheckoutAdditionalInfo) => {
        console.log(`onResumePending:\n${JSON.stringify(additionalInfo)}`);
        debugger;
    }

    const onCheckoutReceivedAdditionalInfo = async (additionalInfo: PrimerCheckoutAdditionalInfo) => {
        console.log(`onCheckoutReceivedAdditionalInfo:\n${JSON.stringify(additionalInfo)}`);
        debugger;
    }

    const onError = (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => {
        console.log(`onError:\n${JSON.stringify(error)}\n\n${JSON.stringify(checkoutData)}`);
        handler?.showErrorMessage("My RN message");
        setLoadingMessage(undefined);
        setIsLoading(false);
        props.navigation.navigate('Result', error);
    };

    const onDismiss = () => {
        console.log(`onDismiss`);
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
              merchantName: appPaymentParameters.merchantName,
              isCaptureBillingAddressEnabled: true
            }
        },
        uiOptions: {
            isInitScreenEnabled: true,
            isSuccessScreenEnabled: true,
            isErrorScreenEnabled: true
        },
        debugOptions: {
            is3DSSanityCheckEnabled: true
        },
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
    };

    const onApplePayButtonTapped = async () => {
        try {
            setIsLoading(true);
            const clientSession: IClientSession = await createClientSession();
            clientToken = clientSession.clientToken;
            await Primer.configure(settings);
            await Primer.showPaymentMethod('APPLE_PAY', PrimerSessionIntent.CHECKOUT, clientToken);

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

    console.log(`RENDER\nisLoading: ${isLoading}`)
    return (
        <View style={backgroundStyle}>
            <View style={{ flex: 1 }} />
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
