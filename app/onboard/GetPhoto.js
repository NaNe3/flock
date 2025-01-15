import { useEffect, useRef, useState } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'

import { uploadAvatar } from '../utils/db-image'
import OnboardButton from '../components/OnboardButton'
import { hapticImpactSoft, hapticSelect } from '../utils/haptics'
import { getUserIdFromLocalStorage, setAttributeForObjectInLocalStorage } from '../utils/localStorage'
import { downloadFileWithPath } from '../utils/db-download'
import SelectPhoto from '../components/SelectPhoto'

export default function GetPhoto({ 
  onboardingData, 
  setOnboardingData, 
  setCurrentScreen,
  uploadCleanup,
  buttonTitle=null,
  removeHeader=false,
}) {
  const insets = useSafeAreaInsets()
  const [image, setImage] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const [buttonMessage, setButtonMessage] = useState('next')
  const [width, setWidth] = useState(Dimensions.get('window').width)

  useEffect(() => {
    if (!image) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }, [image])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setImage(result.assets[0].uri)
      setOnboardingData(prev => ({ ...prev, avatar: result.assets[0].uri }))
      setDisabled(false)
    }
  }

  const initiateUploadProcess = async () => {
    setDisabled(true)
    setButtonMessage('uploading')

    try {
      const userId = await getUserIdFromLocalStorage()
      const { data, error } = await uploadAvatar(image, userId)
      
      if (data && !error) {
        const { uri } = await downloadFileWithPath('avatars', 'public/profile/', data.path.split('/').pop())
        await setAttributeForObjectInLocalStorage('user_information', 'avatar_path', uri)

        if (uploadCleanup === null || uploadCleanup === undefined) {
          setCurrentScreen(prev => prev + 1)
        } else {
          uploadCleanup()
        }
      } else {
        setDisabled(true)
        setButtonMessage('try a different photo 1')
      }
    } catch (error) {
      setDisabled(true)
      console.log(error)
      setButtonMessage('try a different photo 2')
    }
  }

  return (
    <View style={styles.container}>
      {!removeHeader ? (
        <View style={{ marginVertical: 50 }}>
          <Text style={styles.instruction}>choose your</Text>
          <Text style={[styles.instruction, { fontSize: 30 }]}>profile picture</Text>
        </View>
      ) : (
        <View style={{ marginVertical: 30 }} />
      )}
      <SelectPhoto
        image={image}
        color={onboardingData.color.color_hex}
        pickImage={pickImage}
        containerStyle={[styles.avatarContainer, { width: width-100, height: width-100 }]}
        imageStyle={styles.avatarImage}
      />
      <OnboardButton
        title={buttonTitle !== null && buttonMessage === "next" ? buttonTitle : buttonMessage}
        color={onboardingData.color.color_hex}
        onPress={() => {
          hapticImpactSoft()
          initiateUploadProcess()
        }}
        style={[styles.nextButton, { bottom: insets.bottom + 15 }]}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    borderWidth: 7,
    borderColor: '#ccc',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  userNameText: {
    fontSize: 36,
    fontFamily: 'nunito-bold',
    color: '#000',
    marginTop: 20,
  },
  instruction: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: '#AAA',
  },
  nextButton: {
    position: 'absolute',
    alignSelf: 'center',
  },
})