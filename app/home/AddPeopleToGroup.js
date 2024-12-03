import { useEffect, useState } from "react"
import { ActivityIndicator, Image, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'

import BasicTextInput from "../components/BasicTextInput"
import { gen } from "../utils/styling/colors"
import { getRelationships } from "../utils/db-relationship"
import SimpleHeader from "../components/SimpleHeader"
import { getUserIdFromLocalStorage } from "../utils/localStorage"
import Avatar from "../components/Avatar"

export default function AddPeopleToGroup({ friendsAdded, setFriendsAdded, setScreenVisible }) {
  const [searchInput, setSearchInput] = useState('')
  const [friends, setFriends] = useState([])
  const [peopleVisible, setPeopleVisible] = useState([])

  useEffect(() => {
    const getFriends = async () => {
      const userId = await getUserIdFromLocalStorage()
      const { data, error } = await getRelationships(userId)

      if (!error) {
        setFriends(data)
        setPeopleVisible(data)

      } else {
        console.error("Error getting friends:", error)
      }
    }

    getFriends()
  }, [])

  const getFriendInfo = (friend) => {
    const friendInfo = { 
      name: null,
      initials: null,
      image: friend.avatar_path,
      added: friendsAdded.some((person) => person.id === friend.id)
    }

    if (friend.fname && friend.lname) {
      friendInfo.name = `${friend.fname} ${friend.lname}`
      friendInfo.initials = `${friend.fname[0]}${friend.lname[0]}`
    } else if (friend.fname) {
      friendInfo.name = friend.fname
      friendInfo.initials = `${friend.fname[0]}${friend.fname[1]}`
    }

    // if (peopleWithDownloadedImages.includes(friend.id) && downloadedImages.length === peopleWithDownloadedImages.length) {
    //   friendInfo.image = downloadedImages.find((image) => image.id === friend.id).uri
    // }

    return friendInfo
  }

  return (
    <View style={styles.container}>
      <SimpleHeader 
        title='Back to group' 
        functionalNavigation={() => setScreenVisible('main')}
      />
      <View style={styles.contentContainer}>
        <BasicTextInput 
          placeholder='Search'
          keyboardType='default'
          value={searchInput}
          onChangeText={(text) => setSearchInput(text)}
          style={{
            padding: 10,
            backgroundColor: gen.tertiaryBackground,
            borderColor: gen.tertiaryBackground,
            color: gen.primaryText,
            borderRadius: 50,
          }}
          focus={false}
        />

        <ScrollView style={styles.friendContainer}>
          {
            peopleVisible.length > 0
            ? peopleVisible.map((friend, index) => {
                const friendInfo = getFriendInfo(friend)
                return (
                  <View key={index} style={styles.friendContentContainer}>
                    <View style={styles.friendInfo}>
                      {/* <Image source={{ uri: friendInfo.image }} style={styles.friendImage} /> */}
                      <Avatar
                        imagePath={friendInfo.image}
                        type="profile"
                        style={styles.friendImage}
                      />
                      <Text 
                        style={styles.friendName}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                      >{friendInfo.name}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.sendButton, { backgroundColor: friendInfo.added ? gen.red : gen.primaryColor }]}
                      onPress={() => {
                        if (!friendInfo.added) {
                          setFriendsAdded((prevState) => [...prevState, friend])
                        } else {
                          setFriendsAdded((prevState) => prevState.filter((person) => person.id !== friend.id))
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[{ fontFamily: 'nunito-bold', fontSize: 14, }, { color: "#FFF" }]}>
                        <Icon name={friendInfo.added ? "times" : "plus"} size={12} color="#FFF" />{friendInfo.added ? ' REMOVE' : ' ADD'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              })
            : <ActivityIndicator size='large' color={gen.darkGray} />
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
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  friendImage: {
    width: 40, 
    height: 50, 
    borderRadius: 5,
    marginRight: 10,
  },
  placeholder: {
    width: 40,
    height: 50,
    borderRadius: 5,
    backgroundColor: gen.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendName: {
    fontSize: 18,
    fontFamily: 'nunito-regular',
    flexShrink: 1,
    overflow: 'hidden',
    color: gen.primaryText
  },
  sendButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: gen.primaryColor,
    borderRadius: 15,
  },
  friendImage: {
    width: 40,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
})