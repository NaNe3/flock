import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'
import SimpleHeader from "../../../components/SimpleHeader"

import Avatar from "../../../components/Avatar"
import { hapticSelect } from "../../../utils/haptics"
import PersonBottomSheet from "../../../components/PersonBottomSheet"
import { useEffect, useState } from "react"
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from "../../../utils/localStorage"
import { timeAgoGeneral } from "../../../utils/timeDiff"
import { getColorLight } from "../../../utils/getColorVariety"
import { useTheme } from "../../../hooks/ThemeProvider"

export default function AllGroupMembers({ navigation, route }) {
  const { group_id, members, isGroupLeader } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [userId, setUserId] = useState(null)

  const [allMembers, setAllMembers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }

    init()
    setAllMembers(members)
  }, [])

  const updateMembers = async () => {
    const groups = JSON.parse(await getLocallyStoredVariable('user_groups'))
    const group = groups.find(group => group.group_id === group_id)

    const newMembers = group.members
    setAllMembers(newMembers)
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Member list"
      />
      <ScrollView style={styles.contentContainer}>
      {
        allMembers.map((member, index) => {
          return (
            <View
              key={index}
              style={styles.optionRow}
            >
              <TouchableOpacity 
                style={styles.personContentContainer}
                activeOpacity={1}
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
              {userId !== member.id && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticSelect()
                    setSelectedMember(member)
                    setModalVisible(true)
                  }}
                  style={[styles.ellipsisContainer, { backgroundColor: getColorLight(member.color) }]}
                >
                  <Icon name="ellipsis" size={20} color={member.color} />
                </TouchableOpacity>
              )}
            </View>
          )
        })
      }
      </ScrollView>
      {modalVisible && (
        <PersonBottomSheet
          person={selectedMember}
          setVisibility={setModalVisible}
          groupId={group_id}
          isGroupLeader={isGroupLeader}
          onMemberKicked={updateMembers}
        />
      )}
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
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
    ellipsisContainer: {
      width: 35,
      height: 28,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    }
  })
}