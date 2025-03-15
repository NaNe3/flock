// import { useEffect, useState } from "react"
// import { useTheme } from "../hooks/ThemeProvider"
import { useRef } from "react"
import { Animated, StyleSheet, TouchableOpacity } from "react-native"

export default function TouchableShrink({ onPress, style, children }) {
  // const { theme } = useTheme()
  // const [styles, setStyles] = useState(style(theme))
  // useEffect(() => { setStyles(style(theme)) }, [theme])

  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true
    }).start()
  }

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true
    }).start()
  }

  return (
    <TouchableOpacity
      activeOpacity={1} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

// function style(theme) {
//   return StyleSheet.create({

//   })
// }