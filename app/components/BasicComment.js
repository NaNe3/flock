import { forwardRef, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, Animated, Touchable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome6'

import Avatar from './Avatar';
import FadeInView from './FadeInView';

import { timeAgo } from '../utils/timeDiff';
import { hapticSelect } from '../utils/haptics';
import { useTheme } from '../hooks/ThemeProvider';

function BasicComment({ 
  index,
  comment,
  replyingTo,
  setReplyingTo,
  isReply=false,
}, ref) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [timeSince, setTimeSince] = useState(timeAgo(comment.created_at));
  const [color] = useState(comment.user.color_id.color_hex)
  const [hasBeenSelected, setHasBeenSelected] = useState(false)
  const commentScale = useRef(new Animated.Value(1)).current

  const handleReplyPress = () => {
    hapticSelect()
    if (replyingTo.media_comment_id === comment.media_comment_id || (isReply && replyingTo.media_comment_id === comment.replying_to)) {
      setReplyingTo({
        media_comment_id: null,
        replying_to: null,
        recipient_id: null,
      })
    } else {
      if (isReply) {
        setReplyingTo({
          media_comment_id: comment.media_comment_id,
          replying_to: comment.replying_to,
          recipient_id: comment.user.id,
        })
      } else {
        setReplyingTo({
          media_comment_id: comment.media_comment_id,
          replying_to: comment.media_comment_id,
          recipient_id: comment.user.id,
        })
      }
      setHasBeenSelected(true)

      Animated.timing(commentScale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }).start()
    }
  }

  useEffect(() => {
    if (hasBeenSelected && replyingTo.media_comment_id !== comment.media_comment_id) {
      Animated.timing(commentScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start()
      setHasBeenSelected(false)
    }
  }, [replyingTo])

  return (
    <Animated.View 
      key={`comment-${comment.comment_media_id}`} 
      style={{ transform: [{ scale: commentScale }] }}
    >
      <FadeInView style={[
        styles.comment, 
        replyingTo.media_comment_id === comment.media_comment_id && { backgroundColor: theme.tertiaryBackground },
        isReply && { paddingVertical: 4 },
        index === 0 && { marginTop: -8 },
      ]}>
        <View style={styles.infoColumn}>
          <View style={[styles.replyBar, { backgroundColor: color }]} />
          {!isReply && (
            <View style={[styles.avatarContainer, { borderColor: color }]}>
              <Avatar
                imagePath={comment.user.avatar_path}
                type='profile'
                style={styles.avatar}
              />
            </View>
          )}
        </View>
        <View style={styles.commentContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleReplyPress}
            style={{ flex: 1 }}
          >
            <Text 
              style={styles.commentUser}
              numberOfLines={1}
              ellipsizeMode='tail'
            >{comment.user.full_name} • {timeSince}</Text>
            <Text style={styles.commentText}>{comment.comment}</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>
    </Animated.View>
  )
}

export default forwardRef(BasicComment);

function style(theme) {
  return StyleSheet.create({
    comment: {
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 5,
      marginHorizontal: 10,
      flexDirection: 'row',
    },
    avatarContainer: {
      width: 40,
      height: 40,
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
    commentContent: {
      flex: 1,
      marginLeft: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    commentUser: {
      fontSize: 14,
      color: theme.secondaryText,
      fontFamily: 'nunito-bold',
    },
    commentText: {
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    commentLink: {
      fontSize: 14,
      color: theme.tertiaryText,
      fontFamily: 'nunito-bold',
      textDecorationLine: 'underline',
    },
    replyCount: {
      fontSize: 14,
      color: theme.secondaryText,
      fontFamily: 'nunito-bold',
      textDecorationLine: 'underline',
    },
    infoColumn: {
      width: 40,
    },
    replyBar: {
      width: 5,
      height: '100%',
      borderRadius: 5,
      backgroundColor: theme.secondaryBackground,
      position: 'absolute',
      left: 20,
      transform: [{ translateX: -2.5 }],
    }
  })
}