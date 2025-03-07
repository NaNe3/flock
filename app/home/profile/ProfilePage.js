import { useCallback, useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { ScrollView } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/FontAwesome6'

import FAIcon from '../../components/FAIcon'
import Avatar from "../../components/Avatar"
import SimpleHeader from "../../components/SimpleHeader"

import { getLocallyStoredVariable } from "../../utils/localStorage"
import { getColorLight } from "../../utils/getColorVariety"
import { getBookmarkCount, getImpressionCount } from "../../utils/db-users"
import { useTheme } from "../../hooks/ThemeProvider"
import { hapticSelect } from "../../utils/haptics"

export default function ProfilePage({ navigation, route }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [userName, setUserName] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [color, setColor] = useState({ color_hex: 'transparent' })
  const [lightColor, setLightColor] = useState('')

  const [streak, setStreak] = useState(0)
  const [impressionCount, setImpressionCount] = useState(null)
  const [bookmarkCount, setBookmarkCount] = useState(null)

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

  const icOpacity = useRef(new Animated.Value(0)).current
  const bcOpacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (impressionCount !== null) {
      Animated.timing(icOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    }
    if (bookmarkCount !== null) {
      Animated.timing(bcOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start()
    }
  }, [impressionCount, bookmarkCount])

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title={userName}
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.navigate('ProfileSettings')
            }}
            style={{ marginLeft: 5 }}
          >
            <Icon name="gear" size={22} color={theme.primaryText} />
          </TouchableOpacity>
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
            <Animated.Text style={[styles.infoText, { opacity: icOpacity }]}>
              <Icon name="paperclip" size={18} /> {impressionCount}
            </Animated.Text>
            <View style={[styles.infoBox, { backgroundColor: getColorLight(color.color_hex) }]}>
              <Text style={[styles.infoText, { fontSize: 28, color: color.color_hex }]}>
                <Icon name="fire" size={24} color={color.color_hex} /> {streak}
              </Text>
            </View>
            <Animated.Text style={[styles.infoText, { opacity: bcOpacity }]}>
              <FAIcon name="bookmark" size={18} /> {bookmarkCount}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
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
  })
}