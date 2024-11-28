import { useState, useEffect } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native'

import SimpleHeader from '../components/SimpleHeader'
import { getChaptersFromBook } from '../utils/read'

export default function Chapters({ navigation, route}) {
  const { work, book } = route.params
  const [chapters, setChapters] = useState([])

  useEffect(() => {
    const collectChapters = async () => {
      try {
        const { chapters: chapterArray } = await getChaptersFromBook(work, book)
        setChapters(chapterArray)
      } catch (error) {
        console.log(error)
      }
    }
    collectChapters()
  }, [])

  return (
    <View style={styles.container}>
      <SimpleHeader
        title={book}
        navigation={navigation}
      />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.chaptersContainer}>
          {chapters.map((chapter, index) => {
            return (
              <TouchableOpacity
                style={{
                  width: 65,
                  padding: 10,
                  alignSelf: 'flex-start',
                }}
                key={`chapter-${index}`}
                onPress={() => {
                  navigation.navigate('Chapter', {
                    work: work,
                    book: book,
                    chapter: chapter,
                  })
                }}
              >
                <Text style={styles.chapter} >{chapter}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  chaptersContainer: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  chapter: {
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'nunito-bold',
    color: '#222',
  }
})