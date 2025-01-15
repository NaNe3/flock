import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, ActivityIndicator, Linking, } from 'react-native'
import * as Contacts from 'expo-contacts'
import Icon from 'react-native-vector-icons/FontAwesome6'

import { createRelationship, getRelationships, removeRelationship } from '../utils/db-relationship'
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from '../utils/localStorage'
import { useEffect, useState } from 'react'
import { gen } from '../utils/styling/colors'

import SearchBar from './components/SearchBar'
import Avatar from '../components/Avatar'
import FadeInView from '../components/FadeInView'
import SimpleHeader from '../components/SimpleHeader'
import { searchForUsersByText } from '../utils/authenticate'
import { hapticSelect } from '../utils/haptics'
import StrongContentBox from '../components/StrongContentBox'
import FriendRequestContainer from './components/FriendRequestContainer'

import { useRealtime } from '../hooks/RealtimeProvider'
import { getUsersFromListOfPhoneNumbers } from '../utils/db-users'
import { timeAgoGeneral } from '../utils/timeDiff'
import PersonBottomSheet from '../components/PersonBottomSheet'
import { getColorLight } from '../utils/getColorVariety'

export default function AddFriend({ navigation }) {
  const { incoming, requested } = useRealtime()

  const [disabled, setDisabled] = useState(true)
  const [contacts, setContacts] = useState([])
  const [contactsThatAreUsers, setContactsThatAreUsers] = useState([])
  const [contactsEnabled, setContactsEnabled] = useState(false)
  const [userId, setUserId] = useState(null)
  const [query, setQuery] = useState('')

  const [friendIds, setFriendIds] = useState([])
  const [friends, setFriends] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [readyForFriends, setReadyForFriends] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])

  const [searchResults, setSearchResults] = useState([])
  const [contactsResults, setContactsResults] = useState([])
  const [resultsBuffering, setResultsBuffering] = useState([])

  const [personBottomSheetVisible, setPersonBottomSheetVisible] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const getUserFriends = async () => {
    const result = JSON.parse(await getLocallyStoredVariable('user_friends'))
    setFriends(result)
    setFriendIds(result.map(friend => friend.id))

    setOutgoing(result.filter(friend => friend.status === 'pending' && friend.invited_by === userId))
  }

  const init = async () => {
    const id = await getUserIdFromLocalStorage()
    setUserId(id)
    getFriendRequests()
  }

  const getFriendRequests = async () => {
    const requests = JSON.parse(await getLocallyStoredVariable('user_friend_requests'))
    setFriendRequests(requests)
    setReadyForFriends(true)
  }

  useEffect(() => {
    if (incoming !== null || requested !== null) {
      getUserFriends()
      getFriendRequests()
    }
  }, [incoming, requested])

  useEffect(() => {

    const getContactsPermission = async () => {
      const { status } = await Contacts.getPermissionsAsync()
      if (status === 'granted') {
        setContactsEnabled(true)
        const { data } = await Contacts.getContactsAsync()
        setContacts(data)

        // see if contacts results are users
        const peopleWithPhoneNumbers = data.filter(contact => {
          if (contact.phoneNumbers) return contact
        })
        const phoneNumbers = peopleWithPhoneNumbers.map(contact => contact.phoneNumbers[0].number.replace(/\D/g, ''))
        const users = await getUsersFromListOfPhoneNumbers(phoneNumbers)
        setContactsThatAreUsers(users)
      }
    }

    init()
    getContactsPermission()
  }, [])

  useEffect(() => {
    const getSearchResults = async () => {
      const result = await searchForUsersByText(userId, query)
      setSearchResults(result)
    }
    const getContactMatches = () => {
      const results = contacts.filter(contact => {
        const name = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`
        return name.toLowerCase().includes(query.toLowerCase())
      })
      setContactsResults(results)
    }

    if (query !== '') {
      getSearchResults()
      getContactMatches()
    } else {
      setSearchResults([])
      setContactsResults([])
    }
  }, [query])

  useEffect(() => {
    if (readyForFriends) getUserFriends()
  }, [friendRequests])

  // const changeTab = (tab) => {
  //   setCurrentTab(tab)
  // }

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
        await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
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
        await removeRelationship(userId, friendId)

        const newFriends = friends.filter(friend => friend.id !== friendId)
        await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
        setFriends(newFriends)
        setOutgoing(newFriends.filter(friend => friend.status === 'pending' && friend.invited_by === userId))
        setFriendIds(prev => prev.filter(id => id !== friendId))
        setResultsBuffering(prev => prev.filter(id => id !== friendId))
      } catch (error) {
        console.log("error removing relationship", error)
      }
    }
  }

  const requestContactsPermission = async () => {
    hapticSelect()
    const { status } = await Contacts.requestPermissionsAsync()
    if (status === 'granted') {
      setContactsEnabled(true)
      const { data } = await Contacts.getContactsAsync()
      setContacts(data)
    }
    if (status === 'denied') {
      Linking.openSettings()
    }
  }

  const sendPrescriptedMessage = (contact) => {
    const message = `Hello ${contact.firstName}, we should study on flock!`
    const phoneNumber = contact.phoneNumbers[0].digits
    const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
  
    Linking.openURL(url).catch(err => console.error('An error occurred', err))
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title='Manage friends'
        // rightIcon={
        //   <Icon name='inbox' size={20} color={gen.primaryText} />
        // }
      />
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar 
            placeholder='Search for friends...'
            query={query}
            setQuery={setQuery}
          />
        </View>
      </View>
      <ScrollView style={styles.contentContainer}>
        {query === '' && (
          <View style={{ flex: 1 }}>
            {/* ENABLE CONTACTS BLOCK */}
            {!contactsEnabled && (
              <TouchableOpacity 
                style={styles.contactOptionBox}
                activeOpacity={0.7}
                onPress={requestContactsPermission}
              >
                <Icon name='address-book' size={30} color={gen.secondaryText} />
                <Text 
                  style={styles.contactOptionBoxText}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >Enable contacts</Text>
                <Icon name='chevron-right' size={20} color={gen.secondaryText} />
              </TouchableOpacity>
            )}

            {/* FRIEND REQUESTS HERE */}
            {friendRequests.length > 0 && (
              <FriendRequestContainer requests={friendRequests} setRequests={setFriendRequests} />
            )}

            {friends.length > 0 && (
              <View style={styles.section}>
                {friends.filter(friend => friend.status === 'accepted').map((friend, index) => {
                  return (
                    <PersonRow 
                      person={friend}
                      onPress={() => {
                        handleRequest(friend.id)
                      }}
                      invitationStatus={friend.status}
                      key={index}
                      setPersonBottomSheetVisible={setPersonBottomSheetVisible}
                      setSelectedPerson={setSelectedPerson}
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
                    <PersonRow 
                      person={friend}
                      onPress={() => {
                        handleRequest(friend.id)
                      }}
                      buffering={resultsBuffering.includes(friend.id)}
                      invitationStatus={friend.status}
                      key={index}
                      setPersonBottomSheetVisible={setPersonBottomSheetVisible}
                      setSelectedPerson={setSelectedPerson}
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
                <PersonRow 
                  person={person}
                  onPress={() => {
                    if (!resultsBuffering.includes(person.id)) {
                      handleRequest(person.id)
                    }
                  }}
                  buffering={resultsBuffering.includes(person.id)}
                  invitationStatus={invitationStatus}
                  key={index}
                  setPersonBottomSheetVisible={setPersonBottomSheetVisible}
                  setSelectedPerson={setSelectedPerson}
                />
              )
            })}
          </View>
        }
        {contactsEnabled && contactsResults.length > 0 && (
          <View style={[styles.section, styles.contactSection]} >
            <Text style={styles.sectionHeaderText}>
              <Icon name='phone' size={16} />  Contacts
            </Text>
            {
              contactsResults
                .slice(0, contactsResults.length >= 3 ? 3 : contactsResults.length)
                .map((contact, index) => {
                  const person = {
                    id: contact.id,
                    fname: contact.firstName,
                    lname: contact.lastName,
                    avatar_path: contact.imageAvailable ? contact.image.uri : null,
                    type: 'contact',
                  }
                  // const contactNumber = contact.phoneNumbers[0].number.replace(/\D/g, '')
                  // const isUser = contactsThatAreUsers.find(user => contactNumber === user.phone_number) ?? []

                  // if (isUser.length > 0) return null
                  return (
                    <PersonRow 
                      person={person}
                      onPress={() => {
                        sendPrescriptedMessage(contact)
                      }}
                      invitationStatus={'invite'}
                      key={index}
                      setPersonBottomSheetVisible={setPersonBottomSheetVisible}
                      setSelectedPerson={setSelectedPerson}
                    />
                  )
                })
            }
          </View>
        )}
      </ScrollView>
      {personBottomSheetVisible && (
        <PersonBottomSheet
          person={selectedPerson}
          setVisibility={setPersonBottomSheetVisible}
          onMemberKicked={getUserFriends}
        />
      )}
    </View>
  )
}

const PersonRow = ({ 
  person, 
  onPress, 
  invitationStatus,
  buffering,
  ...props
}) => {
  let displayText = ''
  if (person.fname) displayText += person.fname[0]
  if (person.lname) displayText += person.lname[0]
  const notInvitable = invitationStatus === 'pending' || invitationStatus === 'accepted'
  const inviteIcon = invitationStatus === null ? 'plus' : invitationStatus === 'invite' ? 'paper-plane' : null
  const inviteText = invitationStatus === null ? 'ADD' : invitationStatus === 'invite' ? 'INVITE' : 'CANCEL'

  return (
    <FadeInView 
      time={100}
      style={[styles.personRow, person.type === 'contact' && { paddingHorizontal: 10 }]}
    >
      <View style={styles.personInformation}>
        <View style={[styles.avatarContainer, { borderColor: invitationStatus === 'accepted' ? person.color : gen.primaryBorder }]}>
          {
            person.type !== 'contact' 
              ? <Avatar 
                  imagePath={person.avatar_path}
                  type='profile'
                  style={styles.avatar}
                />
              : <View style={[styles.avatar, styles.contactAvatar]}>
                  <Text style={styles.avatarText}>{displayText}</Text>
                </View>
          }
        </View>
        <View style={styles.personNameBox}>
          <Text 
            style={styles.personName}
            ellipsizeMode='tail'
            numberOfLines={1}
          >{`${person.fname ?? ''} ${person.lname ?? ''}`}</Text>
          {person.type !== 'contact' && <Text style={styles.personLastStudied}>studied {timeAgoGeneral(person.last_studied)}</Text>}
        </View>
      </View>
      {
        invitationStatus !== "accepted" ? (
          <TouchableOpacity
            style={[
              styles.interactButton, // primaryColor
              { backgroundColor: person.color },
              notInvitable && person.type !== 'contact' && { backgroundColor: getColorLight(person.color) }, // primaryColorLight
              person.type === 'contact' && styles.contactBackground
            ]}
            activeOpacity={0.7}
            onPress={onPress}
          >
            {
              buffering 
                ? <ActivityIndicator size='small' color={notInvitable ? person.color : '#fff'} style={styles.buttonText} />
                : (
                  <Text style={[styles.buttonText, notInvitable && { color: person.color }]}>
                    <Icon name={!notInvitable && inviteIcon} />
                    {` ${inviteText}`}
                  </Text>
                )
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              props.setSelectedPerson(person)
              props.setPersonBottomSheetVisible(true)
            }}
            style={[styles.ellipsisContainer, { backgroundColor: getColorLight(person.color) }]}
          >
            <Icon name='ellipsis' size={20} color={person.color} />
          </TouchableOpacity>
        )
      }
    </FadeInView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: gen.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    padding: 20,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: gen.primaryBackground,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingVertical: 20,
    backgroundColor: gen.secondaryBackground,
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
    borderColor: gen.primaryBorder,
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
    backgroundColor: gen.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: gen.primaryText,
  },
  personNameBox: {
    flex: 1,
    marginLeft: 10,
  },
  personName: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.primaryText,
  },
  personLastStudied: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: gen.gray,
  },

  interactButton: {
    minWidth: 70,
    borderRadius: 30,
    // backgroundColor: gen.primaryColor,
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
  invited: { backgroundColor: gen.primaryColorLight },
  contactBackground: { backgroundColor: gen.primaryColor },

  contactOptionBox: {
    marginHorizontal: 20,
    marginVertical: 15,
    padding: 20,
    backgroundColor: gen.primaryBackground,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contactOptionBoxText: {
    flex: 1,
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.secondaryText,
    marginHorizontal: 15,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeaderText: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.secondaryText,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  contactSection: {
    marginHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: gen.primaryBackground,
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