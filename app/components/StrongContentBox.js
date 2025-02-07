import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Touchable, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useTheme } from '../hooks/ThemeProvider'

export default function StrongContentBox({ 
  navigation,
  title,
  icon,
  onPress = null,
  children
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <View style={styles.container}>
      <View style={{ 
        borderBottomWidth: 2,
        borderColor: theme.primaryBorder, 
      }}>
        <Text style={styles.containerTitle}>{title}</Text>
      </View>
      <View style={styles.groupRowContainer}>
        {children}
        {
          onPress !== null && <TouchableOpacity 
            onPress={onPress}
            style={{
              padding: 15,
            }}
          >
            <Text style={styles.createGroupButton}><Icon name="plus" size={18} color={theme.actionText} /> ADD FRIENDS</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: theme.primaryBackground,
      borderRadius: 15,
      marginTop: 30,
    },
    containerTitle: {
      fontSize: 16,
      fontFamily: 'nunito-bold',
      color: theme.actionText,
      marginLeft: 15,
      marginVertical: 15,
    }, 
    groupRowContainer: {
      width: '100%',
    },
    createGroupButton: {
      textAlign: 'center',
      fontFamily: 'nunito-bold',
      color: theme.primaryText,
      fontSize: 16,
    }
  })
}