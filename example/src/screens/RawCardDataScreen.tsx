import React, { useEffect, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import {
    InputElementType,
    RawCardData,
    RawDataManager,
} from '@primer-io/react-native';
import TextField from '../components/TextField';
import { styles } from '../styles';
import type { RawDataScreenProps } from '../models/RawDataScreenProps';

export interface RawCardDataScreenProps {
    navigation: any;
    clientSession: any;
}

const rawDataManager = new RawDataManager();

const RawCardDataScreen = (props: RawDataScreenProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isCardFormValid, setIsCardFormValid] = useState(false);
    const [requiredInputElementTypes, setRequiredInputElementTypes] = useState<string[] | undefined>(undefined);
    const [cardNumber, setCardNumber] = useState<string>("");
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [cvv, setCvv] = useState<string>("");
    const [cardholderName, setCardholderName] = useState<string | undefined>("");
    const [metadataLog, setMetadataLog] = useState<string>("");
    const [validationLog, setValidationLog] = useState<string>("");

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        await rawDataManager.initialize({
            paymentMethodType: props.route.params.paymentMethodType,
            onMetadataChange: (data => {
                const log = `\nonMetadataChange: ${JSON.stringify(data)}\n`;
                console.log(log);
                setMetadataLog(log);
            }),
            onValidation: ((isVallid, errors) => {
                let log = `\nonValidation:\nisValid: ${isVallid}\n`;

                if (errors) {
                    log += `errors:${JSON.stringify(errors, null, 2)}\n`;
                }

                console.log(log);
                setValidationLog(log);
                setIsCardFormValid(isVallid);
            })
        })
        const requiredInputElementTypes = await rawDataManager.getRequiredInputElementTypes();
        setRequiredInputElementTypes(requiredInputElementTypes);
    }

    const setRawData = (
        tmpCardNumber: string | null,
        tmpExpiryDate: string | null,
        tmpCvv: string | null,
        tmpCardholderName: string | null
    ) => {
        let expiryDateComponents = expiryDate.split("/");

        let expiryMonth: string | undefined;
        let expiryYear: string | undefined;

        if (expiryDateComponents.length === 2) {
            expiryMonth = expiryDateComponents[0];
            expiryYear = expiryDateComponents[1];
        }

        let rawData: RawCardData = {
            cardNumber: cardNumber || "",
            expiryMonth: expiryMonth || "",
            expiryYear: expiryYear || "",
            cvv: cvv || "",
            cardholderName: cardholderName
        }

        if (tmpCardNumber) {
            rawData.cardNumber = tmpCardNumber;
        }

        if (tmpExpiryDate) {
            expiryDateComponents = tmpExpiryDate.split("/");
            if (expiryDateComponents.length === 2) {
                rawData.expiryMonth = expiryDateComponents[0];
                rawData.expiryYear = expiryDateComponents[1];
            }
        }

        if (tmpCvv) {
            rawData.cvv = tmpCvv;
        }

        if (tmpCardholderName) {
            rawData.cardholderName = tmpCardholderName;
        }

        rawDataManager.setRawData(rawData);
    }

    const renderInputs = () => {
        if (!requiredInputElementTypes) {
            return null;
        } else {
            return (
                <View>
                    {
                        requiredInputElementTypes.map(et => {
                            if (et === InputElementType.CARD_NUMBER) {
                                return (
                                    <TextField
                                        key={"CARD_NUMBER"}
                                        style={{ marginVertical: 8 }}
                                        title='Card Number'
                                        value={cardNumber}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setCardNumber(text);
                                            setRawData(text, null, null, null);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.EXPIRY_DATE) {
                                return (
                                    <TextField
                                        key={"EXPIRY_DATE"}
                                        style={{ marginVertical: 8 }}
                                        title='Expiry Date'
                                        value={expiryDate}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setExpiryDate(text);
                                            setRawData(null, text, null, null);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.CVV) {
                                return (
                                    <TextField
                                        key={"CVV"}
                                        style={{ marginVertical: 8 }}
                                        title='CVV'
                                        value={cvv}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setCvv(text);
                                            setRawData(null, null, text, null);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.CARDHOLDER_NAME) {
                                return (
                                    <TextField
                                        key={"CARDHOLDER_NAME"}
                                        style={{ marginVertical: 8 }}
                                        title='CVV'
                                        value={cardholderName}
                                        keyboardType={"default"}
                                        onChangeText={(text) => {
                                            setCardholderName(text);
                                            setRawData(null, null, null, text);
                                        }}
                                    />
                                );
                            }
                        })
                    }
                </View>
            );
        }
    }

    const pay = async () => {
        try {
            await rawDataManager.submit();

        } catch (err) {
            console.error(err);
        }
    }

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

    const renderPayButton = () => {
        return (
            <TouchableOpacity
                style={{
                    ...styles.button,
                    marginVertical: 16,
                    backgroundColor: isCardFormValid ? 'black' : "lightgray"
                }}
                onPress={e => {
                    if (isCardFormValid) {
                        pay();
                    }
                }}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Pay
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEvents = () => {
        return (
            <View>
                <View style={{ backgroundColor: "lightgray" }}>
                    <Text style={{ height: 50 }}>
                        {metadataLog}
                    </Text>
                </View>
                <View style={{ backgroundColor: "lightgray", marginTop: 16 }}>
                    <Text>
                        {validationLog}
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
            {renderInputs()}
            {renderPayButton()}
            {renderEvents()}
            {renderLoadingOverlay()}
        </View>
    );
};

export default RawCardDataScreen;
