
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

    const onClientSessionUpdate = (clientSession: ClientSession) => {
        console.log(`onClientSessionUpdate\n${JSON.stringify(clientSession)}`);;
        setLoadingMessage('onClientSessionUpdate');
    }

    const onBeforePaymentCreate = (checkoutPaymentMethodData: CheckoutPaymentMethodData, handler: PaymentCreationHandler) => {
        console.log(`onBeforePaymentCreate\n${JSON.stringify(checkoutPaymentMethodData)}`);
        handler.continuePaymentCreation();
        setLoadingMessage('onBeforePaymentCreate');
    }

    const onCheckoutComplete = (checkoutData: CheckoutData) => {
        console.log(`PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
        setLoadingMessage(undefined);
        setIsLoading(false);
        props.navigation.navigate('Result', checkoutData);
    };

    const onTokenizeSuccess = async (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: TokenizationHandler) => {
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

    const onResumeSuccess = async (resumeToken: string, handler: ResumeHandler) => {
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

    const onResumePending = async (additionalInfo: CheckoutAdditionalInfo) => {
        console.log(`onResumePending:\n${JSON.stringify(additionalInfo)}`);
        debugger;
    }

    const onCheckoutReceivedAdditionalInfo = async (additionalInfo: CheckoutAdditionalInfo) => {
        console.log(`onCheckoutReceivedAdditionalInfo:\n${JSON.stringify(additionalInfo)}`);
        debugger;
    }

    const onError = (error: PrimerError, checkoutData: CheckoutData | null, handler: ErrorHandler | undefined) => {
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

    console.log(`RENDER\nisLoading: ${isLoading}`)
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
        </View>
    );
};

export default CheckoutScreen;
