import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { setLocallyStoredVariable } from "../../utils/localStorage"
import { acceptGroupInvitation, rejectGroupInvitation } from "../../utils/db-relationship"
import { hapticSelect } from "../../utils/haptics"

import AcceptReject from "./AcceptReject"
import { removeSingleGroupChatState } from "../../utils/db-message"
import { useHolos } from "../../hooks/HolosProvider"

export default InviteRow = ({ navigation, setGroupStatus, userId, groupId }) => {
  const { groups, setGroups } = useHolos()

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
    await removeSingleGroupChatState(userId, groupId)

    setGroups(prev => {
      return prev.filter(g => g.group_id !== groupId)
    })
    navigation.goBack()
  }
  return (
    <AcceptReject accept={accept} reject={reject} />
  )
}
