import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector, gestureHandlerRootHOC, GestureHandlerRootView } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome6'

import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera'
import { Audio } from 'expo-av'

import VideoPreview from '../components/VideoPreview'

import { hapticError, hapticImpactSoft, hapticSelect } from '../utils/haptics'
import { constants } from '../utils/styling/colors'
import { uploadMedia } from '../utils/db-media'
import { deleteLocalFileWithPath, getLocalUriForFile } from '../utils/db-download';
import { getAttributeFromObjectInLocalStorage } from '../utils/localStorage';
import FadeInView from '../components/FadeInView';
import BasicBottomSheet from './components/BasicBottomSheet';
import GroupSelection from './components/GroupSelection';
import MicrophoneCameraPermissions from '../components/MicrophoneCameraPermissions';
import { getColorVarietyAsync } from '../utils/getColorVariety';
import { ActivityActionWheel } from './components/ActivityActionWheel';
import { WriteMessage } from './components/WriteMessage';

function Capture({ navigation, route }) {
  const { location } = route.params
  const insets = useSafeAreaInsets()
  const [camera, setCamera] = useState({
    'facing': 'front',
    'output': null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [selectingGroup, setSelectingGroup] = useState(false)

  const [main, setMain] = useState({})
  const [userAvatar, setUserAvatar] = useState('')
  const [recipientAvatar, setRecipientAvatar] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState({
    recipient_id: null,
    recipient: 'all friends',
  })

  const [locked, setLocked] = useState(false)
  const recordOnTap = useRef(false)
  const recordingRef = useRef(false)
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState("0:00")

  const [cameraStatus, setCameraStatus] = useState(null)
  const [microphoneStatus, setMicrophoneStatus] = useState(null)

  const [gestures, setGestures] = useState({ takePictureGesture: null, recordGesture: null })
  const cameraRef = useRef(null)
  const intervalRef = useRef(null)

  const [selected, setSelected] = useState(0)

  useEffect(() => {
    recordingRef.current = recording
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

  useEffect(() => {
    const findMicrophonePermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setMicrophoneStatus(status === 'granted')
      } catch (error) { console.error(error) }
    }

    const findCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraStatus(status === 'granted')
      } catch (error) { console.error(error) }
    }

    findMicrophonePermissions()
    findCameraPermissions()

    // GESTURES CREATION AND CLEANUP
    const takePictureGesture = Gesture.Tap().onEnd(() => {
      if (!recordOnTap.current) {
        takePicture()
      } else {
        if (recordingRef.current) {
          stopRecording()
        } else {
          hapticImpactSoft()
          setRecording(true)
        }
      }
    }).runOnJS(true).shouldCancelWhenOutside(false)
    const recordGesture = Gesture.LongPress().maxDistance(50).onStart(() => {
      hapticImpactSoft()
      setRecording(true)
    }).onEnd(() => {
      stopRecording()
    }).runOnJS(true).shouldCancelWhenOutside(false)
    setGestures({ takePictureGesture, recordGesture })

    // GET PROFILE INFORMATION
    const init = async () => {
      const colors = await getColorVarietyAsync()
      setMain(colors)

      const profilePicture = await getAttributeFromObjectInLocalStorage('user_information', 'avatar_path')
      const profileURI = getLocalUriForFile(profilePicture)
      setUserAvatar(profileURI)
      setRecipientAvatar(profileURI)
    }

    init()

    return () => {
      setGestures({ takePictureGesture: null, recordGesture: null })
    };
  }, [])

  const toggleCameraFacing = () => {
    if (!recording) {
      hapticSelect()
      setCamera({ ...camera, facing: camera.facing === 'front' ? 'back' : 'front' })
    }
  }

  const takePicture = () => {
    hapticImpactSoft()
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
      const video = await cameraRef.current.recordAsync({
        maxDuration: 90,
        codec: 'avc1',
      })

      setCamera({ ...camera, output: video.uri, isVideo: true })
      setRecording(false)
      // const fileInfo = await FileSystem.getInfoAsync(video.uri)
      // console.log('File size:', fileInfo.size/1000000)
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

  const getSeconds = (time) => {
    const timeSplit = time.split(':')
    const minutes = timeSplit[0]
    const seconds = timeSplit[1]

    return parseInt(minutes) * 60 + parseInt(seconds)
  }

  const uploadRecordedMedia = async (location, media, media_type) => {
    hapticImpactSoft()
    setIsUploading(true)

    const { data, error } = await uploadMedia({
      location,
      media,
      media_type,
      duration: getSeconds(duration),
      recipient_id: selectedRecipient.recipient_id
    })

    if (error) {
      // TODO - Create an alert if upload is a failure
    } else {
      navigation.goBack()
    }
  }

  if (cameraStatus === null || microphoneStatus === null) {
    // Camera permissions are still loading.
    return <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  }

  if (!cameraStatus || !microphoneStatus) {
    // Camera permissions are not granted yet.
    return (
      <MicrophoneCameraPermissions
        cameraStatus={cameraStatus}
        setCameraStatus={setCameraStatus}
        microphoneStatus={microphoneStatus}
        setMicrophoneStatus={setMicrophoneStatus}
      />
    )
  }


  return (
    <>
      <GestureHandlerRootView style={[styles.container, { paddingTop: insets.top -10 }]}>
        <View style={[styles.cameraContainer, recording && {
          borderColor: main.primaryColor,
        }]}>
          {
            camera.output === null ? selected === 1 ? (
              <WriteMessage
                navigation={navigation}
                location={location}
                recipient={{
                  avatar: recipientAvatar,
                  info: selectedRecipient,
                  action: setSelectingGroup,
                }}
              />
            ) : (
              <CameraView
                style={styles.camera}
                facing={camera.facing}
                mode={recording ? 'video' : 'photo'}
                ref={cameraRef}
                mirror={camera.facing === 'front'}
                videoQuality='480p'
                videoBitrate={1000000}
              >
                {!recording && (
                  <TouchableOpacity
                    style={styles.exitButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      hapticSelect()
                      navigation.goBack()
                    }}
                  >
                    <Icon name="xmark" size={30} color="#fff" />
                  </TouchableOpacity>
                )}

                {recording && (
                  <View style={styles.timer}>
                    <Text style={{ color: constants.lightestGray, fontSize: 20, fontFamily: 'nunito-regular' }}>{duration}</Text>
                  </View>
                )}

                <View style={styles.cameraActionBar}>
                  {!recording && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        if (!recording) {
                          hapticSelect()
                          recordOnTap.current = !recordOnTap.current
                          setLocked(recordOnTap.current)
                        }
                      }}
                      style={styles.flipButton}
                    >
                      <Icon name={locked ? "lock" : "unlock"} size={30} color='#fff' />
                    </TouchableOpacity>
                  )}

                  <GestureDetector
                    gesture={Gesture.Simultaneous(gestures.takePictureGesture, gestures.recordGesture)}
                  >
                    <View style={styles.recordButton}>
                      <TouchableOpacity
                        style={{ flex: 1, backgroundColor: recording ? main.primaryColor : '#fff', borderRadius: 50 }}
                        activeOpacity={0.7}
                      />
                    </View>
                  </GestureDetector>

                  {!recording && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.flipButton}
                      onPress={toggleCameraFacing}
                    >
                      <Icon name="camera-rotate" size={30} color='#fff' />
                    </TouchableOpacity>
                  )}
                </View>
              </CameraView>
            ) : (
              <View style={{ flex: 1, overflow: 'hidden' }}>
                {camera.output && !camera.isVideo && <Image source={{ uri: camera.output }} style={{ flex: 1, borderRadius: 20 }} />}
                {camera.output && camera.isVideo && (
                  <VideoPreview
                    source={{ uri: camera.output }}
                    includeBottomShadow={false}
                  />
                )}
                {camera.output && camera.isVideo && (
                  <View style={styles.timerPreview}>
                    <Text style={{ color: constants.lightestGray, fontSize: 20, fontFamily: 'nunito-regular' }}>{duration}</Text>
                  </View>
                )}
                {isUploading && (
                  <FadeInView style={styles.uploadingBox}>
                    <Text style={styles.uploadText}>uploading ...</Text>
                  </FadeInView>
                )}
                <TouchableOpacity
                  style={[styles.exitButton, isUploading && { opacity: 0.5 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isUploading) {
                      hapticSelect()
                      deleteLocalFileWithPath(camera.output)
                      setCamera({ ...camera, output: null, isVideo: false })
                    }
                  }}
                >
                  <Icon name="trash" size={25} color='#fff' />
                </TouchableOpacity>
              </View>
            )
          }
        </View>
        <View style={[styles.cameraFooter, { marginBottom: insets.bottom }]}>
          {
            camera.output ? (
              <>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.recipientContainer, isUploading && { opacity: 0.5 }]}
                  onPress={() => {
                    if (!isUploading) {
                      if (selectingGroup) {
                        setSelectingGroup(false)
                      } else {
                        hapticSelect()
                        setSelectingGroup(true)
                      }
                    } else {
                      hapticError()
                    }
                  }}
                >
                  <Image source={{ uri: recipientAvatar }} style={styles.recipientAvatar} />
                  <Text 
                    style={styles.recipientText}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >{selectedRecipient.recipient}</Text>
                  <Icon name="chevron-down" size={15} color={constants.lightestGray} style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <View style={styles.sendButtonContainer}>
                  <TouchableOpacity 
                    style={[styles.sendButton, { backgroundColor: main.primaryColor }, isUploading && { opacity: 0.5 }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (!isUploading) {
                        uploadRecordedMedia(location, camera.output, camera.isVideo ? 'video' : 'picture')
                      }
                    }}
                  >
                    <Icon name="feather-pointed" size={25} color='#fff' />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ActivityActionWheel
                selected={selected}
                setSelected={setSelected}
              />
            )
          }
        </View>
      </GestureHandlerRootView>
      {selectingGroup &&
        <BasicBottomSheet
          title="sending to"
          setVisibility={setSelectingGroup}
          backgroundColor={constants.heckaGray2}
          titleColor={constants.lightestGray}
        >
          <GroupSelection
            userAvatar={userAvatar}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            setRecipientAvatar={setRecipientAvatar}
            setSelectingGroup={setSelectingGroup}
            theme='dark'
          />
        </BasicBottomSheet>
      }
    </>
  )
}

export default gestureHandlerRootHOC(Capture)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: constants.gray,
  },
  cameraContainer: {
    flex: 1, 
    padding: 6,
    borderRadius: 32,
    borderWidth: 6,
    overflow: 'hidden',
  },
  cameraFooter: {
    height: 55,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: constants.lightGray,
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

  recipientContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 30,
  },
  recipientAvatar: {
    width: 35,
    height: 35,
    borderRadius: 30,
  },
  recipientText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: constants.lightestGray,
    marginLeft: 10,
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    width: 55,
    height: 55,
    marginHorizontal: 10,
    borderRadius: 50,
  },
  sendButton: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  uploadText: {
    color: constants.lightestGray,
    fontSize: 20,
    fontFamily: 'nunito-regular',
  }
})