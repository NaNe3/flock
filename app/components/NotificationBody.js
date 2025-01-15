import { useEffect, useRef, useState } from "react"
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from 'react-native-vector-icons/FontAwesome5'

import Avatar from "./Avatar"

import { gen } from "../utils/styling/colors"
import { getAttributeFromObjectInLocalStorage } from "../utils/localStorage"
import { getLocalUriForFile } from "../utils/db-download"
import { hapticImpactHeavy } from "../utils/haptics"
import { getColorLight } from "../utils/getColorVariety"

const width = Dimensions.get('window').width
const MAX_DRAG = 15
const TIME = 4000

export default function NotificationBody({
  image,
  title,
  body,
  color,
  proceed
}) {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(-200)).current
  const release = useRef(false)
  const lightColor = getColorLight(color)

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      timing: 1000,
      useNativeDriver: false,
    }).start()

    const clearNotification = setTimeout(() => {
      Animated.spring(translateY, {
        toValue: -200,
        timing: 1000,
        useNativeDriver: false,
      }).start(() => proceed())
    }, TIME)
    return () => clearTimeout(clearNotification)
  }, [])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          const damping = 1 - Math.exp(-gestureState.dy / MAX_DRAG)
          const newTranslateY = damping * MAX_DRAG
          translateY.setValue(newTranslateY)
          release.current = false
        } else if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy)
          if (gestureState.dy < -30) {
            release.current = true
          } else {
            release.current = false
          }
        }
      },
      onPanResponderRelease: () => {
        const destination = release.current === true ? -200 : 0
        if (release.current === true) hapticImpactHeavy()

        Animated.spring(translateY, {
          toValue: destination,
          timing: 1000,
          useNativeDriver: false,
        }).start(() => proceed())
      },
    })
  ).current

  const additional = {
    transform: [{ translateY }],
    top: insets.top + 10,
    backgroundColor: lightColor,
  }

  return (
    <Animated.View
      style={[
        styles.notification, 
        styles.shadow, 
        additional,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.avatarContainer, { borderColor: color }]}>
        <Avatar
          imagePath={image}
          type={image.includes('profile') ? 'profile' : 'group'}
          style={styles.avatar}
        />
      </View>
      <View style={styles.informationContainer}>
        <Text style={[styles.informationHeader, { color: color }]}>{title}</Text>
        <Text style={[styles.informationBody, { color: color }]}>{body}</Text>
      </View>
      <Icon name='angle-down' size={20} color={color} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  notification: {
    zIndex: 1000,
    position: 'absolute',
    width: width-40,
    marginLeft: 20,
    marginHorizontal: 20,
    padding: 14,

    backgroundColor: gen.primaryColorLight,
    borderRadius: 20,

    flexDirection: 'row',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: gen.primaryBorder, // Black shadow color
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.5, // Low opacity for a subtle shadow
    shadowRadius: 4, // Blur radius for the shadow
  },
  avatarContainer: {
    width: 50,
    height: 50,
    padding: 3,
    borderColor: gen.primaryColor,
    borderWidth: 3,
    borderRadius: 100,
    marginRight: 15
  },
  avatar: {
    flex: 1,
    borderRadius: 100,
  },
  informationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  informationHeader: {
    color: gen.primaryColor,
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'nunito-bold',
    marginBottom: -3
  },
  informationBody: {
    color: gen.primaryColor,
    // opacity: 0.8,
    fontSize: 14,
    fontFamily: 'nunito-regular',
  },
})