import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, Animated, TouchableOpacity, Dimensions, PanResponder } from "react-native";
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome6'

import SimpleHeader from "../components/SimpleHeader"

import { getVersesFromChapter } from "../utils/read";
import { hapticImpactHeavy, hapticSelect } from "../utils/haptics";
import { getUserIdFromLocalStorage } from "../utils/localStorage"
import VerseContainer from "./components/VerseContainer";
import { getPrimaryColor } from "../utils/getColorVariety";
import { useTheme } from "../hooks/ThemeProvider";
import { useFocusEffect } from "@react-navigation/native";

const windowHeight = Dimensions.get('window').height

function Chapter({ navigation, route }) {
  const { work, book, chapter, plan=null } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor)
  const [verses, setVerses] = useState([])
  const [chapterTitle] = useState(book.replace("Doctrine And Covenants", "D&C") + " " + chapter)
  const [showChapterTitle, setShowChapterTitle] = useState(false)
  const [showSwipeBar, setShowSwipeBar] = useState(false)
  const [swipeOpacity, setSwipeOpacity] = useState(0)
  const [userInformation, setUserInformation] = useState({})
  const [swipeUpScrollEvent, setSwipeUpScrollEvent] = useState(null)
  const isAnimating = useRef(false)
  const versesInChapter = useRef(null)
  const didGoToReadingSummary = useRef(false)

  const swipeBarRef = useRef(null)
  const scrollViewRef = useRef(null)


  useEffect(() => {
    const init = async () => {
      const primaryColor = await getPrimaryColor()
      setPrimaryColor(primaryColor)

      const userId = await getUserIdFromLocalStorage()
      setUserInformation({ user_id: userId, })
      const verses = await getVersesFromChapter(work, book, chapter)
      versesInChapter.current = Object.keys(verses).length
      console.log("verses in chapter: ", versesInChapter.current)
      if (plan.verses !== null) {
        let selected = {};
        const range = Array.from({ length: plan.verses[1] - plan.verses[0] + 1 }, (_, i) => i + plan.verses[0]);
        range.forEach(verse => { selected[verse] = verses[verse] })
        setVerses(selected)
      } else {
        setVerses(verses)
      }
    }

    init()
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

  const swipeOffset = useRef(new Animated.Value(150)).current;
  const translateOffset = useRef(swipeOffset.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -150],
  })).current;
  const backgroundColor = useMemo(() => 
    swipeOffset.interpolate({
      inputRange: [150, 350],
      outputRange: [theme.secondaryBackground, primaryColor],
      extrapolate: 'clamp',
    }), [swipeOffset, primaryColor])

  const swipeTextColor = useMemo(() =>
    swipeOffset.interpolate({
      inputRange: [150, 350],
      outputRange: [theme.secondaryText, theme.oppositeText],
      extrapolate: 'clamp',
    }), [swipeOffset])

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          const newMarginBottom = 150 - gestureState.dy;
          swipeOffset.setValue(newMarginBottom);
          scrollViewRef.current.scrollToEnd({ animated: false });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -200) {
          hapticImpactHeavy()
          Animated.spring(swipeOffset, {
            toValue: Dimensions.get('window').height,
            useNativeDriver: false,
          }).start()
          setTimeout(() => {
            didGoToReadingSummary.current = true
            navigation.navigate('ReadingSummary', {
              location: {
                work: work,
                book: book,
                chapter: chapter,
              },
              plan: {
                plan_info: plan === null ? null : plan.plan_info,
                plan_item_id: plan === null ? null : plan.plan_item_id,
              },
              verses: plan.verses === null ? [1, versesInChapter.current] : plan.verses
            })
          }, 300)
        } else {
          isAnimating.current = true
          Animated.spring(swipeOffset, {
            toValue: 150,
            useNativeDriver: false,
          }).start(() => isAnimating.current = false)
        }
      },
    })
  ).current;

  useEffect(() => {
    setSwipeUpScrollEvent(swipeOffset.addListener(({ value }) => {
      if (isAnimating.current === false) {
        scrollViewRef.current.scrollToEnd({ animated: false })
      }
    }))
    return () => {
      if (swipeUpScrollEvent !== null) swipeOffset.removeListener(swipeUpScrollEvent)
    }
  }, [swipeOffset])

  useFocusEffect(
    useCallback(() => {
      if (didGoToReadingSummary.current) {
        didGoToReadingSummary.current = false
        Animated.timing(swipeOffset, {
          toValue: 150,
          useNativeDriver: false,
          timing: 100,
        }).start()
      }
    }, [])
  )

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
        {/* <Animated.View style={[styles.contentContainer, { marginBottom: swipeOffset }]}> */}
        <Animated.View style={ [ styles.contentContainer, { transform: [{ translateY: translateOffset }] } ]}>
          <View style={styles.landingContainer}>
            <Text style={[styles.chapterHeading, { fontSize: chapterTitle.length < 10 ? 48 : 35}]}>{chapterTitle}</Text>
          </View>
          <VerseContainer 
            navigation={navigation} 
            verses={verses} 
            userInformation={userInformation}
            work={work}
            book={book}
            chapter={chapter}
            swipeIcon={true}
          />
        </Animated.View>
      </Animated.ScrollView>
      {
        showSwipeBar && (
          <Animated.View 
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
          </Animated.View>
        )
      }
    </View>
  )
}

export default gestureHandlerRootHOC(Chapter)

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      width: '100%',
    },
    scrollContainer: {
      width: '100%',
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    contentContainer: {
      flex: 1, 
      minHeight: windowHeight+600,
      backgroundColor: theme.primaryBackground, 
      paddingTop: 600, 
      marginTop: -450,
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
      color: theme.primaryText,
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
      color: theme.secondaryText,
      textAlign: 'center',
    }
  })
}