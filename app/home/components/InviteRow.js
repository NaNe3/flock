import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { setLocallyStoredVariable } from "../../utils/localStorage"
import { acceptGroupInvitation, rejectGroupInvitation } from "../../utils/db-relationship"
import { hapticSelect } from "../../utils/haptics"

import AcceptReject from "./AcceptReject"

export default InviteRow = ({ navigation, groups, setGroups, setGroupStatus, userId, groupId }) => {

  const accept = () => {
    hapticSelect()
    acceptGroupInvitation(userId, groupId)
    // update group status in local storage and hook
    if (setGroupStatus) setGroupStatus('accepted')
    if (!setGroups) return
    setGroups(prev => {
      const newGroups = prev.map(g => g.group_id === groupId ? { ...g, status: 'accepted' } : g)
      return newGroups
    })
  }
  const reject = async () => {
    hapticSelect()
    await rejectGroupInvitation(userId, groupId)
    // update group status in local storage and hook

    if (setGroupStatus) {
      setGroupStatus('rejected')
      const newGroups = groups.filter(g => g.group_id !== groupId)
      await setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
      navigation.goBack()
    }
    if (!setGroups) return
    setGroups(prev => {
      const newGroups = prev.filter(g => g.group_id !== groupId)
      setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
      return newGroups
    })
  }
  return (
    <AcceptReject accept={accept} reject={reject} />
  )
}
