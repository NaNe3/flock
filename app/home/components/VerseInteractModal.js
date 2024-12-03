import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, Text, Dimensions, Animated, TouchableOpacity, Platform, Keyboard, Easing, FlatList } from "react-native"
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { FlashList } from "@shopify/flash-list";

import { gen } from "../../utils/styling/colors"

import { hapticSelect } from "../../utils/haptics"
import { addComment, getComments, getTimeSincePosted } from "../../utils/db-comment"
import { getAttributeFromObjectInLocalStorage } from "../../utils/localStorage"

import EmptySpace from "../../components/EmptySpace"
import BasicTextInput from "../../components/BasicTextInput"
import Avatar from "../../components/Avatar"
import ExperienceSlider from "./ExperienceSlider";

export default function VerseInteractModal({ 
  navigation,
  modalVisible, 
  setModalVisible, 
  work, 
  book, 
  chapter, 
  verseSelected: verse,
  userId
}) {
  const bottomSheetRef = useRef(null)
  const commentInputRef = useRef(null)
  const snapPoints = useMemo(() => [280], []);
  const [userInformation, setUserInformation] = useState({})
  const [commentInput, setCommentInput] = useState('')
  const [displayInputBar, setDisplayInputBar] = useState(true)

  const [comments, setComments] = useState([])
  const [numberOfComments, setNumberOfComments] = useState(0)
  const [replyingTo, setReplyingTo] = useState(null)

  const opacity = useRef(new Animated.Value(0)).current
  const keyboardHeight = useRef(new Animated.Value(0)).current
  const interpolatedTranslateY = keyboardHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1]
  })

  useEffect(() => {
    const getNecessaryData = async () => {
      const { comments, error } = await getComments(work, book, chapter, verse)
      if (!error) {
        setComments(comments)
        setNumberOfComments(comments.length)
      } else console.error(error)

      const userAvatarPath = await getAttributeFromObjectInLocalStorage("userInformation", "avatar_path")
      const fname = await getAttributeFromObjectInLocalStorage("userInformation", "fname")
      const lname = await getAttributeFromObjectInLocalStorage("userInformation", "lname")
      setUserInformation({
        avatar_path: userAvatarPath,
        fname: fname,
        lname: lname
      })
    }
    getNecessaryData()

    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    const keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', (event) => {
      bottomSheetRef.current.snapToIndex(2)
      Animated.timing(keyboardHeight, {
        toValue: event.endCoordinates.height,
        duration: event.duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  
    const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', (event) => {
      // bottomSheetRef.current.snapToIndex(1)
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: event.duration,
        useNativeDriver: true,
      }).start()
    });
  
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }
  }, [])

  const handleClose = () => {
    Keyboard.dismiss()
    bottomSheetRef.current.close()
    const removeCommentBar = setTimeout(() => {
      setDisplayInputBar(false)
      clearTimeout(removeCommentBar)
    }, 100)
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(true)
    })
  }

  const submitComment = async () => {
    if (commentInput !== '') {
      hapticSelect()
      addComment({
        work: work,
        book: book,
        chapter: chapter,
        verse: verse,
        user_id: userId,
        comment: commentInput
      })
      setComments(prev => [{
        user: {
          avatar_path: userInformation.avatar_path,
          fname: userInformation.fname,
          lname: userInformation.lname
        },
        comment: {
          comment: commentInput,
          created_at: 'now'
        }
      }, ...prev])
      setCommentInput('')
    }
  }

  const handleAnimate = useCallback((fromIndex, toIndex) => {
    if (toIndex === 0 || toIndex === -1) {
      handleClose()
    }
  }, [])

  const startReply = () => {
    commentInputRef.current.focus()
  }

  return (
    <>
      <Animated.View style={[styles.bottomSheetOverlay, { opacity }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onClose={() => { 
          bottomSheetRef.current.close()
          setDisplayInputBar(false)
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setModalVisible(false))
        }}
        onAnimate={handleAnimate}
        enablePanDownToClose
        animateOnMount
        backgroundStyle={{ backgroundColor: gen.primaryBackground }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.modalHeader}>{`${book} ${chapter}:${verse}`}</Text>
          <ExperienceSlider 
            navigation={navigation} 
            canAddExperience={true}
            location={{ work, book, chapter, verse }}
          />
          {/* <View style={styles.commentsList}>
            {
              numberOfComments > 0 ? (
                <FlashList
                  data={comments}
                  keyExtractor={(item, index) => `comment-${index}`}
                  renderItem={({ item, index }) => <Comment co={item} startReply={startReply} />}
                  estimatedItemSize={20}
                  ListFooterComponent={<EmptySpace size={400} />}
                />
              ) : (
                <Text style={{ fontFamily: 'nunito-bold', fontSize: 24, marginTop: 100, textAlign: "center", color: gen.lightGray}}>No comments</Text>
              )
            }
          </View> */}
        </BottomSheetView>
      </BottomSheet>
      <Animated.View style={[
        styles.commentBarContainer,
        { display: displayInputBar ? 'flex' : 'none' },
        { transform: [{ translateY: interpolatedTranslateY }] }
      ]}>
        {
          replyingTo && (
            <View style={styles.replyingInfo}>
              <Text style={styles.replyingInfoText}>replying to {replyingTo}</Text>
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => {
                  hapticSelect()
                  setDisplayInputBar(false)
                  Keyboard.dismiss()
                }}
              >
                <Icon name="close" size={14} color={gen.primaryColor} />
              </TouchableOpacity>
            </View>
          )
        }
        <View style={styles.commentBar}>
          <BasicTextInput 
            ref={commentInputRef}
            placeholder="Add a comment"
            keyboardType="default"
            value={commentInput}
            onChangeText={(text) => setCommentInput(text)} 
            style={styles.commentTextInput}
            containerStyle={{
              flex: 1
            }}
            focus={false}
            multiline={true}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={submitComment}
            style={styles.sendButton}
          >
            <Icon name="send" size={20} color={gen.actionText} />
          </TouchableOpacity>

        </View>
      </Animated.View>
    </>
  )
}

