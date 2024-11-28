import { useEffect, useRef } from "react"
import { Animated, View } from "react-native"

export default function FadeInView({ children, style, time = 300 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: time,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  return (
      <Animated.View
        style={[style, { opacity: fadeAnim }]}
      >
        {children}
      </Animated.View>
  )
}
