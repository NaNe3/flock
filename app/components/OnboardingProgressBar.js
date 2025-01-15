import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome5'

import { gen } from "../utils/styling/colors";
import { hapticSelect } from "../utils/haptics";

export default function OnboardingProgressBar({ 
  setCurrentScreen, 
  currentScreen,
  totalScreens, 
}) {
  const insets = useSafeAreaInsets()
  const [progress, setProgress] = useState(new Animated.Value(0))
  const displayedProgress = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })

  useEffect(() => {
    const newProgress = calculateProgress()
    Animated.spring(progress, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false
    }).start()
  }, [currentScreen])

  const calculateProgress = () => {
    return ((currentScreen-1) / totalScreens) * 100
  }

  return (
    <View style={[styles.barContainer, { marginTop: insets.top }]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => {
          hapticSelect()
          setCurrentScreen(prev => {
            if (prev-1 > 1) {
              return prev - 1
            } else {
              return prev
            }
          })
        }}
      >
        <Icon name="arrow-left" size={25} color={gen.gray} />
      </TouchableOpacity>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { width: displayedProgress }]} />      
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  barContainer: {
    width: '100%',
    height: 70,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: gen.lightestGray,
    borderRadius: 5,
    marginLeft: 20
  },
  progress: {
    height: '100%', 
    backgroundColor: gen.gray, 
    borderRadius: 5 
  }
})