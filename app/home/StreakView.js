import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { getPrimaryColor } from "../utils/getColorVariety";
import { getAttributeFromObjectInLocalStorage } from "../utils/localStorage";
import { hapticImpactHeavy } from "../utils/haptics";
import { useTheme } from "../hooks/ThemeProvider";

const { width, height } = Dimensions.get('window')

export default function StreakView({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [ color, setColor ] = useState(theme.secondaryBackground)
  const animatedValue = useRef(new Animated.Value(0)).current
  const streakScale = useRef(new Animated.Value(1)).current
  const instructionOpacity = useRef(new Animated.Value(0)).current
  const animation = useRef(null)

  const circleSize = useRef(new Animated.Value(0)).current
  const maxSize = 2000

  const [streakDisplayed, setStreakDisplayed] = useState(0)
  const [streakChanged, setStreakChanged] = useState(false)
  const [animationFinished, setAnimationFinished] = useState(false)

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setColor(color)

      const streak = await getAttributeFromObjectInLocalStorage('user_information', 'current_streak')
      setStreakDisplayed(streak-1)
    }

    init()
  }, [])

  useEffect(() => {
    animation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: -1,
          duration: 30,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 30,
          useNativeDriver: true,
        }),
      ])
    )
    setTimeout(() => {
      Animated.timing(streakScale, {
        toValue: 0.6,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setStreakDisplayed(prev => prev + 1)
        setStreakChanged(true)
        stopAnimation()
        startCircleAnimation()
        Animated.spring(streakScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start()
      })
    }, 1400)
    animation.current.start()

    return () => { animation.current.stop() }
  }, [animatedValue])

  useEffect(() => {
    if (!animationFinished) return

    Animated.timing(instructionOpacity, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [animationFinished])

  const stopAnimation = () => {
    if (animation.current) {
      animation.current.stop()
    }
  }

  const rumble = animatedValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  })

  const startCircleAnimation = () => {
    Animated.timing(circleSize, {
      toValue: maxSize,
      duration: 1200,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        setAnimationFinished(true)
      }, 1000)
    })
  }

  const circleTop = circleSize.interpolate({
    inputRange: [0, maxSize],
    outputRange: [height / 2, height / 2 - maxSize / 2],
  })
  const circleLeft = circleSize.interpolate({
    inputRange: [0, maxSize],
    outputRange: [width / 2, width / 2 - maxSize / 2],
  })

  return (
    <TouchableOpacity 
      activeOpacity={1}
      onPress={() => { 
        if (animationFinished) {
          hapticImpactHeavy()
          navigation.navigate('Landing') 
        }
      }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: color,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize.interpolate({
              inputRange: [0, maxSize],
              outputRange: [0, maxSize / 2],
            }),
            top: circleTop,
            left: circleLeft,
          },
        ]}
      />
      <Animated.Text style={[styles.streak, { color: streakChanged ? '#fff' : theme.secondaryText }, { transform: [{ translateX: rumble }, { scale: streakScale }] }]}>
        {streakDisplayed}
      </Animated.Text>
      <Animated.Text style={[styles.helperText, { color: streakChanged ? '#fff' : theme.secondaryText }]}>DAYS STUDIED</Animated.Text>
      <Animated.Text style={[styles.instructionText, { opacity: instructionOpacity }]}>tap to continue</Animated.Text>
    </TouchableOpacity>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center'
    },
    streak: {
      color: theme.secondaryText,
      fontSize: 150,
      fontFamily: 'nunito-bold',
      textAlign: 'center'
    },
    helperText: {
      color: theme.gray,
      fontSize: 24,
      fontFamily: 'nunito-bold',
      marginTop: -20
    },
    circle: {
      position: 'absolute',
    },

    instructionText: {
      position: 'absolute',
      bottom: 80,
      fontFamily: 'nunito-bold',
      fontSize: 24,
      color: "#fff",
    }
  })
}