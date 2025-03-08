import { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hapticImpactHeavy } from "../utils/haptics";
import { useTheme } from "../hooks/ThemeProvider";
import EmptySpace from "../components/EmptySpace";

export default function ReactionPage({ navigation, route }) {
  const { activity_id } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const pan = useRef(new Animated.ValueXY()).current;
  const alreadySwiped = useRef(false)

  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const init = async () => {
    }

    init()
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
        if (gestureState.dy > 50) {
          if (!alreadySwiped.current) {
            alreadySwiped.current = true
            hapticImpactHeavy()
            navigation.goBack()
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) return
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current

  const marginTop = pan.y.interpolate({
    inputRange: [0, 300],
    outputRange: [insets.top + 30, insets.top + 130],
    extrapolate: 'clamp'
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.swipeContainer, { marginTop: marginTop }]}>

      </Animated.View>
      <View style={styles.dragContainer}>
        <View 
          {...panResponder.panHandlers}
          style={styles.actionContainer}
        >
          <View style={styles.actionBar} />
          <Text style={styles.headerText}>Reactions</Text>
        </View>
        <ScrollView 
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {hasLoaded ? (
            <>
            </>
          ) : (
            <>
            </>
          )}
          <EmptySpace size={400} />
        </ScrollView>
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    swipeContainer: { width: '100%', },
    dragContainer: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
    },
    actionContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 15,
    },
    actionBar: {
      width: 35,
      height: 6,
      backgroundColor: theme.actionText,
      borderRadius: 20
    },
    headerText: {
      fontFamily: 'nunito-bold',
      color: theme.actionText,
      fontSize: 16,
      marginVertical: 10
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    noCommentsDisclaimer: {
      color: theme.actionText,
      fontSize: 24,
      marginTop: 120,
      fontFamily: 'nunito-bold',
      textAlign: 'center'
    },
    footer: {
      width: '100%',
      paddingHorizontal: 20
    }
  })
}