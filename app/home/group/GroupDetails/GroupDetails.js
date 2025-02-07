import { useCallback, useEffect, useState } from "react"
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/FontAwesome'

import SimpleHeader from "../../../components/SimpleHeader"
import Avatar from "../../../components/Avatar"
import StrongContentBox from "../../../components/StrongContentBox"

import { getLocallyStoredVariable, getUserIdFromLocalStorage } from "../../../utils/localStorage"
import { hapticSelect } from "../../../utils/haptics"
import PersonBottomSheet from "../../../components/PersonBottomSheet"
import { timeAgoGeneral } from "../../../utils/timeDiff"
import { useTheme } from "../../../hooks/ThemeProvider"

export default function GroupDetails({ navigation, route }) {
  const { group_id, group_name, group_avatar, group_plan, members } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [groupName, setGroupName] = useState(group_name)
  const [userId, setUserId] = useState('')
  const [groupAvatar, setGroupAvatar] = useState(group_avatar)
  const [groupPlan, setGroupPlan] = useState(group_plan)
  const [groupMembers, setGroupMembers] = useState(members)

  const [userIsLeader, setUserIsLeader] = useState(false)
  const [isMember, setIsMember] = useState(false)

  const [userModalVisibility, setUserModalVisibility] = useState(false)
  const [personSelected, setPersonSelected] = useState({})

  const groupOptions = [{
    name: 'CHAT INFO',
    rows: [
      { name: 'Change name or image', location: 'EditGroupInfo' },
      { name: 'Leave group', location: 'GroupLeave', danger: true, condition: groupMembers.length > 1 },
      { name: 'Delete group', actionIcon: 'trash', location: 'GroupDelete', danger: true, leader: true },
    ]
  }]

  useEffect(() => {
    const getNecessaryData = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
      const user = groupMembers.find(member => member.id === userId)
      setUserIsLeader(user.is_leader)
      setIsMember(user.status === 'accepted')
    }
    getNecessaryData()
  }, [groupMembers])

  const getUserGroupsFromLocalStorage = async () => {
    const result = JSON.parse(await getLocallyStoredVariable('user_groups')).find(group => group.group_id === group_id)

    setGroupName(result.group_name)
    setGroupPlan(result.group_plan)
    setGroupMembers(result.members)
    setGroupAvatar(result.group_image)
  }

  useFocusEffect(
    useCallback(() => {
      getUserGroupsFromLocalStorage()
    }, [])
  );

  return (
    <View style={styles.container}>
      <SimpleHeader 
        navigation={navigation} 
        title="Details"
      />
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.contentContainerFormatting}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.landingContainer}>
          <View style={styles.landingContainerContent}>
            <View style={styles.groupPhotoContainer}>
              <Avatar 
                imagePath={groupAvatar}
                type="group"
                style={styles.groupPhoto} 
              />
            </View>
            <Text style={styles.groupNameText}>{groupName}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <StrongContentBox
            navigation={navigation}
            title={`MEMBERS (${groupMembers.length})`}
          >
            {
              groupMembers.slice(0, 3).map((member, index) => {
                return (
                  <View 
                    key={index}
                    style={styles.optionRow}
                  >
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                      activeOpacity={0.7}
                      onPress={() => {
                        // navigation.navigate(row.location)}
                        // console.log('navigate to', member)
                      }}
                    >
                      <View style={[styles.avatarImageContainer, { borderColor: member.color }]}>
                        <Avatar
                          imagePath={member.avatar_path}
                          type="user"
                          style={styles.avatarImage}
                        />
                      </View>
                      <View style={styles.userNameLeft}>
                        <Text style={styles.optionRowText}>{member.fname} {member.lname}</Text>
                        <Text style={styles.optionRowTextSecondary}>studied {timeAgoGeneral(member.last_studied)}</Text>
                      </View>
                    </TouchableOpacity>
                    {
                      member.id !== userId && (
                        <TouchableOpacity 
                          activeOpacity={0.7}
                          onPress={() => {
                            hapticSelect()
                            setPersonSelected(member)
                            setUserModalVisibility(true)
                          }}
                        >
                          <Icon name="ellipsis-h" size={16} color={member.color} />
                        </TouchableOpacity>
                      )
                    }
                  </View>
                )
              })
            }
            <TouchableOpacity 
              key="add-group-members"
              style={[styles.optionRow, { borderTopWidth: 2, borderColor: theme.primaryBorder }]}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate("AddGroupMembers", { 
                  members: groupMembers, 
                  group_id: group_id,
                  isGroupLeader: userIsLeader,
                })
              }}
            >
              <Text style={styles.optionRowText}>invite friends</Text>
              <Icon name="chevron-right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity 
              key="see-full-list"
              style={[styles.optionRow, { borderTopWidth: 2, borderColor: theme.primaryBorder }]}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate("AllGroupMembers", { 
                  members: groupMembers, 
                  group_id: group_id,
                  isGroupLeader: userIsLeader,
                })
              }}
            >
              <Text style={styles.optionRowText}>see all members</Text>
              <Icon name="chevron-right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </StrongContentBox>

          {
            isMember && groupOptions.map((option, index) => {
              return (
                <StrongContentBox
                  key={index}
                  navigation={navigation}
                  title={option.name}
                >
                  {
                    option.rows.map((row, index) => {
                      if (row.leader && !userIsLeader) return null
                      if (row.condition !== undefined && !row.condition) return null
                      return (
                        <TouchableOpacity 
                          key={index}
                          style={styles.optionRow}
                          activeOpacity={0.7}
                          onPress={() => {
                            navigation.navigate(row.location, {
                              group_name: groupName,
                              group_avatar: groupAvatar,
                              group_plan: groupPlan,
                              members: groupMembers,
                              ...route.params,
                            })
                          }}
                        >
                          <Text style={[styles.optionRowText, { color: row.danger ? theme.red : theme.primaryText }]}>
                            <Icon name={row.actionIcon} size={16} color={row.danger ? theme.red : theme.secondaryText} /> {row.name}
                          </Text>
                          { row.icon ? <Icon name={row.icon} size={16} color={row.danger ? theme.red : theme.secondaryText} /> : null }
                        </TouchableOpacity>
                      )
                    })
                  }
                </StrongContentBox>
              )
            })
          }

          {/* <StrongContentBox
            navigation={navigation}
            title="MEMBERS"
          >
            <TouchableOpacity 
              style={styles.optionRow}
              activeOpacity={0.7}
            >
              <Text style={styles.optionRowText}>Block a member</Text>
              <Icon name="chevron-right" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          </StrongContentBox> */}
        </View>
      </ScrollView>
      {userModalVisibility && (
        <PersonBottomSheet 
          person={personSelected}
          setVisibility={setUserModalVisibility}
          isGroupLeader={userIsLeader}
          groupId={group_id}
          onMemberKicked={getUserGroupsFromLocalStorage}
        />
      )}
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    landingContainer: {
      flex: 1,
      width: '100%',
      paddingTop: 600,
      marginTop: -600,
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      backgroundColor: theme.primaryBackground,
    },
    landingContainerContent: {
      margin: 20,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.secondaryBackground,
    },
    contentContainerFormatting: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      padding: 20,
      paddingBottom: 100
    },
    groupPhoto: {
      borderRadius: 10,
      flex: 1,
      width: '100%',
    },
    groupPhotoContainer: {
      width: 150,
      height: 200,
      padding: 5,
      marginVertical: 20,
      borderWidth: 5,
      borderColor: theme.primaryBorder,
      borderRadius: 20,
    }, 
    groupNameText: {
      fontFamily: 'nunito-bold',
      fontSize: 30,
      color: theme.primaryText,
      textAlign: 'center',
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
      marginLeft: 10,
    },
  })
}