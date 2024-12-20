import { StyleSheet, View, ViewStyle } from "react-native";
import { PrimerGooglePayButton } from "./PrimerGooglePayButton";
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

const styles = StyleSheet.create({
    defaultContainer: {
        minHeight: 75
    }
});