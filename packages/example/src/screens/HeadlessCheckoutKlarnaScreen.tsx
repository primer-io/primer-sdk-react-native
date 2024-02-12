import React, { useEffect, useRef, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Button,
    requireNativeComponent,
} from 'react-native';
import {
    KlarnaManager,
    KlarnaPaymentComponent,
    PrimerError,
    PrimerInvalidComponentData,
    PrimerValidComponentData,
    PrimerValidatingComponentData,
    PrimerComponentDataValidationError,
    KlarnaManagerProps,
    KlarnaPaymentFinalization,
    KlarnaPaymentOptions,
    KlarnaPaymentCategory,
    PaymentSessionAuthorized,
    PaymentSessionCreated,
    PaymentSessionFinalized
} from '@primer-io/react-native';

const klarnaManager = new KlarnaManager();
let klarnaPaymentComponent: KlarnaPaymentComponent;

const PrimerKlarnaPaymentView = requireNativeComponent<{}>(
    'PrimerKlarnaPaymentView'
);

const HeadlessCheckoutKlarnaScreen = (props: any) => {
    const [isAuthorizationVisible, setAuthorizationVisible] = useState<boolean>(false)
    const [selectedPaymentCategoryIdentifier, setSelectedPaymentCategoryIdentifier] = useState<string | null>(null);
    const [paymentCategories, setPaymentCategories] = useState<KlarnaPaymentCategory[]>([])

    useEffect(() => {
        (async () => {
            const klarnaManagerProps: KlarnaManagerProps = {
                onStep: (data: PaymentSessionCreated | PaymentSessionAuthorized | PaymentSessionFinalized) => {
                    const log = `\nonStep: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    if (isPaymentSessionCreated(data)) {
                        setPaymentCategories(data.paymentCategories)
                    } else if (data?.name == "paymentViewLoaded") {
                        setAuthorizationVisible(true)
                    }
                },
                onError: (error: PrimerError) => {
                    const log = `\nonError: ${JSON.stringify(error)}\n`;
                    console.log(log);
                },
                onInvalid: (data: PrimerInvalidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => {
                    const log = `\nonInvalid: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    //   setIsLoading(false);
                    //   setIsValidating(null);
                },
                onValid: (data: PrimerValidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => {
                    const log = `\nonValid: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    //   setIsLoading(false);
                    //   setIsValidating(null);
                    //   if (isBankId(data?.data)) {
                    //     submit()
                    //   }
                },
                onValidating: (data: PrimerValidatingComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => {
                    const log = `\onValidating: ${JSON.stringify(data)}\n`;
                    console.log(log);
                },
                onValidationError: (data: PrimerComponentDataValidationError<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => {
                    const log = `\nonValidationError: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    //   setIsLoading(false);
                    //   setIsValidating(null);
                },
            };
            klarnaPaymentComponent = await klarnaManager.provide(klarnaManagerProps);
            klarnaPaymentComponent?.start();
        })()
    }, []);

    const onPaymentCategorySelected = async () => {
        try {
            const klarnaPaymentCategory = paymentCategories.find(
                (paymentCategory) => paymentCategory.identifier === selectedPaymentCategoryIdentifier
            ) as KlarnaPaymentCategory
            await klarnaPaymentComponent.onSetPaymentOptions(
                {
                    returnIntentUrl: "TODO://TODO", // TODO TWS-94
                    paymentCategory: klarnaPaymentCategory
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async () => {
        try {
            await klarnaPaymentComponent.submit();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View
            style={{
                padding: 16,
                flex: 1,
                backgroundColor: 'white',
            }}>

            <Text style={{ fontSize: 18, fontWeight: 'bold', paddingBottom: 8 }}>Klarna session</Text>

            <PaymentCategories
                selectedPaymentCategoryIdentifier={selectedPaymentCategoryIdentifier}
                paymentCategories={paymentCategories}
                onPress={(identifier) => { setSelectedPaymentCategoryIdentifier(identifier) }}
            />

            <View style={styles.button}>
                <Button
                    disabled={selectedPaymentCategoryIdentifier === null}
                    onPress={() => onPaymentCategorySelected()}
                    title="Initialize Klarna view"
                />
            </View>

            {isAuthorizationVisible && <PrimerKlarnaPaymentView style={{ flex: 1 }}/>}

            <View style={styles.button}>
                {isAuthorizationVisible && <Button onPress={() => onSubmit()} title="Continue" />}
            </View>
        </View>
    );
};

function isPaymentSessionCreated(data?: PaymentSessionCreated | PaymentSessionAuthorized | PaymentSessionFinalized): data is PaymentSessionCreated {
    return (data as PaymentSessionCreated).paymentCategories !== undefined;
}

const PaymentCategories = ({ paymentCategories, selectedPaymentCategoryIdentifier, onPress }: {
    paymentCategories: KlarnaPaymentCategory[],
    selectedPaymentCategoryIdentifier: string | null,
    onPress: (identifier: string) => void
}) => {
    return <>{paymentCategories.map(paymentCategory => (
        <RadioButton
            key={paymentCategory.identifier}
            text={paymentCategory.name}
            isChecked={selectedPaymentCategoryIdentifier == paymentCategory.identifier}
            onPress={() => onPress(paymentCategory.identifier)}
        />
    ))}</>
}

const RadioButton = ({ text, isChecked, onPress }: { text: string, isChecked: boolean, onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.radioButton} onPress={() => onPress()}>
            <View style={[styles.radioCircle, isChecked && styles.checkedRadioCircle]} />
            <Text style={styles.radioText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    radioButton: {
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioText: {
        paddingStart: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2C98F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedRadioCircle: {
        backgroundColor: '#2C98F0',
    },
    button: {
        paddingTop: 16,
    },
});

export default HeadlessCheckoutKlarnaScreen;