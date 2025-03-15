import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../hooks/ThemeProvider";

export default function NotificationIndicator({ count, offset }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  
  const pulseAnim = useRef(new Animated.Value(0)).current
  const [primaryColor, setPrimaryColor] = useState(null)
  const [primaryColorLight, setPrimaryColorLight] = useState(null)

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [pulseAnim])

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ff8480", "#FF5F50"],
  })

  return (
    <Animated.View style={[styles.container, { backgroundColor, right: offset }]}>
      <Text 
        style={styles.text}
        numberOfLines={1}
        ellipsizeMode="clip"
      >{count}</Text>
    </Animated.View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 1,
      top: -5,
      right: -5,
      paddingHorizontal: 5,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 3,
      borderColor: theme.primaryBackground,
    },
    text: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'nunito-bold',
    },
  });
}