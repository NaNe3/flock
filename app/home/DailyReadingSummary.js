import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import BasicButton from "../components/BasicButton";
import { gen, currentTheme } from "../utils/styling/colors";
import { hapticImpactRigid } from "../utils/haptics";
import { checkIfUserHasStudiedPlanToday, setLocallyStoredVariable, getLocallyStoredVariable, getUserIdFromLocalStorage } from "../utils/localStorage"
import { createReadingLog } from "../utils/authenticate"
import { manageStreakNotifications } from "../utils/notify";
import { getPrimaryColor } from "../utils/getColorVariety";
import FAIcon from "../components/FAIcon";

const getFormattedDate = () => {
  const options = { weekday: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

export default function DailyReadingSummary({ navigation, route }) {
  const { verses, location } = route.params
  const insets = useSafeAreaInsets()
  const [color, setColor] = useState(gen.secondaryBackground)
  const [date, setDate] = useState(getFormattedDate())
  const [book, setBook] = useState(location.book.replace("Joseph Smith", "JS").replace("Doctrine And Covenants", "D&C"))
  const animationOpacity = useRef(new Animated.Value(1)).current
  const readingFadeAnim = useRef(new Animated.Value(0)).current
  const readingTranslateY = useRef(new Animated.Value(80)).current
  const borderOpacity = useRef(new Animated.Value(0)).current

  const [fadeAnims, setFadeAnims] = useState([])
  const [logging, setLogging] = useState(false)

  const [userLogs, setUserLogs] = useState([])
  const [versesInStudy, setVersesInStudy] = useState(0)
  const [versesRead, setVersesRead] = useState(0)
  const [totalVerses, setTotalVerses] = useState(34)

  useEffect(() => {
    // get primary color
    const init = async () => {
      const primaryColor = await getPrimaryColor()
      setColor(primaryColor)
    }
    init()

    // set verse hooks
    setVersesInStudy(verses)
    setTotalVerses(verses[1] - verses[0] + 1)

    // set up fade animations for elements
    animate()

    // create reading completion log
    logReading()
  }, [])

  useEffect(() => {
    if (fadeAnims.length === 0) return

    for (let i = 0; i < fadeAnims.length; i++) {
      Animated.timing(fadeAnims[i], {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        delay: (i * 500) + 1000,
      }).start()
    }
  }, [fadeAnims])

  const animate = () => {
    const elementCount = 4
    let fadeAnimsPrep = []
    for (let i = 0; i < elementCount; i++) {
      fadeAnimsPrep.push(new Animated.Value(0))
    }
    setFadeAnims(fadeAnimsPrep)
    setTimeout(() => {
      Animated.timing(readingFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(readingTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(),
          Animated.timing(borderOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(),
        ])
      })
    }, 300)
  }

  const logReading = async () => {
    if (logging) return
    setLogging(true)
    const userLogs = JSON.parse(await getLocallyStoredVariable('user_logs'))
    setUserLogs(userLogs)

    const hasAlreadyStudied = await checkIfUserHasStudiedPlanToday()
    if (!hasAlreadyStudied) {
      const userId = await getUserIdFromLocalStorage()
      const { data, error } = await createReadingLog(userId, 1)
      if (!error) {
        // create streak notifications for user
        await manageStreakNotifications()

        // update local logs
        await setLocallyStoredVariable('user_logs', JSON.stringify([...userLogs, data]))

        // update last_read and current_streak for user
        const user = JSON.parse(await getLocallyStoredVariable('user_information'))
        const updatedUser = { ...user, last_read: data.log_id, current_streak: user.current_streak + 1 }
        await setLocallyStoredVariable('user_information', JSON.stringify(updatedUser))

      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { marginTop: insets.top + 20 }]}>
        <Text style={styles.subHeader}>{date.toUpperCase()}</Text>
        <Text style={styles.header}>today's reading</Text>
      </View>
      <View style={styles.taskContainer}>
        <Animated.View style={[styles.task, { opacity: readingFadeAnim, transform: [{ translateY: readingTranslateY }] }]}>
          <View style={styles.book}>
            <Text style={styles.bookText}>Come</Text>
            <Text style={styles.bookText}>Follow</Text>
            <Text style={styles.bookText}>Me</Text>
          </View>
          <View style={styles.taskContent}>
            <Text 
              style={{ color: gen.primaryText, fontSize: 22, fontFamily: 'nunito-bold' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{book} {location.chapter}</Text>
            <Text style={{ color: gen.secondaryText, fontSize: 16, fontFamily: 'nunito-bold' }}>verses {verses[0]} - {verses[1]}</Text>
          </View>
          <Icon name='check' size={22} color={gen.actionText} style={{ marginRight: 10 }} />
        </Animated.View>
        <Animated.View style={[styles.itemContainer, { opacity: borderOpacity }]}>
          <Animated.View style={[styles.item, { opacity: fadeAnims[0], borderColor: color }]}>
            <FAIcon name='bookmark' size={18} style={styles.itemIcon} />
            <Text style={styles.itemText}>11 verses read today</Text>
          </Animated.View>
          <Animated.View style={[styles.item, { opacity: fadeAnims[1], borderColor: color }]}>
            <Icon name='clock-rotate-left' size={18} style={styles.itemIcon} />
            <Text style={styles.itemText}>3:46 time studied</Text>
          </Animated.View>
          <Animated.View style={[styles.item, { opacity: fadeAnims[2], borderColor: color }]}>
            <Icon name='plus' size={18} style={styles.itemIcon} />
            <Text style={styles.itemText}>2 impressions</Text>
          </Animated.View>
        </Animated.View>
      </View>
      <Animated.View style={[styles.actionContainer, { marginBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            hapticImpactRigid()
            navigation.goBack()
          }}
        >
          <Text style={styles.actionText}>back to chapter</Text>
        </TouchableOpacity>
        <BasicButton
          title={'next'}
          style={styles.button}
          onPress={() => {
            hapticImpactRigid()
            navigation.navigate('Landing')
          }}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: gen.primaryBackground,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
  },
  header: {
    fontFamily: 'nunito-bold', 
    fontSize: 36,
    textAlign: 'center',
    color: gen.primaryText
  },
  subHeader: {
    fontFamily: 'nunito-bold',
    textAlign: 'center',
    fontSize: 18,
    color: gen.gray,
  },
  actionText: {
    width: '100%',
    color: gen.gray,
    fontSize: 22,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
    marginBottom: 10
  },
  actionContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  taskContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    paddingTop: 40,
  },
  task: {
    zIndex: 2,
    width: '100%',
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: gen.secondaryBackground,
  },
  taskContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  book: {
    width: 65,
    height: 75,
    backgroundColor: gen.maroon,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookText: {
    color: gen.orange,
    fontSize: 12,
    fontFamily: 'nunito-bold',
  },
  itemContainer: {
    zIndex: 1,
    paddingLeft: 25,
    paddingTop: 30,
    paddingBottom: 20,
    marginTop: -40,
    width: '100%',
    backgroundColor: gen.secondaryBackground,
    borderRadius: 15,
  },
  item: {
    marginVertical: 8,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 6,
    borderRadius: 8,
  },
  itemText: {
    color: gen.actionText,
    fontSize: 18,
    fontFamily: 'nunito-bold',
    textAlign: 'left',
  },
  itemIcon: {
    color: gen.actionText,
    marginRight: 10,
  },
})