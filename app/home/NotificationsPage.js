import { View, StyleSheet, ScrollView } from 'react-native'

import SimpleHeader from '../components/SimpleHeader';
import { useTheme } from '../hooks/ThemeProvider';
import { useEffect, useState } from 'react';

export default function NotificationsPage({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <SimpleHeader navigation={navigation} title="Notifications" />
      <ScrollView style={styles.notificationContainer}>
        
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
    },
    notificationContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    }
  })
}