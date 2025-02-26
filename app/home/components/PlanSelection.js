import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../hooks/ThemeProvider";
import { constants } from "../../utils/styling/colors";

export default function PlanSelection({ onSelect }) {
  const { theme, currentTheme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <PlanRow
        plan={'Come Follow Me'}
        planColor={constants.maroon}
        studying='11,456'
        onPress={() => {
          onSelect('Come Follow Me')
        }}
        currentTheme={currentTheme}
        styles={styles}
      />
    </View>
  )
}

const PlanRow = ({ plan, planColor, studying, onPress, currentTheme, styles }) => {
  const isSelected = true

  return (
    <View style={[styles.selectableContainer, isSelected && { backgroundColor: currentTheme === 'dark' ? '#616161' : '#eee' }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.selectable}
        onPress={onPress}
      >
        <View style={[styles.planDisplayContainer, { backgroundColor: planColor }]}>
          {plan.split(" ").map((word, i) => {
            return <Text key={`${word}-${i}`} style={styles.planDisplayText} >{word}</Text>
          })}
        </View>
        <View style={styles.selectableInfo}>
          <Text style={[styles.selectableText, { color: currentTheme === "dark" ? '#eee' : "#616161"}]}>{plan}</Text>
          <Text style={styles.selectableSupportingText}>{studying} studying</Text>
        </View>
        {/* <Icon name={selected === group.group_name ? 'circle-check' : 'circle'} size={25} color="#eee" /> */}
      </TouchableOpacity>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: 400,
      paddingVertical: 20,
    },
    selectableContainer: {
      marginHorizontal: 20,
      padding: 15,
      borderRadius: 10,
      
      justifyContent: 'center',
    },
    selectable: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectableInfo: {
      marginLeft: 20,
      flex: 1
    },
    selectableText: {
      fontFamily: 'nunito-bold',
      fontSize: 20,
      color: '#eee',
    },
    selectableSupportingText: {
      fontFamily: 'nunito-bold',
      fontSize: 14,
      color: '#999',
    },

    planDisplayContainer: {
      width: 60,
      height: 75,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    planDisplayText: {
      fontFamily: 'nunito-bold',
      fontSize: 12,
      textAlign: 'center',
      color: constants.orange,
    },
  })
}