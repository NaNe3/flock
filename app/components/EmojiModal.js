import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text, Dimensions } from "react-native";
// import { getEmojis } from "unicode-emoji"

import BasicBottomSheet from "../home/components/BasicBottomSheet";
import hexToRgba from "../utils/hexToRgba";
import EmojiReaction from "./EmojiReaction";
import { useTheme } from "../hooks/ThemeProvider";

export default function EmojiModal({ setEmojiModalVisible, emojiOnPress }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  // const [allEmojis, setAllEmojis] = useState([])
  // const [displayedEmojis, setDisplayedEmojis] = useState([])
  // const pageSize = 48
  
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
      backgroundColor={theme.primaryBackground}
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
                hexToRgba(theme.heckaGray, 0.85), 
                hexToRgba(theme.heckaGray, 0.90), 
                hexToRgba(theme.heckaGray, 0.98), 
                theme.heckaGray]}
              style={styles.gradient}
            />
          </View> */}
        </ScrollView>
      </View>
    </BasicBottomSheet>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      overflow: 'hidden',
    },
    handleStyle: {
      height: 50,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      backgroundColor: hexToRgba(theme.primaryBackground, 0.95),
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
      color: theme.secondaryText,
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
}