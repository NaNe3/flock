import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity, Dimensions, PanResponder } from "react-native";
import { Gesture, GestureDetector, gestureHandlerRootHOC, GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from "../components/SimpleHeader"
import VerseInteractModal from "./components/VerseInteractModal"

import { getVersesFromChapter } from "../utils/read";
import { hapticImpactHeavy, hapticImpactRigid, hapticImpactSoft, hapticSelect } from "../utils/haptics";
import { gen } from "../utils/styling/colors";
import { getAttributeFromObjectInLocalStorage, getUserIdFromLocalStorage } from "../utils/localStorage"
import VerseContainer from "./components/VerseContainer";
import FadeInView from "../components/FadeInView";
import { getColorVarietyAsync, getPrimaryColor } from "../utils/getColorVariety";

const windowHeight = Dimensions.get('window').height

function Chapter({ navigation, route }) {
  const [primaryColor, setPrimaryColor] = useState(gen.primaryColor)
  const { work, book, chapter, plan=null } = route.params
  const [verses, setVerses] = useState([])
  const [showChapterTitle, setShowChapterTitle] = useState(false)
  const [showSwipeBar, setShowSwipeBar] = useState(false)
  const [swipeOpacity, setSwipeOpacity] = useState(0)
  const [userInformation, setUserInformation] = useState({})
  const [swipeUpScrollEvent, setSwipeUpScrollEvent] = useState(null)
  const isAnimating = useRef(false)
  // const [modalVisible, setModalVisible] = useState(false)
  // const [verseSelected, setVerseSelected] = useState(null)

  const swipeBarRef = useRef(null)
  const scrollViewRef = useRef(null)

  useEffect(() => {
    const getUserId = async () => {
      const primaryColor = await getPrimaryColor()
      setPrimaryColor(primaryColor)

      const userId = await getUserIdFromLocalStorage()
      setUserInformation({
        user_id: userId,
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
    // show chapter title when scrolling
    const scrollPosition = event.nativeEvent.contentOffset.y
    if (scrollPosition > 60) {
      setShowChapterTitle(true)
    } else {
      setShowChapterTitle(false)
    }

    // show swipe bar when at bottom
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtBottom) {
      setShowSwipeBar(true)
    } else {
      setShowSwipeBar(false)
    }

    // fade in swipe bar
    if (showSwipeBar) {
      const diff = (Math.floor(contentSize.height - (layoutMeasurement.height + contentOffset.y)) -20) * -1
      if (diff >= 0) {
        setSwipeOpacity(diff / 20)
      } else {
        setSwipeOpacity(1)
      }
    }
  }


  const animatedMarginBottom = useRef(new Animated.Value(150)).current;
  const backgroundColor = useMemo(() => 
    animatedMarginBottom.interpolate({
      inputRange: [150, 350],
      outputRange: [gen.secondaryBackground, primaryColor],
      extrapolate: 'clamp',
    }), [animatedMarginBottom, primaryColor])

  const swipeTextColor = useMemo(() =>
    animatedMarginBottom.interpolate({
      inputRange: [150, 350],
      outputRange: [gen.secondaryText, gen.oppositeText],
      extrapolate: 'clamp',
    }), [animatedMarginBottom])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          const newMarginBottom = 150 - gestureState.dy;
          animatedMarginBottom.setValue(newMarginBottom);
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -200) {
          hapticImpactHeavy()
          Animated.spring(animatedMarginBottom, {
            toValue: Dimensions.get('window').height,
            useNativeDriver: false,
          }).start()
          setTimeout(() => {
            navigation.navigate('DailyReadingSummary', {
              location: {
                work: work,
                book: book,
                chapter: chapter,
              },
              verses: plan.verses
            })
          }, 300)
        } else {
          isAnimating.current = true
          Animated.spring(animatedMarginBottom, {
            toValue: 150,
            useNativeDriver: false,
          }).start(() => isAnimating.current = false)
        }
      },
    })
  ).current;

  useEffect(() => {
    setSwipeUpScrollEvent(animatedMarginBottom.addListener(({ value }) => {
      if (isAnimating.current === false) {
        scrollViewRef.current.scrollToEnd({ animated: false })
      }
    }))
    return () => {
      if (swipeUpScrollEvent !== null) animatedMarginBottom.removeListener(swipeUpScrollEvent)
    }
  }, [animatedMarginBottom])


  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        middleTitle={`${book} ${chapter}`}
        showChapterTitle={showChapterTitle}
        rightIcon={
          <TouchableOpacity onPress={() => { hapticSelect() }} >
            <Icon
              name='bars'
              size={20}
              color='transparent'
              style={{ marginLeft: 30 }}
            />
          </TouchableOpacity>
        }
      />
      <Animated.ScrollView
        ref={scrollViewRef}
        style={[styles.scrollContainer, { backgroundColor: backgroundColor}]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.contentContainer, { marginBottom: animatedMarginBottom }]}>
          <View style={styles.landingContainer}>
            <Text style={styles.chapterHeading}>{book} {chapter}</Text>
          </View>
          <VerseContainer 
            navigation={navigation} 
            verses={verses} 
            userInformation={userInformation}
            // setModalVisible={setModalVisible}
            // setVerseSelected={setVerseSelected}
            work={work}
            book={book}
            chapter={chapter}
            swipeIcon={true}
          />
        </Animated.View>
      </Animated.ScrollView>
      {
        showSwipeBar && (
          <View 
            style={[styles.bottomContainer, { opacity: swipeOpacity }]}
            ref={swipeBarRef}
            {...panResponder.panHandlers}
          >
            <View style={styles.swipeBar}>
              <Animated.View style={{ color: swipeTextColor }}>
              </Animated.View>
            </View>
            <Animated.Text style={[styles.swipeText, { color: swipeTextColor }]}>
              <Icon name="angle-up" size={30} />{'\n'}
              swipe to finish
            </Animated.Text>
          </View>
        )
      }
      {/* {
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
      } */}
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
  scrollContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: gen.secondaryBackground,
  },
  contentContainer: {
    flex: 1, 
    minHeight: windowHeight+600,
    backgroundColor: gen.primaryBackground, 
    paddingTop: 600, 
    marginTop: -600,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
    textAlign: 'center',
    color: gen.primaryText,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    paddingTop: 30,
    backgroundColor: 'transparent',
    opacity: 0,
  },
  swipeBar: {
    width: '100%',
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 24,
    fontFamily: 'nunito-bold',
    color: gen.secondaryText,
    textAlign: 'center',
  }
})