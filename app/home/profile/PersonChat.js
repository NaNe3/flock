import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { useTheme } from "../../hooks/ThemeProvider"
import { useHolos } from "../../hooks/HolosProvider"

import SimpleHeader from "../../components/SimpleHeader"
import PersonRow from "../components/PersonRow"
import ChatView from "../components/ChatView"
import HugeIcon from "../../components/HugeIcon"
import { getUserIdFromLocalStorage } from "../../utils/localStorage"

export default function PersonChat({ navigation, route }) {
  const { person } = route.params
  const { theme } = useTheme()
  const { messages: data } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [messages, setMessages] = useState(data[`friend-${person.id}`])

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    await changeAllMessagesToSeenIn({ user_id: userId, friend_id: person.id })
  }

  useEffect(() => {
    init()
  }, [])

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
      backgroundColor: theme.primaryBackground,
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