import { forwardRef, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, UIManager, findNodeHandle } from 'react-native'

import { timeAgo } from '../utils/timeDiff';
import { useTheme } from '../hooks/ThemeProvider';
import Avatar from './Avatar';
import { hapticImpactHeavy } from '../utils/haptics';

const MAX_DRAG = 50

export default function BasicMessage({ 
  message,
  isFirstInBlock=false,
  setSelected,
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const commentRef = useRef(null)
  const [timeSince, setTimeSince] = useState(timeAgo(message.created_at));
  const [color] = useState(message.author.color)

  const messageTranslateX = useRef(new Animated.Value(0)).current
  const releaseMessage = () => {
    Animated.spring(messageTranslateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start()
    setSelected({ message_id: message.message_id })
  }
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0) {
          const damping = 1 - Math.exp(-gestureState.dx / MAX_DRAG)
          const newTranslateX = damping * MAX_DRAG
          messageTranslateX.setValue(newTranslateX)
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > MAX_DRAG / 2) {
          hapticImpactHeavy()
        }
        releaseMessage()
      },
      onPanResponderTerminate: (e, gestureState) => {
        if (gestureState.dx > MAX_DRAG / 2) {
          hapticImpactHeavy()
        }
        releaseMessage()
      }
    })
  ).current

  return (
    <>
      <View ref={commentRef} />
      <Animated.View 
        style={[styles.message, isFirstInBlock && { paddingTop: 18 }, { transform: [{ translateX: messageTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.infoColumn}>
          <View style={[styles.replyBar, { backgroundColor: color }]} />
          {isFirstInBlock && (
            <View style={[styles.avatarContainer, { borderColor: color }]}>
              <Avatar
                imagePath={message.author.avatar_path}
                type='profile'
                style={styles.avatar}
              />
            </View>
          )}
        </View>
        <View style={styles.messageContent}>
          {/* <Text 
            style={styles.messageUser}
            numberOfLines={1}
            ellipsizeMode='tail'
          >{message.author.full_name} • {timeSince}</Text> */}
          <Text style={styles.messageText}>{message.message}</Text>
        </View>
      </Animated.View>
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    message: {
      borderRadius: 10,
      paddingVertical: 2,
      paddingHorizontal: 5,
      flexDirection: 'row',
    },
    avatarContainer: {
      width: 36,
      height: 36,
      padding: 2,
      overflow: 'hidden',
      borderRadius: 25,
      borderWidth: 3,
      backgroundColor: theme.primaryBackground,
    },
    avatar: {
      flex: 1,
      borderRadius: 100
    },
    messageContent: {
      flex: 1,
      flexDirection: 'column',
      marginLeft: 10,
      justifyContent: 'center',
    },
    messageUser: {
      fontSize: 14,
      color: theme.secondaryText,
      fontFamily: 'nunito-bold',
    },
    messageText: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    infoColumn: {
      width: 36,
    },
    replyBar: {
      width: 5,
      height: '100%',
      borderRadius: 5,
      backgroundColor: theme.secondaryBackground,
      position: 'absolute',
      left: 18,
      transform: [{ translateX: -2.5 }],
    }
  })
}