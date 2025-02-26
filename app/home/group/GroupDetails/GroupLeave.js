import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from "../../../components/SimpleHeader";
import BasicButton from "../../../components/BasicButton";
import { Text } from "react-native";
import { hapticSelect } from "../../../utils/haptics";
import { leaveGroupByGroupId } from "../../../utils/db-image";
import { getLocallyStoredVariable, setLocallyStoredVariable } from "../../../utils/localStorage";
import { getPrimaryColor } from "../../../utils/getColorVariety";
import { useTheme } from "../../../hooks/ThemeProvider";

export default function GroupLeave ({ navigation, route }) {
  const { group_name, group_id, members, userId } = route.params
  console.log("GroupLeave: ", group_name, group_id, members, userId)
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const [color, setColor] = useState(theme.primaryColor)
  const [leaving, setLeaving] = useState(false)
  const [newLeader, setNewLeader] = useState(null)
  const [isLeader, setIsLeader] = useState(false)

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setColor(color)
    }
    init()

    const isUserTheLeader = members.some(member => {
      if (member.is_leader && member.id === userId) {
        return true
      }
    })
    setIsLeader(isUserTheLeader)
  }, [])

  const handleGroupLeave = async () => {
    setLeaving(true)
    // leave group
    console.log("I AM LEAVING THE GROUP: ", group_id, userId, newLeader)
    const { error } = await leaveGroupByGroupId(group_id, userId, newLeader)

    // remove group from user_groups in local storage
    if (error === null) {
      const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
      const newGroups = groups.filter(group => group.group_id !== group_id)
      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))

      navigation.navigate('FriendsPage')
    } else {
      // TODO - HANDLE ERROR
    }
    setLeaving(false)
  }

  return (
    <View style={[styles.container, { paddingBottom: 20+insets.bottom }]}>
      <SimpleHeader
        title='Leave group'
        navigation={navigation}
      />
      <ScrollView style={styles.otherGroupMembers}>
        {isLeader && (
          <>
            <Text style={styles.groupMembersHeader}>select new group leader</Text>
            <View style={styles.groupMembersContainer}>
              {
                members.map(member => {
                  if (member.id !== userId) {
                    return (
                      <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={() => {
                          hapticSelect()
                          if (newLeader === member.id) {
                            setNewLeader(null)
                          } else {
                            setNewLeader(member.id)
                          }
                        }}
                        style={[styles.groupMember, newLeader === member.id &&  { borderColor: color }]}
                        key={member.id}
                      >
                        <Text style={[styles.groupMemberText, newLeader === member.id && { color: color }]}>{member.fname} {member.lname}</Text>
                        <Icon name={newLeader === member.id ? 'circle-check' : 'circle'} size={20} color={newLeader === member.id ? color : theme.primaryText} />
                      </TouchableOpacity>
                    )
                  }
                })
              }
            </View>
          </>
        )}
      </ScrollView>
      <BasicButton
        title={`Leave '${group_name}'`}
        disabled={leaving || (isLeader && newLeader === null)}
        onPress={handleGroupLeave}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
      alignItems: 'center',
    },
    otherGroupMembers: {
      flex: 1,
      marginHorizontal: 20,
      paddingVertical: 20,
    },
    groupMembersContainer: {
      width: '100%',
      backgroundColor: theme.primaryBackground,
      borderRadius: 15,
    },
    groupMember: {
      width: '100%',
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 15,
      borderWidth: 4,
      borderColor: 'transparent',
    },
    groupMembersHeader: {
      fontSize: 20,
      paddingVertical: 15,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    groupMemberText: {
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
  })
}