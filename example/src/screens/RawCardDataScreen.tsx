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

export interface RawCardDataScreenProps {
    navigation: any;
    clientSession: any;
}

const rawDataManager = new RawDataManager();

const RawCardDataScreen = (props: RawCardDataScreenProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [requiredInputElementTypes, setRequiredInputElementTypes] = useState<string[] | undefined>(undefined);
    const [cardNumber, setCardNumber] = useState<string>("4242 4242 4242 4242");
    const [expiryDate, setExpiryDate] = useState<string>("03/2030");
    const [cvv, setCvv] = useState<string>("123");
    const [cardholderName, setCardholderName] = useState<string | undefined>("John Smith");

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        await rawDataManager.initialize({ 
            paymentMethodType: "PAYMENT_CARD",
            onMetadataChange: (data => {
                console.log(`\n\nonMetadataChange: ${JSON.stringify(data)}`);
            }),
            onValidation: ((isVallid, errors) => {
                console.log(`\n\nonValidation:\nisValid: ${isVallid}\nerrors:${JSON.stringify(errors)}`);
            })
        })
        const requiredInputElementTypes = await rawDataManager.getRequiredInputElementTypes();
        setRequiredInputElementTypes(requiredInputElementTypes);
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
                                        style={{ marginVertical: 8 }}
                                        title='Card Number'
                                        value={cardNumber}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setCardNumber(text);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.EXPIRY_DATE) {
                                return (
                                    <TextField
                                        style={{ marginVertical: 8 }}
                                        title='Expiry Date'
                                        value={expiryDate}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setExpiryDate(text);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.CVV) {
                                return (
                                    <TextField
                                        style={{ marginVertical: 8 }}
                                        title='CVV'
                                        value={cvv}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setCvv(text);
                                        }}
                                    />
                                );
                            } else if (et === InputElementType.CARDHOLDER_NAME) {
                                return (
                                    <TextField
                                        style={{ marginVertical: 8 }}
                                        title='CVV'
                                        value={cardholderName}
                                        keyboardType={"default"}
                                        onChangeText={(text) => {
                                            setCardholderName(text);
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
            const rawCardData: RawCardData = {
                cardNumber: cardNumber,
                expiryMonth: "03",
                expiryYear: "2030",
                cvv: "123",
                cardholderName: cardholderName
            }
            await rawDataManager.setRawData(rawCardData);
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
                style={{ ...styles.button, marginVertical: 16, backgroundColor: 'black' }}
                onPress={e =>  {
                    pay();
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

    return (
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
            {renderInputs()}
            {renderPayButton()}
            {renderLoadingOverlay()}
        </View>
    );
};

export default RawCardDataScreen;
