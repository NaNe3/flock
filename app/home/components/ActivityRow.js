import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../hooks/ThemeProvider";
import { useEffect, useState } from "react";
import { getVerseByLocation } from "../../utils/read";
import FadeInView from "../../components/FadeInView";

export default function ActivityRow({ activity }) {
  const { work, book, chapter, verse } = activity
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [title, setTitle] = useState(`${book} ${chapter}:${verse}`)
  const [content, setContent] = useState('')

  const init = async () => {
    const location = {
      work: work,
      book: book,
      chapter: chapter,
      verse: activity.verse,
    }
  
    const verse = await getVerseByLocation(location)
    setContent(verse)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      {
        content !== '' && (
          <FadeInView style={styles.container}>
            <View style={[styles.border, { borderColor: activity.user.color }]} />
            <View style={styles.contentContainer}>

              <Text style={styles.activityTitle}>{title}</Text>
              <Text style={styles.activityContent}>{content}</Text>
            </View>
          </FadeInView>
        )
      }
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      marginBottom: 15
    },
    contentContainer: {
      paddingVertical: 5,
    },
    border: {
      width: 3,
      borderWidth: 3,
      borderRadius: 10,
      marginRight: 10,
    },
    activityTitle: {
      fontSize: 20,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
      marginBottom: 0
    },
    activityContent: {
      fontSize: 17,
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
    },
  })
}