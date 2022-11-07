import React, { useEffect, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import {
    InputElementType,
    RawDataManager,
    RawPhoneNumberData,
} from '@primer-io/react-native';
import TextField from '../components/TextField';
import { styles } from '../styles';
import type { RawDataScreenProps } from '../models/RawDataScreenProps';

const rawDataManager = new RawDataManager();

const RawPhoneNumberDataScreen = (props: any) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isCardFormValid, setIsCardFormValid] = useState(false);
    const [requiredInputElementTypes, setRequiredInputElementTypes] = useState<string[] | undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [metadataLog, setMetadataLog] = useState<string>("");
    const [validationLog, setValidationLog] = useState<string>("");

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        await rawDataManager.configure({
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

    const setRawData = (tmpPhoneNumber: string) => {
        let rawData: RawPhoneNumberData = {
            phoneNumber: tmpPhoneNumber
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
                            if (et === InputElementType.PHONE_NUMBER) {
                                return (
                                    <TextField
                                        key={"PHONE_NUMBER"}
                                        style={{ marginVertical: 8 }}
                                        title='Phone Number'
                                        value={phoneNumber}
                                        keyboardType={"numeric"}
                                        onChangeText={(text) => {
                                            setPhoneNumber(text);
                                            setRawData(text);
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
            <ScrollView>
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
            </ScrollView>
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

export default RawPhoneNumberDataScreen;
