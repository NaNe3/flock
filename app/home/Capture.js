import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Gesture, GestureDetector, gestureHandlerRootHOC, GestureHandlerRootView } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome6'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av'

import VideoPreview from '../components/VideoPreview'

import { hapticImpactSoft } from '../utils/haptics'
import { gen } from '../utils/styling/colors'
import { uploadMedia } from '../utils/db-media';

function Capture({ navigation, route }) {
  const location = route.params
  const [camera, setCamera] = useState({
    'facing': 'front',
    'output': null
  });
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState("0:00")
  const [permission, requestPermission] = useCameraPermissions();
  const [gestures, setGestures] = useState({ takePictureGesture: null, recordGesture: null })
  const cameraRef = useRef(null)
  const intervalRef = useRef(null)


  useEffect(() => {
    if (recording) {
      startRecording()
      setDuration("0:00")
      intervalRef.current = setInterval(() => {
        setDuration(prevDuration => {
          const dividedTime = prevDuration.split(':')
          const currentTime = parseInt(dividedTime[0]) * 60 + parseInt(dividedTime[1]) + 1
          return `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')}`
        })
      }, 1000);
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current);
  }, [recording]);


  const toggleCameraFacing = () => {
    setCamera({ ...camera, facing: camera.facing === 'front' ? 'back' : 'front' })
  }

  const takePicture = () => {
    cameraRef.current.takePictureAsync({ quality: 0.5, base64: true })
      .then((data) => {
        setCamera({ ...camera, output: data.uri, isVideo: false })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const startRecording = async () => {
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: 45 })
      setCamera({ ...camera, output: video.uri, isVideo: true })
      setRecording(false)
      console.log('output sent to ', video.uri)
    } catch (error) {
      console.error(error)
    }
  }

  const stopRecording = async () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording()
      setRecording(false)
    }
  }

  // const takePictureGesture = Gesture.Tap().onEnd(() => {
  //   takePicture()
  // }).runOnJS(true)

  // const recordGesture = Gesture.LongPress().onStart(() => {
  //   hapticImpactSoft()
  //   setRecording(true)
  // }).onEnd(() => {
  //   stopRecording()
  // }).runOnJS(true)

  const uploadRecordedMedia = async (location, media, media_type) => {
    const { data, error } = await uploadMedia(location, media, media_type)

    if (error) {
      // TODO - Create an alert if upload is a failure
    } else {
      navigation.goBack()
    }
  }

  useEffect(() => {
    const findMicrophonePermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
      } catch (error) {
        console.error(error)
      }
    }
    findMicrophonePermissions()

    // GESTURES CREATION AND CLEANUP
    const takePictureGesture = Gesture.Tap().onEnd(() => {
      takePicture();
    }).runOnJS(true).shouldCancelWhenOutside(true);
    const recordGesture = Gesture.LongPress().onStart(() => {
      hapticImpactSoft();
      setRecording(true);
    }).onEnd(() => {
      stopRecording();
    }).runOnJS(true).shouldCancelWhenOutside(true);
    setGestures({ takePictureGesture, recordGesture });

    return () => {
      setGestures({ takePictureGesture: null, recordGesture: null })
    };
  }, [])

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.cameraContainer, recording && {
        borderColor: gen.red,
      }]}>
        {
          camera.output === null ? (
            <CameraView
              style={styles.camera}
              facing={camera.facing}
              mode={recording ? 'video' : 'photo'}
              ref={cameraRef}
              mirror={camera.facing === 'front'}
            >
              <TouchableOpacity
                style={styles.exitButton}
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
              >
                <Icon name="xmark" size={30} color='#fff' />
              </TouchableOpacity>

              {recording && (
                <View style={styles.timer}>
                  <Text style={{ color: gen.lightestGray, fontSize: 20, fontFamily: 'nunito-regular' }}>{duration}</Text>
                </View>
              )}

              <View style={styles.cameraActionBar}>
                <TouchableOpacity style={styles.flipButton}>
                  <Icon name="font" size={30} color='#fff' />
                </TouchableOpacity>

                <View style={styles.recordButton}>
                  <GestureDetector
                    gesture={Gesture.Simultaneous(gestures.takePictureGesture, gestures.recordGesture)}
                  >
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: recording ? gen.red : '#fff', borderRadius: 50 }}
                      activeOpacity={0.7}
                    >

                    </TouchableOpacity>
                  </GestureDetector>
                </View>

                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <Icon name="camera-rotate" size={30} color='#fff' />
                </TouchableOpacity>
              </View>
            </CameraView>

          ) : (
            <View style={{ flex: 1, overflow: 'hidden' }}>
              {camera.output && !camera.isVideo && <Image source={{ uri: camera.output }} style={{ flex: 1, borderRadius: 20 }} />}
              {camera.output && camera.isVideo && (
                <VideoPreview
                  source={{ uri: camera.output }}
                />
              )}
              {camera.output && camera.isVideo && (
                <View style={styles.timerPreview}>
                  <Text style={{ color: gen.lightestGray, fontSize: 20, fontFamily: 'nunito-regular' }}>{duration}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.exitButton}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO - DELETE THE CACHED FILE
                  setCamera({ ...camera, output: null, isVideo: false })
                }}
              >
                <Icon name="xmark" size={30} color='#fff' />
              </TouchableOpacity>
            </View>
          )
        }
      </View>
      <View style={styles.cameraFooter}>
        {
          camera.output && (
            <>
              <View style={styles.groupContainer}>
                <View style={styles.groupSelection}>

                </View>
              </View>
              <TouchableOpacity 
                style={styles.sendButton}
                activeOpacity={0.7}
                onPress={() => {
                  uploadRecordedMedia(location, camera.output, camera.isVideo ? 'video' : 'picture')
                }}
              >
                <Text style={{ color: "#fff", fontSize: 20, fontFamily: 'nunito-bold' }}>
                  SEND <Icon name="paper-plane" size={20} color='#fff' />
                </Text>
              </TouchableOpacity>
            </>
          )
        }
      </View>
    </GestureHandlerRootView>
  )
}

export default gestureHandlerRootHOC(Capture)

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: gen.gray,
  },
  cameraContainer: {
    flex: 1, 
    padding: 6,
    borderRadius: 32,
    borderWidth: 6,
    overflow: 'hidden',
  },
  cameraFooter: {
    height: 100,
    backgroundColor: 'black',
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  exitButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraActionBar: {
    width: '100%',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    position: 'absolute',
    bottom: 0,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderWidth: 6,
    borderRadius: 50,
    borderColor: gen.lightGray,
    overflow: 'hidden',
    padding: 5,
  },
  flipButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    alignSelf: 'center',
    marginTop: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(100,100,100,0.7)',
    borderRadius: 10,
  },
  timerPreview: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(100,100,100,0.7)',
    borderRadius: 10,
  },
  groupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 20,
    padding: 7,
  },
  groupSelection: {
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  sendButton: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  }
})