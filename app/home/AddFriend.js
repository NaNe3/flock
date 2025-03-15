import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome6'

import { createRelationship, removeRelationship } from '../utils/db-relationship'
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from '../utils/localStorage'
import { useEffect, useState } from 'react'

import SearchBar from './components/SearchBar'
import { searchForUsersByText } from '../utils/authenticate'
import { hapticSelect } from '../utils/haptics'
import FriendRequestContainer from './components/FriendRequestContainer'

import { useRealtime } from '../hooks/RealtimeProvider'
import { useTheme } from '../hooks/ThemeProvider'
import SimpleHeader from '../components/SimpleHeader'
import InvitePersonRow from './components/InvitePersonRow'
import PersonRow from './components/PersonRow'
import { useHolos } from '../hooks/HolosProvider'

export default function AddFriend({ navigation }) {
  const { theme } = useTheme()
  const { friends, setFriends, friendRequests, setFriendRequests } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const { incoming, requested } = useRealtime()

  const [userId, setUserId] = useState(null)
  const [query, setQuery] = useState('')

  const [friendIds, setFriendIds] = useState(friends.map(friend => friend.id))
  // const [friends, setFriends] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [readyForFriends, setReadyForFriends] = useState(false)
  // const [friendRequests, setFriendRequests] = useState([])

  const [searchResults, setSearchResults] = useState([])
  const [resultsBuffering, setResultsBuffering] = useState([])

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    setUserId(userId)

    setOutgoing(friends.filter(friend => friend.status === 'pending' && friend.invited_by === userId))
  }

  const getFriendRequests = async () => {
    const requests = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    setFriendRequests(requests)
    setReadyForFriends(true)
  }

  useEffect(() => {
    if (incoming !== null || requested !== null) {
      getFriendRequests()
    }
  }, [incoming, requested])

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    const getSearchResults = async () => {
      const result = await searchForUsersByText(userId, query)
      setSearchResults(result)
    }
    if (query !== '' && userId !== null) {
      getSearchResults()
    } else {
      setSearchResults([])
    }
  }, [query])

  const handleRequest = async (friendId) => {
    hapticSelect()
    setResultsBuffering([...resultsBuffering, friendId])
    if (!friendIds.includes(friendId)) {
      // IF FRIEND IS BEING ADDED
      try {
        const { data } = await createRelationship(userId, friendId, 'pending')

        const newFriends = [...friends, {
          status: 'pending',
          ...data
        }]
        // await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        setFriends(newFriends)
        setOutgoing(prev => [...prev, data])
        setFriendIds(prev => [...prev, friendId])
        setResultsBuffering(prev => prev.filter(id => id !== friendId))
      } catch(error) {
        console.log("error creating relationship", error)
      }
    } else {
      // IF FRIEND IS BEING REMOVED
      try {
        const relationshipId = friends.find(friend => friend.id === friendId).relationship_id
        await removeRelationship(relationshipId)

        const newFriends = friends.filter(friend => friend.id !== friendId)
        // await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        setFriends(newFriends)
        setOutgoing(newFriends.filter(friend => friend.status === 'pending' && friend.invited_by === userId))
        setFriendIds(prev => prev.filter(id => id !== friendId))
        setResultsBuffering(prev => prev.filter(id => id !== friendId))
      } catch (error) {
        console.log("error removing relationship", error)
      }
    }
  }

  const personRowProps = {
    theme,
    styles,
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title='Add friends'
      />
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar 
            placeholder='Search by name'
            query={query}
            setQuery={setQuery}
          />
        </View>
      </View>
      <ScrollView style={styles.contentContainer}>
        {query === '' && (
          <View style={{ flex: 1 }}>
            {/* FRIEND REQUESTS HERE */}
            {friendRequests.length > 0 && (
              <FriendRequestContainer requests={friendRequests} setRequests={setFriendRequests} />
            )}

            {friends.length > 0 && (
              <View style={[styles.section, { marginHorizontal: 20 }]}>
                {friends.filter(friend => friend.status === 'accepted').map((friend, index) => {
                  return (
                    <PersonRow
                      person={friend}
                      key={`friend-${index}`}
                    />
                  )
                })}
              </View>
            )}
            {outgoing.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeaderText}>outgoing requests</Text>
                {outgoing.map((friend, index) => {
                  return (
                    <InvitePersonRow 
                      person={friend}
                      onPress={() => {
                        handleRequest(friend.id)
                      }}
                      buffering={resultsBuffering.includes(friend.id)}
                      invitationStatus={friend.status}
                      key={index}
                      {...personRowProps}
                    />
                  )
                })}
              </View>
            )}
          </View>
        )}
        {searchResults.length > 0 &&
          <View style={styles.section}>
            {searchResults.map((person, index) => {
              let friend = friends.find(friend => friend.id === person.id)
              let invitationStatus = friend ? friend.status : null

              return (
                <InvitePersonRow 
                  person={person}
                  onPress={() => {
                    if (!resultsBuffering.includes(person.id)) {
                      handleRequest(person.id)
                    }
                  }}
                  buffering={resultsBuffering.includes(person.id)}
                  invitationStatus={invitationStatus}
                  key={index}
                  {...personRowProps}
                />
              )
            })}
          </View>
        }
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.secondaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerContainer: {
      width: '100%',
      padding: 20,
      paddingTop: 5,
      paddingBottom: 10,
      backgroundColor: theme.primaryBackground,
    },
    contentContainer: {
      flex: 1,
      width: '100%',
      paddingVertical: 20,
      backgroundColor: theme.secondaryBackground,
    },
    searchBarContainer: {
      width: '100%',
      height: 50, 
      flexDirection: 'row',
      marginBottom: 10 
    },

    personRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 20,
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