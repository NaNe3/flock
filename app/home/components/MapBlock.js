import { useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../../hooks/ThemeProvider";
import MapLine from "./MapLine";
import BasicButton from "../../components/BasicButton";
import { getColorLight, getPrimaryColor } from "../../utils/getColorVariety";
import { hapticImpactSoft } from "../../utils/haptics";

export default function MapBlock({ 
  navigation,
  item,
  status='locked',
}) {
  const versesInStudy = item.verses.split('-').map(verse => parseInt(verse))
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [color, setColor] = useState(theme.actionText)
  const [light, setLight] = useState(theme.tertiaryBackground)
  const [day, setDay] = useState(new Date().getDay())

  const [forceLocked, setForceLocked] = useState(false)

  const init = async () => {
    const color = await getPrimaryColor()
    const light = getColorLight(color)
    setColor(color)
    setLight(light)
  }

  const checkAvailability = () => {
    if (status === "active") {
      if (item.day > day) { setForceLocked(true) }
    }
  }

  useFocusEffect(
    useCallback(() => {
      init()
      setDay(new Date().getDay())
    }, [])
  )

  useEffect(() => {
    checkAvailability()
  }, [day])

  return (
    <>
      <MapLine />
      <Animated.View
        style={[
          styles.container,
          (status === "locked" || forceLocked) ? styles.locked : status === "active" ? styles.active : styles.complete,
        ]}
      >
        {(status === "locked" || forceLocked) && (
          <Icon name="lock" size={24} color={theme.secondaryText} />
        )}
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.planItemHeader}>{item.book !== "" ? item.book : item.work.replace("Doctrine And Covenants", "D&C")} {item.chapter}</Text>
          <Text style={styles.planItemVerses}>verses {item.verses}</Text>
        </View>
        {status === "complete" && (
          <Icon name={status === "complete" ? "arrow-rotate-right" : "play"} size={24} color={theme.secondaryText} style={{ marginTop: 5 }}/>
        )}
        {/* {status === "active" && (
          <View style={styles.depressionContainer} />
        )} */}
        {!forceLocked ? (
          <>
            {status === "active" && (
              <Text style={[styles.activeText, {color: color, backgroundColor: light, }]}>
                <Icon name="play" size={18} color={color !== null ? color : theme.secondaryText} style={{ marginTop: 5 }}/> begin study
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.activeText}>
            <Icon name="calendar-day" size={18} color={theme.secondaryText} style={{ marginTop: 5 }}/> unlocks tomorrow
          </Text>
        )}

      </Animated.View>
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    locked: {
      borderWidth: 4,
      borderColor: theme.primaryBorder,
      borderStyle: 'dashed',
    },
    active: {
      backgroundColor: theme.primaryBackground,
    },
    complete: {
      backgroundColor: theme.primaryBackground,
      opacity: 0.5
    },
    planItemHeader: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
      textAlign: 'center',
    },
    planItemVerses: {
      fontSize: 16,
      fontFamily: 'nunito-regular',
      color: theme.secondaryText,
      textAlign: 'center',
    },
    completedRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    completedContainer: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: theme.quarternaryBackground,

      color: theme.actionText,
      fontFamily: 'nunito-bold',
      fontSize: 16,

      // position: 'absolute',
      // top: -15,
      // right: 10,
    },
    playButton: {
      width: '100%',
    },
    activeText: {
      backgroundColor: theme.primaryBorder,
      marginTop: 5,
      paddingVertical: 7,
      paddingHorizontal: 15,
      borderRadius: 8,
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
      textAlign: 'center',
    },
    // depressionContainer: {
    //   backgroundColor: theme.secondaryBackground,
    //   borderRadius: 10,
    //   width: '100%',
    //   height: 50,
    //   marginTop: 5,
    //   marginBottom: 15,
    // }
  })
}