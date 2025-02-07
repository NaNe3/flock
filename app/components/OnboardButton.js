import React, { useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { classic } from '../utils/styling/colors';
import { hapticImpactSoft } from '../utils/haptics';
import getColorVariety from "../utils/getColorVariety";

export default function OnboardButton({ 
  title,
  onPress, 
  style: customStyling, 
  disabled = false, 
  icon,
  color = classic.primaryColor,
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(classic.primaryColor)
  const [primaryColorShadow, setPrimaryColorShadow] = useState(classic.primaryColorShadow)
  const [primaryColorDisabled, setPrimaryColorDisabled] = useState(classic.primaryColorDisabled)
  const [primaryColorShadowDisabled, setPrimaryColorShadowDisabled] = useState(classic.primaryColorShadowDisabled)
  
  useEffect(() => {
    const colors = getColorVariety(color)
    setColors(colors)
  }, [color])

  const setColors = ({primaryColor, primaryColorDisabled, primaryColorShadow, primaryColorShadowDisabled}) => {
    setPrimaryColor(primaryColor)
    setPrimaryColorDisabled(primaryColorDisabled)
    setPrimaryColorShadow(primaryColorShadow)
    setPrimaryColorShadowDisabled(primaryColorShadowDisabled)
  }

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled) {
          hapticImpactSoft();
          onPress();
        }
      }}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonContainer,
        customStyling,
        { backgroundColor: disabled ? primaryColorDisabled : primaryColor },
        { shadowColor: disabled ? primaryColorShadowDisabled : primaryColorShadow },
        isPressed && styles.pressed,
      ]}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text 
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.buttonText}
      >
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
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 4 }, // Position the shadow directly at the bottom
    shadowOpacity: 1, // Make the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
    transform: [{ translateY: 0 }],
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
