import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { hapticImpactSoft } from "../utils/haptics";
import { Text } from "react-native";

export default function SelectColor({ onColorSelect }) {
  const colors = [
    { color_id: 1, color_hex: '#0ba3ff', color_name: 'blue' },
    { color_id: 2, color_hex: '#ffbf00', color_name: 'light orange' },
    { color_id: 3, color_hex: '#ff5964', color_name: 'red' },
    { color_id: 4, color_hex: '#1dd1a1', color_name: 'green' },
    { color_id: 5, color_hex: '#ffe74c', color_name: 'yellow' },
    { color_id: 6, color_hex: '#b95cf4', color_name: 'purple' },
    { color_id: 7, color_hex: '#ff9f1c', color_name: 'orange' },
    { color_id: 8, color_hex: '#48dbfb', color_name: 'light blue' },
    { color_id: 9, color_hex: '#f368e0', color_name: 'pink' },
    { color_id: 10, color_hex: '#1abc9c', color_name: 'turquoise' },
    { color_id: 11, color_hex: '#ff6b6b', color_name: 'salmon' },
    { color_id: 12, color_hex: '#00B7EB', color_name: 'cyan' },
    { color_id: 13, color_hex: '#ff7f50', color_name: 'coral' },
    { color_id: 14, color_hex: '#ff6348', color_name: 'tomato' },
    { color_id: 15, color_hex: '#ff4757', color_name: 'watermelon' },
    { color_id: 16, color_hex: '#2ed573', color_name: 'emerald' },
    { color_id: 17, color_hex: '#bb8fce', color_name: 'light purple' },
    { color_id: 18, color_hex: '#ffcc29', color_name: 'gold' },
    { color_id: 19, color_hex: '#DC143C', color_name: 'crimson' },
    { color_id: 20, color_hex: '#9EFD38', color_name: 'lime' },
    { color_id: 21, color_hex: '#C154C1', color_name: 'crayola' },
    { color_id: 22, color_hex: '#71A6D2', color_name: 'iceberg' },
    { color_id: 23, color_hex: '#C8A2C8', color_name: 'lilac' },
    { color_id: 24, color_hex: '#3EB489', color_name: 'mint' },
    { color_id: 25, color_hex: '#FFDB58', color_name: 'mustard' },
    { color_id: 26, color_hex: '#B5B35C', color_name: 'olive' },
    { color_id: 27, color_hex: '#FF7518', color_name: 'pumpkin' },
    { color_id: 28, color_hex: '#C2B280', color_name: 'sand' },
    { color_id: 29, color_hex: '#FA5053', color_name: 'strawberry' },
    { color_id: 30, color_hex: '#000', color_name: 'black' },
  ]

  const colorAnimations = useRef(colors.map(color => new Animated.Value(1))).current
  const handlePressIn = (index) => {
    hapticImpactSoft()
    Animated.spring(colorAnimations[index], {
      toValue: 1.3,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }
  const handlePressOut = (index) => {
    Animated.spring(colorAnimations[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start()

    onColorSelect(colors[index])
    // setColor(colors[index])
    // setOnboardingData({ ...onboardingData, color: colors[index] })
    // setDisabled(false)
  }

  return (
    <View style={styles.container}>
      {
        colors.map((color, index) => (
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => handlePressIn(index)}
            onPressOut={() => handlePressOut(index)}
            key={index}
          >
            <Animated.View
              style={[
                styles.colorBox, 
                { backgroundColor: color.color_hex },
                { transform: [{ scale: colorAnimations[index] }] }
              ]}
            >
              <Text style={styles.colorName}>{color.color_name}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 140,
  },
  colorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 200,
    margin: 5
  },
  colorName: {
    color: '#fff',
    fontFamily: 'nunito-bold',
    fontSize: 18,
  }
})