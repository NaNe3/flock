import { StyleSheet, TouchableOpacity, View, Text } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'
import SimpleHeader from "../../../components/SimpleHeader"

import { hapticSelect } from "../../../utils/haptics"
import { useEffect, useState } from "react"
import { getLocallyStoredVariable, setLocallyStoredVariable } from "../../../utils/localStorage"
import AddPeopleToGroup from "../../AddPeopleToGroup"
import { addGroupMembers, removeGroupMembers } from "../../../utils/db-image"
import { useTheme } from "../../../hooks/ThemeProvider"

export default function AllGroupMembers({ navigation, route }) {
  const { group_id, members, isGroupLeader } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [addingFriends, setAddingFriends] = useState(false)
  const [friendsAdded, setFriendsAdded] = useState(members)

  const modifyMembership = async () => {
    setAddingFriends(true)
    const friendsToAdd = friendsAdded.filter((friend) => members.find((member) => member.id === friend.id) === undefined)
    const friendsToRemove = members.filter((member) => friendsAdded.find((friend) => friend.id === member.id) === undefined)

    if (friendsToAdd.length > 0) {
      await addFriends(friendsToAdd)
    } 
    if (friendsToRemove.length > 0) {
      await removeFriends(friendsToRemove)
    }

    navigation.goBack()
    setAddingFriends(false)
  }

  const addFriends = async (friendsToAdd) => {
    const { data, error } = await addGroupMembers(group_id, friendsToAdd)

    // localStorage, add these friends to the group
    if (error === null) {
      const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
      const group = groups.find((group) => parseInt(group.group_id) === parseInt(group_id))
      const newMembers = [...group.members, ...data]
      const newGroup = {
        ...group,
        members: newMembers
      }
      const newGroups = groups.map((g) => {
        if (parseInt(g.group_id) === parseInt(group_id)) {
          return newGroup
        }
        return g
      })

      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
    } else {
      console.log(error)
    }
  }

  const removeFriends = async (friendsToRemove) => {
    const { error } = await removeGroupMembers(group_id, friendsToRemove)

    if (error === null) {
      const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
      const group = groups.find((group) => parseInt(group.group_id) === parseInt(group_id))
      const newMembers = group.members.filter((member) => friendsToRemove.find((friend) => friend.id === member.id) === undefined)
      const newGroup = {
        ...group,
        members: newMembers
      }
      const newGroups = groups.map((g) => {
        if (parseInt(g.group_id) === parseInt(group_id)) {
          return newGroup
        }
        return g
      })

      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
    }
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        title="Invite Friends"
        functionalNavigation={() => {
          modifyMembership()
        }}
        rightIcon={
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.navigate('AddFriend')
            }}
            style={styles.addFriendButton}
          >
            <Text style={{ color: theme.primaryText, fontFamily: 'nunito-bold', fontSize: 12 }}>
              <Icon name="plus" /> ADD FRIEND
            </Text>
          </TouchableOpacity>
        }
      />
      <AddPeopleToGroup
        navigation={navigation}
        friendsAdded={friendsAdded}
        setFriendsAdded={setFriendsAdded}
        allowUninvite={isGroupLeader}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    contentContainer: {
      flex: 1
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
    optionRowTextSecondary: {
      fontFamily: 'nunito-bold',
      fontSize: 14,
      marginTop: -3,
      color: theme.secondaryText
    },
    personContentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarImageContainer: {
      width: 40,
      height: 40,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.gray,
      padding: 2,
      overflow: 'hidden',
    },
    avatarImage: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    userNameLeft: {
      flex: 1,
      marginLeft: 10,
    },
    addFriendButton: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: theme.tertiaryBackground,
    },
  })
}