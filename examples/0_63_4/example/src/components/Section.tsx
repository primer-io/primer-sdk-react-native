import * as React from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';
import {
    View,
} from 'react-native';

export interface SectionProps {
    style?: StyleProp<ViewStyle>;
}
import { styles } from "../styles";

export const Section: React.FC<{title: string, style: SectionProps}> = ({ children, title, style }) => {

    const renderChildren = (children: React.ReactNode[]) => {
        return children.forEach((child, index) => {
            return child;
        })
    }

    return (
        <View style={{ marginTop: 32, marginBottom: 12, ...style }}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: "black"
                    },
                ]}
            >
                {title}
            </Text>
            {/* <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: "black"
                    },
                ]}
            >
                {children}
            </Text> */}
        </View>
    );
};