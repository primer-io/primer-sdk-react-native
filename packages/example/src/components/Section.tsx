import * as React from 'react';
import {StyleProp, Text, ViewStyle} from 'react-native';
import {View} from 'react-native';

export interface SectionProps {
  style?: StyleProp<ViewStyle>;
}
import {styles} from '../styles';

export const Section: React.FC<{title: string; style: SectionProps}> = ({
  title,
  style,
}) => {
  return (
    <View style={{marginTop: 32, marginBottom: 12, ...style}}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: 'black',
          },
        ]}>
        {title}
      </Text>
    </View>
  );
};
