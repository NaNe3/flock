import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { useTheme } from "../../hooks/ThemeProvider"

import SimpleHeader from "../../components/SimpleHeader"
import PersonRow from "../components/PersonRow"
import { getMessagesInPrivateChat } from "../../utils/db-message"
import { getUserIdFromLocalStorage } from "../../utils/localStorage"
import ChatView from "../components/ChatView"
import HugeIcon from "../../components/HugeIcon"
import { getPrimaryColor } from "../../utils/getColorVariety"

export default function PersonChat({ navigation, route }) {
  const { person } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [messages, setMessages] = useState([])

  const init = async () => {
    const userId = await getUserIdFromLocalStorage()
    const messages = await getMessagesInPrivateChat({ sender_id: userId, recipient_id: person.id })
    // const startBlocks = messages.reduce((acc, message, index) => {
    //   if (index === 0 || message.author.id !== messages[index - 1].author.id) acc.push(index)
    //   return acc
    // }, [])
    // setStartBlocks(startBlocks)

    setMessages(messages)
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