import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View, Animated, PanResponder, ScrollView } from "react-native"
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from 'react-native-vector-icons/FontAwesome6'
import { LinearGradient } from 'expo-linear-gradient';

import hexToRgba from "../utils/hexToRgba"
import { getMediaByMediaId, getMediaFromVerse } from "../utils/authenticate"
import Media from "../components/Media"
import Avatar from "../components/Avatar"
import { hapticError, hapticImpactHeavy, hapticSelect } from "../utils/haptics"
import { timeAgo } from "../utils/timeDiff"
import { getEmojiHistory, getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage"
import EmojiBurst from "../components/EmojiBurst";
import { reactToMedia } from "../utils/db-media";
import EmojiModal from "../components/EmojiModal";
import EmojiReaction from "../components/EmojiReaction";
import { getFontSizeOfComment } from "../utils/format-comment";
import EmptySpace from "../components/EmptySpace";
import { getCommentCount } from "../utils/db-comment";
import { useTheme } from "../hooks/ThemeProvider";

export default function ViewImpressions({ navigation, route }) {
  const { title, location, media_id } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const insets = useSafeAreaInsets()
  const [emojis, setEmojis] = useState([])
  const alreadySwiped = useRef(false)
  const firstLoad = useRef(true)
  const mediaChangeDirection = useRef(null)
  const mediaChangeValue = useRef(null)
  const mediaCount = useRef(0)
  const currentMediaRef = useRef(0)
  const currentMediaId = useRef(null)
  const currentMediaType = useRef(null)

  const [userId, setUserId] = useState(null)
  const [media, setMedia] = useState([])
  const [currentMedia, setCurrentMedia] = useState(0)
  const [preferences, setPreferences] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timeSincePosted, setTimeSincePosted] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(null)

  const [defaultEmojis, setDefaultEmojis] = useState([])
  const [emojiModalVisible, setEmojiModalVisible] = useState(false)
  const isScrollEnabled = useRef(false)

  useFocusEffect(
    useCallback(() => {
      const getImpressions = async () => {
        const userId = await getUserIdFromLocalStorage()
        let media
        if (location !== null && location !== undefined) {
          const { work, book, chapter, verse } = location
          media = await getMediaFromVerse(work, book, chapter, verse, userId)
        } else if (media_id !== null && media_id !== undefined) {
          media = await getMediaByMediaId(media_id)
        }
        setUserId(userId)
        setMedia(media)
        mediaCount.current = media.length
        if (firstLoad.current) {
          currentMediaId.current = media[0].media === null ? media[0].comment.comment_id : media[0].media.media_id
          currentMediaType.current = media[0].media === null ? 'comment' : 'media'
          firstLoad.current = false
        }

        if (media.length > 0) {
          const timeCreated = media[currentMedia].media !== null ? media[currentMedia].media.created_at : media[currentMedia].comment.created_at
          const timeSince = timeAgo(timeCreated)
          setTimeSincePosted(timeSince)
          setUserAvatar(media[currentMedia].user.avatar_path)
          setUserName(`${media[currentMedia].user.fname} ${media[currentMedia].user.lname}`)

          // await getCommentInformation()
          const mediaId = media[currentMedia].media !== null ? media[currentMedia].media.media_id : media[currentMedia].comment.comment_id
          const commentCount = await getCommentCount(mediaId, media[currentMedia].media !== null ? 'media_id' : 'comment_id')
          setCommentCount(commentCount)
        }
      }

      alreadySwiped.current = false
      getImpressions()
    }, [])
  )

  useEffect(() => {
    const getMediaPreferences = async () => {
      const preferences = JSON.parse(await getLocallyStoredVariable('media_preferences'))
      if (preferences === null) await setLocallyStoredVariable('media_preferences', JSON.stringify({ soundEnabled: true }))
      if (preferences.soundEnabled !== undefined) setSoundEnabled(preferences.soundEnabled)
    }

    getMediaPreferences()
    const checkForSwipe = setInterval(() => {
      if (mediaChangeDirection.current !== null) {
        handleMediaChange(mediaChangeDirection.current)
        mediaChangeDirection.current = null
      }
      if (mediaChangeValue.current !== null) {
        setCurrentMedia(mediaChangeValue.current)
        // currentMediaId.current = media[mediaChangeValue.current].media.media_id
        mediaChangeValue.current = null
      }
    }, 50)

    return () => clearInterval(checkForSwipe)
  }, [])

  useEffect(() => {
    if (media.length > 0) {
      getTimeSincePosted()
      currentMediaId.current = media[currentMedia].media !== null ? media[currentMedia].media.media_id : media[currentMedia].comment.comment_id
      currentMediaType.current = media[currentMedia].media !== null ? 'media' : 'comment'
      getCommentInformation()
    }
  }, [currentMedia])

  useEffect(() => {
    if (!emojiModalVisible) getDefaultEmojis()
  }, [emojiModalVisible])

  const getTimeSincePosted = () => {
    const timeCreated = media[currentMedia].media !== null ? media[currentMedia].media.created_at : media[currentMedia].comment.created_at
    const timeSince = timeAgo(timeCreated)
    setTimeSincePosted(timeSince)
    setUserAvatar(media[currentMedia].user.avatar_path)
    setUserName(`${media[currentMedia].user.fname} ${media[currentMedia].user.lname}`)
  }

  const getDefaultEmojis = async () => {
    const defaults = await getEmojiHistory()
    setDefaultEmojis(defaults)
  }

  const getCommentInformation = async () => {
    const mediaId = media[currentMedia].media !== null ? media[currentMedia].media.media_id : media[currentMedia].comment.comment_id
    const commentCount = await getCommentCount(mediaId, media[currentMedia].media !== null ? 'media_id' : 'comment_id')
    setCommentCount(commentCount)
  }

  const handleEmojiPress = async (emoji) => {
    setEmojiModalVisible(false)
    setEmojis(prev => [...prev,
      <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />,
      <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />,
    ])
    setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 50)
    setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 100)
    setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 150)
    setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 200)
    setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 250)
    await reactToMedia({
      emoji: emoji,
      media_id: media[currentMedia].media.media_id,
      recipient_id: media[currentMedia].user.id,
      sender_id: userId,
    })
  }

  const handleMediaChange = (event) => {
    if (event === "right") {
      if (currentMediaRef.current > 0) {
        hapticSelect()
        currentMediaRef.current = currentMediaRef.current - 1
        mediaChangeValue.current = currentMediaRef.current
      } else { hapticError() }
    } else {
      if (currentMediaRef.current < mediaCount.current - 1) {
        hapticSelect()
        currentMediaRef.current = currentMediaRef.current + 1
        mediaChangeValue.current = currentMediaRef.current
      } else { hapticError() }
    }
  }

  const toggleSound = async () => {
    hapticSelect()
    setSoundEnabled(!soundEnabled)
    await setLocallyStoredVariable('media_preferences', JSON.stringify({ soundEnabled: !soundEnabled }))
  }

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          pan.setValue({ x: gestureState.dx, y: !isScrollEnabled.current ? gestureState.dy : 0 });
        } else {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }

        if (!isScrollEnabled.current) {
          if (gestureState.dy < -150) {
            // Swiped down
            handleSwipeUp();
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          mediaChangeDirection.current = "right"
        }
        if (gestureState.dx < -50) {
          mediaChangeDirection.current = "left"
        }
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const handleSwipeUp = () => {
    if (!alreadySwiped.current) {
      hapticImpactHeavy()
      alreadySwiped.current = true
      navigation.navigate("CommentPage", {
        media_id: currentMediaId.current,
        media_type: currentMediaType.current
      })
    }
  }

  const translateY = pan.y.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: [-50, 0, 50],
    extrapolate: 'clamp',
  });
  const translateX = pan.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-50, 0, 50],
    extrapolate: 'clamp',
  })

  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(
      Animated.sequence([
        shake,
        Animated.delay(1700), // Wait for 1.7 seconds before the next shake
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [shakeAnimation]);

  const shakeStyle = {
    transform: [
      {
        rotate: shakeAnimation.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-10deg', '10deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, { marginTop: insets.top, marginBottom: insets.bottom === 0 ? 10 : insets.bottom }]} >
        <View style={styles.contentActionBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.goBack()
            }}
            style={styles.actionButton}
          >
            <Icon name="arrow-left" size={22} color={theme.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerText}>{title}</Text>
          <TouchableOpacity
            onPress={() => {
              hapticImpactHeavy()
              const destination = {
                work: location.work,
                book: location.book,
                chapter: location.chapter,
                verse: location.verse
              }
              navigation.navigate("Capture", { location: location })
            }}
            style={styles.actionButton}
          >
            <Animated.View style={shakeStyle}>
              <Icon name="feather-pointed" size={22} color={theme.primaryText} />
            </Animated.View>
          </TouchableOpacity>
        </View>
        {media.length > 1 && (
          <View style={styles.mediaBarList}>
            {media.map((item, index) => (
              <View 
                key={`media-bar-${index}`}
                style={[styles.mediaBar, index === currentMedia && { backgroundColor: theme.mediaUnseen}]} 
              />
            ))}
          </View>
        )}
        {
          media.length > 0 ? (
            <Animated.View
              {...panResponder.panHandlers}
              style={[{transform: [{ translateY }, { translateX }]}, styles.impressionContainer]}
            >
              {media[currentMedia].media !== null ? (
                <>
                  <Media
                    path={media[currentMedia].media.media_path}
                    type={media[currentMedia].media.media_type}
                    style={styles.impression}
                    includeBottomShadow={true}
                    soundEnabled={soundEnabled}
                    declareLoadingState={setLoading}
                  />
                  {
                    media[currentMedia].media.media_type === 'video' && (
                      <TouchableOpacity 
                        activeOpacity={0.7}
                        style={styles.videoSoundContainer}
                        onPress={toggleSound}
                      >
                        <Icon name={soundEnabled ? "volume-high" : 'volume-xmark'} size={16} color={theme.lightestGray} />
                      </TouchableOpacity>
                    )
                  }
                  {
                    media[currentMedia].media.media_type === 'picture' &&
                    <LinearGradient
                      colors={['transparent', hexToRgba(theme.heckaGray, 0.8), theme.heckaGray]}
                      style={{ height: 130, width: '100%', position: 'absolute', bottom: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
                    />
                  }
                </>
              ) : (
                <View style={[styles.impression, styles.commentContainer, { backgroundColor: media[currentMedia].user.color }]}>
                  <ScrollView 
                    style={{ width: '100%', marginBottom: 60, paddingTop: 50 }}
                    onTouchStart={() => isScrollEnabled.current = true}
                    onTouchEnd={() => isScrollEnabled.current = false}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={[
                      styles.comment,
                      { fontSize: getFontSizeOfComment(media[currentMedia].comment.comment) }
                    ]}>{media[currentMedia].comment.comment}</Text>
                    <EmptySpace size={60} />
                  </ScrollView>
                  <LinearGradient
                    colors={[hexToRgba(media[currentMedia].user.color, 1), hexToRgba(media[currentMedia].user.color, 1), hexToRgba(media[currentMedia].user.color, 0)]}
                    style={[styles.gradient, { top: 10 }]}
                  />
                  <LinearGradient
                    colors={[hexToRgba(media[currentMedia].user.color, 0), hexToRgba(media[currentMedia].user.color, 1), hexToRgba(media[currentMedia].user.color, 1)]}
                    style={[styles.gradient, { bottom: 60 }]}
                  />
                </View>
              )}
              {
                media[currentMedia].group && (
                  <View style={styles.impressionGroupContainer}>
                    <Avatar 
                      imagePath={media[currentMedia].group.group_image}
                      type="group"
                      style={styles.groupAvatar}
                    />
                    <Text 
                      style={styles.groupText}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                    >{media[currentMedia].group.group_name}</Text>
                  </View>
                )
              }
              <View style={styles.footerContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View style={styles.authorContent}>
                    <View style={[styles.avatarContainer, { borderColor: media[currentMedia].user.color }]}>
                      <Avatar
                        imagePath={userAvatar}
                        type="profile"
                        style={styles.avatar}
                      />
                    </View>
                    <View style={styles.authorInformation}>
                      <Text style={styles.authorName}>{userName}</Text>
                      <Text style={styles.authorCreatedAt}>posted {timeSincePosted} ago</Text>
                    </View>
                  </View>
                  <View style={styles.reactionBarContainer}>
                    <View style={styles.actionBar}>
                      <View style={styles.action}>
                        <EmojiReaction 
                          emoji={<Text style={{ fontSize: 30 }}>💬</Text>}
                          onPress={handleSwipeUp}
                        />
                        <Text style={styles.actionText}>{commentCount}</Text>
                      </View>
                    </View>
                    <View style={styles.reactionBar}>
                      {defaultEmojis.map((emoji, index) => (
                        <EmojiReaction key={`emoji-button-${index}`} emoji={emoji} size={30} onPress={handleEmojiPress}/>
                      ))}
                      <EmojiReaction
                        emoji={ <Icon name="circle-plus" size={30} color={theme.actionText} /> }
                        onPress={() => {
                          hapticImpactHeavy()
                          setEmojiModalVisible(true) 
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
              {/* {loading && (
                <LoadingOverlay />
              )} */}
            </Animated.View>
          ) : (
            <View style={styles.impression} />
          )
        }
      </View>
      { emojis.map(emoji => emoji) }
      {emojiModalVisible && (
        <EmojiModal
          setEmojiModalVisible={setEmojiModalVisible} 
          emojiOnPress={handleEmojiPress}
        />
      )}
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.secondaryBackground,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 0,
      paddingBottom: 0,
      width: '100%',
    },
    contentActionBar: {
      flexDirection: 'row',
      marginVertical: 10,
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
    footerContainer: {
      width: '100%',
      paddingHorizontal: 10,
      paddingBottom: 10,
      position: 'absolute',
      bottom: 0,
      flexDirection: 'column',
    },
    authorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10
    },
    authorInformation: { marginLeft: 10, },
    authorName: {
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: theme.lightestGray,
    },
    authorCreatedAt: {
      fontSize: 13,
      fontFamily: 'nunito-bold',
      color: theme.lightGray,
    },
    impressionContainer: {
      width: '100%',
      flex: 1,
    },
    impression: {
      width: '100%',
      flex: 1,
      backgroundColor: theme.primaryBackground,
      borderRadius: 40,
    },
    reactionBarContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    reactionBar: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: hexToRgba(theme.primaryBackground, 0.8),
      borderRadius: 40,
    },
    actionBar: { marginVertical: 10, },
    action: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'nunito-bold',
      color: '#fff',
      marginTop: -8
    },
    mediaBarList: {
      width: '100%',
      height: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 10,
      paddingHorizontal: 10,
    },
    mediaBar: {
      flex: 1,
      height: 5,
      borderRadius: 5,
      marginHorizontal: 2,
      backgroundColor: theme.mediaSeen,
    },
    impressionGroupContainer: {
      padding: 7,
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: hexToRgba(theme.heckaGray, 0.5),
      borderRadius: 50,
    },
    groupAvatar: {
      width: 30,
      height: 30,
      borderRadius: 30,
    },
    groupText: {
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: '#fff',
      marginLeft: 10,
      marginRight: 5,
    },
    videoSoundContainer: {
      height: 40,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 15,
      right: 20,
      padding: 10,
      backgroundColor: hexToRgba(theme.heckaGray, 0.5),
      borderRadius: 50,
    },
    avatarContainer: {
      width: 55,
      height: 55,
      padding: 2,
      borderRadius: 55,
      borderWidth: 3,
      borderColor: theme.primaryBorder
    },
    avatar: {
      flex: 1,
      borderRadius: 55,
    },
    commentContainer: {
      width: '100%',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    comment: {
      color: "#fff",
      fontFamily: 'nunito-bold',
    },
    gradient: {
      position: 'absolute', 
      width: '100%', 
      height: 60
    }
  })
}