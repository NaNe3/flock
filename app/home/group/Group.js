import { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from '../../components/SimpleHeader'
import Avatar from '../../components/Avatar'

import { getLocalUriForFile } from '../../utils/db-download'
import { hapticSelect } from '../../utils/haptics'
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from '../../utils/localStorage'
import InviteRow from '../components/InviteRow'
import ChatView from '../components/ChatView'
import { getMessagesInGroupChat } from '../../utils/db-message'
import { useTheme } from '../../hooks/ThemeProvider'
import { useHolos } from '../../hooks/HolosProvider'

export default function Group({ navigation, route }) {
  const { theme } = useTheme()
  const { messages: data } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const { group } = route.params
  const { group_id, group_name, group_image, group_plan, members, status } = group
  const group_avatar = getLocalUriForFile(group_image)
  
  const [userId, setUserId] = useState(null)
  const [groups, setGroups] = useState([])

  const [groupName, setGroupName] = useState(group_name)
  const [groupAvatar, setGroupAvatar] = useState(group_avatar)
  const [groupPlan, setGroupPlan] = useState(group_plan)
  const [groupMembers, setGroupMembers] = useState(members)
  const [groupStatus, setGroupStatus] = useState(status)

  const [messages, setMessages] = useState(data[`group-${group_id}`])

  const init = async () => {
    const userGroups = JSON.parse(await getLocallyStoredVariable('user_groups'))
    setGroups(userGroups)

    const userId = await getUserIdFromLocalStorage()
    setUserId(userId)

    // const messages = await getMessagesInGroupChat({ group_id })
    // setMessages(messages)
  }

  useFocusEffect(
    useCallback(() => {
      const getUserGroupsFromLocalStorage = async () => {
        const result = JSON.parse(await getLocallyStoredVariable('user_groups')).find(group => group.group_id === group_id)

        setGroupName(result.group_name)
        setGroupAvatar(result.group_image)
        setGroupPlan(result.group_plan)
        setGroupMembers(result.members)
      }

      init()
      getUserGroupsFromLocalStorage()
    }, [])
  )

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
            <Avatar 
              imagePath={groupAvatar}
              type="group"
              style={styles.groupPhoto}
            />
            <View style={{ flex: 1 }}>
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
    groupPhoto: {
      width: 35,
      height: 42,
      backgroundColor: theme.lightestGray,
      borderRadius: 5,
      marginRight: 10
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