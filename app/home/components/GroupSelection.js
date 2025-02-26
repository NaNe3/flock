import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { getLocallyStoredVariable, getUserIdFromLocalStorage } from "../../utils/localStorage";
import { getLocalUriForFile } from "../../utils/db-download";
import { hapticSelect } from "../../utils/haptics";

const height = Dimensions.get('window').height * 0.5

export default function GroupSelection({ 
  userAvatar, 
  setRecipientAvatar, 
  selectedRecipient,
  setSelectedRecipient,
  setSelectingGroup,
  theme,
}) {
  const insets = useSafeAreaInsets()
  const [userId, setUserId] = useState('')
  const [groups, setGroups] = useState([])
  const [friends, setFriends] = useState([])

  const [selected, setSelected] = useState(selectedRecipient.recipient)
  
  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
      getGroups(userId)
      getFriends(userId)
    }

    const getGroups = async (userId) => {
      const result = JSON.parse(await getLocallyStoredVariable('user_groups')).filter(group => {
        const isGroupAccessible = group.members.find(member => member.id === userId).status
        if (isGroupAccessible === 'accepted') return group
      })
      setGroups(result)
    }
    const getFriends = async (userId) => {
      const result = JSON.parse(await getLocallyStoredVariable('user_friends')).filter(friend => {
        const isFriendAccepted = friend.status === 'accepted'
        if (isFriendAccepted) return friend
      })
      setFriends(result)
    }

    init()
  }, [])

  const handleChange = (group_id, group_image, group_name) => {
    hapticSelect()
    setSelected(group_name)

    setRecipientAvatar(getLocalUriForFile(group_image))
    setSelectedRecipient({
      recipient_id: group_id,
      recipient: group_name,
    })

    setSelectingGroup(false)
  }

  return (
    <ScrollView 
      style={[styles.container, { minHeight: height, paddingBottom: 40+insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <GroupRow 
        group={{
          group_name: 'all friends',
          group_image: userAvatar,
          members: friends,
        }}
        selected={selected}
        onPress={() => handleChange(null, userAvatar, 'all friends')}
        theme={theme}
      />
      <View style={[styles.separator, { borderColor: theme === "dark" ? "#616161" : "#eee"}]} />
      {
        groups.length >= 0 && groups.map((group, index) => {
          return (
            <GroupRow 
              key={index}
              group={group}
              selected={selected}
              setSelected={setSelected}
              onPress={() => handleChange(group.group_id, group.group_image, group.group_name)}
              theme={theme}
            />
          )
        })
      }
    </ScrollView>
  )
}

const GroupRow = ({ group, selected, setSelected, onPress, theme }) => {
  const isSelected = selected === group.group_name
  const groupImage = getLocalUriForFile(group.group_image)

  return (
    <View style={[styles.selectableContainer, isSelected && { backgroundColor: theme === 'dark' ? '#616161' : '#eee' }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.selectable}
        onPress={onPress}
      >
        <Image source={{ uri: groupImage }} style={styles.selectableAvatar} />
        <View style={styles.selectableInfo}>
          <Text style={[styles.selectableText, { color: theme === "dark" ? '#eee' : '#616161' }]}>{group.group_name}</Text>
          <Text style={[styles.selectableSupportingText, { color: theme === "dark" ? '#999' : '#999'}]}>{group.members.length} people</Text>
        </View>
        {/* <Icon name={selected === group.group_name ? 'circle-check' : 'circle'} size={25} color="#eee" /> */}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    width: '100%',
    height: 'auto',
  },
  separator: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#616161',
  },
  selectableContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    
    justifyContent: 'center',
  },
  selectable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectableInfo: {
    marginLeft: 10,
    flex: 1
  },
  selectableText: {
    fontFamily: 'nunito-bold',
    fontSize: 20,
    color: '#eee',
  },
  selectableSupportingText: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    color: '#999',
  },
  selectableAvatar: {
    width: 45,
    height: 55,
    borderRadius: 5,
    backgroundColor: '#D3D3D3'
  }
})