import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ScrollView } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/FontAwesome6'
import * as Updates from 'expo-updates'

import FAIcon from '../../components/FAIcon'
import Avatar from "../../components/Avatar"
import SimpleHeader from "../../components/SimpleHeader"
import StrongContentBox from "../../components/StrongContentBox"

import { getLocallyStoredVariable } from "../../utils/localStorage"
import { hapticImpactHeavy, hapticSelect } from "../../utils/haptics"
import { getColorLight } from "../../utils/getColorVariety"
import { getBookmarkCount, getImpressionCount } from "../../utils/db-users"
import { removeUserSession } from "../../utils/authenticate"
import { useTheme } from "../../hooks/ThemeProvider"

export default function ProfilePage({ navigation }) {
  const { theme, currentTheme, changeTheme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [color, setColor] = useState({ color_hex: 'transparent' })
  const [lightColor, setLightColor] = useState('')

  const [streak, setStreak] = useState(0)
  const [impressionCount, setImpressionCount] = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)

  const init = async () => {
    const userInformation = JSON.parse(await getLocallyStoredVariable('user_information'))

    setUserName(`${userInformation.fname} ${userInformation.lname}`)
    setUserAvatar(userInformation.avatar_path)
    setStreak(userInformation.current_streak)
    setColor(userInformation.color)

    const impressionCount = await getImpressionCount(userInformation.id)
    const bookmarkCount = await getBookmarkCount(userInformation.id)

    setImpressionCount(impressionCount)
    setBookmarkCount(bookmarkCount)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const handleSignOut = async () => {
    hapticImpactHeavy()
    await removeUserSession()
    await Updates.reloadAsync()
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Profile"
        rightIcon={
          // <TouchableOpacity>
          //   <Icon name="gear" size={24} color={theme.primaryText} />
          // </TouchableOpacity>
          <Switch
            trackColor={{false: '#616161', true: '#DDD'}}
            thumbColor={currentTheme === 'light' ? '#fff' : '#bbb'}
            ios_backgroundColor="#616161"
            onChange={() => {
              changeTheme(currentTheme === 'light' ? 'dark' : 'light')
            }}
            value={currentTheme === 'light'}
          />
        }
      />
      <ScrollView 
        style={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.landingContainer}>
          <View style={[styles.userProfileImageContainer, { borderColor: color.color_hex }]}>
            {
              userAvatar && <Avatar 
                style={styles.userProfileImage}
                imagePath={userAvatar}
                type="profile"
              />
            }
          </View>
          <Text style={styles.userNameText}>{userName}</Text>
          <View style={styles.profileInformationContainer}>
            <Text style={styles.infoText}>
              <Icon name="paperclip" size={18} /> {impressionCount}
            </Text>
            <View style={[styles.infoBox, { backgroundColor: getColorLight(color.color_hex) }]}>
              <Text style={[styles.infoText, { fontSize: 28, color: color.color_hex }]}>
                <Icon name="fire" size={24} color={color.color_hex} /> {streak}
              </Text>
            </View>
            <Text style={styles.infoText}>
              <FAIcon name="bookmark" size={18} /> {bookmarkCount}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <StrongContentBox 
            title={'ACCOUNT'}
            navigation={navigation}
          >
            <View style={styles.optionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  hapticSelect()
                  navigation.navigate('ChangeProfileName')
                }}
              >
                <Text style={styles.optionRowText}>change name</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  hapticSelect()
                  navigation.navigate('ChangeProfilePicture')
                }}
              >
                <Text style={styles.optionRowText}>change profile picture</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  hapticSelect()
                  navigation.navigate('ChangeProfileColor')
                }}
              >
                <Text style={[styles.optionRowText, { color: color.color_hex }]}>change color 🎨</Text>
              </TouchableOpacity>
            </View>
          </StrongContentBox>

          <TouchableOpacity
            onPress={handleSignOut}
          >
            <Text style={styles.danger}>
              <Icon name="delete-left" size={16} color={theme.red} /> Sign out of your account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    landingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.primaryBackground,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      marginTop: -600,
      paddingTop: 600,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.secondaryBackground
    },
    profileContent: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    userProfileImageContainer: {
      width: 180,
      height: 180,
      padding: 6,
      borderRadius: 100,
      borderWidth: 6,
      overflow: 'hidden',
      marginBottom: 20,
    },
    userProfileImage: {
      flex: 1,
      borderRadius: 100,
    },
    profileInformationContainer: {
      width: '100%',
      marginTop: 30,
      marginBottom: 10,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      // backgroundColor: 'red'
    },
    infoBox: {
      backgroundColor: theme.secondaryBackground,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 15
    },
    infoText: {
      minWidth: 80,
      textAlign: 'center',
      fontSize: 18,
      color: theme.darkishGray,
      fontFamily: 'nunito-bold',
    },
    userNameText: {
      color: theme.primaryText,
      fontSize: 36,
      fontWeight: 'bold',
      fontFamily: 'nunito-bold',
    },

    optionRow: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionRowText: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.primaryText
    },
    danger: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.red,
      marginVertical: 35,
      marginLeft: 10,
    }
  })
}