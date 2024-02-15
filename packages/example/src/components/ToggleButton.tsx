import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

const ToggleButton = ({ onPress, selected, text }: {
    onPress: () => void,
    selected: boolean,
    text: string
}) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, selected && styles.selectedButton]}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        flex: 1,
        padding: 10,
        backgroundColor: 'lightgray',
        borderRadius: 5,
        marginVertical: 10,
    },
    selectedButton: {
        backgroundColor: '#2C98F0',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ToggleButton;