import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import { getPrimaryColor } from "../utils/getColorVariety";
import { useTheme } from "../hooks/ThemeProvider";

export default function LoadingScreen({
  progress,
  steps,
  setLoading,
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor)
  const [progressDisplayed] = useState(new Animated.Value(0))
  const [messageSelected, setMessageSelected] = useState(0)

  const messages = [
    'looking for the three nephites',
    'searching for the golden plates',
    'finding the liahona',
    'looking for the brass plates',
    'searching for the sword of laban',
    'finding the tree of life',
    'looking for the iron rod',
    'reading through Isaiah',
  ]

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setPrimaryColor(color)

      const randomMessage = Math.floor(Math.random() * messages.length)
      setMessageSelected(randomMessage)
    }

    init()
  }, [])

  useEffect(() => {
    Animated.spring(progressDisplayed, {
      toValue: (progress / steps) * 100,
      duration: 80,
      useNativeDriver: false,
    }).start()

    if (progress === steps) {
      const timeout = setTimeout(() => {
        setLoading(false)
        clearTimeout(timeout)
      }, 200)
    }
  }, [progress])

  const progressPercentage = progressDisplayed.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{messages[messageSelected]}</Text>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { backgroundColor: primaryColor }, { width: progressPercentage }]} />
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primaryBackground,
    },
    message: {
      marginHorizontal: 20,
      marginBottom: 50,
      fontFamily: 'nunito-bold',
      fontSize: 24,
      textAlign: 'center',
      color: theme.gray,
    },
    progressBar: {
      width: '75%',
      height: 12,
      backgroundColor: theme.lightestGray,
      borderRadius: 10,
      overflow: 'hidden',
    },
    progress: {
      height: '100%',
      backgroundColor: theme.primaryColor,
      borderRadius: 100
    },
  })
}