import { StyleSheet, Text, View } from "react-native"
import { gen } from "../../utils/styling/colors"
import { useEffect, useState } from "react"

export default function WeekActivityTracker() {
  const [weekDays, setWeekDays] = useState([])

  useEffect(() => {

  }, [])

  return (
    <View style={styles.weekRow}>
      <View style={styles.weekDay}> 
        <Text style={styles.weekDayText}>SU</Text>
        <Text style={[styles.dayContainer, { backgroundColor: gen.tertiaryBackground, borderBottomLeftRadius: 10, borderTopLeftRadius: 10 }]}>
          <Text style={styles.dayNumberText}>14</Text>
        </Text>

      </View>
      <View style={styles.weekDay}>
        <Text style={styles.weekDayText}>M</Text>
        <Text style={[styles.dayContainer, { backgroundColor: gen.tertiaryBackground }]}>
          <Text style={styles.dayNumberText}>15</Text>
        </Text>

      </View>
      <View style={styles.weekDay}>
        <Text style={styles.weekDayText}>T</Text>
        <View style={[styles.dayContainer, { backgroundColor: gen.tertiaryBackground, borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingVertical: 0 }]}>
          <View style={{ flex: 1, backgroundColor: gen.primaryColorLight, paddingVertical: 5, borderRadius: 10 }}>
            <Text style={[styles.dayNumberText, { color: gen.primaryColor }]}>16</Text>
          </View>
        </View>

      </View>
      <View style={styles.weekDay}> 
        <Text style={styles.weekDayText}>W</Text>
        <View style={styles.dayContainer}>
          <Text style={styles.dayNumberText}>16</Text>
        </View>

      </View>
      <View style={styles.weekDay}> 
        <Text style={styles.weekDayText}>TH</Text>
        <View style={styles.dayContainer}>
          <Text style={styles.dayNumberText}>17</Text>
        </View>

      </View>
      <View style={styles.weekDay}> 
        <Text style={styles.weekDayText}>F</Text>
        <View style={styles.dayContainer}>
          <Text style={styles.dayNumberText}>18</Text>
        </View>

      </View>
      <View style={styles.weekDay}> 
        <Text style={styles.weekDayText}>S</Text>
        <View style={styles.dayContainer}>
          <Text style={styles.dayNumberText}>19</Text>
        </View>

      </View>
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
    color: gen.actionText,
  }
})