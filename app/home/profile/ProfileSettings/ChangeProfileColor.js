import { useEffect, useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import SimpleHeader from "../../../components/SimpleHeader"
import SelectColor from "../../../components/SelectColor"
import BasicButton from "../../../components/BasicButton"

import { hapticSelect } from "../../../utils/haptics"
import { gen } from "../../../utils/styling/colors"
import { getAttributeFromObjectInLocalStorage, getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../../../utils/localStorage"
import { updateUserColorById } from "../../../utils/db-users"
import { LinearGradient } from "expo-linear-gradient"

export default function ChangeProfileColor({ navigation }) {
  const insets = useSafeAreaInsets()  

  const [formerColor, setFormerColor] = useState(null)
  const [buttonMessage, setButtonMessage] = useState('change color')
  const [userId, setUserId] = useState(null)
  const [newColor, setNewColor] = useState(null)
  const [disabled, setDisabled] = useState(true)

  useEffect(() => {
    const init = async () => {
      const color = await getAttributeFromObjectInLocalStorage('user_information', 'color')
      setFormerColor(color)
      setNewColor(color)

      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }
    init()
  }, [])

  useEffect(() => {
    if (newColor !== formerColor) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }, [newColor])

  const handleColorChange = async () => {
    setDisabled(true)
    setButtonMessage('changing')
    const { error } = await updateUserColorById(userId, newColor.color_id)

    if (error === null) {
      setDisabled(false)
      setButtonMessage('change color')

      const user = JSON.parse(await getLocallyStoredVariable('user_information'))
      const newUser = { ...user, color: newColor }
      await setLocallyStoredVariable('user_information', JSON.stringify(newUser))

      setFormerColor(newColor)
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Change profile color"
        onPress={() => {
          hapticSelect()
          navigation.goBack()
        }}
      />
      <ScrollView style={styles.contentContainer}>
        <SelectColor
          onColorSelect={color => {
            setNewColor(color)
          }}
        />
      </ScrollView>
      <BasicButton
        title={buttonMessage}
        onPress={handleColorChange}
        disabled={disabled}
        style={[styles.button, { bottom: insets.bottom + 10 }]}
        color={newColor?.color_hex}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
  contentContainer: {
    padding: 20
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
  }
})