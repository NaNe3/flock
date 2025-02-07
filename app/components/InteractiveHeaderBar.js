import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

import { hapticSelect } from "../utils/haptics";
import { getLocallyStoredVariable } from "../utils/localStorage";
import { useTheme } from "../hooks/ThemeProvider";

import Avatar from "./Avatar";
import { getColorLight } from "../utils/getColorVariety";

export default function InteractiveHeaderBar() {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [color, setColor] = useState(theme.primaryBorder)
  const [colorLight, setColorLight] = useState(theme.primaryBorder)
  const [userProfilePicture, setUserProfilePicture] = useState(null)
  const [streak, setStreak] = useState(0)

  const init = async () => {
    const user = JSON.parse(await getLocallyStoredVariable('user_information'))

    setUserProfilePicture(user.avatar_path)
    setColor(user.color.color_hex)
    setColorLight(getColorLight(user.color.color_hex))
    setStreak(user.current_streak)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  return (
    <View style={[styles.headerBar, { height: 60 + insets.top, paddingTop: insets.top }]}>
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
          {/* <TouchableOpacity 
            activeOpacity={0.7}
            style={{ width: 30 }}
            onPress={() => {
              hapticSelect()
              navigation.navigate('Notifications')
            }}
          >
            <Icon name="bell" size={25} color={theme.actionText} />
            <View style={[styles.newNotificationIndicator, { backgroundColor: 'test' === 'test' ? theme.red : theme.primaryBackground}]} />
          </TouchableOpacity> */}
          <View style={[styles.profileInfoContainer, { backgroundColor: colorLight }]}>
            <Text style={[styles.text, styles.streakText, { color: color }]}>
              <Icon name="burn" size={12} color={color} /> {streak}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.profilePictureContainer, { borderColor: color }]}
              onPress={() => {
                hapticSelect()
                navigation.navigate('ProfilePageRouter')
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
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    headerBar: {
      width: '100%',
      height: 110,
      backgroundColor: theme.primaryBackground,
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
      color: theme.darkGray,
    },
    premiumButton: {
      backgroundColor: theme.secondaryColor,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 20,
    },
    profilePictureContainer: {
      width: 33,
      height: 33,
      borderRadius: 30,
      borderWidth: 2,
      padding: 2,
      overflow: 'hidden',
      backgroundColor: theme.primaryBackground,
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
      borderColor: theme.primaryBackground,
    },
    profileInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      marginLeft: 10,
    },
    streakText: {
      marginLeft: 10,
      marginRight: 5,
      fontSize: 14,
      color: '#fff',
    },
    
  })
}