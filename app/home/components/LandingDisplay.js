import { useEffect, useRef, useState } from "react"
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useTheme } from "../../hooks/ThemeProvider"
import { useModal } from "../../hooks/UniversalModalProvider"

import BasicButton from "../../components/BasicButton"
import { getLocallyStoredVariable } from "../../utils/localStorage"
import { hapticImpactSoft } from "../../utils/haptics"
import PlanSelection from "./PlanSelection"
import PlanItemRow from "./PlanItemRow"

export default function LandingDisplay({
  navigation,
  currentPlanItem,
  scrollingState
}) {
  const { setVisible, setModal, setTitle, closeBottomSheet } = useModal()
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [versesInStudy, setVersesInStudy] = useState(0)
  const [chapter, setChapter] = useState('')
  const [location, setLocation] = useState({})
  const [plan, setPlan] = useState({ plan_info: {}, plan_item_id: null, })
  const [time, setTime] = useState('')
  const [planButtonState, setPlanButtonState] = useState({
    disabled: false
  })
  const [planItemAccessible, setPlanItemAccessible] = useState(true)
  const [hasStudied, setHasStudied] = useState(false)

  const init = async () => {
    const currentPlan = JSON.parse(await getLocallyStoredVariable('user_plans'))[0]
    const chapter = currentPlanItem.book === "" || currentPlanItem.book === null
      ? `${currentPlanItem.work.replace("Doctrine And Covenants", "D&C").toUpperCase()} ${currentPlanItem.chapter}`
      : `${currentPlanItem.book.replace("Joseph Smith", "JS").replace("Doctrine And Covenants", "D&C").toUpperCase()} ${currentPlanItem.chapter}`
    setPlan({ plan_info: currentPlan, plan_item_id: currentPlanItem.plan_item_id })
    setChapter(chapter)
    setVersesInStudy(currentPlanItem.verses.split('-').map(verse => parseInt(verse)))
    setTime(currentPlanItem.time)
    setLocation({
      work: currentPlanItem.work,
      book: currentPlanItem.work === "Doctrine And Covenants" ? "Doctrine And Covenants" : currentPlanItem.book,
      chapter: currentPlanItem.chapter,
    })

    // CHECK IF PLAN ITEM IS ACCESSIBLE TO USER
    const day = new Date().getDay()
    if (currentPlanItem.day <= day) {
      setPlanItemAccessible(true)
    } else {
      setPlanItemAccessible(false)
    }
  }



  // const getStudyCompletion = async (week, currentDay) => {
  //   const logs = JSON.parse(await getLocallyStoredVariable('user_logs'))

  //   const year = new Date().getFullYear()
  //   const hasStudiedToday = logs.some(log => {
  //     const time = log.created_at

  //     const date = new Date(time)
  //     const yearOfLog = date.getFullYear()
  //     const weekOfLog = getWeekFromTimestamp(time)
  //     const dayOfLog = date.getDay()

  //     return yearOfLog === year && weekOfLog === week && dayOfLog === currentDay && log.plan_item_id === plan.plan_item_id
  //   })
  //   setHasStudied(hasStudiedToday)
  // }

  // useFocusEffect(
  //   useCallback(() => {
  //     init()
  //   }, [])
  // )

  useEffect(() => {
    const trigger = async () => { await init() }
    if (currentPlanItem !== null) trigger()
  }, [currentPlanItem])

  useEffect(() => {
    if (scrollingState) closeLanding()
  }, [scrollingState])

  const landingOpened = useRef(true)
  const pan = useRef(new Animated.Value(0)).current;
  const marginBottom = useRef(
    pan.interpolate({
      inputRange: [-280, 0],
      outputRange: [0, 280],
      extrapolate: 'clamp',
    })
  ).current;

  const handleShowPlan = () => {
    hapticImpactSoft()
    setVisible(true)
    setModal(
      <PlanSelection
        onSelect={(plan) => {
          closeBottomSheet()
        }}
      />
    )
    setTitle('select plan')
  }

  const openLanding = () => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
    }).start()
    landingOpened.current = true
  }

  const closeLanding = () => {
    Animated.timing(pan, {
      toValue: -280,
      duration: 200,
      useNativeDriver: false,
    }).start()
    landingOpened.current = false
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (landingOpened.current === true) {
          if (gestureState.dy < 0) {
            pan.setValue(gestureState.dy)
          } else {
            const damping = 1 - Math.exp(-gestureState.dy / 30)
            const newTranslateY = damping * 30
            pan.setValue(newTranslateY)
          }
        } else {
          if (gestureState.dy > 280) {
            const damping = 1 - Math.exp(-(gestureState.dy - 280) / 30)
            const newTranslateY = damping * 30
            pan.setValue(newTranslateY)
          } else {
            pan.setValue(gestureState.dy - 280)
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (landingOpened.current === true) {
          if (gestureState.dy < 0) {
            closeLanding()
          } else {
            openLanding()
          }
        } else {
          if (gestureState.dy > 0) {
            openLanding()
          } else {
            closeLanding()
          }
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[
      styles.landingContainer, 
      { transform: [{ translateY: pan }], marginBottom: marginBottom}
    ]}>
      {planItemAccessible ? (
        <>
          <View style={styles.landingContentContainer}>
            <TouchableOpacity
              style={styles.planContainer}
              activeOpacity={0.7}
              onPress={handleShowPlan}
            >
              <View style={styles.planContentContainer}>
                <View style={styles.planBox}>
                  <Text style={styles.planArt}>Come</Text>
                  <Text style={styles.planArt}>Follow</Text>
                  <Text style={styles.planArt}>Me</Text>
                </View>
                <Text style={styles.planText}>
                  Come Follow Me &nbsp;<Icon name="chevron-down" size={12} color={theme.actionText} />
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.header, chapter.length < 9 && { fontSize: 60}]}>{chapter}</Text>
            <Text style={styles.verses}>verses {versesInStudy[0]} - {versesInStudy[1]}</Text>
          </View>
          <View style={styles.actionContainer}>
            <BasicButton
              title={`${time} minutes`}
              icon='clock-o'
              onPress={() => {
                hapticImpactSoft()
                navigation.navigate('Chapter', {
                  work: location.work,
                  book: location.book,
                  chapter: location.chapter,
                  plan: {
                    verses: versesInStudy,
                    ...plan
                  }
                })
              }}
              disabled={planButtonState.disabled || !planItemAccessible}
              style={{ width: '100%' }}
            />
          </View>
        </>
      ) : (
        <View style={styles.completedView}>
          <Text style={styles.subheader}>unlocks tomorrow </Text>
          <PlanItemRow item={currentPlanItem} />
        </View>
      )}
      <View
        style={styles.dragBarContainer}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragBar}></View>
      </View>
    </Animated.View>
  )
}

