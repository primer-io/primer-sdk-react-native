
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import TextField from '../components/TextField';
import { makeRandomString } from '../helpers/helpers';
import type { IClientSessionLineItem } from '../models/IClientSessionRequestBody';
import { styles } from '../styles';

export interface NewLineItemScreenProps {
    lineItem?: IClientSessionLineItem;
    onAddLineItem?: (lineItem: IClientSessionLineItem) => void;
    onEditLineItem?: (lineItem: IClientSessionLineItem) => void;
    onRemoveLineItem?: (lineItem: IClientSessionLineItem) => void;
}

const NewLineItemScreen = (props: any) => {
    const newLineItemScreenProps: NewLineItemScreenProps | undefined = props.route.params;
    //@ts-ignore
    const [isEditing, setIsEditing] = React.useState<boolean>(newLineItemScreenProps?.lineItem === undefined ? false : true);
    const [name, setName] = React.useState<string | undefined>(newLineItemScreenProps?.lineItem === undefined ? undefined : newLineItemScreenProps.lineItem.description);
    const [quantity, setQuantity] = React.useState<number | undefined>(newLineItemScreenProps?.lineItem === undefined ? undefined : newLineItemScreenProps.lineItem.quantity);
    const [unitPrice, setUnitPrice] = React.useState<number | undefined>(newLineItemScreenProps?.lineItem === undefined ? undefined : newLineItemScreenProps.lineItem.amount);

    return (
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 12, flex: 1 }}>
            <TextField
                title='Name'
                style={{ marginBottom: 10 }}
                value={name}
                onChangeText={(text) => {
                    setName(text);
                }}
            />
            <TextField
                title='Quantity'
                style={{ marginVertical: 10 }}
                value={quantity === undefined ? undefined : `${quantity}`}
                keyboardType={'numeric'}
                onChangeText={(text) => {
                    const tmpQuantity = Number(text);
                    if (!isNaN(tmpQuantity) && tmpQuantity > 0) {
                        setQuantity(tmpQuantity);
                    } else {
                        setQuantity(undefined);
                    }
                }}
            />
            <TextField
                title='Unit Price'
                style={{ marginVertical: 10 }}
                value={unitPrice === undefined ? undefined : `${unitPrice}`}
                keyboardType={'numeric'}
                onChangeText={(text) => {
                    const tmpUnitPrice = Number(text);
                    if (!isNaN(tmpUnitPrice) && tmpUnitPrice > 0) {
                        setUnitPrice(tmpUnitPrice);
                    } else {
                        setUnitPrice(undefined);
                    }
                }}
            />
            {/* <TextField
                title='Discount'
                style={{marginVertical: 10}}
            /> */}
            <TouchableOpacity
                style={{ ...styles.button, marginTop: 5, marginBottom: 10, backgroundColor: 'black' }}
                onPress={() => {
                    if (isEditing && newLineItemScreenProps?.lineItem) {
                        if (name && quantity && unitPrice) {
                            const newLineItem: IClientSessionLineItem = {
                                itemId: `item-id-${makeRandomString(8)}`,
                                description: name,
                                quantity: quantity,
                                amount: unitPrice
                            }
    
                            if (newLineItemScreenProps?.onEditLineItem) {
                                newLineItemScreenProps.onEditLineItem(newLineItem);
                            }
    
                            props.navigation.goBack();
                        }
                    } else {
                        if (name && quantity && unitPrice) {
                            const newLineItem: IClientSessionLineItem = {
                                itemId: `item-id-${makeRandomString(8)}`,
                                description: name,
                                quantity: quantity,
                                amount: unitPrice
                            }
    
                            if (newLineItemScreenProps?.onAddLineItem) {
                                newLineItemScreenProps.onAddLineItem(newLineItem);
                            }
    
                            props.navigation.goBack();
                        }
                    }
                }}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    {
                        isEditing ? "Edit Line Item" : "Add Line Item" 
                    }
                </Text>
            </TouchableOpacity>

            {
                newLineItemScreenProps?.lineItem === undefined ? null :
                    <TouchableOpacity
                        style={{ ...styles.button, marginBottom: 20, backgroundColor: 'red' }}
                        onPress={() => {
                            if (newLineItemScreenProps.onRemoveLineItem && newLineItemScreenProps.lineItem) {
                                newLineItemScreenProps.onRemoveLineItem(newLineItemScreenProps.lineItem);
                            }

                            props.navigation.goBack();
                        }}
                    >
                        <Text
                            style={{ ...styles.buttonText, color: 'white' }}
                        >
                            Remove Line Item
                        </Text>
                    </TouchableOpacity>
            }

        </View>
    );
};

export default NewLineItemScreen;
