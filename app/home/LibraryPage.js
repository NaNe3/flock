import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { offered, offeredColors } from '../utils/read'
import { hapticSelect } from '../utils/haptics'
import { gen } from '../utils/styling/colors';

import InteractiveHeaderBar from '../components/InteractiveHeaderBar';
import SearchBar from './components/SearchBar';

const WorkShelf = ({ navigation }) => {
  return (
    <View style={styles.libraryContent}>
      {
        offered.map((book, index) => {
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.bookRow}
              onPress={() => {
                hapticSelect()
                if (book === 'Doctrine And Covenants') {
                  navigation.navigate('Chapters', {
                    work: book,
                    book: book,
                  })
                } else {
                  navigation.navigate('Book', { work: book })
                }
              }}
              key={`work-${index}`}
            >
              <View style={[styles.book, { backgroundColor: offeredColors[book].background}]}>
                {
                  book.split(' ').map((word, index) => {
                    return (
                      <Text key={`word-${index}`} style={[styles.bookName, { color: offeredColors[book].text }]}>{word}</Text>
                    )
                  })
                }
              </View>
              <View style={{ flex: 1 }}>
                <Text 
                  style={styles.bookHeader}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >{book}</Text>
                {
                  (book == 'Old Testament' || book == 'New Testament') && (
                    <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, marginLeft: 20, color: gen.gray }}>King James Version</Text>
                  )
                }
              </View>
            </TouchableOpacity>
          )
        })
      }
      {/* <TouchableOpacity 
        style={styles.addBookButton}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>
          <Icon name='plus' size={18} color={gen.actionText} /> ADD
        </Text>
      </TouchableOpacity> */}
    </View>
  )
}

export default function LibraryPage({ navigation }) {
  const [query, setQuery] = useState('')

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.contentContainer}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {/* <View style={styles.searchBarContainer}>
          <SearchBar 
            placeholder="Ain't the gospel cool?"
            query={query}
            setQuery={setQuery}
          />
        </View> */}
        <WorkShelf navigation={navigation} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: gen.primaryBackground,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%', 
    paddingTop: 5,
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    width: '100%',
    height: 50, 
    flexDirection: 'row',
    marginBottom: 10 
  },
  libraryContent: {
    paddingTop: 10,
    flex: 1,
    width: '100%',
    flexDirection: 'column',
  },
  bookRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  book: {
    width: 60,
    height: 70,
    borderRadius: 10,
    backgroundColor: gen.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookName: {
    fontSize: 8,
    fontFamily: 'nunito-bold',
    color: gen.primaryColor,
  },
  addBookButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 20,
    borderColor: gen.primaryBorder,
    borderWidth: 5,
  },
  addButtonText: {
    fontFamily: 'nunito-bold', 
    fontSize: 18, 
    color: gen.actionText,
    textAlign: 'center',
    alignItems: 'center',
    paddingVertical: 20 
  },
  bookHeader: {
    color: gen.primaryText,
    fontFamily: 'nunito-bold', 
    fontSize: 22, 
    marginLeft: 20 
  },
})