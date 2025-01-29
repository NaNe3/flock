import { useEffect, useRef, useState } from "react"
import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'

import { gen } from "../../utils/styling/colors"
import { getColorLight, getPrimaryColor } from "../../utils/getColorVariety"
import { MessageInput } from "./MessageInput"
import EmptySpace from "../../components/EmptySpace"
import { hapticImpactSoft, hapticSelect } from "../../utils/haptics"
import { getUserIdFromLocalStorage } from "../../utils/localStorage"
import { publishMainComment } from "../../utils/db-comment"
import { LinearGradient } from "expo-linear-gradient"
import hexToRgba from "../../utils/hexToRgba"

export function WriteMessage({ navigation, location }) {
  const [color, setColor] = useState(gen.gray)
  const [userId, setUserId] = useState(null)
  const [colorLight, setColorLight] = useState(gen.grayLight)
  const [comment, setComment] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [ isPublishing, setIsPublishing ] = useState(false)
  const scrollRef = useRef()
  
  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      const colorLight = getColorLight(color)
      setColor(color)
      setColorLight(colorLight)

      const userId = await getUserIdFromLocalStorage()
      setUserId(userId)
    }
    init()
  }, [])

  useEffect(() => {
    setWordCount(comment.length === 0 ? 0 : comment.split(' ').length)
  }, [comment])

  const handleCommentPublish = async () => {
    // comment, color_scheme, group_id, user_id, location
    setIsPublishing(true)
    await publishMainComment({
      comment: comment,
      color_scheme: 0,
      user_id: userId,
      group_id: null,
      location: location
    })

    setIsPublishing(false)
    navigation.goBack()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: color }]}>
        <ScrollView 
          ref={scrollRef}
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <MessageInput
            navigation={navigation} 
            comment={comment}
            setComment={setComment}
            scrollToBottom={() => {
              scrollRef.current.scrollToEnd({ animated: false })
            }}
            // customColor={color}
          />
          <EmptySpace size={400} />
        </ScrollView>
        <LinearGradient
          colors={[hexToRgba(color, 1), hexToRgba(color, 1), hexToRgba(color, 0)]}
          style={[styles.gradient, { top: 0 }]}
        />
        <LinearGradient
          colors={[hexToRgba(color, 0), hexToRgba(color, 1), hexToRgba(color, 1)]}
          style={[styles.gradient, { bottom: 0 }]}
        />
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.exitButton}
            activeOpacity={!isPublishing ? 0.7 : 1}
            onPress={() => {
              if (isPublishing) return
              hapticSelect()
              navigation.goBack()
            }}
          >
            <Icon name="xmark" size={30} color={ isPublishing ? '#bbb': '#fff'} />
          </TouchableOpacity>
          { wordCount != 0 && <Text style={styles.wordCount}>{wordCount} / 150</Text> }
          {/* <Text style={styles.wordCount}>{wordCount} words</Text> */}
        </View>
        <TouchableOpacity
          activeOpacity={!isPublishing ? comment.length > 1 ? 0.7 : 0.5 : 0.5}
          style={[styles.publishButton, { backgroundColor: colorLight, opacity: isPublishing || comment.length === 0 ? 0.5 : 1 }]}
          onPress={() => {
            console.log(comment.length)
            if (isPublishing || comment.length === 0) return
            hapticImpactSoft()
            handleCommentPublish()
          }}
        >
          <Text style={[styles.publishText, { color }]}>
            <Icon name="feather-pointed" size={18} color={color} /> publish
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  contentContainer: {
    height: '100%',
    paddingHorizontal: 30,
    paddingTop: 150,
  },
  topBar: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: 20,
    paddingLeft: 20,
    paddingRight: 30,
    flexDirection: 'row',
  },
  exitButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: '#fff',
  },
  publishButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
  },
  gradient: {
    position: 'absolute', 
    width: '100%', 
    height: 100
  }
})