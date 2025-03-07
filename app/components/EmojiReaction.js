import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native"
import { hapticSelect } from "../utils/haptics"
import { setEmojiHistory } from "../utils/localStorage"

export default function EmojiReaction({ emoji, size, setEmojis, onPress, ...props }) {
  const scaleValue = useRef(new Animated.Value(0.4)).current
  const isEmoji = typeof emoji === 'string'

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start()
  }, [])

  const handlePressIn = async () => {
    hapticSelect()
    Animated.spring(scaleValue, {
      toValue: 0.4,
      duration: 100,
      useNativeDriver: true,
    }).start()
    setTimeout(() => {
      Animated.spring(scaleValue, {
        toValue: 1, // Return to original size
        duration: 100,
        useNativeDriver: true,
      }).start()
    }, 100)
    if (isEmoji) { await setEmojiHistory(emoji) }
    onPress(emoji)
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePressIn}
      >
        <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  emoji: {
    marginHorizontal: 5,
    // marginVertical: 2,
    opacity: 1,
  },
})