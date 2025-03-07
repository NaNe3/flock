import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet } from "react-native"
import BasicMessage from "../../components/BasicMessage"
import { useTheme } from "../../hooks/ThemeProvider"
import EmptySpace from "../../components/EmptySpace"
import ChatMessageBar from "./ChatMessageBar"

export default function ChatView({
  person,
  group,
  messages,
  setMessages
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const scrollViewRef = useRef(null)
  const [startBlocks, setStartBlocks] = useState([])
  const [selected, setSelected] = useState({
    message_id: null
  })

  useEffect(() => {
    const startBlocks = messages.reduce((acc, message, index) => {
      if (index === 0 || message.author.id !== messages[index - 1].author.id) acc.push(index)
      return acc
    }, [])
    setStartBlocks(startBlocks)
  }, [messages])

  return (
    <>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {
          messages.map((message, index) => (
            <BasicMessage
              key={index}
              message={message}
              isFirstInBlock={startBlocks.includes(index)}
              setSelected={setSelected}
            />
          ))
        }
        <EmptySpace size={300} />
      </ScrollView>
      <ChatMessageBar
        recipient_id={person?.id}
        group_id={group?.group_id}
        setMessages={setMessages}
      />
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    contentContainer: {
      width: '100%',
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.tertiaryBackground,
    },
    personPhoto: {
      width: 35,
      height: 42,
      backgroundColor: theme.lightestGray,
      borderRadius: 5,
      marginRight: 10
    },
    personName: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
  })
}