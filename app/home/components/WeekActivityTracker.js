import { use, useCallback, useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native";

import { gen } from "../../utils/styling/colors"
import { getLocallyStoredVariable } from "../../utils/localStorage";
import { getDatesOfCurrentWeek } from "../../utils/plan";
import { getColorVarietyAsync } from "../../utils/getColorVariety";

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

export default function WeekActivityTracker() {
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
                index !== currentDay && { color: gen.actionText },
              ]}
            />
          )
        })
      }
    </View>
  )
}

const styles = StyleSheet.create({
  weekRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
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
    color: gen.tertiaryText,
    fontSize: 14,
    textAlign: 'center',
  },
  dayNumberText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    textAlign: 'center',
  }
})

const shades = StyleSheet.create({
  gray: { backgroundColor: gen.tertiaryBackground, },
  current: { 
    backgroundColor: gen.primaryColorLight, 
    borderRadius: 10,
  },
  currentText: { color: gen.primaryColor },
  roundedLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  roundedRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  }
})