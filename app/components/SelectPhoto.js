import { useEffect, useRef, useState } from "react"
import { Animated, Image, StyleSheet, Text } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome5'

import { hapticSelect } from "../utils/haptics"
import { TouchableOpacity } from "react-native";
import { getColorVarietyAsync } from "../utils/getColorVariety";

export default function SelectPhoto({
  image,
  pickImage,
  containerStyle,
  imageStyle,
  contentType="text",
  color='#0096FF',
}) {
  const [primaryColor, setPrimaryColor] = useState(null)
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      const colors = await getColorVarietyAsync()
      setPrimaryColor(colors.primaryColor)
    }
    init()
  }, [])

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

  console.log("primaryColor: ", primaryColor, "color: ", color)
  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', primaryColor === null ? color : primaryColor],
  })

  return (
    <TouchableOpacity 
      onPress={() => {
        hapticSelect()
        pickImage()
      }}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        containerStyle,
        image && { borderColor: borderColor },
      ]}>
        {
          !image
            ? contentType === "text"
              ? <Text style={styles.instruction}>Upload a photo</Text>
              : <Icon name='plus' size={35} color='#AAA' />
            : <Image source={{ uri: image }} style={imageStyle} />
        }
      </Animated.View>
    </TouchableOpacity>
  ) 
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: '#616161',
  }
})