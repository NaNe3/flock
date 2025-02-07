import { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"

import UserDisplayInteraction from "../../components/UserDisplayInteraction"
import FadeInView from "../../components/FadeInView"

import { getAllVersesWithLikesInChapter, getVersesWithActivity } from "../../utils/authenticate"
import { invokeLikeVerse } from "../../utils/db-like"
import { hapticImpactSoft, hapticSelect } from "../../utils/haptics"
import { useFocusEffect } from "@react-navigation/native"
import { useRealtime } from "../../hooks/RealtimeProvider"
import { useTheme } from "../../hooks/ThemeProvider"

export default function VerseContainer({
  navigation,
  verses,
  userInformation,
  work,
  book,
  chapter,
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const { media } = useRealtime()
  const [versesLiking, setVersesLiking] = useState([])
  const [likes, setLikes] = useState([])
  const [uniqueVersesWithUserLikes, setUniqueVersesWithUserLikes] = useState([])
  const [uniqueVersesWithMedia, setUniqueVersesWithMedia] = useState({})
  const [activity, setActivity] = useState([])

  // realtime activity
  useEffect(() => {
    const trigger = async () => { await loadMedia() }
    if (media.length > 0) { trigger() }
  }, [media])

  const init = async () => {
    if (userInformation.user_id === null || userInformation.user_id === undefined) return

    await loadMedia()

    // allLikes: raw data from the database
    // versesWithLikes: unique verses that have been liked
    const allLikes = await getAllVersesWithLikesInChapter(work, book, chapter, userInformation.user_id)
    const versesWithLikes = findUniqueVersesWithUserLikes(allLikes)
    setLikes(allLikes)
    setUniqueVersesWithUserLikes(versesWithLikes)
  }

  const loadMedia = async () => {
    const allMedia = await getVersesWithActivity(work, book, chapter, userInformation.user_id)
    const versesWithMedia = findUniqueVersesWithMedia(allMedia)
    setActivity(allMedia)
    setUniqueVersesWithMedia(versesWithMedia)
  }

  useFocusEffect(
    useCallback(() => {
      init()
      return () => { }
    }, [userInformation])
  )

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
    hapticImpactSoft()
    console.log("Verse Pressed: ", verse)
    if (uniqueVersesWithMedia[verse] !== undefined) {
      navigation.navigate('ViewImpressions', { title: `${book} ${chapter}:${verse}`, location: { work, book, chapter, verse } })
    } else {
      navigation.navigate('Capture', { location: { work, book, chapter, verse } })
    }
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
      await invokeLikeVerse({ location: { work: work, book: book, chapter: chapter, verse: verse }, user_id: userInformation.user_id })
    }
    setVersesLiking(prev => prev.filter(v => v !== verse))
  }

  return (
    <GestureHandlerRootView style={styles.verseContainer}>
      {
        verses && <FadeInView
          style={{ width: '100%' }}
          time={700}
        >
          {
            Object.entries(verses).map(([key, verse], index) => {
              const keyInt = parseInt(key)
              const tapGesture = Gesture.Tap().numberOfTaps(2).onEnd(() => handleVerseLike(keyInt)).runOnJS(true).shouldCancelWhenOutside(true)
              const longPressGesture = Gesture.LongPress().onStart(() => handleVersePress(keyInt)).runOnJS(true).shouldCancelWhenOutside(true)

              return (
                <GestureDetector
                  key={`verse-${index}`}
                  gesture={
                    Gesture.Simultaneous(tapGesture, longPressGesture)
                  }
                >
                  <View style={styles.verseBox}>
                    {/* {uniqueVersesWithMedia[key] !== undefined && media.filter(m => m.verse === keyInt).map((media, index) => {
                      return (
                        <MediaItem 
                          key={`media-${index}`}
                          media={media}
                          top={index*45}
                        />
                      )
                    })} */}
                    <Text
                      style={styles.verse}
                    >{key} {verse}</Text>
                    {uniqueVersesWithMedia[key] !== undefined && (
                      <FadeInView style={styles.activityIndicator}>
                        {Array(uniqueVersesWithMedia[key]).fill().map((_, index) => {
                          const activityColor = activity.filter(a => a.verse === keyInt)[index].color
                          return (
                            <TouchableOpacity 
                              style={styles.activityItemTouchableArea}
                              key={`activity-${index}`}
                              onPress={() => handleVersePress(keyInt)}
                            >
                              <View
                                style={[styles.activityItem, index !== 0 && { marginTop: 5}, { borderColor: activityColor }]}
                              />
                            </TouchableOpacity>
                          )
                        })}
                      </FadeInView>
                    )}
                    {
                      uniqueVersesWithUserLikes.includes(keyInt)
                      && likes.filter(like => like.verse === keyInt).map((person, index) =>
                        <UserDisplayInteraction key={`like-${index}`} />
                      )
                    }
                  </View>
                </GestureDetector>
              )
            })
          }

        </FadeInView>
      }
    </GestureHandlerRootView>
  )
}

function style(theme) {
  return StyleSheet.create({
    verseContainer: {
      flex: 1,
      marginHorizontal: 50,
      paddingBottom: 70
    },
    verseBox: {
      width: '100%',
      marginBottom: 30,
    },
    verse: {
      fontSize: 22,
      fontFamily: 'nunito-bold',
      textAlign: 'left',
      color: theme.primaryText,
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
      color: theme.darkishGray,
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
      color: theme.primaryColor,
      backgroundColor: '#FFFFE0',
      fontFamily: 'nunito-bold',
    },
    activityIndicator: {
      position: 'absolute',
      left: -35,
      width: 0,
      height: '100%',
      // borderWidth: 4,
      // borderRadius: 10,
      // borderColor: theme.primaryColor,
    },
    activityItem: {
      flex: 1,
      borderWidth: 4,
      borderRadius: 10,
      borderColor: theme.primaryColor,
    },
    activityItemTouchableArea: {
      flex: 1,
      maxHeight: 150,
      paddingHorizontal: 15,
    }
  })
}