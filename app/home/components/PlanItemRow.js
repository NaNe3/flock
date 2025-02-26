import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'

import { useTheme } from "../../hooks/ThemeProvider";
import { constants } from "../../utils/styling/colors";

export default function PlanItemRow({ item }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [chapter] = useState(
    item.book === "" || item.book === null
      ? `${item.work.replace("Doctrine And Covenants", "D&C")} ${item.chapter}`
      : `${item.book.replace("Joseph Smith", "JS").replace("Doctrine And Covenants", "D&C")} ${item.chapter}`
  )

  return (
    <View style={styles.container}>
      <View style={styles.planDisplayContainer}>
        <Text style={styles.planDisplayText} >Come</Text>
        <Text style={styles.planDisplayText} >Follow</Text>
        <Text style={styles.planDisplayText} >Me</Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoContent}>
          <Text style={styles.infoChapter}>{chapter}</Text>
          <Text style={styles.infoVerses}>verses {item.verses}</Text>
        </View>
        <Icon name='lock' size={20} color={theme.secondaryText} style={{ marginRight: 10 }} />
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',

      backgroundColor: theme.tertiaryBackground,
      // borderWidth: 4,
      // borderColor: theme.primaryBorder,
      borderRadius: 14
    },
    planDisplayContainer: {
      width: 60,
      height: 70,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: constants.maroon,
    },
    planDisplayText: {
      fontFamily: 'nunito-bold',
      fontSize: 12,
      textAlign: 'center',
      color: constants.orange,
    },
    infoContainer: {
      flex: 1,
      marginLeft: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    infoChapter: {
      fontFamily: 'nunito-bold',
      fontSize: 24,
      color: theme.primaryText,
    },
    infoVerses: {
      fontFamily: 'nunito-bold',
      fontSize: 18,
      color: theme.secondaryText,
    },
  })
}