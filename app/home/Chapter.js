import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Dimensions, LogBox } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome'
import { getVersesFromChapter } from "../utils/read";
import { createRealtimeConnection, doesTheUserLikeTheVerse, getAllVersesWithLikesInChapter, getCommentsForVerse, getCommentsFromChapter, getNamesFromListOfIds, postComment } from "../utils/authenticate"
import { getLocallyStoredVariable } from "../utils/localStorage";
import { hapticSelect, hapticSuccess } from "../utils/haptics";
import BasicModal from "../components/BasicModal";
import BasicTextInput from "../components/BasicTextInput";
import BasicComment from "../components/BasicComment";

LogBox.ignoreAllLogs();

export default function Chapter({ navigate, route }) {
  const { book, chapter } = route.params
  const [verses, setVerses] = useState([])
  const [likes, setLikes] = useState([])
  const [versesWithLikes, setVersesWithLikes] = useState([])
  const [uniqueVersesWithUserLikes, setUniqueVersesWithUserLikes] = useState([])
  const [comments, setComments] = useState([])
  const [versesWithComments, setVersesWithComments] = useState([])

  // MODAL STUFF
  const [likesModalVisible, setLikesModalVisible] = useState(false)
  const [peopleWhoLikedVerse, setPeopleWhoLikedVerse] = useState([])
  const [peopleWhoCommented, setPeopleWhoCommented] = useState([])
  const [commentsOfVerse, setCommentsOfVerse] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [modalSection, setModalSection] = useState('comments')
  const [modalHeight, setModalHeight] = useState(500)
  const [verseFocused, setVerseFocused] = useState(null)
  const [commentBarStyling, setCommentBarStyling] = useState({
    position: 'absolute',
    bottom: 40,
  })

  const screenHeight = Dimensions.get('window').height

  useEffect(() => {
    const verses = getVersesFromChapter(book, chapter)
    setVerses(verses)
    getLikesOfVerse(book, chapter)

    organizeComments()

    const realtimeUpdates = async () => {
      await createRealtimeConnection(() => {
        const verses = getVersesFromChapter(book, chapter)
        setVerses(verses)
        getLikesOfVerse(book, chapter)
      }, () => {
        organizeComments()
        getCommentsOfVerse(book, chapter, verseFocused)
        getCommentsOfVerse(book, chapter, verseFocused)
      })
    }

    realtimeUpdates()
    return () => {
      realtimeUpdates()
    }
  }, [])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      const keyboardHeight = event.endCoordinates.height;
      setModalHeight(screenHeight - 45);
      setCommentBarStyling({
        position: 'absolute',
        bottom: keyboardHeight + 20,
      });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setModalHeight(500);
      setCommentBarStyling({
        position: 'absolute',
        bottom: 40,
      });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const getLikesOfVerse = async (book, chapter) => {
    const userId = await getLocallyStoredVariable('userId')
    const data = await getAllVersesWithLikesInChapter(book, chapter)
    if (data) setLikes(data)

    const uniqueVersesWithLikes = Array.from(new Set(data.map(verse => {
      if (JSON.parse(verse.people).length > 0) {
        return verse.verse
      }
    })))
    setVersesWithLikes(uniqueVersesWithLikes)

    const uniqueVersesWithUserLikes = data.filter(verse => JSON.parse(verse.people).includes(userId)).map(verse => verse.verse)
    setUniqueVersesWithUserLikes(uniqueVersesWithUserLikes)
  }

  const getCommentsOfVerse = async (book, chapter, verse) => {
    const data = await getCommentsForVerse(book, chapter, verse)
    setCommentsOfVerse(data)
    getAuthorsOfComments(data)
  }

  const handleVersePress = async (book, chapter, verse) => {
    setPeopleWhoLikedVerse([])
    setPeopleWhoCommented([])    


    hapticSelect()
    getPeopleWhoHaveLikedVerse(verse)
    setVerseFocused(verse)
    setLikesModalVisible(true)
    await getCommentsOfVerse(book, chapter, verse)
  }

  const handleVerseLike = async (book, chapter, verse) => {
    hapticSelect()
    const userId = await getLocallyStoredVariable('userId')
    await doesTheUserLikeTheVerse(userId, book, chapter, verse)
    await getLikesOfVerse(book, chapter)
  }

  const getPeopleWhoHaveLikedVerse = async (verse) => {
    const people = JSON.parse(likes.filter(like => like.verse === verse)[0].people)
    const data = await getNamesFromListOfIds(people)

    setPeopleWhoLikedVerse(data.map(person => person.name))
  }

  const getAuthorsOfComments = async (comments) => {
    const people = Array.from(new Set(comments.map(comment => comment.user_id)))
    const data = await getNamesFromListOfIds(people)

    setPeopleWhoCommented(data)
  }

  const handleSendComment = async () => {
    const userId = await getLocallyStoredVariable('userId')
    const data = await postComment(userId, commentInput, book, chapter, verseFocused)
  
    if (data) {
      hapticSuccess()
      setCommentInput('')
      Keyboard.dismiss()
      setCommentsOfVerse(data)
      getAuthorsOfComments(data)
    }
  }

  const organizeComments = async () => {
    const comments = await getCommentsFromChapter(book, chapter)
    setComments(comments)
    setVersesWithComments(comments.map(comment => comment.verse))
  }
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ width: '100%', flex: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <Text style={styles.chapterHeading}>{book} {chapter}</Text>
        <View style={styles.verseContainer}>
          {
            Object.keys(verses).map((verse, index) => {
              return (
                <GestureDetector
                  key={`verse-${index}`}
                  gesture={
                    Gesture.Simultaneous(
                      Gesture.LongPress().onStart(() => handleVersePress(book, chapter, index+1)),
                      Gesture.Tap().numberOfTaps(2).onEnd(() => handleVerseLike(book, chapter, index+1))
                    )
                  }
                >
                  <View style={styles.verseBox}>
                    {
                      versesWithLikes.includes(index+1) && (
                        <View style={styles.likeContainer}>
                          {
                            uniqueVersesWithUserLikes.includes(index+1) ? (
                              <Icon name="heart" size={20} color='red' />
                            ) : (
                              <Icon name="heart-o" size={20} color='#616161' />
                            )
                          }
                          <Text style={styles.likeNumber}>
                            {
                              JSON.parse(likes.filter(like => like.verse === index+1)[0].people).length
                            }
                          </Text>
                          
                        </View>
                      )
                    }
                    {
                      versesWithComments.includes(index+1) && (
                        <View style={styles.commentContainer}>
                          <Icon name="comment" size={20} color='#616161' />
                          <Text style={styles.likeNumber}>
                            {
                              comments.filter(comment => comment.verse === index+1).length
                            }
                          </Text>
                        </View>

                      )
                    }
                    <Text style={styles.verse}>
                      {index+1} {verses[verse]}
                    </Text>
                    {/* {
                      versesWithComments.includes(index+1) && (
                        <Icon name="comment" size={20} color='#616161' />
                      )
                    } */}
                  </View>
                </GestureDetector>
              )
            })
          }
        </View>
      </ScrollView>
      <BasicModal 
        visible={likesModalVisible}
        setVisible={setLikesModalVisible}
        height={modalHeight}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.modalSelectionBar}>
              <TouchableOpacity 
                onPress={() => {
                  hapticSelect()
                  setModalSection('likes')
                }}
              >
                <Text style={[styles.modalOptions, modalSection === 'likes' && { color: "#FFBF00"}]}>LIKES</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  hapticSelect()
                  setModalSection('comments')
                }}
              >
                <Text style={[styles.modalOptions, modalSection === 'comments' && { color: "#FFBF00"}]}>COMMENTS</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ width: '100%', flex: 1 }}>
              <TouchableOpacity activeOpacity={1}>
                {modalSection === "likes" && (peopleWhoLikedVerse.length > 0 ? (
                  peopleWhoLikedVerse.map((person, index) => {
                    return <Text style={styles.likedLog} key={`person-${index}`}>liked by <Text style={styles.personHighlight}>{person}</Text></Text>
                  })
                ) : (
                  <Text style={[styles.likedLog, {color: "#616161"}]}>No likes yet</Text>
                ))}
                {modalSection === "comments" && (commentsOfVerse.length > 0 ? (
                  commentsOfVerse.map((comment, index) => {
                    return (
                      <BasicComment 
                        key={`comment-${index}`} 
                        comment={comment} 
                        user={peopleWhoCommented.filter(person => {
                          return person.id === comment.user_id
                        }).map(person => person.name)[0]}
                      />

                    )
                  })
                ) : (
                  <Text style={[styles.likedLog, {color: "#616161"}]}>No comments yet</Text>
                ))}
              </TouchableOpacity>
            </ScrollView>

            {modalSection === "comments" && (
              <View style={[styles.commentBar, commentBarStyling]}>
                <BasicTextInput 
                  placeholder="Add a comment"
                  keyboardType="default"
                  value={commentInput}
                  onChangeText={(text) => setCommentInput(text)} 
                  style={{
                    padding: 10,
                    backgroundColor: '#D3D3D3',
                    borderRadius: 50,
                  }}
                  containerStyle={{
                    flex: 1
                  }}
                  focus={false}
                />
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    hapticSelect()
                    handleSendComment()
                  }}
                  style={styles.sendButton} 
                >
                  <Icon name="send" size={20} color="#616161" />
                </TouchableOpacity>
              </View>

            )}
          </View>
        </TouchableWithoutFeedback>
      </BasicModal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  chapterHeading: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 60,
    marginTop: 110,
    fontFamily: 'nunito-bold',
  },
  verseContainer: {
    width: '80%',
    flex: 1,
    alignItems: 'center',
  },
  verseBox: {
    width: '100%',
    marginBottom: 30,
  },
  verse: {
    width: '100%',
    fontSize: 22,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  },
  likeContainer: {
    position: 'absolute',
    top: 6,
    left: -30,
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: '#000'
  },
  commentContainer: {
    position: 'absolute',
    top: 56,
    left: -30,
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: '#000'
  },
  likeNumber: {
    fontFamily: 'nunito-regular', 
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  likedLog: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  personHighlight: {
    color: '#FFBF00',
    backgroundColor: '#FFFFE0',
    fontFamily: 'nunito-bold',

  },
  modalSelectionBar: {
    width: '100%',
    height: 50,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  modalOptions: {
    width: 100,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'nunito-bold',
  },
  commentBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'bottom 0.5s',
  },
  sendButton: {
    height: 50,
    width: 50,
    backgroundColor: '#D3D3D3',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -15,
    marginRight: 15,  
  }
})