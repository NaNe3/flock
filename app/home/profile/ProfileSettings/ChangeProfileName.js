import { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"

import SimpleHeader from "../../../components/SimpleHeader"
import BasicButton from "../../../components/BasicButton"
import BasicTextInput from "../../../components/BasicTextInput"

import { hapticSelect } from "../../../utils/haptics"
import { gen } from "../../../utils/styling/colors"
import { updateUserNameById } from "../../../utils/db-users"
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../../../utils/localStorage"
import { ScrollView } from "react-native-gesture-handler"

export default function ChangeProfileName({ navigation }) {
  const [buttonMessage, setButtonMessage] = useState("update")
  const [disabled, setDisabled] = useState(true)
  const [formerName, setFormerName] = useState("")
  const [newName, setNewName] = useState("")

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(await getLocallyStoredVariable('user_information'))
      const name = `${user.fname} ${user.lname}`
      setFormerName(name)
      setNewName(name)
    }
    init()
  }, [])

  useEffect(() => {
    if (newName !== undefined) {
      setDisabled(newName.length === 0 || newName === formerName)
    }
  }, [newName])

  const updateProfileName = async () => {
    setDisabled(true)
    setButtonMessage("updating...")
    const userId = await getUserIdFromLocalStorage()
    const { data, error } = await updateUserNameById(userId, newName)

    if (error === null) {
      const user = JSON.parse(await getLocallyStoredVariable('user_information'))
      const newUser = { ...user, full_name: data.full_name, fname: data.fname, lname: data.lname }

      await setLocallyStoredVariable('user_information', JSON.stringify(newUser))

      navigation.goBack()
    } else {
      console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Change name"
        onPress={() => {
          hapticSelect()
          navigation.goBack()
        }}
      />
      <ScrollView style={styles.contentContainer}>
        <BasicTextInput
          placeholder="new name" 
          keyboardType="default"
          value={newName}
          onChangeText={setNewName}
          style={{
            borderWidth: 0,
            fontSize: 30,
            textAlign: 'center',
          }}
          multiline
        />
        <View style={{ marginTop: 20 }}>
          <BasicButton
            title={buttonMessage}
            onPress={updateProfileName}
            disabled={disabled}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.secondaryBackground,
  },
  contentContainer: {
    flex: 1,
  },
  button: {
    alignSelf: 'center',
  }
})