import { useCallback, useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

import FA6Icon from '../components/FA6Icon';
import { classic } from '../utils/styling/colors';
import { hapticImpactSoft } from '../utils/haptics';
import getColorVariety, { getColorVarietyAsync } from "../utils/getColorVariety";
import { useFocusEffect } from "@react-navigation/native";
import FAIcon from "./FAIcon";

export default function BasicButton({ 
  title=null,
  onPress, 
  style: customStyling, 
  disabled = false,
  icon,
  iconType="FA",
  iconSize=26,
  color = classic.primaryColor,
}) {
  const [isPressed, setIsPressed] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(classic.primaryColor)
  const [primaryColorShadow, setPrimaryColorShadow] = useState(classic.primaryColorShadow)
  const [primaryColorDisabled, setPrimaryColorDisabled] = useState(classic.primaryColorDisabled)
  const [primaryColorShadowDisabled, setPrimaryColorShadowDisabled] = useState(classic.primaryColorShadowDisabled)
  
  const init = async () => {
    const colors = await getColorVarietyAsync() 
    setColors(colors)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

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
      onPressIn={() => {
        setIsPressed(true)
      }}
      onPressOut={() => {
        setIsPressed(false)
      }}
      style={[
        styles.buttonContainer,
        customStyling,
        { backgroundColor: disabled ? primaryColorDisabled : primaryColor },
        { shadowColor: disabled ? primaryColorShadowDisabled : primaryColorShadow },
        isPressed ? styles.pressed : styles.notPressed,
      ]}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text 
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.buttonText}
      >
        {icon && iconType === "FA" ? (
          <FAIcon name={icon} size={iconSize} color="#fff" style={title !== null && { marginRight: 10 }} />
        ) : (
          <FA6Icon name={icon} size={iconSize} color="#fff" style={title !== null && { marginRight: 10 }} />
        )}
        { icon && (title !== null && ' ') }
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
    shadowOpacity: 1, // Keep the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
  },
  notPressed: {
    shadowOffset: { width: 0, height: 5 }, // Position the shadow directly at the bottom
    elevation: 5,
  },
  pressed: {
    shadowOffset: { width: 0, height: 0 }, // Adjust the shadow position when pressed
    marginTop: 5,
    marginBottom: -5,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'nunito-bold',
  },
});
