import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6'
import { useFocusEffect } from "@react-navigation/native"
import * as Updates from 'expo-updates'

import SimpleHeader from "../../components/SimpleHeader";
import StrongContentBox from "../../components/StrongContentBox";
import { hapticImpactHeavy, hapticSelect } from "../../utils/haptics";
import { getLocallyStoredVariable } from "../../utils/localStorage";
import { useTheme } from "../../hooks/ThemeProvider";
import { removeUserSession } from "../../utils/authenticate";

export default function ProfileSettings({ navigation }) {
  const { theme, currentTheme, changeTheme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const [color, setColor] = useState({ color_hex: 'transparent' })

  const init = async () => {
    const userInformation = JSON.parse(await getLocallyStoredVariable('user_information'))
    setColor(userInformation.color)
  }

  useFocusEffect(
    useCallback(() => {
      init()
    }, [])
  )

  const handleSignOut = async () => {
    hapticImpactHeavy()
    await removeUserSession()
    await Updates.reloadAsync()
  }

  return (
    <View style={styles.container}>
      <SimpleHeader 
        title='Settings' 
        navigation={navigation}
      />
      <ScrollView style={styles.contentContainer}>
        <StrongContentBox 
          title={'ACCOUNT'}
          navigation={navigation}
        >
          <View style={styles.optionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticSelect()
                navigation.navigate('ChangeProfileName')
              }}
            >
              <Text style={styles.optionRowText}>change name</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticSelect()
                navigation.navigate('ChangeProfilePicture')
              }}
            >
              <Text style={styles.optionRowText}>change profile picture</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticSelect()
                changeTheme(currentTheme === 'light' ? 'dark' : 'light')
              }}
            >
              <Text style={styles.optionRowText}>change to { currentTheme === 'light' ? 'dark' : 'light' } mode</Text>
            </TouchableOpacity>
            
            <Switch
              trackColor={{false: '#616161', true: '#DDD'}}
              thumbColor={currentTheme === 'light' ? '#fff' : '#bbb'}
              ios_backgroundColor="#616161"
              onChange={() => {
                changeTheme(currentTheme === 'light' ? 'dark' : 'light')
              }}
              value={currentTheme === 'light'}
            />
          </View>
          <View style={styles.optionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                hapticSelect()
                navigation.navigate('ChangeProfileColor')
              }}
            >
              <Text style={[styles.optionRowText, { color: color.color_hex }]}>change color 🎨</Text>
            </TouchableOpacity>
          </View>
        </StrongContentBox>

        <TouchableOpacity
          onPress={handleSignOut}
        >
          <Text style={styles.danger}>
            <Icon name="delete-left" size={16} color={theme.red} /> Sign out
          </Text>
        </TouchableOpacity>
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
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    optionRow: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionRowText: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.primaryText
    },
    danger: {
      fontFamily: 'nunito-bold',
      fontSize: 16,
      color: theme.red,
      marginVertical: 35,
      marginLeft: 10,
    }
  })
}