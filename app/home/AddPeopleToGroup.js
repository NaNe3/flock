import { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/FontAwesome'

import { gen } from "../utils/styling/colors"
import SimpleHeader from "../components/SimpleHeader"
import { getLocallyStoredVariable } from "../utils/localStorage"
import Avatar from "../components/Avatar"
import SearchBar from "./components/SearchBar"
import { hapticSelect } from "../utils/haptics"
import FadeInView from "../components/FadeInView"

export default function AddPeopleToGroup({ 
  navigation, 
  friendsAdded, 
  setFriendsAdded,
  setScreenVisible=null,
  allowUninvite=true,
}) {
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [friends, setFriends] = useState([])
  const [peopleVisible, setPeopleVisible] = useState([])

  const getFriends = async () => {
    const friends = JSON.parse(await getLocallyStoredVariable('user_friends'))
    setFriends(friends)

    setPeopleVisible(friends)
  }

  useFocusEffect(
    useCallback(() => {
      setQuery('')
      getFriends()
    }, [])
  )

  useEffect(() => {
    if (query.length > 0) {
      const filteredFriends = friends.filter((friend) => {
        const name = `${friend.fname} ${friend.lname}`
        return name.toLowerCase().includes(query.toLowerCase())
      })
      setPeopleVisible(filteredFriends)
    } else {
      setPeopleVisible(friends)
    }
  }, [query])

  const getFriendInfo = (friend) => {
    const friendInfo = { 
      name: `${friend.fname ?? ''} ${friend.lname ?? ''}`,
      image: friend.avatar_path,
      added: friendsAdded.some((person) => person.id === friend.id),
      status: friend.status,
    }

    return friendInfo
  }

  return (
    <View style={styles.container}>
      {setScreenVisible && (
        <SimpleHeader 
          title='Back to group' 
          functionalNavigation={() => setScreenVisible('main')}
          rightIcon={
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                hapticSelect()
                navigation.navigate('AddFriend')
              }}
              style={styles.addFriendButton}
            >
              <Text style={{ color: gen.primaryText, fontFamily: 'nunito-bold', fontSize: 12 }}>
                <Icon name="plus" color={gen.primaryText} /> ADD FRIEND
              </Text>
            </TouchableOpacity>
          }
        />

      )}
      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder='search through friends list'
            query={query}
            setQuery={setQuery}
          />
        </View>

        <ScrollView style={styles.friendContainer}>
          {
            peopleVisible.length > 0
            ? peopleVisible.map((friend, index) => {
                const friendInfo = getFriendInfo(friend)
                return (
                  <FadeInView key={index} style={styles.friendContentContainer}>
                    <View style={[styles.avatarContainer, { borderColor: friendInfo.status === 'accepted'  ? friend.color : gen.primaryBorder }]}>
                      <Avatar
                        imagePath={friendInfo.image}
                        type="profile"
                        style={styles.friendImage}
                      />
                    </View>
                    <View style={styles.friendInfo}>
                      {/* <Image source={{ uri: friendInfo.image }} style={styles.friendImage} /> */}
                      <Text 
                        style={[styles.friendName, { color: friendInfo.status === 'accepted' ? gen.primaryText : gen.secondaryText }]}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                      >{friendInfo.name}</Text>
                      <Text style={[styles.friendStatus, { color: friendInfo.status === 'accepted' ? gen.secondaryText : gen.tertiaryText }]}>{friendInfo.status === 'accepted' ? 'friends' : 'friend request sent'}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.sendButton, { backgroundColor: friendInfo.added ? allowUninvite ? gen.red : gen.lightBlue : gen.primaryColor }]}
                      onPress={() => {
                        if (allowUninvite) {
                          if (!friendInfo.added) {
                            setFriendsAdded((prevState) => [...prevState, friend])
                          } else {
                            setFriendsAdded((prevState) => prevState.filter((person) => person.id !== friend.id))
                          }
                        }
                      }}
                      activeOpacity={allowUninvite ? 0.7 : 1}
                    >
                      <Text style={[{ fontFamily: 'nunito-bold', fontSize: 14, }, { color: "#FFF" }]}>
                        {allowUninvite && <Icon name={friendInfo.added ? "times" : "plus"} size={12} color="#FFF" />}{
                          friendInfo.added
                            ? allowUninvite
                              ? ' REMOVE'
                              : 'INVITED'
                            : ' ADD'
                        }
                      </Text>
                    </TouchableOpacity>
                  </FadeInView>
                )
              })
            : (
              <View style={styles.noResultsContainer}>
                <Text style={{ textAlign: 'center', fontFamily: 'nunito-bold', fontSize: 20, color: gen.secondaryText, marginTop: 30 }}>NO RESULTS</Text>
                <TouchableOpacity
                  style={styles.noResultsButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticSelect()
                    navigation.navigate('AddFriend')
                  }}
                >
                  <Icon name="search" size={24} style={{ marginRight: 10 }} color={gen.primaryText} /> 
                  <Text style={{ fontFamily: 'nunito-bold', fontSize: 24, color: gen.primaryText, textAlign: 'center' }}>
                    look for friend
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    width: '100%',
    height: 50, 
    flexDirection: 'row',
    marginTop: 10,
  },
  addFriendButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: gen.tertiaryBackground,
  },
  contentContainer:{
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
  },
  friendContainer: {
    flex: 1,
    paddingTop: 30,
    marginTop: 10,
  }, 
  friendContentContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  friendInfo: { 
    flexDirection: 'column', 
    justifyContent: 'center',
    flex: 1 
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    overflow: 'hidden',
    marginRight: 10,
    padding: 2,
    borderWidth: 3,
    borderColor: gen.primaryBorder,
  },
  friendImage: {
    flex: 1,
    borderRadius: 100,
  },
  friendName: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    flexShrink: 1,
    overflow: 'hidden',
    color: gen.primaryText
  },
  friendStatus: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    color: gen.tertiaryText,
  },
  sendButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: gen.primaryColor,
    borderRadius: 15,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsButton: {
    width: 250,
    padding: 20,
    borderRadius: 20,
    backgroundColor: gen.secondaryBackground,
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
})