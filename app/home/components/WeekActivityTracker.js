import { useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native";

import { getDatesOfCurrentWeek } from "../../utils/plan";
import { getColorVarietyAsync } from "../../utils/getColorVariety";
import { useTheme } from "../../hooks/ThemeProvider";


export default function WeekActivityTracker() {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [shades, setShades] = useState(shade(theme))
  useEffect(() => { setShades(shade(theme)) }, [theme])

  const [main, setMain] = useState({})
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const [dates, setDates] = useState([14, 15, 16, 17, 18, 19, 20])
  const [currentDay, setCurrentDay] = useState(0)
  const [readingForToday, setReadingForToday] = useState(null)

  const init = async () => {
    const colors = await getColorVarietyAsync()
    setMain(colors)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  useEffect(() => {
    init()

    const { currentDay: today, dates } = getDatesOfCurrentWeek()
    setCurrentDay(today)
    setDates(dates)
  }, [])

  const Day = ({ day, date, isToday, currentDay, background, text }) => {
    return (
      <View style={styles.weekDay}>
        <Text style={styles.weekDayText}>{day}</Text>
        <View style={isToday && [shades.roundedRight, currentDay !== 0 && shades.gray]}>
          <View style={[styles.dayContainer, background]}>
            <Text style={[styles.dayNumberText, text]}>{date}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.weekRow}>
      {
        days.map((day, index) => {
          return (
            <Day 
              key={`${day}-${index}`}
              day={day}
              date={dates[index]}
              isToday={currentDay === index}
              currentDay={currentDay}
              background={[
                index < currentDay && shades.gray, 
                index === 0 && shades.roundedLeft, 
                index === 6 && shades.roundedRight, 
                index === currentDay && { backgroundColor: main.primaryColorLight, borderRadius: 10 },
              ]}
              text={[
                styles.dayNumberText,
                index === currentDay && { color: main.primaryColor },
                index !== currentDay && { color: theme.actionText },
              ]}
            />
          )
        })
      }
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    weekRow: {
      backgroundColor: theme.primaryBackground,
      width: '100%',
      flexDirection: 'row',
      paddingBottom: 30,
      paddingHorizontal: 10,
    },
    dayContainer: {
      paddingVertical: 5,
      height: 40,
    },
    weekDay: {
      flex: 1,
      height: 40,
    },
    weekDayText: {
      fontFamily: 'nunito-bold',
      color: theme.tertiaryText,
      fontSize: 14,
      textAlign: 'center',
    },
    dayNumberText: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      textAlign: 'center',
    }
  })
}

function shade(theme) {
  return StyleSheet.create({
    gray: { backgroundColor: theme.tertiaryBackground, },
    current: { 
      backgroundColor: theme.primaryColorLight, 
      borderRadius: 10,
    },
    currentText: { color: theme.primaryColor },
    roundedLeft: {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
    },
    roundedRight: {
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    }
  })
}
