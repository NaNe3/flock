import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import BasicButton from '../components/BasicButton';
import EmptySpace from '../components/EmptySpace';
import { gen } from '../utils/styling/colors';

// TO DO
// 1. Display information about the plan

export default function Commitment({ 
  setCurrentScreen,
  planData,
  setPlanData,
}) {
  const [loading, setLoading] = useState(false)
  const bookColors = {
    'Come Follow Me': [gen.maroon, gen.primaryColor],
    'Book of Mormon': [gen.navy, gen.primaryColor],
    'Doctrine and Covenants': ['#000', gen.primaryColor],
    'New Testament': ['#000', gen.primaryColor],
    'Old Testament': ['#000', gen.primaryColor],
  }

  const DayBox = ({ day, chapters }) => {
    return (
      <View style={styles.dayBox}>
        <Text style={styles.dayBoxHeader}>DAY {day}</Text>
        <View style={styles.verseBox}>
          {
            chapters.map((chapter, index) => (
              <Text key={`verse-${day}-${index}`} style={styles.verse}>
                {chapter}&nbsp;&nbsp;&nbsp;
                <Icon name='clock-o' size={16} color={gen.heckaGray2} /> <Text style={{ color: gen.heckaGray2 }}>7 min</Text>
              </Text>
            ))
          }
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.circleButton}
        onPress={() => setCurrentScreen(prev => prev - 1)}   
      >
        <Text style={{ fontFamily: 'nunito-bold'}}>BACK</Text>
      </TouchableOpacity>

      {
        loading ? (
          <ActivityIndicator size="large" color={gen.gray} />
        ) : (
          <ScrollView 
            style={styles.planContainer}
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bookDisplay}>
              {
                planData.plan.map((book, index) => (
                  <View key={`book-${index}`} style={[styles.book, { backgroundColor: bookColors[book][0] }]}>
                    {
                      book.split(' ').map((word) => {
                        return <Text key={`word-${book}-${word}`} style={styles.innerBookText}>{word}</Text>
                      })
                    }
                  </View>
                ))
              }
            </View>
            <View style={{ marginTop: 40, width: '100%', alignItems: 'center'}}>
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
              <DayBox day={1} chapters={['1 Nephi 1', '1 Nephi 2']} />
            </View>
            <EmptySpace size={250} style={{ backgroundColor: 'red' }} />
          </ScrollView>
        )
      }

      <BasicButton
        title="Aight. We ball"
        onPress={() => setCurrentScreen(prev => prev + 1)}
        style={{ position: 'absolute', bottom: 60 }}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.lightestGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planContainer: {
    width: '100%',
  },
  circleButton: {
    position: 'absolute',
    zIndex: 1,
    top: 70,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookDisplay: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

    paddingTop: 530,
    marginTop: -400,
  },
  book: {
    width: 135,
    height: 170,
    padding: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    backgroundColor: gen.navy,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerBookText: {
    color: gen.primaryColor,
    fontFamily: 'nunito-bold',
    fontSize: 20,
  },
  dayBox: {
    width: '90%',
    padding: 20,
  },
  dayBoxHeader: {
    fontSize: 20,
    fontFamily: 'nunito-bold',
    color: '#000',
  },
  verseBox: {
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  verse: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: gen.darkGray,
    marginLeft: 10,
  }
})