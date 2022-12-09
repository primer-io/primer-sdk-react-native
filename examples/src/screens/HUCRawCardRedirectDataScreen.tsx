import React, { useEffect, useState } from 'react';

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
import {
    PrimerCheckoutData,
    PrimerClientSession,
    PrimerError,
    PrimerErrorHandler,
    HeadlessUniversalCheckout,
    PrimerPaymentMethodTokenData,
    PrimerResumeHandler,
    PrimerSettings,
    PrimerTokenizationHandler,
    HeadlessUniversalCheckoutRawDataManager,
    PrimerRawCardRedirectData,
    PrimerBancontactCardRedirectData
} from '@primer-io/react-native';
import type { PrimerHeadlessUniversalCheckoutRawDataManagerOptions } from 'src/headless_checkout/PrimerHeadlessUniversalCheckoutRawDataManager';

let paymentId: string | null = null;
let log: string | undefined;

export const HUCRawCardRedirectDataScreen = (props: any) => {
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<undefined | string[]>(undefined);
    const [paymentResponse, setPaymentResponse] = useState<null | string>(null);
    const [localImageUrl, setLocalImageUrl] = useState<null | string>(null);
    const [clearLogs, setClearLogs] = useState<boolean>(false);
    const [error, setError] = useState<null | any>(null);

    const updateLogs = (str: string) => {
        const currentLog = log || '';
        const combinedLog = currentLog + '\n' + str;
        log = combinedLog;
    }

    const onPrepareStart = (paymentMethodType: string) => {
        updateLogs(`\nℹ️ HUC started preparing for ${paymentMethodType}`);
        setIsLoading(true);
    };

    const onPaymentMethodShow = (paymentMethodType: string) => {
        updateLogs(`\nℹ️ HUC showed ${paymentMethodType}`);
        setIsLoading(true);
    };

    const onTokenizeStart = (paymentMethodType: string) => {
        updateLogs(`\nℹ️ HUC started tokenization for ${paymentMethodType}`);
        setIsLoading(true);
    };

    const onAvailablePaymentMethodsLoad = (paymentMethodTypes: string[]) => {
        updateLogs(`\nℹ️ HUC did set up client session for payment methods ${JSON.stringify(paymentMethodTypes)}`);
        setIsLoading(false);
    };

    const onCheckoutComplete = (checkoutData: PrimerCheckoutData) => {
        updateLogs(`\n✅ PrimerCheckoutData:\n${JSON.stringify(checkoutData)}`);
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
                handler.handleSuccess();
            }
        } catch (err) {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
            console.error(err);
            setIsLoading(false);
            props.navigation.navigate('Result', err);
            handler.handleFailure("My RN message");
        }
    }

    const onResumeSuccess = async (resumeToken: string, handler: PrimerResumeHandler) => {
        updateLogs(`\n✅ onResumeSuccess:\n${JSON.stringify(resumeToken)}`);

        try {
            if (paymentId) {
                const payment: IPayment = await resumePayment(paymentId, resumeToken);
                props.navigation.navigate('Result', payment);
                setIsLoading(false);
                handler.handleSuccess();
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
            handler.handleFailure("My RN message");
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
                urlScheme: 'merchant://primer.io',
            },
        },

        onCheckoutComplete: onCheckoutComplete,
        onTokenizeSuccess: onTokenizeSuccess,
        onResumeSuccess: onResumeSuccess,
        onPrepareStart: onPrepareStart,
        onPaymentMethodShow: onPaymentMethodShow,
        onTokenizeStart: onTokenizeStart,
        onAvailablePaymentMethodsLoad: onAvailablePaymentMethodsLoad,
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
                    .then((paymentMethodTypes) => {
                        updateLogs(`\nℹ️ Available payment methods:\n${JSON.stringify(paymentMethodTypes, null, 2)}`);
                        setPaymentMethods(paymentMethodTypes);
                        startHUCRawDataManager();

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

    const startHUCRawDataManager = async () => {
        try {
            const options: PrimerHeadlessUniversalCheckoutRawDataManagerOptions = {
                paymentMethodType: "ADYEN_BANCONTACT_CARD",
                onMetadataChange: (data) => {
                    const cardNetwork = data?.cardNetwork;
                    if (cardNetwork) {
                        updateLogs(`\nℹ️ Detected card network ${data.cardNetwork}`);
                    }
                },
                onValidation: (isValid, errors) => {
                    if (!isValid && errors && errors.length > 0) {
                        updateLogs(`\n🛑 Error:\n${JSON.stringify(errors, null, 2)}`);
                    }
                }
            }
            await HeadlessUniversalCheckoutRawDataManager.configure(options);
            const requiredInputElementTypes = await HeadlessUniversalCheckoutRawDataManager.getRequiredInputElementTypes();

            let rawCardData: PrimerBancontactCardRedirectData = {
                cardNumber: "",
                expiryMonth: "14",
                expiryYear: "2024",
                cardholderName: "John"
            }
            await HeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);

            setTimeout(async () => {
                rawCardData.expiryMonth = "03"
                await HeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);

                setTimeout(async () => {
                    rawCardData.cardNumber = "4"
                    await HeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);

                    setTimeout(async () => {
                        rawCardData.expiryYear = "2030"
                        await HeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);

                        setTimeout(async () => {
                            rawCardData.cardNumber = "4871049999999910"
                            await HeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);
                            await HeadlessUniversalCheckoutRawDataManager.submit();

                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);

            // rawCardData.number = "4242424242424242"
            // rawCardData.expiryMonth = "12"
            // rawCardData.expiryYear = "2024"
            // rawCardData.cvv = "123"
            // rawCardData.cardholderName = "John"
            // PrimerHeadlessUniversalCheckoutRawDataManager.setRawData(rawCardData);

        } catch (err) {
            updateLogs(`\n🛑 Error:\n${JSON.stringify(err, null, 2)}`);
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
