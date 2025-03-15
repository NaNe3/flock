import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../hooks/ThemeProvider";
import { useHolos } from "../hooks/HolosProvider";
import SimpleHeader from "../components/SimpleHeader";
import Avatar from "../components/Avatar";
import { getUserIdFromLocalStorage } from "../utils/localStorage";
import { createRelationship, removeRelationship } from "../utils/db-relationship";
import { hapticSelect } from "../utils/haptics";

export default function PersonProfile({ navigation, route }) {
  const { person } = route.params
  const { theme } = useTheme()
  const { friends, setFriends } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [userId, setUserId] = useState(null)
  const [state, setState] = useState(null)
  const [buffering, setBuffering] = useState(false)
  const noLongerFriend = useRef(false)

  const [streak, setStreak] = useState(person.current_streak)
  const [impressionCount, setImpressionCount] = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)


  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }

    init()
  }, [])

  useEffect(() => {
    const friend = friends.find(friend => friend.id === person.id)
    if (friend) {
      if (friend.status === 'accepted') setState('friend')
      if (friend.status === 'pending') setState('pending')
    } else {
      setState(null)
    }
  }, [person, friends])

  const handlePersonAction = async() => {
    hapticSelect()
    if (buffering) return
    setBuffering(true)
    if (state === 'friend' || state === 'pending') {
      // cancel request
      await removeRelationship(person.relationship_id)

      const newFriends = friends.filter(friend => friend.id !== person.id)
      setFriends(newFriends)
      noLongerFriend.current = true
    } else {
      // add friend
      const { data } = await createRelationship(userId, person.id, 'pending')

      const newFriends = [...friends, {
        status: 'pending',
        ...data
      }]
      setFriends(newFriends)
    }
    setBuffering(false)
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        functionalNavigation={() => {
          if (noLongerFriend.current) {
            navigation.navigate('FriendsPage')
          } else {
            navigation.goBack()
          }
        }}
        title={`${person.fname} ${person.lname}`}
      />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.landingContainer}>
          <View style={[styles.userProfileImageContainer, { borderColor: person.color }]}>
            <Avatar 
              style={styles.userProfileImage}
              imagePath={person.avatar_path}
              type="profile"
            />
          </View>
          <Text style={styles.userNameText}>{person.fname} {person.lname}</Text>
          {/* <View style={styles.profileInformationContainer}>
            <Text style={styles.infoText}>
              <Icon name="paperclip" size={18} /> {impressionCount}
            </Text>
            <View style={[styles.infoBox, { backgroundColor: getColorLight(person.color) }]}>
              <Text style={[styles.infoText, { fontSize: 28, color: person.color }]}>
                <Icon name="fire" size={24} color={person.color} /> {streak}
              </Text>
            </View>
            <Text style={styles.infoText}>
              <FAIcon name="bookmark" size={18} /> {bookmarkCount}
            </Text>
          </View> */}

          <TouchableOpacity 
            activeOpacity={0.7}
            style={[
              styles.actionRow, 
              (state === 'friend' || state === 'pending') && { backgroundColor: theme.red },
              state === null && { backgroundColor: theme.blue }
            ]}
            onPress={handlePersonAction}
          >
            {buffering ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.actionText}>{
                state === 'friend' ? 'Remove Friend' : 
                state === 'pending' ? 'Cancel Request' : 
                'Add Friend'
              }</Text>
            )}
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
    contentContainer: {
      paddingVertical: 5,
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
    actionRow: {
      width: '70%',
      height: 45,
      borderRadius: 15,
      padding: 10,
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'nunito-bold',
    }
  })
}