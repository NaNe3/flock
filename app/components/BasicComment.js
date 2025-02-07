import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome6'

import Avatar from './Avatar';
import FadeInView from './FadeInView';

import { timeAgo } from '../utils/timeDiff';
import { hapticSelect } from '../utils/haptics';
import { useTheme } from '../hooks/ThemeProvider';

export default function BasicComment({ 
  comment,
  replyingTo,
  setReplyingTo,
  isReply=false,
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [timeSince, setTimeSince] = useState(timeAgo(comment.created_at));
  const [hasBeenSelected, setHasBeenSelected] = useState(false)
  const commentScale = useRef(new Animated.Value(1)).current

  const handleReplyPress = () => {
    hapticSelect()
    if (replyingTo === comment.media_comment_id) {
      setReplyingTo(null)
      return
    } else {
      if (isReply) {
        setReplyingTo(comment.replying_to)
      } else {
        setReplyingTo(comment.media_comment_id)
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
    if (hasBeenSelected && replyingTo !== comment.media_comment_id) {
      Animated.timing(commentScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start()
      setHasBeenSelected(false)
    }
  }, [replyingTo])

  const handleSeeReplies = () => {
    Keyboard.dismiss()
    hapticSelect()
  }

  return (
    <Animated.View key={`comment-${comment.comment_media_id}`} style={{ transform: [{ scale: commentScale }] }}>
      <FadeInView style={[styles.comment, replyingTo === comment.media_comment_id && { backgroundColor: theme.tertiaryBackground }]}>
        <View style={[styles.avatarContainer, { borderColor: comment.user.color_id.color_hex }, isReply && { width: 35, height: 35 }]}>
          <Avatar
            imagePath={comment.user.avatar_path}
            type='profile'
            style={styles.avatar}
          />
        </View>
        <View style={styles.commentContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commentUser}>{comment.user.full_name} • {timeSince}</Text>
            <Text style={styles.commentText}>{comment.comment}</Text>
            {comment.reply_count > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleSeeReplies}>
                <Text style={styles.replyCount}>{comment.reply_count} {comment.reply_count > 1 ? "replies" : "reply"}</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ padding: 5 }}
            onPress={handleReplyPress}
          >
            <Icon name='reply' size={15} color={theme.secondaryText} />
          </TouchableOpacity>
        </View>
      </FadeInView>
    </Animated.View>
  )
}

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
      marginTop: 5,
      color: theme.primaryText,
      fontFamily: 'nunito-bold',
      textDecorationLine: 'underline',
    },
    replyCount: {
      fontSize: 14,
      color: theme.secondaryText,
      fontFamily: 'nunito-bold',
      textDecorationLine: 'underline',
    }
  })
}