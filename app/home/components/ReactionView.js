import { useEffect, useState } from "react"
import { useTheme } from "../../hooks/ThemeProvider"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

import hexToRgba from "../../utils/hexToRgba"
import Avatar from "../../components/Avatar"
import FadeInView from "../../components/FadeInView"

export default function ReactionView({ reactions, count, onPress }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  const [displayedReactions, setDisplayedReactions] = useState([])
  useEffect(() => { setStyles(style(theme)) }, [theme])

  useEffect(() => {
    // const disposable = [...reactions]
    // setDisplayedReactions(disposable.reverse().slice(0, 3))
    setDisplayedReactions([reactions[reactions.length-1]])
  }, [reactions])

  return (
    <FadeInView
      time={100}
      style={styles.container}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.avatars}
      >
        {displayedReactions.map((reaction, index) => {
          return (
            <View style={styles.avatarContainer} key={index}>
              <Avatar
                imagePath={reaction.user.avatar_path}
                type="profile"
                style={styles.avatar}
              />
              <Text style={styles.emoji}>{reaction.emoji}</Text>
              {(index === displayedReactions.length-1 && count > 1) && (
                <View style={styles.shadow} />
              )}
              {(index === displayedReactions.length-1 && count > 1) && (
                <Text style={styles.count}>{count}</Text>
              )}
            </View>
          )
        })}
      </TouchableOpacity>
    </FadeInView>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      // backgroundColor: hexToRgba(theme.primaryBackground, 0.7),
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 3,
    },
    avatars: {
      flexDirection: "row",
      padding: 5,
    },
    avatarContainer: {
      width: 38,
      height: 38,
      backgroundColor: theme.primaryBackground,
      borderRadius: 20,
      overflow: "hidden",
    },
    avatar: {
      borderRadius: 20,
      flex: 1
    },
    emoji: {
      position: "absolute",
      color: theme.primaryText,
      fontFamily: 'nunito-bold',
      fontSize: 14,
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: 'center',
      textAlignVertical: 'center', // Android only
    },
    count: {
      position: "absolute",
      color: '#fff',
      fontFamily: 'nunito-bold',
      fontSize: 14,
      top: 10,
      left: 0,
      right: 0,
      bottom: 0,
      textAlign: 'center',
      textAlignVertical: 'center', // Android only
    },
    shadow: {
      width: '100%',
      height: '100%',
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: `rgba(0, 0, 0, 0.5)`,
    }
  })
}