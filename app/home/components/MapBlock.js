import { useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome6'
import HugeIcon from "../../components/HugeIcon"

import { useTheme } from "../../hooks/ThemeProvider";
import MapLine from "./MapLine";
import { getColorLight, getPrimaryColor } from "../../utils/getColorVariety";
import TouchableShrink from "../../components/TouchableShrink";
import { hapticImpactSoft } from "../../utils/haptics";
import FlagIcon from "../../svg/Flag";

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
      <View
        style={[
          styles.container,
          (status === "locked" || forceLocked) ? styles.locked : status === "active" ? styles.active : styles.complete,
        ]}
      >
        {(status === "locked" || forceLocked) && (
          <Icon name="lock" size={24} color={theme.secondaryText} />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {(status === "active" && !forceLocked) && (
            <HugeIcon 
              icon='laurel-wreath-left'
              size={35}
              style={{marginRight: 20}} 
              color={theme.secondaryText}
            />
          )}
          <View style={{ marginVertical: 10 }}>
            <Text style={styles.planItemHeader}>{item.book !== "" ? item.book : item.work.replace("Doctrine And Covenants", "D&C")} {item.chapter}</Text>
            <Text style={styles.planItemVerses}>verses {item.verses}</Text>
          </View>
          {(status === "active" && !forceLocked) && (
            <HugeIcon
              icon='laurel-wreath-right'
              size={35}
              style={{ marginLeft: 15 }}
              color={theme.secondaryText}
            />
          )}
        </View>
        {status === "complete" && (
          // <Icon name={status === "complete" ? "arrow-rotate-right" : "play"} size={24} color={theme.secondaryText} style={{ marginTop: 5 }}/>
          <View style={styles.completedContainer}>
            <View style={[styles.flagContainer, { backgroundColor: light }]}>
              <FlagIcon size={24} color={color} />
              {/* <Text style={styles.flagText}>completed</Text> */}
            </View>
            <Text style={[styles.activeText, { color: theme.secondaryText, backgroundColor: theme.tertiaryBackground, }]}>
              <Icon name="arrow-rotate-right" size={18} color={theme.secondaryText} style={{ marginTop: 10 }}/> review chapter
            </Text>
          </View>
        )}

        {!forceLocked ? (
          <>
            {status === "active" && (
              <TouchableShrink
                onPress={() => {
                  hapticImpactSoft()
                  navigation.navigate('Chapter', {
                    work: item.work,
                    book: item.book,
                    chapter: item.chapter,
                    plan: {
                      verses: item.verses.split('-').map(verse => parseInt(verse)),
                      plan_info: {
                        plan_id: item.plan_id,
                        plan_name: "Come Follow Me",
                      },
                      plan_item_id: item.plan_item_id,
                    }
                  })
                }}
                style={styles.playButton}
              >
                <Text style={[styles.activeText, { color: color, backgroundColor: light, }]}>
                  <Icon name="play" size={18} color={color !== null ? color : theme.secondaryText} style={{ marginTop: 5 }}/> begin study
                </Text>
              </TouchableShrink>
            )}
          </>
        ) : (
          <Text style={styles.activeText}>
            <Icon name="calendar-day" size={18} color={theme.secondaryText} style={{ marginTop: 5 }}/> unlocks tomorrow
          </Text>
        )}

      </View>
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    locked: {
      borderWidth: 4,
      borderColor: theme.primaryBorder,
      borderStyle: "dashed",
    },
    active: {
      backgroundColor: theme.primaryBackground,
    },
    complete: {
      backgroundColor: theme.primaryBackground,
      opacity: 0.5,
    },
    planItemHeader: {
      fontSize: 24,
      fontWeight: "bold",
      fontFamily: "nunito-bold",
      color: theme.actionText,
      textAlign: "center",
    },
    planItemVerses: {
      fontSize: 16,
      fontFamily: "nunito-regular",
      color: theme.secondaryText,
      textAlign: "center",
    },
    playButton: {
      width: "75%",
      marginTop: 5,
    },
    activeText: {
      backgroundColor: theme.primaryBorder,
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 12,
      fontSize: 18,
      fontFamily: "nunito-bold",
      color: theme.secondaryText,
      textAlign: "center",
    },
    readingInformation: {
      backgroundColor: theme.primaryBackground,
      // borderWidth: 3,
      // borderColor: theme.primaryBorder,
      borderRadius: 10,
      paddingHorizontal: 5,
      paddingVertical: 22,
      flexDirection: "row",
      justifyContent: "space-around",
    },
    infoColumn: {
      width: "30%",
      alignItems: "center",
    },
    infoText: {
      fontFamily: "nunito-bold",
      fontSize: 16,
      marginTop: 5,
      color: theme.secondaryText,
    },
    completedContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    flagContainer: {
      borderRadius: 10,
      padding: 12,
      backgroundColor: theme.tertiaryBackground,
      marginRight: 10,
    },
  });
}