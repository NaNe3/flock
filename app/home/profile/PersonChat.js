import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { useTheme } from "../../hooks/ThemeProvider"
import { useHolos } from "../../hooks/HolosProvider"

import SimpleHeader from "../../components/SimpleHeader"
import PersonRow from "../components/PersonRow"
import ChatView from "../components/ChatView"
import HugeIcon from "../../components/HugeIcon"
import { getUserIdFromLocalStorage } from "../../utils/localStorage"
import { updateLastMessageSeen } from "../../utils/db-message"

export default function PersonChat({ navigation, route }) {
  const { person } = route.params
  const { theme } = useTheme()
  const { messages, setChatStates } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [userId, setUserId] = useState(null)
  const [chatMessages, setChatMessages] = useState(messages[`friend-${person.id}`])


  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)

      // actualizeChatState(userId)
    }

    init()
  }, [])

  useEffect(() => {
    const msgs = messages[`friend-${person.id}`]
    setChatMessages(msgs)
  }, [messages])

  // useEffect(() => {
  //   if (userId !== null) {
  //     actualizeChatState(userId)
  //   }
  // }, [chatMessages])

  // const actualizeChatState = async (userId) => {
  //   const msgs = messages[`friend-${person.id}`]
  //   if (msgs) {
  //     const lastMessage = msgs[msgs.length - 1].message_id
  //     if (lastMessage) {
  //       setChatStates(prev => {
  //         return prev.map(chatState => {
  //           if (chatState.relationship_id) {
  //             if (chatState.relationship_id.user_one === person.id || chatState.relationship_id.user_two === person.id) {
  //               return { ...chatState, new_message_count: 0 }
  //             } else { return chatState }
  //           } else { return chatState }
  //         })
  //       })
  //       await updateLastMessageSeen({ user_id: userId, message_id: lastMessage, relationship_id: person.relationship_id })
  //     }
  //   }
  // }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        component={
          <PersonRow
            person={person}
          />
        }
        rightIcon={
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.activeImpressionContainer}
          >
            <Text style={[styles.activeImpressions, { color: '#fff'}]}>3</Text>
            <HugeIcon
              icon="play"
              size={22}
              color={'#fff'}
            />
          </TouchableOpacity>
        }
        verticalPadding={20}
      />
      <ChatView
        person={person}
        messages={chatMessages}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    activeImpressionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activeImpressions: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    }
  })
}
