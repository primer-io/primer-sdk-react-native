import { StyleSheet, View, ViewStyle, NativeModules } from "react-native";
import { PrimerGooglePayButton } from "./PrimerGooglePayButton";
import { IPrimerGooglePayButtonOptions } from "./../models"
import React from "react";

export const NativeResourceView: React.FC<{ nativeViewName: string, style?: ViewStyle }> = ({ nativeViewName, style }) => {
    return (
        <View>
            {nativeViewName === "PrimerGooglePayButton" ? (
                <PrimerGooglePayButton style={[styles.defaultContainer, style]} />
            ) : null}
        </View>
    );
};

export const PrimerGooglePayButtonConstants = NativeModules.PrimerGooglePayButtonConstants?.getConstants();

const styles = StyleSheet.create({
    defaultContainer: {
        minHeight: 75
    }
});
