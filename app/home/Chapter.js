import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Keyboard, LogBox, Animated, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector, gestureHandlerRootHOC, GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from "../components/SimpleHeader"
import VerseInteractModal from "./components/VerseInteractModal";

import { getVersesFromChapter } from "../utils/read";
import { createRealtimeConnection, doesTheUserLikeTheVerse, getAllVersesWithLikesInChapter, getCommentsForVerse, getCommentsFromChapter, getNamesFromListOfIds, postComment } from "../utils/authenticate"
import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getAttributeFromObjectInLocalStorage, getUserIdFromLocalStorage } from "../utils/localStorage"
import { invokeLikeVerse } from "../utils/db-invoke-edge";
import UserDisplayInteraction from "../components/UserDisplayInteraction";
import { useFocusEffect } from "@react-navigation/native";

function Chapter({ navigation, route }) {
  const { work, book, chapter } = route.params
  const [verses, setVerses] = useState([])
  const [userInformation, setUserInformation] = useState({})
  const [showChapterTitle, setShowChapterTitle] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [verseSelected, setVerseSelected] = useState(null)

  // hooks to track likes
  const [versesLiking, setVersesLiking] = useState([])
  const [likes, setLikes] = useState([])
  const [uniqueVersesWithUserLikes, setUniqueVersesWithUserLikes] = useState([])

  useEffect(() => {
    const getUserId = async () => {
      const userId = await getUserIdFromLocalStorage()
      const userPath = await getAttributeFromObjectInLocalStorage("userInformation", "avatar_path")
      setUserInformation({
        user_id: userId,
        avatar_path: userPath
      })

      const verses = await getVersesFromChapter(work, book, chapter)
      setVerses(verses)
    
      // allLikes: raw data from the database
      // versesWithLikes: unique verses that have been liked
      const allLikes = await getAllVersesWithLikesInChapter(work, book, chapter, userId)
      const versesWithLikes = findUniqueVersesWithUserLikes(allLikes)
      setLikes(allLikes)
      setUniqueVersesWithUserLikes(versesWithLikes)
    }

    // const realtimeUpdates = async () => {
      // await createRealtimeConnection(() => {
      //   // const verses = getVersesFromChapter(book, chapter)
      //   // setVerses(verses)
      //   // getLikesOfVerse(book, chapter)
      // }, () => {
      //   organizeComments()
      //   // getCommentsOfVerse(book, chapter, verseFocused)
      //   // getCommentsOfVerse(book, chapter, verseFocused)
      // })
    // }

    getUserId()
    // realtimeUpdates()
    // return () => {
    //   realtimeUpdates()
    // }
  }, [])

  const findUniqueVersesWithUserLikes = (likes) => {
    const uniqueVerses = []
    likes.forEach(like => {
      if (!uniqueVerses.includes(like.verse)) {
        uniqueVerses.push(like.verse)
      }
    })
    return uniqueVerses
  }

  const handleVersePress = (verse) => {
    setVerseSelected(verse)
    setModalVisible(true)
  }

  const handleVerseLike = async (verse) => {
    if (versesLiking.includes[verse]) return

    setVersesLiking(prev => [...prev, verse])
    if (userInformation.user_id !== null) {
      hapticSelect()
      if (!likes.some(like => like.verse === verse && like.user_id === userInformation.user_id)) {
        const newLikes = [...likes, { user_id: userInformation.user_id, verse: verse, user: { avatar_path: userInformation.avatar_path }}]

        setLikes(newLikes)
        setUniqueVersesWithUserLikes([...uniqueVersesWithUserLikes, verse])
      } else {
        const newLikes = likes.filter(like => {
          const result = like.verse !== verse || (like.verse === verse && like.user_id != userInformation.user_id)
          return result
        })
        setLikes(newLikes)
        setUniqueVersesWithUserLikes(findUniqueVersesWithUserLikes(newLikes))
      }
      const result = await invokeLikeVerse(work, book, chapter, verse, userInformation.user_id)
      if (!result.ok) {
        // Whatever happens when user like fails
        console.error("Error liking verse", result)
      }
    }
    setVersesLiking(prev => prev.filter(v => v !== verse))
  }

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y
    if (scrollPosition > 60) setShowChapterTitle(true)
    else setShowChapterTitle(false)
  }

  useFocusEffect(
    useCallback(() => {
      console.log("Focused on chapter")
      // Reset any state or gestures if necessary
      return () => {
        console.log("Unfocused on chapter")
        // Cleanup function to reset state on unmount
      };
    }, [])
  );


  return (
    <GestureHandlerRootView style={styles.container}>
      <SimpleHeader 
        navigation={navigation} 
        middleTitle={`${book} ${chapter}`}
        showChapterTitle={showChapterTitle}
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              hapticSelect()
            }}
          >
            <Icon 
              name='bars'
              size={20}
              color='#000'
              style={{ marginLeft: 30 }}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView 
        style={{ width: '100%', flex: 1, }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.chapterHeading}>{book} {chapter}</Text>
        <View style={styles.verseContainer}>
          {
            Object.keys(verses).map((verse, index) => {
              const tapGesture = Gesture.Tap().numberOfTaps(2).onEnd(() => handleVerseLike(index+1)).runOnJS(true).shouldCancelWhenOutside(true)
              const longPressGesture = Gesture.LongPress().onStart(() => handleVersePress(index+1)).runOnJS(true).shouldCancelWhenOutside(true)
 
              return (
                <GestureDetector
                  key={`verse-${index}`}
                  gesture={
                    Gesture.Simultaneous(tapGesture, longPressGesture)
                  }
                >
                  <View style={styles.verseBox}>
                    <Text 
                      style={styles.verse}
                    >
                      {index+1} {verses[verse]}
                    </Text>
                    {
                      uniqueVersesWithUserLikes.includes(index+1) 
                      && likes.filter(like => like.verse === index+1).map((person, index) =>
                        // FIND AVATAR PATHS FROM PEOPLE WHO HAVE LIKED VERSE!
                        <UserDisplayInteraction
                          key={`like-${index}`}
                          path={person.user.avatar_path}
                          mediaType="like"
                          top={index*35}
                        />
                      )
                    }
                  </View>
                </GestureDetector>
              )
            })
          }
        </View>
      </ScrollView>
      {
        modalVisible && (
          <VerseInteractModal 
            navigation={navigation}
            modalVisible={modalVisible} 
            setModalVisible={setModalVisible}
            work={work}
            book={book}
            chapter={chapter}
            verseSelected={verseSelected}
            userId={userInformation.user_id}
          />
        )
      }
    </GestureHandlerRootView>
  )
}

export default gestureHandlerRootHOC(Chapter)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  chapterHeading: {
    fontSize: 48,
    marginBottom: 60,
    paddingHorizontal: 40,
    fontFamily: 'nunito-bold',
    alignSelf: 'center',
  },
  verseContainer: {
    flex: 1,
    marginLeft: 50,
    marginRight: 50,
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
    textAlign: 'left',
  },
  likeContainer: {
    position: 'absolute',
    top: 6,
    right: -30,
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: '#000'
  },
  commentContainer: {
    position: 'absolute',
    top: 56,
    left: -40,
    fontSize: 14,
    fontFamily: 'nunito-bold',
    color: '#000'
  },
  likeNumber: {
    fontFamily: 'nunito-regular', 
    fontSize: 14,
    color: gen.darkishGray,
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
    color: gen.orange,
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
    borderBottomColor: gen.lightGray,
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
    backgroundColor: gen.lightGray,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -15,
    marginRight: 15,  
  }
})