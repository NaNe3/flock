import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { getMediaFromChapter, getMediaFromVerse } from "../../utils/authenticate"
import { gen } from "../../utils/styling/colors"

import Avatar from "../../components/Avatar"
import Media from "../../components/Media"
import { LinearGradient } from 'expo-linear-gradient';
import timeAgo from "../../utils/timeDiff"

const Slider = ({ 
  navigation, 
  onPress = () => null,
  children = null,
  style = null
}) => {
  return (
    <TouchableOpacity 
      style={[styles.slide, style]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  )
}

export default function ExperienceSlider({ 
  navigation, 
  canAddExperience = false,
  location 
}) {
  const { work, book, chapter, verse } = location
  const [media, setMedia] = useState([])

  useEffect(() => {
    const getMedia = async () => {
      if (verse === undefined) {
        const media = await getMediaFromChapter(work, book, chapter)
        setMedia(media)
      } else {
        const media = await getMediaFromVerse(work, book, chapter, verse)
        setMedia(media)
      }
    }
    getMedia()
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.containerStyle}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {
          canAddExperience && (
            <Slider 
              navigation={navigation} 
              onPress={() => {
                console.log("GOIN GTO CAPTURE")
                navigation.navigate('Capture', location)
              }}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="plus" size={25} color={gen.gray} />
            </Slider>
          )
        }
        {
          media && media.map((item, index) => {
            const { media_type, media_id, media_path, created_at } = item.media
            const { user_id, avatar_path } = item.user
            const { verse: mediaVerse } = item

            const timePassed = timeAgo(created_at)

            return (
              <Slider key={`media-${media_id}`} >
                <View style={styles.mediaContent} >
                  <Media path={media_path} type={media_type} style={{ flex: 1 }} />
                  <View style={styles.blur}>
                    <Icon name="play" size={20} color={gen.tertiaryText} style={styles.slideIcon}/>
                  </View>
                  <Text style={styles.postedTimeText}>{timePassed}</Text>
                  <View style={styles.avatarContainer}>
                    <View style={{ flex: 1, borderRadius: 15, overflow: 'hidden'}}>
                      <Avatar 
                        imagePath={avatar_path} 
                        type="profile"
                        style={{ flex: 1 }}
                      />
                    </View>
                  </View>
                </View>
              </Slider>
            )
          })
        }
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 160,
    backgroundColor: gen.primaryBackground,
    marginBottom: 20,
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    width: 100,
    height: 140,
    marginLeft: 10,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: gen.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width: 100,
    height: 140,
    marginLeft: 10,
    borderRadius: 15,
    borderWidth: 4,
    padding: 4,
    borderColor: gen.primaryBorder,
  },
  mediaContent: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  blur: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  mediaVerseText: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    fontSize: 12,
    color: gen.tertiaryText
  },
  postedTimeText: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    fontSize: 11,
    color: gen.tertiaryText
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 25,
    height: 25,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: gen.primaryBorder,
    padding: 2,
    overflow: 'hidden',
  },
})