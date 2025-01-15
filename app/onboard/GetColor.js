import { use, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Animated } from "react-native";
import { hapticImpactSoft } from "../utils/haptics";
import EmptySpace from "../components/EmptySpace";
import SelectColor from "../components/SelectColor";

export default function GetColor({ onboardingData, setOnboardingData, setDisabled }) {
  const [color, setColor] = useState(null)


  useEffect(() => {
    if (onboardingData.color) {
      setDisabled(false)
      setColor(onboardingData.color)
    } else {
      setDisabled(true)
    }
  }, [])

  // const selectColor = (color) => {
  //   setOnboardingData({ ...onboardingData, color })
  //   setColor(color)
  //   setDisabled(false)

  //   // setColor(colors[index])
  //   // setOnboardingData({ ...onboardingData, color: colors[index] })
  //   // setDisabled(false)
  // }

  const handleColorSelect = (color) => {
    setColor(color)
    setOnboardingData({ ...onboardingData, color: color })
    setDisabled(false)
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.header}>choose a color 🎨</Text>
        <SelectColor 
          onColorSelect={color => handleColorSelect(color)} 
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    width: '100%',
    fontFamily: 'nunito-bold',
    fontSize: 24,
    // color: '#AAA',
    marginBottom: 40,
    textAlign: 'center',
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