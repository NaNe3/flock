import { Alert, AppState, Linking, StyleSheet, Switch, Text, View } from "react-native"
import { constants } from "../utils/styling/colors"
import { Camera } from "expo-camera"
import { useEffect, useState } from "react";

export default function MicrophoneCameraPermissions({
  cameraStatus,
  setCameraStatus,
  microphoneStatus,
  setMicrophoneStatus,
}) {
  const [appState, setAppState] = useState(AppState.currentState);
  const [lastChecked, setLastChecked] = useState(null)

  const requestPermissionsToCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setCameraStatus(status === 'granted')

    if (status !== 'granted') {
      setLastChecked('camera')
      Alert.alert(
        "Camera Permission",
        "Camera permission is required to use this feature. Please enable it in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  const requestPermissionsToMicrophone = async () => {
    const { status } = await Camera.requestMicrophonePermissionsAsync()
    setMicrophoneStatus(status === 'granted')

    if (status !== 'granted') {
      setLastChecked('microphone')
      Alert.alert(
        "Microphone Permission",
        "Microphone permission is required to use this feature. Please enable it in the app settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      )
    }
  }

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Check permissions again when the app comes to the foreground
        if (lastChecked === 'camera') requestPermissionsToCamera();
        if (lastChecked === 'microphone') requestPermissionsToMicrophone();
        setLastChecked(null);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>allow access</Text>

      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Camera</Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              ios_backgroundColor="#3e3e3e"
              onChange={() => {
                if (!cameraStatus) {
                  requestPermissionsToCamera()
                }
              }}
              value={cameraStatus}
            />
          </View>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Microphone</Text>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              ios_backgroundColor="#3e3e3e"
              onChange={() => {
                if (!microphoneStatus) {
                  requestPermissionsToMicrophone()
                }
              }}
              value={microphoneStatus}
            />
          </View>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'nunito-bold',
    color: '#fff',
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
    backgroundColor: constants.heckaGray,
  },
  permissionText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: '#fff',
  }
})