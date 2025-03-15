import { useEffect, useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from '../../components/SimpleHeader'
import Avatar from '../../components/Avatar'

import { getLocalUriForFile } from '../../utils/db-download'
import { hapticSelect } from '../../utils/haptics'
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from '../../utils/localStorage'
import InviteRow from '../components/InviteRow'
import ChatView from '../components/ChatView'
import { updateLastMessageSeen } from '../../utils/db-message'
import { useTheme } from '../../hooks/ThemeProvider'
import { useHolos } from '../../hooks/HolosProvider'

export default function GroupChat({ navigation, route }) {
  const { group } = route.params
  const { group_id, group_name, group_image, group_plan, members, status } = group
  const { theme } = useTheme()
  const { messages: data, groups } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  
  const [userId, setUserId] = useState(null)

  const [groupName, setGroupName] = useState(group_name)
  const [groupAvatar, setGroupAvatar] = useState(getLocalUriForFile(group_image))
  const [groupPlan, setGroupPlan] = useState(group_plan)
  const [groupMembers, setGroupMembers] = useState(members)
  const [groupStatus, setGroupStatus] = useState(status)

  const [messages, setMessages] = useState(data[`group-${group_id}`])

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    setUserId(userId)

    const messages = data[`group-${group_id}`]
    if (messages) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage) {
        await updateLastMessageSeen({ user_id: userId, message_id: lastMessage.message_id, group_id })
      }
    }
  }

  const updateGroupDetailsInformation = async () => {
    const group = groups.find(group => group.group_id === group_id)

    setGroupName(group.group_name)
    setGroupPlan(group.group_plan)
    setGroupMembers(group.members)
    setGroupAvatar(group.group_image)
  }

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    setMessages(data[`group-${group_id}`])
  }, [data])

  useEffect(() => {
    updateGroupDetailsInformation()
  }, [groups])

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        component={
          <TouchableOpacity 
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.navigate('GroupDetailsRouter', {
                  group_name: groupName,
                  group_avatar: groupAvatar,
                  group_plan: groupPlan,
                  members: groupMembers,
                  ...route.params,
                }
              )
            }}
          >
            <View style={styles.groupPhotoContainer}>
              <Avatar 
                imagePath={groupAvatar}
                type="group"
                style={styles.groupPhoto}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.groupName} numberOfLines={1} ellipsizeMode='tail' >{groupName}</Text>
              <Text style={{ color: theme.gray, fontFamily: 'nunito-bold' }}>
                <Icon name="users" color={theme.gray }/> {groupMembers.length} MEMBERS
              </Text>
            </View>
          </TouchableOpacity>
        }
        verticalPadding={20}
      />
      {
        groupStatus === 'pending' && (
          <View style={styles.landingContainer}>
            <View style={styles.planLayoutContainer}>
              <InviteRow
                navigation={navigation}
                groups={groups}
                setGroupStatus={setGroupStatus} 
                userId={userId} 
                groupId={group_id} 
              />
            </View>
          </View>
        )
      }
      <ChatView
        group={group}
        messages={messages}
        setMessages={setMessages}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.secondaryBackground,
    },
    contentContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.secondaryBackground,
    },
    landingContainer: {
      width: '100%',
      backgroundColor: theme.primaryBackground,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      // paddingTop: 600,
      // marginTop: -600,
      // display: 'none'
    },
    groupPhotoContainer: {
      padding: 2,
      borderWidth: 3,
      borderColor: theme.primaryBorder,
      width: 50,
      height: 50,
      borderRadius: 50,
      overflow: 'hidden',
    },
    groupPhoto: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
      backgroundColor: theme.tertiaryBackground,
    },
    groupName: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    activityBar: {
      width: '100%',
      maxHeight: 100,
      paddingHorizontal: 20,
      paddingTop: 30,
      backgroundColor: '#fff',
    },
    memberPhoto: {
      width: 70,
      height: 70,
      padding: 3,
      borderWidth: 4,
      borderColor: theme.primaryBorder,
      borderRadius: 35,
      marginRight: 5
    },
    planLabel: {
      backgroundColor: theme.lightestGray,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
    },
    planLayoutContainer: {
      paddingHorizontal: 40,
      marginBottom: 20,
    },
    announcementContainer: {

    },
    disclaimerText: {
      fontFamily: 'nunito-bold', 
      fontSize: 24, 
      color: theme.heckaGray2, 
      textAlign: 'center', 
      marginTop: 100, 
      alignItems: 'center'
    }
  })
}