import { useEffect, useRef, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import BasicMessage from "../../components/BasicMessage"
import { useTheme } from "../../hooks/ThemeProvider"
import EmptySpace from "../../components/EmptySpace"
import ChatMessageBar from "./ChatMessageBar"
import { getMessagesInGroupChat, getMessagesInPrivateChat, updateLastMessageSeen } from "../../utils/db-message"
import { useHolos } from "../../hooks/HolosProvider"
import { getUserIdFromLocalStorage } from "../../utils/localStorage"
// import { FlashList } from "@shopify/flash-list"

export default function ChatView({
  person=null,
  group=null,
  messages,
}) {
  const { theme } = useTheme()
  const { setMessages, setChatStates } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  
  const scrollViewRef = useRef(null)
  const [userId, setUserId] = useState(null)
  const [startBlocks, setStartBlocks] = useState([])
  const [selected, setSelected] = useState({
    message_id: null
  })
  const [numberOfMessages, setNumberOfMessages] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  
  const initialized = useRef(false)
  const isFetchingPast = useRef(false)
  const loadingNewMessages = useRef(false)
  const oldContentHeight = useRef(0)

  const newStartBlocks = useRef(0)
  const oldStartBlocks = useRef(0)

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }
    init()

    const initialize = setTimeout(() => {
      initialized.current = true
    }, 1000)
    return () => clearTimeout(initialize)
  }, [])

  useEffect(() => {
    if (messages === undefined || messages.length === 0) return
    const startBlocks = messages.reduce((acc, message, index) => {
      if (index === 0 || message.author.id !== messages[index - 1].author.id) acc.push(index)
      return acc
    }, [])
    setStartBlocks(startBlocks)
    newStartBlocks.current = startBlocks.length
    if (userId !== null) {
      actualizeChatState(userId, startBlocks)
    }
    setNumberOfMessages(messages.length)
  }, [messages])

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y

    if (offsetY < 10 && initialized.current) {
      initialized.current = false
      loadingNewMessages.current = true
      getPastMessages()
    }
  }

  const getPastMessages = async () => {
    oldContentHeight.current = contentHeight
    isFetchingPast.current = true

    if (group !== null && group !== undefined) {
      const newMessages = await getMessagesInGroupChat({ group_id: group.group_id, start: numberOfMessages })
      const key = `group-${group.group_id}`
      setMessages((prev) => {
        return {
          ...prev,
          [key]: [...newMessages, ...messages]
        }
      })
      setNumberOfMessages(prev => prev + newMessages.length)
      setTimeout(() => {
        initialized.current = true
        loadingNewMessages.current = false
      }, 1000)
    } else {
      const newMessages = await getMessagesInPrivateChat({ sender_id: userId, recipient_id: person.id, start: numberOfMessages })
      const key = `friend-${person.id}`
      setMessages((prev) => {
        return {
          ...prev,
          [key]: [...newMessages, ...messages]
        }
      })
      setNumberOfMessages(prev => prev + newMessages.length)
      setTimeout(() => {
        initialized.current = true
        loadingNewMessages.current = false
      }, 1000)
    }
    
    const startBlocks = messages.reduce((acc, message, index) => {
      if (index === 0 || message.author.id !== messages[index - 1].author.id) acc.push(index)
      return acc
    }, [])
    setStartBlocks(startBlocks)
    newStartBlocks.current = startBlocks.length
    if (userId !== null) {
      actualizeChatState(userId, startBlocks)
    }

  }

  useEffect(() => {
  }, [messages])

  const actualizeChatState = async (userId) => {
    const lastMessage = messages[messages.length - 1].message_id
    if (lastMessage && userId) {
      if (person !== null) {
        setChatStates(prev => {
          return prev.map(chatState => {
            if (chatState.relationship_id) {
              if (chatState.relationship_id.user_one === person.id || chatState.relationship_id.user_two === person.id) {
                return { ...chatState, new_message_count: 0 }
              } else { return chatState }
            } else { return chatState }
          })
        })
        await updateLastMessageSeen({ user_id: userId, message_id: lastMessage, relationship_id: person.relationship_id })
      } else if (group !== null) {
        setChatStates(prev => {
          return prev.map(chatState => {
            if (parseInt(chatState.group_id) === parseInt(group.group_id)) {
              return { ...chatState, new_message_count: 0 }
            } else { return chatState }
          })
        })
        await updateLastMessageSeen({ user_id: userId, message_id: lastMessage, group_id: group.group_id })
      }
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        onContentSizeChange={(w, h) => {
          // if we've just loaded new messages,
          // adjust scroll offset by the change in content height
          if (isFetchingPast.current && scrollViewRef.current) {
            console.log(newStartBlocks.current, " - ", oldStartBlocks.current)
            const offset = (h-(newStartBlocks.current*18)) - (oldContentHeight.current-(oldStartBlocks.current*18))
            scrollViewRef.current.scrollTo({ y: offset, animated: false })
            isFetchingPast.current = false
          }
          // Save the new height
          setContentHeight(h)
          oldStartBlocks.current = newStartBlocks.current
          
          if (!loadingNewMessages.current) {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {
          messages !== undefined && messages.map((message, index) => (
            <BasicMessage
              key={`message-${message.message_id}`}
              message={message}
              isFirstInBlock={startBlocks.includes(index)}
              setSelected={setSelected}
            />
          ))
        }
        <EmptySpace size={400} />
      </ScrollView>
      {/* <View style={styles.container}>
        <FlashList
        ref={scrollViewRef}
          data={messages}
          initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0}
          renderItem={({ item, index }) => (
            <BasicMessage
              message={item}
              isFirstInBlock={startBlocks.includes(index)}
              setSelected={setSelected}
            />
          )}
          contentContainerStyle={styles.contentContainer}
          estimatedItemSize={50}
        />

      </View> */}
      <ChatMessageBar
        recipient_id={person?.id}
        group_id={group?.group_id}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      flex: 1,
    },
    contentContainer: {
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