const Comment = memo(({ co, startReply }) => {
  const timeSincePosted = co.comment.created_at !== 'now' ? getTimeSincePosted(co.comment.created_at) : 'now'
  return (
    <View style={styles.commentRow}>
      <View style={{ marginRight: 10 }}>
        <View style={{ borderWidth: 3, borderColor: gen.gray, borderRadius: 100, padding: 2 }}>
          {/* <Avatar 
            imagePath={co.user.avatar_path }
            type="profile"
            style={styles.commentAvatar}
          /> */}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.commentInfo}>{co.user.fname} {co.user.lname} • {timeSincePosted}</Text>
        <Text style={styles.commentText}>{co.comment.comment}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            hapticSelect()
            startReply()
          }}
        >
          <Text style={{ marginTop: 5, color: gen.darkGray, fontFamily: 'nunito-regular' }}>reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(70,70,70,0.5)",
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    // justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: gen.primaryBackground
  },
  commentsList: {
    flex: 1,
    width: '100%',
    backgroundColor: gen.primaryBackground
  },
  modalHeader: {
    fontSize: 22,
    marginBottom: 20,
    fontFamily: 'nunito-bold',
    color: gen.primaryText
  },
  replyingInfo: {
    backgroundColor: gen.primaryColorLight,
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  replyingInfoText: {
    color: gen.primaryColor,
    fontFamily: 'nunito-bold',
  },
  commentBarContainer: {
  },
  commentBar: {
    backgroundColor: gen.primaryBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'bottom 0.5s',
    paddingHorizontal: 20,
    paddingBottom: 20,

    display: 'none'
  },
  sendButton: {
    padding: 15,
    backgroundColor: gen.tertiaryBackground,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,  
    marginLeft: 10,
  },
  commentRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 25
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  commentInfo: {
    fontSize: 14,
    fontFamily: 'nunito-bold',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'nunito-regular',
    marginTop: 5
  },
  commentTextInput: {
    padding: 10,
    backgroundColor: gen.tertiaryBackground,
    borderRadius: 20,
    marginTop: 0,
  }
})