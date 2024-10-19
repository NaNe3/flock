import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import { hapticSuccess } from '../utils/haptics'

export default function BasicButton({ title, onPress, style, disabled=false, icon }) {
  return (
    <TouchableOpacity 
      onPress={() => {
        if (!disabled) {
          hapticSuccess()
          onPress()
        }
      }}
      style={ 
        disabled 
          ? [styles.buttonContainer, style, { backgroundColor: "#ffecb2" } ]
          : [styles.buttonContainer, style, { backgroundColor: "#FFBF00" } ]
      }
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{icon && (
        <Icon name={icon} size={26} color="#fff" style={{ marginRight: 10 }} />
      )} {title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    backgroundColor: '#FFBF00',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  }
});