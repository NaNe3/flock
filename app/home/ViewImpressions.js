import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Touchable, PanResponder, Dimensions } from "react-native"
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from 'react-native-vector-icons/FontAwesome6'
import { LinearGradient } from 'expo-linear-gradient';

import { gen } from "../utils/styling/colors"
import hexToRgba from "../utils/hexToRgba"
import { getMediaFromVerse } from "../utils/authenticate"
import Media from "../components/Media"
import Avatar from "../components/Avatar"
import { hapticError, hapticSelect } from "../utils/haptics"
import { timeAgo } from "../utils/timeDiff"
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from "../utils/localStorage"
import { getLocalUriForFile } from "../utils/db-download";
import EmojiBurst from "../components/EmojiBurst";
import { reactToMedia } from "../utils/db-media";
import CommentBar from "../components/CommentBar";
import FAIcon from "../components/FAIcon";

const screenWidth = Dimensions.get('window').width;

export default function ViewImpressions({ navigation, route }) {
  const { work, book, chapter, verse } = route.params
  const insets = useSafeAreaInsets()
  const [emojis, setEmojis] = useState([])

  const [userId, setUserId] = useState(null)
  const [media, setMedia] = useState([])
  const [currentMedia, setCurrentMedia] = useState(0)
  const [preferences, setPreferences] = useState({})
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timeSincePosted, setTimeSincePosted] = useState('')
  const [userAvatar, setUserAvatar] = useState('')
  const [userName, setUserName] = useState('')

  const [initialTouchX, setInitialTouchX] = useState(null)

  useFocusEffect(
    useCallback(() => {
      const getImpressions = async () => {
        const userId = await getUserIdFromLocalStorage()
        const media = await getMediaFromVerse(work, book, chapter, verse, userId)
        setUserId(userId)
        setMedia(media)

        if (media.length > 0) {
          const timeSince = timeAgo(media[currentMedia].media.created_at)
          setTimeSincePosted(timeSince)
          setUserAvatar(media[currentMedia].user.avatar_path)
          setUserName(`${media[currentMedia].user.fname} ${media[currentMedia].user.lname}`)
        }
      }

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
  }, [])

  useEffect(() => {
    if (media.length > 0) {
      console.log(media[currentMedia])
      const timeSince = timeAgo(media[currentMedia].media.created_at)
      setTimeSincePosted(timeSince)
      setUserAvatar(media[currentMedia].user.avatar_path)
      setUserName(`${media[currentMedia].user.fname} ${media[currentMedia].user.lname}`)
    }
  }, [currentMedia])

  const handleMediaChange = (event) => {
    const touchX = event.nativeEvent.locationX;
    if (touchX < screenWidth / 2) {
      // LEFT
      if (currentMedia > 0){
        hapticSelect()
        setCurrentMedia(currentMedia - 1)
      } else {
        hapticError()
      }
    } else {
      // RIGHT
      if (currentMedia < media.length - 1) {
        hapticSelect()
        setCurrentMedia(currentMedia + 1)
      } else {
        hapticError()
      }
    }
  }

  const handlePressIn = (event) => {
    setInitialTouchX(event.nativeEvent.locationX);
  }

  const handlePressOut = (event) => {
    const finalTouchX = event.nativeEvent.locationX;
    if (initialTouchX !== null && Math.abs(finalTouchX - initialTouchX) > 10) {
      console.log('Dragged');
    } else if (event) {
      handleMediaChange(event)
    }
    setInitialTouchX(null);
  }

  const toggleSound = async () => {
    hapticSelect()
    setSoundEnabled(!soundEnabled)
    await setLocallyStoredVariable('media_preferences', JSON.stringify({ soundEnabled: !soundEnabled }))
  }

  return (
    <View style={styles.container}>
      <View style={[styles.contentContainer, { marginTop: insets.top, marginBottom: insets.bottom }]} >
        <View style={styles.contentActionBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticSelect()
              navigation.goBack()
            }}
            style={styles.actionButton}
          >
            <Icon name="arrow-left" size={22} color={gen.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerText}>{book} {chapter}:{verse}</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Capture", {work, book, chapter, verse})
            }}
            style={styles.actionButton}
          >
            <Icon name="camera" size={22} color={gen.primaryText} />
          </TouchableOpacity>
        </View>
        {media.length > 1 && (
          <View style={styles.mediaBarList}>
            {media.map((item, index) => (
              <View 
                key={`media-bar-${index}`}
                style={[styles.mediaBar, index === currentMedia && { backgroundColor: gen.mediaUnseen}]} 
              />
            ))}
          </View>
        )}
        {
          media.length > 0 ? (
            <View style={styles.impressionContainer}>
              <Media
                path={media[currentMedia].media.media_path}
                type={media[currentMedia].media.media_type}
                style={styles.impression}
                includeBottomShadow={true}
                soundEnabled={soundEnabled}
              />
              {
                media[currentMedia].media.media_type === 'picture' &&
                <LinearGradient
                  colors={['transparent', hexToRgba(gen.heckaGray, 0.8), gen.heckaGray]}
                  style={{ height: 130, width: '100%', position: 'absolute', bottom: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
                />
              }
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
              {
                media[currentMedia].media.media_type === 'video' && (
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    style={styles.videoSoundContainer}
                    onPress={toggleSound}
                  >
                    <Icon name={soundEnabled ? "volume-high" : 'volume-xmark'} size={16} color={gen.lightestGray} />
                  </TouchableOpacity>
                )
              }
              <View style={styles.footerContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <View style={styles.reactionBar}>
                      <EmojiReaction emoji="💛" setEmojis={setEmojis} media_id={media[currentMedia].media.media_id} recipient_id={media[currentMedia].user.id} sender_id={userId} />
                      <EmojiReaction emoji="🔥" setEmojis={setEmojis} media_id={media[currentMedia].media.media_id} recipient_id={media[currentMedia].user.id} sender_id={userId} />
                      <EmojiReaction emoji={
                        <Icon name="circle-plus" size={30} color={gen.secondaryText} />
                      } />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.impression} />
          )
        }
      </View>
      { emojis.map(emoji => emoji) }
    </View>
  )
}

