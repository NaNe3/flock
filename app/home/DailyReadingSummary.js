import { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import BasicButton from "../components/BasicButton";
import { gen } from "../utils/styling/colors";

export default function DailyReadingSummary({ navigation, route }) {
  const { plan, chapter, location, time } = route.params
  const [versesInStudy, setVersesInStudy] = useState(0)
  const [versesRead, setVersesRead] = useState(0)
  const [totalVerses, setTotalVerses] = useState(34)

  useEffect(() => {
    const day = new Date().getDay()
    const versesString = plan.content[day].location.verses
    const verses = versesString.split('-').map(verse => parseInt(verse))
    setVersesInStudy(verses)
    setTotalVerses(verses[1] - verses[0] + 1)
  }, [])

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.exitButton}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
      >
        <Icon name="xmark" size={30} color={gen.actionText} />
      </TouchableOpacity>
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        <Text style={styles.subHeader}>TODAY'S READING</Text>
        <Text style={styles.header}>{chapter}</Text>
        <ScrollView 
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={styles.actionPlanBox} >
            <TouchableOpacity 
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', width: '100%', padding: 15 }}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.book, { backgroundColor: gen.navy }]}>
                  <Text style={styles.bookName}>Book</Text>
                  <Text style={styles.bookName}>of</Text>
                  <Text style={styles.bookName}>Mormon</Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'nunito-bold', color: gen.primaryText }}>COME FOLLOW ME</Text>
                  <Text style={{ fontSize: 12, fontFamily: 'nunito-bold', color: gen.gray }}>Book of Mormon</Text>
                </View>
              </View>
              <Icon name="chevron-down" size={20} color={gen.gray} />
              {/* <Icon name="check" size={20} color={gen.gray} /> */}
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 15, paddingVertical: 10, width: '100%', borderTopWidth: 3, borderColor: gen.primaryBorder }}>
              <View style={styles.taskRow}>
                <Text style={styles.task}>Verses to read</Text>
                <Text style={styles.task}>({versesRead}/{totalVerses})</Text>
              </View>
              <View style={styles.taskRow}>
                <Text style={styles.task}>Reflect on study</Text>
                <Text style={styles.task}></Text>
              </View>
            </View>


          </View>

        </ScrollView>
      </View>

      <BasicButton
        title="continue"
        onPress={() => {
          console.log("NAVIGATING TO")
          console.log("work: ", location.work)
          console.log("book: ", location.book)
          console.log("chapter: ", location.chapter)
          console.log("plan: ", versesInStudy)
          navigation.navigate('Chapter', {
            work: location.work,
            book: location.book,
            chapter: location.chapter,
            plan: {
              verses: versesInStudy,
              next: null
            }
          })
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontFamily: 'nunito-bold', 
    fontSize: 40,
    marginVertical: 0,
    color: gen.primaryText
  },
  subHeader: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    marginTop: 40,
    color: gen.darkishGray
  },
  actionPlanBox: {
    width: '80%', 
    marginTop: 40,
    flexDirection: 'column',
    borderRadius: 10, 
    borderWidth: 5, 
    borderColor: gen.primaryBorder, 
  },
  book: {
    width: 40,
    height: 50,
    borderRadius: 5,
    backgroundColor: gen.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookName: {
    fontSize: 6,
    fontFamily: 'nunito-bold',
    color: gen.orange,
  },
  taskRow: {
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  task: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: gen.actionText
  },
})