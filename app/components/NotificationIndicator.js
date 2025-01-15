import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export default function NotificationIndicator({ count, offset }) {
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
    outputRange: ["#ff8480", "#FF0800"],
  })

  return (
    <Animated.View style={[styles.container, { backgroundColor, right: offset }]}>
      <Text style={styles.text}>{count}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1,
    top: -5,
    right: -5,
    height: 23,
    paddingHorizontal: 5,
    minWidth: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'nunito-bold',
  },
});
