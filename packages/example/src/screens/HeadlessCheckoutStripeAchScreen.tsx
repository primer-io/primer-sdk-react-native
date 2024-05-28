import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    Button,
    StyleSheet,
} from 'react-native';
import {
    AchManager,
    StripeAchComponent,
    AchUserDetailsStep,
    PrimerError,
    PrimerInvalidComponentData,
    PrimerValidComponentData,
    PrimerValidatingComponentData,
    PrimerComponentDataValidationError,
    AchManagerProps,
    StripeAchUserDetailsValidatableData,
} from '@primer-io/react-native';
import TextField from '../components/TextField';

const achManager = new AchManager();
let component: StripeAchComponent;

const HeadlessCheckoutStripeAchScreen = (props: any) => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [emailAddress, setEmailAddress] = useState<string>("");
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const [emailAddressError, setEmailAddressError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const achManagerProps: AchManagerProps = {
                onStep: (data: AchUserDetailsStep) => {
                    const log = `\nonStep: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    switch (data.stepName) {
                        case "userDetailsRetrieved":
                            setFirstName(data.firstName);
                            setLastName(data.lastName);
                            setEmailAddress(data.emailAddress);
                            break;

                        case "userDetailsCollected":
                            props.navigation.goBack();
                            break;
                    }
                },
                onError: (error: PrimerError) => {
                    const log = `\nonError: ${JSON.stringify(error)}\n`;
                    console.log(log);
                },
                onInvalid: (data: PrimerInvalidComponentData<StripeAchUserDetailsValidatableData>) => {
                    const log = `\nonInvalid: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    let error = data?.errors[0]?.description ?? null
                    switch (data.data.validatableDataName) {
                        case "firstName":
                            setFirstNameError(error)
                            break;
                        case "lastName":
                            setLastNameError(error)
                            break;
                        case "emailAddress":
                            setEmailAddressError(error)
                            break;
                    }
                },
                onValid: (data: PrimerValidComponentData<StripeAchUserDetailsValidatableData>) => {
                    const log = `\nonValid: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    switch (data.data.validatableDataName) {
                        case "firstName":
                            setFirstNameError(null)
                            break;
                        case "lastName":
                            setLastNameError(null)
                            break;
                        case "emailAddress":
                            setEmailAddressError(null)
                            break;
                    }
                },
                onValidating: (data: PrimerValidatingComponentData<StripeAchUserDetailsValidatableData>) => {
                    const log = `\onValidating: ${JSON.stringify(data)}\n`;
                    console.log(log);
                },
                onValidationError: (data: PrimerComponentDataValidationError<StripeAchUserDetailsValidatableData>) => {
                    const log = `\nonValidationError: ${JSON.stringify(data)}\n`;
                    console.log(log);
                    switch (data.data.validatableDataName) {
                        case "firstName":
                            setFirstNameError(data.data.error)
                            break;
                        case "lastName":
                            setLastNameError(data.data.error)
                            break;
                        case "emailAddress":
                            setEmailAddressError(data.data.error)
                            break;
                    }
                },
            };
            console.log("Initializing Stripe ACH component")
            try {
                component = await achManager.provide(achManagerProps);
                console.log("Starting Stripe ACH component");
                component?.start();
            } catch (error) {
                console.log("Failed to init Stripe ACH component: " + error);
            }
        })()
    }, []);

    const onSubmit = async () => {
        try {
            await component.submit();
        } catch (err) {
            console.error(err);
        }
    };

    const onSetFirstName = async (value: string) => {
        console.log("Setting first name");
        setFirstName(value);
        await component.onSetFirstName(value);
    };

    const onSetLastName = async (value: string) => {
        console.log("Setting last name");
        setLastName(value);
        await component.onSetLastName(value);
    };

    const onSetEmailAddress = async (value: string) => {
        console.log("Setting email address");
        setEmailAddress(value);
        await component.onSetEmailAddress(value);
    };

    return (
        <View
            style={{
                padding: 16,
                flex: 1,
                backgroundColor: 'white',
            }}>

            <Text style={{ fontSize: 18, fontWeight: 'bold', paddingBottom: 8 }}>Stripe ACH session</Text>

            <TextFieldWithError title='First name' value={firstName} error={firstNameError} onChangeText={onSetFirstName} />
            <TextFieldWithError title='Last name' value={lastName} error={lastNameError} onChangeText={onSetLastName} />
            <TextFieldWithError title='Email address' value={emailAddress} error={emailAddressError} onChangeText={onSetEmailAddress} />

            <View style={styles.button}>
                <Button
                    disabled={firstNameError != null || lastNameError != null || emailAddressError != null}
                    onPress={() => onSubmit()}
                    title="Submit"
                />
            </View>
        </View>
    );
};

const TextFieldWithError = ({ title, value, error, onChangeText }: { title: string, value: string, error: string | null, onChangeText: (value: string) => void }) => {
    return (
        <View>
            <TextField
                title={title}
                textInputStyle={{
                    backgroundColor: '#f5f5f5',
                    borderColor: '#f5f5f5',
                    paddingHorizontal: 10,
                }}
                style={{
                    marginTop: 20,
                    borderRadius: 5,
                    marginHorizontal: 5,
                }}
                placeholder={title}
                value={value}
                onChangeText={onChangeText}
            />
            {error ? <Text style={{color: 'red', marginTop: 4, marginHorizontal: 10 }}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingTop: 16,
    },
});

export default HeadlessCheckoutStripeAchScreen;