const EmojiReaction = ({ emoji, setEmojis, ...props }) => {
  const scaleValue = useRef(new Animated.Value(1)).current
  const isEmoji = typeof emoji === 'string'

  const handlePressIn = async () => {
    hapticSelect()
    Animated.spring(scaleValue, {
      toValue: 0.8,
      duration: 100,
      useNativeDriver: true,
    }).start()
    setTimeout(() => {
      Animated.spring(scaleValue, {
        toValue: 1, // Return to original size
        duration: 100,  
        useNativeDriver: true,
      }).start()
    }, 100)
    if (isEmoji) {
      setEmojis(prev => [...prev, 
        <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />,
        <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />,
      ])
      setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 50)
      setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 100)
      setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 150)
      setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 200)
      setTimeout(() => { setEmojis(prev => [...prev, <EmojiBurst key={`emoji-burst-${Math.random()}`} emoji={emoji} callback={() => setEmojis(prev => prev.slice(1))} />, ]) }, 250)

      const { media_id, sender_id, recipient_id } = props
      await reactToMedia({
        emoji: emoji,
        media_id: media_id,
        sender_id: sender_id,
        recipient_id: recipient_id
      })
    }
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        activeOpacity={0.7}
        // onPressIn={handlePressIn}
        // onPressOut={handlePressOut}
        onPress={handlePressIn}
      >
        <Text style={[styles.emoji, !isEmoji && { marginLeft: 12 }]}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gen.secondaryBackground,
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
    color: gen.primaryText,
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
    color: gen.lightestGray,
  },
  authorCreatedAt: {
    fontSize: 13,
    fontFamily: 'nunito-bold',
    color: gen.lightGray,
  },
  impressionContainer: {
    width: '100%',
    flex: 1,
  },
  impression: {
    width: '100%',
    flex: 1,
    backgroundColor: gen.primaryBackground,
    borderRadius: 40,
  },
  reactionBarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBar: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hexToRgba(gen.primaryBackground, 0.8),
    borderRadius: 40,
  },
  emoji: {
    fontSize: 30,
    marginHorizontal: 2,
    opacity: 1,
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
    backgroundColor: gen.mediaSeen,
  },
  impressionGroupContainer: {
    padding: 7,
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: hexToRgba(gen.heckaGray, 0.5),
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
    backgroundColor: hexToRgba(gen.heckaGray, 0.5),
    borderRadius: 50,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    padding: 2,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: gen.primaryBorder
  },
  avatar: {
    flex: 1,
    borderRadius: 55,
  },
  comment: {
    fontSize: 18,
    color: gen.tertiaryText,
    fontFamily: 'nunito-bold',
  }
})