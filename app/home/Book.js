import { useEffect, useState } from "react"
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native"

import SimpleHeader from "../components/SimpleHeader"
import FadeInView from "../components/FadeInView"

import { getBooksFromWork, getChaptersFromBook } from "../utils/read"
import { hapticSelect } from "../utils/haptics"
import { useTheme } from "../hooks/ThemeProvider"

export default function Book({ navigation, route }) {
  const { work } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [booksInWork, setBooksInWork] = useState([])
  useEffect(() => {
    const { books } = getBooksFromWork(work)
    setBooksInWork(books)
  }, [])

  return (
    <View style={styles.container}>
      <SimpleHeader
        title={work}
        navigation={navigation}
      />
      <ScrollView style={styles.contentContainer}>
        <FadeInView style={{ flex: 1, paddingHorizontal: 45 }}>
          {
            booksInWork.map((book, index) => {
              return (
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={styles.bookRow}
                  onPress={() => {
                    hapticSelect()
                    navigation.navigate('Chapters', {
                      work: work,
                      book: book,
                    })
                  }}
                  key={`book-${index}`}
                >
                  <Text style={styles.bookText}>{book}</Text>
                </TouchableOpacity>
              )
            })
          }
        </FadeInView>
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    contentContainer: {
      flex: 1,
      paddingVertical: 20,
    },
    bookRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    bookText: {
      fontFamily: 'nunito-bold', 
      fontSize: 20, 
      textAlign: 'center',
      color: theme.primaryText
    }
  });
}