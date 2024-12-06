import { useEffect, useState } from "react"
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'
import * as ImagePicker from 'expo-image-picker'


import SelectPhoto from "../../../components/SelectPhoto"
import BasicButton from "../../../components/BasicButton"
import SimpleHeader from "../../../components/SimpleHeader"
import BasicTextInput from "../../../components/BasicTextInput"

import { gen } from "../../../utils/styling/colors"
import { hapticSelect } from "../../../utils/haptics"
import { updateGroupAvatar, updateGroupName } from "../../../utils/db-image"
import { getLocalUriForFile } from "../../../utils/db-download"

export default function EditGroupInfo({ navigation, route }) {
  const { group_id, group_name, group_avatar, group_plan, members } = route.params
  const avatarFormatted = getLocalUriForFile(group_avatar)
  const [image, setImage] = useState(avatarFormatted)
  const [groupName, setGroupName] = useState(group_name)
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true)

  useEffect(() => {
    if (groupName !== group_name || image !== avatarFormatted) {
      setSaveButtonDisabled(false)
    } else {
      setSaveButtonDisabled(true)
    }
  }, [image, groupName])


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSaveButtonPress = async () => {
    setSaveButtonDisabled(true)
    if (image !== avatarFormatted) {
      const { error } = await updateGroupAvatar({ groupId: group_id, newImage: image, oldImage: group_avatar })
    }
    if (groupName !== group_name) {
      const { error } = await updateGroupName({ groupId: group_id, groupName: groupName })
    }

    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <SimpleHeader 
        navigation={navigation} 
        title="Edit group"
      />
      <ScrollView style={styles.contentContainer}>
        <SelectPhoto
          image={image}
          pickImage={pickImage}
          containerStyle={styles.groupPhoto}
          imageStyle={{ width: '100%', height: '100%', borderRadius: 15 }} 
          contentType='icon'
        />

        <BasicTextInput
          placeholder={group_name}
          keyboardType="default"
          value={groupName}
          onChangeText={setGroupName}
          style={{
            borderWidth: 0,
            fontSize: 30,
            textAlign: 'center',
          }}
          multiline
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        {
          (groupName !== group_name || image !== avatarFormatted) && (
            <View style={styles.modifications}>
              {
                groupName !== group_name && <View style={styles.modification}>
                  <Text 
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.modificationText}
                  >changing group name</Text>
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      hapticSelect()
                      setGroupName(group_name)
                    }}
                  >
                    <Text style={styles.clearButtonText}>CLEAR</Text>
                  </TouchableOpacity>
                </View>
              }
              {
                image !== avatarFormatted && <View style={styles.modification}>
                  <Text 
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.modificationText}
                  >changing group avatar</Text>
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => {
                      hapticSelect()
                      setImage(group_avatar)
                    }}
                  >
                    <Text style={styles.clearButtonText}>CLEAR</Text>
                  </TouchableOpacity>
                </View>
              }
            </View>
          )
        }
        <BasicButton 
          title="save"
          disabled={saveButtonDisabled}
          onPress={handleSaveButtonPress}
          style={styles.saveButton}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 50,
  },
  groupPhoto: {
    width: 150,
    height: 200,
    backgroundColor: gen.primaryBackground,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderWidth: 5,
    borderRadius: 20,
    borderColor: gen.primaryBorder,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: gen.primaryBackground,
    flex: 1,
    width: '80%',
    alignSelf: 'center',
  },
  saveButton: {
    width: '100%',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: gen.primaryColorLight,
  },
  clearButtonText: {
    color: gen.primaryColor,
    fontFamily: 'nunito-bold',
    fontSize: 12,
  },
  modifications: {
    backgroundColor: gen.tertiaryBackground,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 35,
    marginBottom: -30,
  },
  modification: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 8,
  },
  modificationText: {
    flex: 1,
    color: gen.primaryText,
    fontFamily: 'nunito-bold',
    fontSize: 16
  },
})