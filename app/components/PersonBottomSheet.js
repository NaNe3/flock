import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'

import { gen } from "../utils/styling/colors";
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage";
import { createRelationship, removeRelationship } from "../utils/db-relationship";

import Avatar from "./Avatar";
import BasicBottomSheet from "../home/components/BasicBottomSheet";
import { removeGroupMember } from "../utils/db-image";
import { hapticSelect } from "../utils/haptics";

export default function PersonBottomSheet({ 
  person,
  setVisibility,
  isGroupLeader=false,
  ...props
}) {
  const [userId, setUserId] = useState(null)
  const [friends, setFriends] = useState([])
  const [state, setState] = useState(null)
  const [buffering, setBuffering] = useState(false)

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      const friends = JSON.parse(await getLocallyStoredVariable('user_friends'))
      setUserId(userId)
      setFriends(friends)
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
      await removeRelationship(userId, person.id)

      const newFriends = friends.filter(friend => friend.id !== person.id)
      await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
      setFriends(newFriends)
    } else {
      // add friend
      const { data } = await createRelationship(userId, person.id, 'pending')

      const newFriends = [...friends, {
        status: 'pending',
        ...data
      }]
      await setLocallyStoredVariable('user_friends', JSON.stringify(newFriends))
      setFriends(newFriends)
    }
    setBuffering(false)
  }

  const handleRemoveFromGroup = async() => {
    hapticSelect()
    const groupId = props.groupId
    // remove group_member row
    const { error } = await removeGroupMember(groupId, person.id)

    if (error === null) {
      // get group from local storage
      const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
      const group = groups.find(group => group.group_id === groupId)

      // remove person from group members
      const newMembers = group.members.filter(member => member.id !== person.id)
      const newGroup = { ...group, members: newMembers }
      const newGroups = groups.map(g => g.group_id === groupId ? newGroup : g)

      // update group in local storage
      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
      props.onMemberKicked()
      setVisibility(false)
    }
  }

  return (
    <BasicBottomSheet
      titleColor={gen.primaryText}
      setVisibility={setVisibility}
      height='auto'
      backgroundColor={gen.primaryBackground}
    >
      <View style={[styles.personInfoContainer, isGroupLeader && { borderBottomWidth: 2, borderBottomColor: gen.primaryBorder }]}>
        {/* <View style={styles.avatarContainer}>
          <Avatar 
            imagePath={person.avatar_path}
            type="profile"
            style={{ flex: 1, borderRadius: 8 }}
          />
        </View> */}
        <View style={styles.personTextContainer}>
          <Text style={{ color: gen.primaryText, fontSize: 20, fontFamily: 'nunito-bold' }}>{person.fname} {person.lname}</Text>
          <Text style={{ color: gen.secondaryText, fontSize: 14, fontFamily: 'nunito-bold', marginBottom: 25 }}>
            {
              state === 'friend' ? 'you are friends' : 
              state === 'pending' ? 'friend request sent' :
              'not friends'
            }
          </Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            style={[
              styles.actionRow, 
              (state === 'friend' || state === 'pending') && { backgroundColor: gen.red },
              state === null && { backgroundColor: gen.blue }
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
      </View>
      {isGroupLeader && (
        <View style={[styles.actionRowContainer, { marginLeft: 40, marginTop: 20}]}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={handleRemoveFromGroup}
          >
            <Text style={[styles.actionText, { color: gen.red }]}>
              <Icon name="sign-out" size={16} color={gen.red} /> Remove from Group
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BasicBottomSheet>
  )
}

const styles = StyleSheet.create({
  actionRowContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  personInfoContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  avatarContainer: {
    width: 100,
    height: 125,
    borderRadius: 15,
    overflow: 'hidden',
    padding: 4,
    borderWidth: 4,
    borderColor: gen.primaryBorder,
  },
  personTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  actionRow: {
    width: '100%',
    height: 45,
    borderRadius: 15,
    padding: 10,
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