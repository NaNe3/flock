import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../../hooks/ThemeProvider"
import FadeInView from "../../components/FadeInView"
import Avatar from "../../components/Avatar"
import { timeAgoGeneral } from "../../utils/timeDiff"
import { getColorLight } from "../../utils/getColorVariety"
import { hapticSelect } from "../../utils/haptics"
import { getLocallyStoredVariable } from "../../utils/localStorage"
import { useNavigation } from "@react-navigation/native"

// invitationStatus potential values:
// null = not invited
// pending = invited
// accepted = accepted

export default function PersonRow({ person, onPress=null }) {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [userId, setUserId] = useState(null)
  const [color, setColor] = useState(person.color)
  const [light, setLight] = useState(getColorLight(person.color))
  const [buffering, setBuffering] = useState(false)

  let displayText = ''
  if (person.fname) displayText += person.fname[0]
  if (person.lname) displayText += person.lname[0]

  useEffect(() => {
    const init = async () => {
      const userId = await getLocallyStoredVariable('user_id')
      setUserId(userId)
    }
    init()
  }, [])

  return (
    <FadeInView
      time={100}
      style={styles.personRow}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => { 
          hapticSelect() 
          if (onPress === null) {
            navigation.navigate('PersonProfile', { person: person })
          } else {
            onPress()
          }
        }}
        style={{ flex: 1}}
      >
        <View style={styles.personInformation}>
          <View
            style={[
              styles.avatarContainer,
              { borderColor: person.color },
            ]}
          >
            <Avatar
              imagePath={person.avatar_path}
              type="profile"
              style={styles.avatar}
            />
          </View>
          <View style={styles.personNameBox}>
            <Text
              style={styles.personName}
              ellipsizeMode="tail"
              numberOfLines={1}
            >{`${person.fname ?? ""} ${person.lname ?? ""}`}</Text>
            {person.type !== "contact" && (
              <Text style={styles.personLastStudied}>
                studied {timeAgoGeneral(person.last_studied)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </FadeInView>
  )
}

function style(theme) {
  return StyleSheet.create({
    personRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
    },
    personInformation: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      padding: 2,
      borderWidth: 3,
      borderColor: theme.primaryBorder,
      width: 50,
      height: 50,
      borderRadius: 50,
      overflow: 'hidden',
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    contactAvatar: {
      backgroundColor: theme.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.primaryText,
    },
    personNameBox: {
      flex: 1,
      marginLeft: 10,
    },
    personName: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.primaryText,
    },
    personLastStudied: {
      fontFamily: 'nunito-bold',
      fontSize: 14,
      color: theme.gray,
    },

    interactButton: {
      minWidth: 70,
      borderRadius: 30,
      // backgroundColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: 'nunito-bold',
      fontSize: 14,
      color: '#fff',
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    invited: { backgroundColor: theme.primaryColorLight },
    contactBackground: { backgroundColor: theme.primaryColor },

    contactOptionBox: {
      marginHorizontal: 20,
      marginVertical: 15,
      padding: 20,
      backgroundColor: theme.primaryBackground,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    contactOptionBoxText: {
      flex: 1,
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.secondaryText,
      marginHorizontal: 15,
    },
    section: {
      marginVertical: 20,
    },
    sectionHeaderText: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.secondaryText,
      paddingHorizontal: 20,
      marginBottom: 10,
      marginTop: 20,
      textAlign: 'center',
    },
    contactSection: {
      marginHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: theme.primaryBackground,
      borderRadius: 15,
    },
    ellipsisContainer: {
      width: 35,
      height: 28,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    }
  })
}