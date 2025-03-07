import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { getLocallyStoredVariable, getUserIdFromLocalStorage } from "../utils/localStorage"
import PersonRow from "./components/PersonRow"
import Avatar from "../components/Avatar"
import { hapticImpactSoft, hapticSelect } from "../utils/haptics"
import FadeInView from "../components/FadeInView"
import { useTheme } from "../hooks/ThemeProvider"
import { useModal } from "../hooks/UniversalModalProvider"
import GroupSelection from "./components/GroupSelection"
import GroupRow from "./components/GroupRow"
import SearchBar from "./components/SearchBar"
import { dateIsToday } from "../utils/authenticate"
import NotificationIndicator from "../components/NotificationIndicator"
import { getColorLight, getPrimaryColor } from "../utils/getColorVariety"
import HugeIcon from "../components/HugeIcon"

export default function FriendsPage({ navigation }) {
  const { visible, setVisible, setModal, setTitle, closeBottomSheet } = useModal()
  const { theme, currentTheme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [userId, setUserId] = useState(null)
  const [color, setColor] = useState(null)
  const [query, setQuery] = useState('')
  const [initialQueriesFinished, setInitialQueriesFinished] = useState(false)

  const [requests, setRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])

  const [display, setDisplay] = useState([])
  const [filteredDisplay, setFilteredDisplay] = useState([])
  const [newImpressions, setNewImpressions] = useState([])

  const [avatar, setAvatar] = useState(null)
  const [selectingGroup, setSelectingGroup] = useState(false)
  const [recipientAvatar, setRecipientAvatar] = useState(null)
  const [selectedRecipient, setSelectedRecipient] = useState({
    recipient_id: null,
    recipient: 'all friends',
  })

  useEffect(() => {
    if (visible) {
      closeBottomSheet()
    }

  }, [selectedRecipient])

  const init = async () => {
    const friends = JSON.parse(await getLocallyStoredVariable('user_friends')).filter(friend => friend.status === 'accepted')
    setFriends(friends)

    const userId = await getUserIdFromLocalStorage()
    setUserId(userId)

    const result = JSON.parse(await getLocallyStoredVariable('user_groups')).map(group => {
      const isGroupAccessible = group.members.find(member => member.id === userId).status
      return { ...group, status: isGroupAccessible }
    })
    setGroups(result)
    const display = [...friends, ...result]
    const sortedDisplay = display.sort(
      (a, b) => new Date(b.last_impression) - new Date(a.last_impression)
    )
    setDisplay(sortedDisplay)
    setFilteredDisplay(sortedDisplay)
    setInitialQueriesFinished(true)

    const daily = JSON.parse(await getLocallyStoredVariable('daily_impressions'))
    const assigned = sortedDisplay.map(item => {
      if (item.group_id) {
        const groupImpressions = daily.filter(impression => parseInt(item.group_id) === impression.group_id)
        return {
          group_id: item.group_id,
          user_id: null,
          count: groupImpressions.length,
          items: groupImpressions
        }
      } else {
        const userImpressions = daily.filter(impression => impression.user_id === item.id && impression.group_id === null)
        return {
          group_id: null,
          user_id: item.id,
          count: userImpressions.length,
          items: userImpressions
        }
      }
    })
    setNewImpressions(assigned)

    const user = JSON.parse(await getLocallyStoredVariable('user_information'))
    const userAvatar = user.avatar_path
    setAvatar(userAvatar)
    setRecipientAvatar(userAvatar)

    const requests = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    setRequests(requests)

    const color = await getPrimaryColor()
    setColor(color)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  useEffect(() => { handleFilter() }, [query, display])
  const handleFilter = () => {
    setFilteredDisplay(display.filter(item => {
      if (item.group_id) {
        return item.group_name.toLowerCase().includes(query.toLowerCase())
      } else {
        const name = item.fname + ' ' + item.lname
        return name.toLowerCase().includes(query.toLowerCase())
      }
    }))
  }

  return (
    <View style={styles.container}>
      <View style={styles.staticBar}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            query={query}
            setQuery={setQuery}
            customStyling={{ paddingRight: 0 }}
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.addButton} onPress={() => {
            hapticSelect()
            navigation.navigate('CreateGroup')
          }}>
            {/* <Icon name='circle-plus' size={20} color="gray" /> */}
            <HugeIcon icon='add-square' size={25} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.addButton} onPress={() => {
            hapticSelect()
            navigation.navigate('AddFriend')
          }}>
            {/* <Icon name='user-plus' size={20} color="gray" /> */}
            <HugeIcon icon='add-user' size={25} color="gray" />
            {requests.length > 0 && (
              <NotificationIndicator
                count={requests.length}
                offset={-5}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        {initialQueriesFinished && (
          <View style={styles.contentContainer}>
            {display.length === 0 && (
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>add your friends to study the scriptures together!</Text>
              </View>
            )}

            {display.length > 0 && filteredDisplay.length === 0 && (
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>you don't have any friends or groups by the name</Text>
                <Text style={[styles.disclaimerText, styles.disclaimed]}>{query}</Text>
              </View>
            )}

            {(display.length === 0 || filteredDisplay.length) === 0 && (
              <TouchableOpacity 
                style={[styles.friendButton, { backgroundColor: color }]}
                activeOpacity={0.7}
                onPress={() => {
                  hapticSelect()
                  navigation.navigate('AddFriend', { initialQuery: query })
                }}
              >
                <Text style={styles.friendButtonText}>look for friend</Text>
              </TouchableOpacity>
            )}

            {filteredDisplay.map((item, index) => {
              const type = item.group_id ? 'group' : 'person'
              const id = item.group_id ? item.group_id : item.id
              let count = 0
              if (newImpressions.length !== 0) {
                count = newImpressions.find(impression => (type === 'group' && impression.group_id === id) || (type === 'person' && impression.user_id === id)).count
              }
              
              return (
                <FadeInView
                  style={styles.itemRow}
                  key={`item-${index}`}
                >
                  {
                    (item.group_id === undefined || item.group_id === null) ? (
                      <PersonRow
                        person={item}
                        invitationStatus='accepted'
                        onPress={() => {
                          hapticSelect()
                          navigation.navigate('PersonChat', { person: item })
                        }}
                        key={`friend-${index}`}
                      />
                    ) : (
                      <GroupRow
                        group={item}
                        navigation={navigation} 
                      />
                    )
                  }
                  <TouchableOpacity
                    style={styles.actionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      hapticSelect()
                      if (type === 'group') {
                        navigation.navigate('Group', { group: item })
                      } else {
                        // navigation.navigate('Person', { person: item })
                        const content = newImpressions.find(impression => impression.user_id === id).items.map(item => item.activity_id)
                        navigation.navigate('ViewImpressions', { activity_ids: content, title: item.fname + ' ' + item.lname })
                      }
                    }}
                  >
                    {count > 0 && (
                      <View style={[styles.unseenContainer, { backgroundColor: type === 'person' ? item.color : color }]}>
                        <Text style={styles.unseenText}>{ count }</Text>
                      </View>
                    )}
                    <View style={styles.rightIndicator}>
                      <Icon name="chevron-right" size={16} color={theme.gray} />
                    </View>

                  </TouchableOpacity>
                </FadeInView>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      
      borderBottomWidth: 1,
      borderBottomColor: theme.tertiaryBackground,
    },
    staticBar: {
      width: '100%',
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 15,

      borderBottomWidth: 1,
      borderBottomColor: theme.tertiaryBackground,
    },
    selectionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',

      backgroundColor: theme.secondaryBackground,
      borderRadius: 50,
      padding: 8
    },
    selectionAvatar: {
      width: 35, 
      height: 35, 
      borderRadius: 20
    },
    selectionText: {
      flex: 1,
      marginLeft: 10,
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.primaryText,
    },
    landingContainer: {
      width: '100%',
      height: 200,
    },
    contentContainer: {
      width: '100%',
      backgroundColor: theme.primaryBackground,
      paddingVertical: 15,

      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryButton,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 150,
      height: 150,
      borderWidth: 6,
      borderRadius: 100,
      marginVertical: 20,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: 100
    },
    placement: {
      width: 35,
      height: 35,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    place: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: '#fff'
    },
    searchBarContainer: {
      flex: 1,
      height: 50,
      paddingRight: 5,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.secondaryBackground,
      borderRadius: 20,
    },
    disclaimer: {
      marginTop: 100,
      marginHorizontal: '10%',
      justifySelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.secondaryBackground,
      borderRadius: 15,
    },
    disclaimerText: {
      fontFamily: 'nunito-bold',
      fontSize: 22,
      color: theme.actionText,
      textAlign: 'center',
    },
    disclaimed: {
      marginTop: 20,
      marginBottom: 10,
      borderRadius: 10,
      paddingVertical: 5,
      paddingHorizontal: 10,

      color: theme.secondaryText,
      backgroundColor: theme.tertiaryBackground
    },
    friendButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 100,
    },
    friendButtonText: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: '#fff'
    },

    unseenContainer: {
      width: 22,
      height: 22,
      borderRadius: 30,
      backgroundColor: theme.tertiaryText,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 6,
    },
    unseenText: {
      fontFamily: 'nunito-bold',
      fontSize: 12,
      color: '#fff'
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 20
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  })
}