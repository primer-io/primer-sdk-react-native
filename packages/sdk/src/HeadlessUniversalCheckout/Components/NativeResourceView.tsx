import { GestureResponderEvent, StyleSheet, TouchableOpacity, ViewStyle, NativeModules } from "react-native";
import { PrimerGooglePayButton } from "./PrimerGooglePayButton";
import { IPrimerGooglePayButtonOptions } from "./../models"
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

export const PrimerGooglePayButtonConstants = NativeModules.PrimerGooglePayButtonConstants?.getConstants();

const styles = StyleSheet.create({
    defaultContainer: {
        minHeight: 75
    }
});
