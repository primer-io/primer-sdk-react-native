import * as React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {Text, View} from 'react-native';

import {styles} from '../styles';

export interface HeadingProps {
  style?: StyleProp<ViewStyle & TextStyle>;
  title: string;
}

const Heading = (props: HeadingProps) => {
  return (
    <View style={props.style}>
      <Text style={styles.textFieldTitle}>{props.title}</Text>
    </View>
  );
};

export const Heading1 = (props: HeadingProps) => {
  return <Heading title={props.title} style={{...styles.sectionTitle}} />;
};

export const Heading2 = (props: HeadingProps) => {
  return <Heading title={props.title} style={{...styles.heading2}} />;
};

export const Heading3 = (props: HeadingProps) => {
  return <Heading title={props.title} style={{...styles.heading3}} />;
};
