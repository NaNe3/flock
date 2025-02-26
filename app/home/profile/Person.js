import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"

import { useTheme } from "../../hooks/ThemeProvider"

import SimpleHeader from "../../components/SimpleHeader"
import PersonRow from "../components/PersonRow"
import ActivityRow from "../components/ActivityRow"
import { getLocallyStoredVariable } from "../../utils/localStorage"
import { getActivityByListOfIds } from "../../utils/authenticate"

export default function Person({ navigation, route }) {
  const { person } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [activity, setActivity] = useState([])

  const init = async () => {
    const daily = JSON.parse(await getLocallyStoredVariable('daily_impressions'))
    const activityIds = daily.map(d => d.activity_id)
    const activity = await getActivityByListOfIds(activityIds)
    setActivity(activity)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        component={
          <PersonRow
            person={person}
          />
        }
        verticalPadding={20}
      />
      <ScrollView style={styles.contentContainer}>
        {
          activity.map((a, i) => (
            <ActivityRow 
              key={`activity-${i}`}
              activity={a}
            />
          ))
        }
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    personPhoto: {
      width: 35,
      height: 42,
      backgroundColor: theme.lightestGray,
      borderRadius: 5,
      marginRight: 10
    },
    personName: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
    },
  })
}