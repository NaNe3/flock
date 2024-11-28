import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { offered, offeredColors } from '../utils/read'
import { hapticSelect } from '../utils/haptics'
import { gen } from '../utils/styling/colors';

import InteractiveHeaderBar from '../components/InteractiveHeaderBar';

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
                  style={{ fontFamily: 'nunito-bold', fontSize: 22, marginLeft: 20 }}
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
      <TouchableOpacity 
        style={styles.addBookButton}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>
          <Icon name='plus' size={18} color={gen.darkGray} /> ADD
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function LibraryPage({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ width: '100%', paddingTop: 0 }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <WorkShelf navigation={navigation} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
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
    paddingTop: 30,
    paddingHorizontal: 20,
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
    color: gen.orange,
  },
  addBookButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 20,
    borderColor: gen.lightGray,
    borderWidth: 5,
  },
  addButtonText: {
    fontFamily: 'nunito-bold', 
    fontSize: 18, 
    color: gen.darkGray,
    textAlign: 'center',
    alignItems: 'center',
    paddingVertical: 20 
  },
})