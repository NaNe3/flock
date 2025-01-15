import { use, useCallback, useEffect, useState } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Icon from 'react-native-vector-icons/FontAwesome6'

import UserDisplayInteraction from "../../components/UserDisplayInteraction"
import FadeInView from "../../components/FadeInView"

import { gen } from "../../utils/styling/colors"
import { getAllVersesWithLikesInChapter, getVersesWithActivity } from "../../utils/authenticate"
import { invokeLikeVerse } from "../../utils/db-invoke-edge"
import { hapticImpactSoft, hapticSelect } from "../../utils/haptics"
import { useFocusEffect } from "@react-navigation/native"
import { useRealtime } from "../../hooks/RealtimeProvider"
import { formatActivityFromSupabase } from "../../utils/format"

export default function VerseContainer({
  navigation,
  verses,
  // setModalVisible,
  // setVerseSelected,
  userInformation,
  work,
  book,
  chapter,
}) {
  const { media } = useRealtime()
  const [versesLiking, setVersesLiking] = useState([])
  const [likes, setLikes] = useState([])
  const [uniqueVersesWithUserLikes, setUniqueVersesWithUserLikes] = useState([])
  const [uniqueVersesWithMedia, setUniqueVersesWithMedia] = useState({})
  const [activity, setActivity] = useState([])
  const [mediaCount, setMediaCount] = useState({})

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
      navigation.navigate('ViewImpressions', { work, book, chapter, verse })
    } else {
      navigation.navigate('Capture', { work, book, chapter, verse })
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
                    {uniqueVersesWithMedia[key] !== undefined && (
                      <FadeInView style={styles.activityIndicator}>
                        {Array(uniqueVersesWithMedia[key]).fill().map((_, index) => {
                          const activityColor = activity.filter(a => a.verse === keyInt)[index].color
                          return (
                            <View
                              key={`activity-${index}`}
                              style={[styles.activityItem, index !== 0 && { marginTop: 5}, { borderColor: activityColor }]}
                            />
                          )
                        })}
                      </FadeInView>
                    )}
                    <Text
                      style={styles.verse} 
                    >{key} {verse}</Text>
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

// const MediaItem = ({ media, top }) => {
//   return (
//     <View style={[styles.mediaBox, { top: 5+top }]}>
//       {/* glass-water, gauge, ice-cream, jet-fighter-up,  */}
//       <Icon name="play" size={12} color={gen.mediaUnseen} />
//       <View style={{ position: 'absolute', right: -7, bottom: -10, borderRadius: 10, borderWidth: 2, borderColor: gen.primaryBackground }}>
//         <Avatar
//           imagePath={media.user.avatar_path}
//           type="profile"
//           style={{ width: 15, height: 15, borderRadius: 10 }}
//         />
//       </View>
//     </View>
//   )
// }

const styles = StyleSheet.create({
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
    color: gen.primaryText,
  },
  // mediaBox: {
  //   position: 'absolute',
  //   left: -35,
  //   width: 25,
  //   height: 33,
  //   borderRadius: 5,
  //   borderWidth: 3,
  //   borderColor: gen.mediaUnseen,

  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
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
    // borderWidth: 4,
    // borderRadius: 10,
    // borderColor: gen.primaryColor,
  },
  activityItem: {
    flex: 1,
    // maxHeight: 160,
    borderWidth: 4,
    borderRadius: 10,
    borderColor: gen.primaryColor,
  }
})