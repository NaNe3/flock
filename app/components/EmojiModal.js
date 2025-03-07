import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Dimensions, Animated } from "react-native"
import { FlashList } from '@shopify/flash-list';
import { getEmojis } from "unicode-emoji"

import EmojiReaction from "./EmojiReaction";
import { useTheme } from "../hooks/ThemeProvider";
import SearchBar from "../home/components/SearchBar";

const screenHeight = Dimensions.get('screen').height

export default function EmojiModal({ emojiOnPress }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [allEmojis, setAllEmojis] = useState([])
  const [displayedEmojis, setDisplayedEmojis] = useState([])
  const [query, setQuery] = useState('')

  const modalHeight = screenHeight * 0.7

  useEffect(() => {
    const emojis = getEmojis()
    setAllEmojis(emojis)

    setDisplayedEmojis(emojis)
  }, [])

  useEffect(() => {
    if (allEmojis.length === 0) return
    if (!query) {
      setDisplayedEmojis(allEmojis)
      return
    }

    const filteredEmojis = allEmojis.filter(emoji => {
      return emoji.keywords.some(keyword =>
        keyword.toLowerCase().includes(query.toLowerCase())
      )
    })

    setDisplayedEmojis(filteredEmojis)
  }, [query])

  const props = {
    onPress: emojiOnPress,
    size: 40,
  }

  return (
    <View style={[styles.container, { height: modalHeight }]}>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search emojis"
          query={query}
          setQuery={setQuery}
        />
      </View>
      <FlashList
        data={displayedEmojis}
        renderItem={({ item }) => (
          <View style={styles.emojiContainer}>
            <EmojiReaction emoji={item.emoji} {...props} />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        estimatedItemSize={2000}
        numColumns={5}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      overflow: 'hidden',
    },
    contentContainer: {
      width: '100%',
      height: '100%',
    },
    searchContainer: {
      height: 60,
      paddingHorizontal: 10,
      paddingBottom: 10,
    
      borderBottomWidth: 1,
      borderBottomColor: theme.primaryBorder
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
    },
    emojiContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }
  })
}