import { Alert, AppState, Linking, StyleSheet, Switch, Text, View } from "react-native";
import { use, useEffect, useState } from "react";
import * as Notifications from 'expo-notifications';

import { gen } from "../utils/styling/colors";

export default function Permissions({ setDisabled, onboardingData }) {
  const [appState, setAppState] = useState(AppState.currentState);
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [pushStatus, setPushStatus] = useState(false)


  useEffect(() => {
    const init = async () => {
      await checkNotificationPermissions()
    }

    setDisabled(true)
    init()
  }, [])

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        checkNotificationPermissions()
      }
      setAppState(nextAppState)
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => { subscription.remove() }
  }, [appState])

  useEffect(() => {
    if (notificationStatus) {
      setDisabled(false)
    }
  }, [notificationStatus])

  const requestNotificationPermissions = async () => {
    const { status: newStatus } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      }
    })
    setNotificationStatus(newStatus === 'granted')

    if (newStatus !== 'granted') {
      Alert.alert(
        "Permission to use Notifications",
        "We will notify you when you have a new message or a new friend request.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync()
    console.log('status', status)
    setNotificationStatus(status === 'granted')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>allow access</Text>

      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Notifications</Text>
            <Switch
              trackColor={{false: '#767577', true: onboardingData.color.color_hex}}
              ios_backgroundColor="#767577"
              onChange={() => {
                if (!notificationStatus) {
                  requestNotificationPermissions()
                }
              }}
              value={notificationStatus}
            />
          </View>
          {/* <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Microphone</Text>
            <Switch
              trackColor={{false: '#767577', true: onboardingData.color.color_hex}}
              ios_backgroundColor="#767577"
              onChange={() => {
                if (!pushStatus) {
                  console.log('requesting permissions to microphone')
                  setPushStatus(true)
                }
              }}
              value={pushStatus}
            />
          </View> */}
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'nunito-bold',
    color: "#000",
  },
  permissionContainer: {
    height: 100,
    width: '100%',
    marginVertical: 30,
  },
  permissionRow: {
    marginVertical: 5,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
  },
  permissionText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: '#999',
  }
})