function style(theme) {
  return StyleSheet.create({
    landingContainer: {
      width: '100%',
      minHeight: 910,
      backgroundColor: theme.primaryBackground,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 600,
      marginTop: -600,
      zIndex: 1,
    },
    landingContentContainer: {
      marginVertical: 30, 
      flex: 1, 
      alignItems: 'center', 
    },
    header: {
      fontFamily: 'nunito-bold', 
      fontSize: 44, 
      marginVertical: 0,
      color: theme.primaryText,
      textAlign: 'center'
    },
    subheader: {
      fontFamily: 'nunito-bold', 
      fontSize: 24, 
      color: theme.darkishGray,
      marginLeft: 10,
      marginBottom: 4,
    },
    subHeaderContainer: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    verses: {
      fontFamily: 'nunito-bold', 
      fontSize: 26, 
      color: theme.darkishGray,
    },
    planContainer: {
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRadius: 100,
      height: 41,

      borderWidth: 3,
      borderColor: theme.primaryBorder,
    },
    planContentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planText: {
      fontSize: 15,
      fontFamily: 'nunito-bold',
      color: theme.actionText,
    },
    planBox: {
      backgroundColor: theme.maroon,
      width: 25,
      height: 25,
      borderRadius: 100,
      marginRight: 5,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    planArt: {
      color: theme.orange,
      fontSize: 5,
      fontFamily: 'nunito-bold',
      textAlign: 'center',
    },
    actionContainer: {
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    dragBarContainer: {
      width: '100%',
      height: 35,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 5,
    },
    dragBar: {
      width: 40,
      height: 7,
      backgroundColor: theme.primaryBorder,
      borderRadius: 100,
    },
    completedView: {
      width: '100%',
      height: 270,
      paddingVertical: 10,
      alignItems: 'center',
    }
  })
}