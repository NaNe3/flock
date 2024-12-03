import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/FontAwesome6'

import UserDisplayInteraction from "../../components/UserDisplayInteraction"

import { gen } from "../../utils/styling/colors"
import { getAllVersesWithLikesInChapter, getVersesWithActivity } from "../../utils/authenticate"
import { invokeLikeVerse } from "../../utils/db-invoke-edge"
import { hapticSelect } from "../../utils/haptics"

export default function VerseContainer({
  navigation, 
  verses, 
  setModalVisible,
  setVerseSelected,
  userInformation,
  work, 
  book, 
  chapter 
}) {
  const [versesLiking, setVersesLiking] = useState([])
  const [likes, setLikes] = useState([])
  const [uniqueVersesWithUserLikes, setUniqueVersesWithUserLikes] = useState([])
  const [uniqueVersesWithMedia, setUniqueVersesWithMedia] = useState({})

  useEffect(() => {
    const utility = async () => {
      if (userInformation.user_id === null) return

      const allMedia = await getVersesWithActivity(work, book, chapter, userInformation.user_id)
      const versesWithMedia = findUniqueVersesWithMedia(allMedia)
      setUniqueVersesWithMedia(versesWithMedia)

      // allLikes: raw data from the database
      // versesWithLikes: unique verses that have been liked
      const allLikes = await getAllVersesWithLikesInChapter(work, book, chapter, userInformation.user_id)
      const versesWithLikes = findUniqueVersesWithUserLikes(allLikes)
      setLikes(allLikes)
      setUniqueVersesWithUserLikes(versesWithLikes)
    }

    utility()
  }, [userInformation])

  const findUniqueVersesWithMedia = (media) => {
    const uniqueVerses = {}
    media.forEach(media => {
      if (uniqueVerses[media.verse] === undefined) {
        uniqueVerses[media.verse] = 1
      } else {
        uniqueVerses[media.verse] += 1
      }
    })
    return uniqueVerses
  }

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

  return (
    <GestureHandlerRootView style={styles.verseContainer}>
      {
        Object.entries(verses).map(([key, verse], index) => {
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
                {uniqueVersesWithMedia[index+1] !== undefined && (
                  <View style={styles.activityIndicator} />
                )}
                <Text 
                  style={styles.verse}
                >
                  {key} {verse}
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
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
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
    color: gen.primaryText,
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
    color: gen.primaryColor,
    backgroundColor: '#FFFFE0',
    fontFamily: 'nunito-bold',
  },
  activityIndicator: {
    position: 'absolute',
    left: -20,
    width: 0,
    height: '100%',
    borderWidth: 4,
    borderRadius: 10,
    borderColor: gen.primaryColor,
  }
})