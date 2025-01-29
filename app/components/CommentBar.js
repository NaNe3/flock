import { useEffect, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard, Animated, Text, Dimensions } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { gen } from "../utils/styling/colors";
import { getPrimaryColor } from "../utils/getColorVariety";
import { createComment } from "../utils/db-comment";
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from "../utils/localStorage";
import { hapticImpactSoft, hapticSelect } from "../utils/haptics";

const width = Dimensions.get('window').width

export default function CommentBar({ 
  navigation,
  media_id,
  media_type,
  setComments,
  replyingTo,
  setReplyingTo
}) {
  const [comment, setComment] = useState('')
  const [userId, setUserId] = useState(null)
  const [keyboardHeight, setKeyboardHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    const init = async () => {
      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }

    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (event) => {
      Animated.spring(keyboardHeight, {
        duration: event.duration,
        toValue: event.endCoordinates.height-30,
        useNativeDriver: false,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', (event) => {
      Animated.spring(keyboardHeight, {
        duration: event.duration,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    });

    init()

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);


  const mutual_props = {
    comment,
    setComment,
    replyingTo,
    setReplyingTo
  }

  return (
    <Animated.View style={[styles.container, { bottom: keyboardHeight }]}>
      <CommentInput { ...mutual_props } />
      <CommentPublishButton
        {...mutual_props}
        media_id={media_id}
        media_type={media_type}
        user_id={userId}
        setComments={setComments}
      />
    </Animated.View>
  )
}

const CommentInput = ({
  placeholder = 'Comment...',
  comment,
  setComment,
  replyingTo,
  setReplyingTo
}) => {
  const commentInputRef = useRef(null)
  const [replyWasActive, setReplyWasActive] = useState(false)

  const handleChangeText = (text) => {
    setComment(text)
  }

  const handleCancelReply = () => {
    hapticSelect()
    setReplyingTo(null)
  }

  useEffect(() => {
    if (replyingTo !== null && !replyWasActive) {
      setReplyWasActive(true)
      commentInputRef.current.focus()
    } else if (replyingTo === null && replyWasActive) {
      setReplyWasActive(false)
      commentInputRef.current.blur()
    }
  }, [replyingTo])

  return (
    <View style={styles.searchBar}>
      {replyingTo !== null && (
        <Animated.View style={styles.commentReplyingBar}>
          <Text style={styles.commentReplyingText}>replying</Text>
          <TouchableOpacity onPress={handleCancelReply}>
            <Icon name="circle-xmark" size={20} color={gen.secondaryText} />
          </TouchableOpacity>
        </Animated.View>
      )}
      <TextInput
        ref={commentInputRef}
        multiline
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="gray"
        value={comment}
        onChangeText={handleChangeText}
      />
    </View>
  );
}

const CommentPublishButton = ({ 
  comment, 
  setComment, 
  user_id, 
  media_id, 
  media_type, 
  setComments,
  replyingTo,
  setReplyingTo
}) => {
  const [color, setColor] = useState(gen.secondaryBackground)
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setColor(color)

      const userInfo = JSON.parse(await getLocallyStoredVariable('user_information'))
      setUserInfo(userInfo)
    }

    init()
  }, [])

  const handlePress = async () => {
    hapticImpactSoft()
    if (comment.length === 0) return
    await createComment({
      media_id: media_type === 'media' ? media_id : null,
      comment_id: media_type === 'comment' ? media_id : null,
      user_id: user_id,
      replying_to: replyingTo,
      comment: comment
    })
    
    // create local comment
    const newComment = {
      comment: comment,
      created_at: new Date().toISOString(),
      user: {
        avatar_path: userInfo.avatar_path,
        color_id: { color_hex: userInfo.color.color_hex },
        full_name: `${userInfo.fname} ${userInfo.lname}`
      }
    }

    setComments(comments => [newComment, ...comments])
    setComment('')
    if (replyingTo !== null) { setReplyingTo(null) }
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.publishButton, { backgroundColor: color }]} 
      onPress={handlePress}
    >
      <Icon name="feather-pointed" size={20} color={"#fff"} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
  },
  searchBar: {
    flex: 1, 
    justifyContent: 'center',
    backgroundColor: gen.secondaryBackground,
    borderRadius: 20,
  },
  searchInput: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 150,
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: gen.primaryText,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: gen.primaryBorder,
  },
  publishButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: gen.primaryBackground,
    borderRadius: 50,
    marginLeft: 10
  },
  commentReplyingBar: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentReplyingText: {
    color: gen.secondaryText,
    fontSize: 16,
    fontFamily: 'nunito-bold',
  }
})