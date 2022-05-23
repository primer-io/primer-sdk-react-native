import * as React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

const ResultScreen = (props: any) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={backgroundStyle}
    >
      <View
        style={{
          marginHorizontal: 20,
          marginVertical: 20,
          backgroundColor: 'lightgrey',
        }}
      >
        <Text>{JSON.stringify(props.route.params, null, 4)}</Text>
      </View>
    </ScrollView>
  );
};

export default ResultScreen;
