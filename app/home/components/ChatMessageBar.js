import { useEffect, useRef, useState } from "react"
import { Animated, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../../hooks/ThemeProvider"
import { getLocallyStoredVariable } from "../../utils/localStorage"
import { sendMessageInPrivateChat, sendMessageToGroupChat } from "../../utils/db-message"
import { useHolos } from "../../hooks/HolosProvider"

export default function ChatMessageBar({ recipient_id, group_id }) {
  const { theme } = useTheme()
  const { setMessages } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const insets = useSafeAreaInsets()

  const [color, setColor] = useState(theme.gray)
  const [userId, setUserId] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [recipientId] = useState(recipient_id)

  const [message, setMessage] = useState('')
  const keyboardHeight = useRef(new Animated.Value(0)).current

  const init = async () => {
    const user = JSON.parse(await getLocallyStoredVariable('user_information'))
    setColor(user.color.color_hex)
    setUserId(user.id)
    setAvatarPath(user.avatar_path)
  }

  useEffect(() => {
    init()

    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (event) => {
      Animated.spring(keyboardHeight, {
        duration: event.duration,
        toValue: -(event.endCoordinates.height-insets.bottom),
        useNativeDriver: false,
      }).start()
    })

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', (event) => {
      Animated.spring(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start()
    })

    init()

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  const handlePress = async () => {
    if (message.length > 0) {
      let published
      if (recipientId !== null && recipientId !== undefined) {
        published = await sendMessageInPrivateChat({ sender_id: userId, recipient_id: recipientId, message })
      } else {
        published = await sendMessageToGroupChat({ group_id: group_id, sender_id: userId, message })
      }

      const key = (recipientId !== null && recipientId !== undefined) ? `friend-${recipientId}` : `group-${group_id}`
      setMessages(prev => {
        return { ...prev, [key]: [...prev[key], published] }
      })
      setMessage('')
    }
  }

  const handleChangeMessage = (text) => {
    setMessage(text)
  }

  return (
    <Animated.View style={[styles.container, { paddingBottom: 110+insets.bottom, transform: [{ translateY: keyboardHeight }] }]}>
      <View style={styles.messageBar}>
        <TextInput
          multiline
          style={styles.messageInput}
          placeholder={'I dislike Laban'}
          placeholderTextColor="gray"
          value={message}
          onChangeText={handleChangeMessage}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.publishButton, { backgroundColor: color }]} 
          onPress={handlePress}
        >
          <Icon name="feather-pointed" size={20} color={"#fff"} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginBottom: -100,
      backgroundColor: theme.primaryBackground,
    },
    messageBar: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.secondaryBackground,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.primaryBorder,
      overflow: 'hidden',
    },
    messageInput: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 12,
      maxHeight: 130,
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    publishButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primaryBackground,
      borderRadius: 50,
      margin: 5
    },
  })
}