import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage";
import NotificationIndicator from "./NotificationIndicator";
import { getGroupsForUser } from "../utils/db-relationship";
import { useRealtime } from "../hooks/RealtimeProvider";

export default function NavigationBar({ currentRoute, setCurrentRoute }) {
  const { groupInvites } = useRealtime()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const [invitationCount, setInvitationCount] = useState(0)
  const [groupsOpened, setGroupsOpened] = useState(false)
  const [userId, setUserId] = useState(null)

  const routes = [
    {
      icon: 'house',
      route: 'Home',
      name: 'home',
    }, 
    {
      icon: 'users',
      route: 'GroupPage',
      name: 'groups',
    },
    {
      icon: 'book',
      route: 'LibraryPage',
      name: 'library',
    },
  ]

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
      const invitationCount = JSON.parse(await getLocallyStoredVariable('user_groups')).filter(g => {
        const isGroupPending = g.members.some(m => m.id === userId && m.status === 'pending')
        return isGroupPending
      }).length

      setInvitationCount(invitationCount)
    }

    init()
  }, [])

  useEffect(() => {
    const update = async () => {
      const userId = await getUserIdFromLocalStorage()
      const { data } = await getGroupsForUser(userId)
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))
      setInvitationCount(data.filter(g => {
        const isGroupPending = g.members.some(m => m.id === userId && m.status === 'pending')
        return isGroupPending
      }).length)

      setGroupsOpened(false)
    }
    if (groupInvites !== null) {
      console.log("group invites", groupInvites)
      update()
    }
  }, [groupInvites])

  const changePage = (route) => {
    hapticSelect()
    setCurrentRoute(route)
    if (route === 'GroupPage') setGroupsOpened(true)
    navigation.navigate(route)
  }

  return (
    // change height to 56 and change paddingTop: 10
    <View style={[styles.container, { height: 66 + insets.bottom }]}>
      {routes.map((r, i) => (
        <TouchableOpacity
          key={`navigation-item-${i}`}
          style={styles.iconContainer}
          onPress={() => changePage(r.route)}
        >
          {r.route === 'GroupPage' && invitationCount > 0 && !groupsOpened && (
            <NotificationIndicator count={invitationCount} offset={-15} />
          )}
          <Icon name={r.icon} size={23} color={currentRoute === r.route ? gen.navigationSelected : gen.navigationUnselected} />
          <Text style={[styles.iconText, currentRoute === r.route && styles.iconTextSelected]}>{r.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 90,
    maxHeight: 90,
    backgroundColor: gen.primaryBackground,
    paddingTop: 15,
    display: "flex",
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  iconText: {
    color: gen.navigationUnselected,
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  iconTextSelected: {
    color: gen.navigationSelected,
  }
})