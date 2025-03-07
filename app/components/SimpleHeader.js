import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { hapticSelect } from '../utils/haptics'
import { useTheme } from '../hooks/ThemeProvider'

export default function SimpleHeader({
  navigation, 
  functionalNavigation = null,
  title = null,
  middleTitle = null,
  showChapterTitle,
  component = null,
  rightIcon = null,
  verticalPadding = 0
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const insets = useSafeAreaInsets()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showChapterTitle ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [showChapterTitle])

  return (
    <View style={[styles.header, { height: 60 + verticalPadding + insets.top, paddingTop: insets.top }]}>
      <View style={[styles.headerContent, { paddingVertical: verticalPadding, height: 60 + verticalPadding }]}>
        <TouchableOpacity
          onPress={() => {
            hapticSelect()
            if (functionalNavigation !== null) {
              functionalNavigation()
            } else {
              navigation.goBack()
            }
          }}
          style={[{ flexDirection: 'row', alignItems: 'center' }, !title && { width: 30, height: 50}, title && { flex: 1 }]}
          activeOpacity={0.7}
        >
          <Icon 
            name='chevron-left'
            size={20}
            color={theme.primaryText}
          />
          { title && (
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
          )}
        </TouchableOpacity>
        { component !== null && component }
        { showChapterTitle && middleTitle !== null &&
          <Animated.Text
            style={[styles.middleTitle, { opacity: fadeAnim }]}
            numberOfLines={1}
            ellipsizeMode={'tail'}
          >
            {
              middleTitle.includes("Joseph Smith") || middleTitle.includes("Doctrine And Covenants")
                ? middleTitle.includes("Joseph Smith")
                  ? `JS${middleTitle.replace("Joseph Smith", "")}`
                  : `D&C${middleTitle.replace("Doctrine And Covenants", "")}`
                : middleTitle
            }
          </Animated.Text> 
        }
        { rightIcon !== null && rightIcon }
      </View>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    header: {
      width: '100%',
      height: 100,
      paddingTop: 40,
      backgroundColor: theme.primaryBackground
    },
    headerContent: {
      flex: 1,
      width: '100%',
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    headerTitle: {
      flex: 1,
      fontFamily: 'nunito-bold',
      fontSize: 23,
      marginLeft: 10,
      color: theme.primaryText
    },
    middleTitle: {
      fontFamily: 'nunito-bold', 
      fontSize: 23, 
      flex: 1, 
      textAlign: 'center',
      color: theme.primaryText,
    }
  })
}