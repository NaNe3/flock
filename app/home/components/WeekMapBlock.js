import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'

import { useTheme } from "../../hooks/ThemeProvider";
import MapLine from "./MapLine";
import BasicButton from "../../components/BasicButton";
import { getLocallyStoredVariable } from "../../utils/localStorage";
import { getPrimaryColor } from "../../utils/getColorVariety";
import { useFocusEffect } from "@react-navigation/native";

export default function MapBlock({
  navigation,
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  const [status, setStatus] = useState('locked')
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [completedCount, setCompletedCount] = useState(0)
  const [itemsToComplete, setItemsToComplete] = useState(0)
  const [completion, setCompletion] = useState(0)
  const [color, setColor] = useState(theme.actionText)

  const init = async () => {
    const color = await getPrimaryColor()
    setColor(color)
    const currentPlan = JSON.parse(await getLocallyStoredVariable('user_plans'))[0]
    const planItems = JSON.parse(await getLocallyStoredVariable(`plan_${currentPlan.plan_id}_items`))
    const piIds = planItems.map(pi => pi.plan_item_id)
    setItemsToComplete(piIds.length)

    const logs = JSON.parse(await getLocallyStoredVariable('user_logs'))
    const completed = logs.filter(log => piIds.includes(log.plan_item_id))
    setCompletedCount(completed.length)
    setCompletion((completed.length / piIds.length) * 100)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  return (
    <>
      <MapLine />
      <View
        style={[
          styles.container,
          status === "locked" ? styles.locked : status === "active" ? styles.active : styles.complete,
        ]}
      >
        {status === "locked" && (
          <Icon name="lock" size={24} color={theme.secondaryText} />
        )}
        <View style={styles.planItemContainer}>
          <Text style={styles.planItemHeader}>unlock review</Text>
          <Text style={[styles.weekCompletionHeader, { marginBottom: 20 }]}>{completedCount}/{itemsToComplete}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${completion}%`, backgroundColor: color }]} />
          </View>
        </View>

        {status === "active" && (
          <BasicButton
            title={`${7} minutes`}
            icon='clock-o'
            onPress={() => navigation.navigate("StudyPage")}
            style={{ marginBottom: 10 }}
          />
        )}
      </View>
    </>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      borderRadius: 20,
      padding: 20,
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
    },
    planItemHeader: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
      textAlign: 'center',
    },
    weekCompletionHeader: {
      fontSize: 24,
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
    },
    planItemContainer: {
      marginVertical: 10, 
      flex: 1, 
      width: '100%', 
      justifyContent: 'center', 
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.primaryBorder,
      overflow: 'hidden',
    },
    progress: {
      flex: 1,
      borderRadius: 100
    }
  })
}