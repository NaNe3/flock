import { act, useEffect, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CommentBar from "../components/CommentBar";
import BasicComment from "../components/BasicComment";

import { hapticImpactHeavy } from "../utils/haptics";
import { getComments, getReplies } from "../utils/db-comment";
import BasicCommentSkeleton from "./components/BasicCommentSkeleton";
import { useTheme } from "../hooks/ThemeProvider";
import EmptySpace from "../components/EmptySpace";

export default function CommentPage({ navigation, route }) {
  const { media_id, media_type } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const pan = useRef(new Animated.ValueXY()).current;
  const alreadySwiped = useRef(false)
  const [replyingTo, setReplyingTo] = useState({
    media_comment_id: null,
    replying_to: null,
    recipient_id: null,
  })

  const [hasLoaded, setHasLoaded] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsWithReplies, setCommentsWithReplies] = useState([])
  const [replies, setReplies] = useState([])

  useEffect(() => {
    const init = async () => {
      const comments = await getComments(media_id, media_type === 'media' ? 'media_id' : 'comment_id')
      setComments(comments)

      const commentIds = comments.reduce((acc, curr) => {
        if (!acc.includes(curr.media_comment_id)) {
          acc.push(curr.media_comment_id)
        }
        return acc
      }, [])

      // hashmap with keys as comment ids and values as replies
      const replies = await getReplies(commentIds)
      setHasLoaded(true)
      const repliesHashMap = {}
      commentIds.forEach(id => {
        repliesHashMap[id] = {
          replies: replies.filter(reply => reply.replying_to === id)
        }
      })
      setCommentsWithReplies(repliesHashMap)
    }

    init()
  }, [])

  useEffect(() => {
    if (comments.filter(comment => comment.replying_to !== null).length > 0) {
      // filter through comments and update commentsWithReplies if a comment exists with replying_to
      let replies = []
      const cleanComments = comments.reduce((acc, curr) => {
        if (curr.replying_to === null) {
          acc.push(curr)
        } else {
          replies.push(curr)
        }
        return acc
      }, [])
      setComments(cleanComments)

      setCommentsWithReplies(prev => {
        replies.forEach(reply => {
          prev[reply.replying_to].replies.push(reply)
        })
        return prev
      })
    }
  }, [comments])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
        if (gestureState.dy > 50) {
          if (!alreadySwiped.current) {
            alreadySwiped.current = true
            hapticImpactHeavy()
            navigation.goBack()
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50) return
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current

  const marginTop = pan.y.interpolate({
    inputRange: [0, 300],
    outputRange: [insets.top + 30, insets.top + 130],
    extrapolate: 'clamp'
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.swipeContainer, { marginTop: marginTop }]}>

      </Animated.View>
      <View style={styles.dragContainer}>
        <View 
          {...panResponder.panHandlers}
          style={styles.actionContainer}
        >
          <View style={styles.actionBar} />
          <Text style={styles.headerText}>Comments</Text>
        </View>
        <ScrollView 
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {hasLoaded ? (
            <>
              {comments.length > 0
                ? comments.map((comment, index) => (
                    <View key={`comment-${index}`}>
                      <BasicComment
                        comment={comment}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                      />
                      {
                        commentsWithReplies[comment.media_comment_id] &&
                        commentsWithReplies[comment.media_comment_id].replies.length > 0 &&
                        commentsWithReplies[comment.media_comment_id].replies.map((reply, index) => (
                          <BasicComment
                            key={`reply-${index}`}
                            index={index}
                            comment={reply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            isReply={true}
                          />
                        ))
                      }
                    </View>
                  ))
                : <Text style={styles.noCommentsDisclaimer}>no comments</Text>
              }
            </>
          ) : (
            <>
              <BasicCommentSkeleton />
              <BasicCommentSkeleton />
              <BasicCommentSkeleton />
              <BasicCommentSkeleton />
            </>
          )}
          <EmptySpace size={400} />
        </ScrollView>
        <View style={[styles.footer, { marginBottom: insets.bottom + 10 }]}>
          <CommentBar
            navigation={navigation}
            media_id={media_id}
            media_type={media_type}
            setComments={setComments}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        </View>
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    swipeContainer: { width: '100%', },
    dragContainer: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
    },
    actionContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 15,
    },
    actionBar: {
      width: 35,
      height: 6,
      backgroundColor: theme.actionText,
      borderRadius: 20
    },
    headerText: {
      fontFamily: 'nunito-bold',
      color: theme.actionText,
      fontSize: 16,
      marginVertical: 10
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 5,
      paddingTop: 5,
    },
    noCommentsDisclaimer: {
      color: theme.actionText,
      fontSize: 24,
      marginTop: 120,
      fontFamily: 'nunito-bold',
      textAlign: 'center'
    },
    footer: {
      width: '100%',
      paddingHorizontal: 20
    }
  })
}