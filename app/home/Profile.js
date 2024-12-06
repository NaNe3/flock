import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { getLocallyStoredVariable } from "../utils/localStorage"
import { gen } from "../utils/styling/colors"
import Avatar from "../components/Avatar"
import SimpleHeader from "../components/SimpleHeader"
import { hapticSelect } from "../utils/haptics"

export default function Profile({ navigation }) {
  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('')

  useEffect(() => {
    const getProfileInformation = async () => {
      const userInformation = JSON.parse(await getLocallyStoredVariable('userInformation'))

      setUserName(`${userInformation.fname} ${userInformation.lname}`)
      setUserAvatar(userInformation.avatar_path)
    }

    getProfileInformation()
  }, [])

  return (
    <View style={styles.container}>
      <SimpleHeader 
        navigation={navigation} 
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              hapticSelect()
            }}
            activeOpacity={0.7}
          >
            <Icon size={20} name="gear" color={gen.primaryText} />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.profileContent}>
        <View style={styles.landingContainer}>
          <View style={styles.userProfileImageContainer}>
            {
              userAvatar && <Avatar 
                style={styles.userProfileImage}
                imagePath={userAvatar}
                type="profile"
              />
            }
          </View>
          <Text style={styles.userNameText}>{userName}</Text>
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
  landingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: gen.primaryBackground,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -600,
    paddingTop: 600,
  },
  profileContent: {
    flex: 1,
    backgroundColor: gen.secondaryBackground,
  },
  userProfileImageContainer: {
    width: 200,
    height: 200,
    padding: 6,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: gen.primaryBorder,
    overflow: 'hidden',
    marginBottom: 20,
  },
  userProfileImage: {
    flex: 1,
    borderRadius: 100,
  },
  userNameText: {
    color: gen.primaryText,
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'nunito-bold',
  },
})