import * as React from 'react';
import type { StyleProp } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
    Text,
    TextInput,
    View,
} from 'react-native';

import { styles } from '../styles';

export interface TextFieldProps {
    keyboardType?: 'numeric' | 'default'
    onChangeText?: (text: string) => void;
    placeholder?: string;
    style?: StyleProp<ViewStyle>;
    title?: string;
    value?: string;
}

const TextField = (props: TextFieldProps) => {
    return (
        //@ts-ignore
        <View style={{...props.style}}>
            {
                props.title === undefined ? null :
                    <Text style={styles.textFieldTitle}>
                        {props.title}
                    </Text>
            }
            <TextInput
                style={{ ...styles.textInput, marginTop: 4 }}
                onChangeText={props.onChangeText}
                value={props.value}
                placeholder={props.placeholder}
                placeholderTextColor={'grey'}
                keyboardType={props.keyboardType}
            />
        </View>
    );
}

export default TextField;