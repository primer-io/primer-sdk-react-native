import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from '../styles';

const Button = () => {
  return (
    <View style={{flex: 1}}>
      <TouchableOpacity
        style={{
          ...styles.button,
          marginHorizontal: 20,
          marginVertical: 5,
          backgroundColor: 'black',
        }}>
        <Text style={{...styles.buttonText, color: 'white'}}>Apple Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;
