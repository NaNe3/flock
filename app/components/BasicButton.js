import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { gen } from '../utils/styling/colors';
import { hapticSuccess } from '../utils/haptics';

export default function BasicButton({ title, onPress, style: customStyling, disabled = false, icon }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled) {
          hapticSuccess();
          onPress();
        }
      }}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonContainer,
        customStyling,
        { backgroundColor: disabled ? gen.primaryColorDisabled : gen.primaryColor },
        { shadowColor: disabled ? gen.primaryColorDisabledShadow : gen.primaryColorShadow },
        isPressed && styles.pressed,
      ]}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text style={styles.buttonText}>
        {icon && (
          <Icon name={icon} size={26} color="#fff" style={{ marginRight: 10 }} />
        )}
        { icon && ' ' }
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: gen.primaryColorShadow,
    shadowOffset: { width: 0, height: 4 }, // Position the shadow directly at the bottom
    shadowOpacity: 1, // Make the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
  },
  pressed: {
    shadowOffset: { width: 0, height: 0 }, // Adjust the shadow position when pressed
    shadowOpacity: 1, // Keep the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
    transform: [{ translateY: 3 }]
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'nunito-bold',
  },
});
