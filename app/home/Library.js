import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import { getChaptersFromBook } from '../utils/read';
import { useNavigation } from '@react-navigation/native';
import { hapticSelect } from '../utils/haptics';

const createNumberArray = (num) => {
  const arrayOfChapters = Array.from({ length: num }, (_, i) => i + 1);
  console.log(arrayOfChapters)
  return arrayOfChapters
};

export default function Library({ navigation }) {
  const [sectionHeader, setSectionHeader] = useState('BOOK OF MORMON')
  const [currentSection, setCurrentSection] = useState('books')
  const [chapters, setChapters] = useState([])
  const books = ["1 Nephi", "2 Nephi", "Jacob", "Enos", "Jarom", "Omni", "Words of Mormon", "Mosiah", "Alma", "Helaman", "3 Nephi", "4 Nephi", "Mormon", "Ether", "Moroni"]

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderContainer}>
        <TouchableOpacity
          onPress={() => {
            if (currentSection === 'chapters') {
              hapticSelect()
              setCurrentSection('books')
              setSectionHeader('BOOK OF MORMON')
            }
          }}
        >
          <Text style={styles.sectionHeader}>{sectionHeader}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <View style={styles.libraryContent}>
          {currentSection === 'books' && books.map((book, index) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  hapticSelect()
                  setSectionHeader(book)
                  setChapters(createNumberArray(getChaptersFromBook(book)))
                  setCurrentSection('chapters')
                }}
                key={`book-${index}`}
              >
                <Text style={styles.book}>{book}</Text>
              </TouchableOpacity>
            )
          })}
          {currentSection === 'chapters' && 
            <View style={styles.chaptersContainer}>
              {chapters.map((chapter, index) => {
                return (
                  <TouchableOpacity
                    style={{
                      width: 60,
                      padding: 10,
                      alignSelf: 'flex-start',
                    }}
                    key={`chapter-${index}`}
                    onPress={() => {
                      hapticSelect()
                      navigation.navigate('Chapter', {
                        book: sectionHeader,
                        chapter: chapter,
                      })
                    }}
                  >
                    <Text style={styles.chapter} >{chapter}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          }
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  sectionHeaderContainer: {
    width: '100%',
    height: 110,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: 65,
    color: '#000',
  },
  libraryContent: {
    width: '85%',
    paddingTop: 30,
  },
  book: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: '#222',
    padding: 10,
  },
  chaptersContainer: {
    width: '100%',
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