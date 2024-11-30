import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getAttributeFromObjectInLocalStorage } from "../utils/localStorage";

import Avatar from "./Avatar";

const InteractiveHeaderBar = () => {
  const navigation = useNavigation()
  const [userProfilePicture, setUserProfilePicture] = useState(null)

  useEffect(() => {
    const getProfilePicture = async () => {
      const profilePicture = await getAttributeFromObjectInLocalStorage('userInformation', 'avatar_path')
      setUserProfilePicture(profilePicture)
    }

    getProfilePicture()
  }, [])

  return (
    <View style={styles.headerBar}>
      <View style={styles.headerContent}>

        <TouchableOpacity 
          style={styles.premiumButton}
          activeOpacity={0.7}
          onPress={() => {
            hapticSelect()
            navigation.navigate('PremiumOffer')
          }}
        >
          <Text style={[styles.text, { color: "#fff", fontSize: 14 }]}>
            <Icon name="bolt" size={12} color="#fff" /> PLUS
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={{ width: 30 }}
            onPress={() => {
              hapticSelect()
              navigation.navigate('Notifications')
            }}
          >
            <Icon name="bell" size={25} color={gen.actionText} />
            <View style={[styles.newNotificationIndicator, { backgroundColor: 'test' === 'test' ? gen.red : gen.primaryBackground}]} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.profilePictureContainer}
            onPress={() => {
              hapticSelect()
              navigation.navigate('Profile')
            }}
          >
          {userProfilePicture && (
            <Avatar 
              imagePath={userProfilePicture}
              type="profile"
              style={styles.profilePicture} 
            />
          )}
          </TouchableOpacity>
        </View>

      </View>
    </View>
  )
}

export default InteractiveHeaderBar

const styles = StyleSheet.create({
  headerBar: {
    width: '100%',
    height: 110,
    backgroundColor: gen.primaryBackground,
    paddingTop: 50,
  },
  headerContent: {
    display: "flex",
    height: 60,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: gen.darkGray,
  },
  premiumButton: {
    backgroundColor: gen.secondaryColor,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  profilePictureContainer: {
    width: 33,
    height: 33,
    borderRadius: 30,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: gen.gray2,
    padding: 2,
    overflow: 'hidden',
  },
  profilePicture: {
    width: 25,
    height: 25,
    borderRadius: 15,
  },
  newNotificationIndicator: {
    width: 12,
    height: 12,
    borderRadius: 8,
    position: 'absolute',
    right: 0,
    top: 0,
    borderWidth: 2,
    borderColor: gen.primaryBackground,
  },
})