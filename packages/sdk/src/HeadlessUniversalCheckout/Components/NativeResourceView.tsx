import { GestureResponderEvent, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { PrimerGooglePayButton } from "./PrimerGooglePayButton";
import React from "react";

interface NativeResourceViewProps {
    nativeViewName: string;
    style?: ViewStyle;
    onPress?: (event: GestureResponderEvent) => void;
}

export const NativeResourceView: React.FC<NativeResourceViewProps> = ({
    nativeViewName,
    style,
    onPress,
}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            {nativeViewName === 'PrimerGooglePayButton' ? (
                <PrimerGooglePayButton style={[styles.defaultContainer, style]} />
            ) : null}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    defaultContainer: {
        minHeight: 75
    }
});