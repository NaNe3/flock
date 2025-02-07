import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { offered, offeredColors } from '../utils/read'
import { hapticSelect } from '../utils/haptics'

import { useTheme } from '../hooks/ThemeProvider';

const WorkShelf = ({ navigation }) => {
  const { theme }= useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

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
                    <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, marginLeft: 20, color: theme.gray }}>King James Version</Text>
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
          <Icon name='plus' size={18} color={theme.actionText} /> ADD
        </Text>
      </TouchableOpacity> */}
    </View>
  )
}

export default function LibraryPage({ navigation }) {
  const [query, setQuery] = useState('')
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

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

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.primaryBackground,
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
      backgroundColor: theme.navy,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookName: {
      fontSize: 8,
      fontFamily: 'nunito-bold',
      color: theme.primaryColor,
    },
    addBookButton: {
      width: '100%',
      marginTop: 20,
      borderRadius: 20,
      borderColor: theme.primaryBorder,
      borderWidth: 5,
    },
    addButtonText: {
      fontFamily: 'nunito-bold', 
      fontSize: 18, 
      color: theme.actionText,
      textAlign: 'center',
      alignItems: 'center',
      paddingVertical: 20 
    },
    bookHeader: {
      color: theme.primaryText,
      fontFamily: 'nunito-bold', 
      fontSize: 22, 
      marginLeft: 20 
    },
  })
}