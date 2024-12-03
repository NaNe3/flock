import { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity } from "react-native";
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from "../components/SimpleHeader"
import VerseInteractModal from "./components/VerseInteractModal"

import { getVersesFromChapter } from "../utils/read";
import { hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getAttributeFromObjectInLocalStorage, getUserIdFromLocalStorage } from "../utils/localStorage"
import VerseContainer from "./components/VerseContainer";

function Chapter({ navigation, route }) {
  const { work, book, chapter, plan=null } = route.params
  const [verses, setVerses] = useState([])
  const [showChapterTitle, setShowChapterTitle] = useState(false)
  const [userInformation, setUserInformation] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [verseSelected, setVerseSelected] = useState(null)

  useEffect(() => {
    const getUserId = async () => {
      const userId = await getUserIdFromLocalStorage()
      const userPath = await getAttributeFromObjectInLocalStorage("userInformation", "avatar_path")
      setUserInformation({
        user_id: userId,
        avatar_path: userPath
      })

      const verses = await getVersesFromChapter(work, book, chapter)
      if (plan.verses !== null) {
        let selected = {};
        const range = Array.from({ length: plan.verses[1] - plan.verses[0] + 1 }, (_, i) => i + plan.verses[0]);
        range.forEach(verse => { selected[verse] = verses[verse] })
        setVerses(selected)
      } else {
        setVerses(verses)
      }
    }

    // const realtimeUpdates = async () => {
      // await createRealtimeConnection(() => {
      //   // const verses = getVersesFromChapter(book, chapter)
      //   // setVerses(verses)
      //   // getLikesOfVerse(book, chapter)
      // }, () => {
      //   organizeComments()
      //   // getCommentsOfVerse(book, chapter, verseFocused)
      //   // getCommentsOfVerse(book, chapter, verseFocused)
      // })
    // }

    getUserId()
    // realtimeUpdates()
    // return () => {
    //   realtimeUpdates()
    // }
  }, [])

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y
    if (scrollPosition > 60) setShowChapterTitle(true)
    else setShowChapterTitle(false)
  }

  return (
    <View style={styles.container}>
      <SimpleHeader 
        navigation={navigation} 
        middleTitle={`${book} ${chapter}`}
        showChapterTitle={showChapterTitle}
        rightIcon={
          <TouchableOpacity
            onPress={() => {
              hapticSelect()
            }}
          >
            <Icon 
              name='bars'
              size={20}
              color={gen.primaryText}
              style={{ marginLeft: 30 }}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={{ width: '100%', flex: 1, }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.landingContainer}>
          <Text style={styles.chapterHeading}>{book} {chapter}</Text>
        </View>
        <VerseContainer 
          navigation={navigation} 
          verses={verses} 
          userInformation={userInformation}
          setModalVisible={setModalVisible}
          setVerseSelected={setVerseSelected}
          work={work}
          book={book}
          chapter={chapter}
        />
      </ScrollView>
      {
        modalVisible && (
          <VerseInteractModal 
            navigation={navigation}
            modalVisible={modalVisible} 
            setModalVisible={setModalVisible}
            work={work}
            book={book}
            chapter={chapter}
            verseSelected={verseSelected}
            userId={userInformation.user_id}
          />
        )
      }
    </View>
  )
}

export default gestureHandlerRootHOC(Chapter)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
    width: '100%',
  },
  landingContainer: {
    flex: 1,
    marginBottom: 60,
  },
  chapterHeading: {
    fontSize: 48,
    paddingHorizontal: 40,
    fontFamily: 'nunito-bold',
    alignSelf: 'center',
    color: gen.primaryText,
  },
})