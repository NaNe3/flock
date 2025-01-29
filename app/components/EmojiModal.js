import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Dimensions } from "react-native";
import { getEmojis } from "unicode-emoji"

import { gen } from "../utils/styling/colors";
import BasicBottomSheet from "../home/components/BasicBottomSheet";
import hexToRgba from "../utils/hexToRgba";
import EmojiReaction from "./EmojiReaction";
import { LinearGradient } from "expo-linear-gradient";

const height = Dimensions.get('window').height

export default function EmojiModal({ setEmojiModalVisible, emojiOnPress }) {
  const [allEmojis, setAllEmojis] = useState([])
  const [displayedEmojis, setDisplayedEmojis] = useState([])
  const pageSize = 48
  
  // useEffect(() => {
  //   const emojis = getEmojis()
  //   setAllEmojis(emojis)

  //   setDisplayedEmojis(emojis.slice(0, pageSize))
  // }, [])

  const props = {
    onPress: emojiOnPress,
    size: 40,
  }

  return (
    <BasicBottomSheet
      backgroundColor={gen.primaryBackground}
      handleStyle={styles.handleStyle}
      setVisibility={setEmojiModalVisible}
      height={400}
    >
      <View style={styles.container}>
        <ScrollView style={styles.contentContainer}>
          <View style={styles.row}>
            <Text style={styles.rowHeader}>frequently used</Text>
            <View style={styles.rowContent}>
              <EmojiReaction emoji={'🔥'} {...props} />
              <EmojiReaction emoji={'😇'} {...props} />
              <EmojiReaction emoji={'🎉'} {...props} />
              <EmojiReaction emoji={'💛'} {...props} />
              <EmojiReaction emoji={'🙏'} {...props} />
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowHeader}>popular</Text>
            <View style={styles.rowContent}>
              <EmojiReaction emoji={'❤️'} {...props} />
              <EmojiReaction emoji={'💙'} {...props} />
              <EmojiReaction emoji={'💚'} {...props} />
              <EmojiReaction emoji={'🧡'} {...props} />
              <EmojiReaction emoji={'💜'} {...props} />
              <EmojiReaction emoji={'🤎'} {...props} />
              <EmojiReaction emoji={'🤍'} {...props} />
              <EmojiReaction emoji={'🖤'} {...props} />
              <EmojiReaction emoji={'💘'} {...props} />
              <EmojiReaction emoji={'💝'} {...props} />
              <EmojiReaction emoji={'💓'} {...props} />
              <EmojiReaction emoji={'💖'} {...props} />
              <EmojiReaction emoji={'✨'} {...props} />
              <EmojiReaction emoji={'💫'} {...props} />
              <EmojiReaction emoji={'⭐'} {...props} />
              <EmojiReaction emoji={'✅'} {...props} />
              <EmojiReaction emoji={'👀'} {...props} />
              <EmojiReaction emoji={'💪'} {...props} />
            </View>
          </View>
          {/* <View style={[styles.row, { marginBottom: -200 }]}>
            <Text style={styles.rowHeader}>all</Text>
            <View style={styles.rowContent}>
              {displayedEmojis.map((emoji, index) => (
                <EmojiReaction key={index} emoji={emoji.emoji} size={40} />
              ))}
            </View>
          </View>
          <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 230 }}>
            <LinearGradient
              colors={['transparent', 
                hexToRgba(gen.heckaGray, 0.85), 
                hexToRgba(gen.heckaGray, 0.90), 
                hexToRgba(gen.heckaGray, 0.98), 
                gen.heckaGray]}
              style={styles.gradient}
            />
          </View> */}
        </ScrollView>
      </View>
    </BasicBottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  handleStyle: {
    height: 50,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: hexToRgba(gen.primaryBackground, 0.95),
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  rowHeader: {
    fontFamily: 'nunito-bold',
    fontSize: 18,
    color: gen.secondaryText,
    marginBottom: 10,
  },
  rowContent: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gradient: {
    height: 430,
    marginBottom: -200,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40
  }
})