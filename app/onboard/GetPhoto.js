import { useEffect, useRef, useState } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker'

import { uploadAvatar } from '../utils/db-image'
import BasicButton from '../components/BasicButton'
import { hapticSelect } from '../utils/haptics';
import { setAttributeForObjectInLocalStorage } from '../utils/localStorage';
import { downloadFileWithPath } from '../utils/db-download';
import SelectPhoto from '../components/SelectPhoto';

export default function GetPhoto({ setCurrentScreen, onboardingData, setOnboardingData }) {
  const [disabled, setDisabled] = useState(true)
  const [image, setImage] = useState(null)
  const [width, setWidth] = useState(Dimensions.get('window').width)
  const [buttonMessage, setButtonMessage] = useState('Aight. We Ball')

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setImage(result.assets[0].uri)
      setDisabled(false)
    }
  }

  const initiateUploadProcess = async () => {
    setDisabled(true)
    setButtonMessage('Uploading...')
    const { data, error } = await uploadAvatar(image, onboardingData.id)
    
    if (data && !error) {
      const { uri } = await downloadFileWithPath('avatars', 'public/profile/', data.path.split('/').pop())
      await setAttributeForObjectInLocalStorage('userInformation', 'avatar_path', uri)

      setCurrentScreen(prev => prev + 1)
    } else {
      setDisabled(true)
      setButtonMessage('Try a different photo')
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.container}>
        {/* <TouchableOpacity 
          onPress={() => {
            hapticSelect()
            pickImage()
          }}
          activeOpacity={0.7}
        >
          <Animated.View style={[
            styles.avatarContainer,
            image && { borderColor: borderColor },
            { width: width-100, height: width-100 }
          ]}>
            {
              !image
                ? <Text style={styles.instruction}>Upload a photo</Text>
                : <Image source={{ uri: image }} style={styles.avatarImage} />
            }
          </Animated.View>
        </TouchableOpacity> */}
        <SelectPhoto
          image={image}
          pickImage={pickImage}
          containerStyle={[styles.avatarContainer, { width: width-100, height: width-100 }]}
          imageStyle={styles.avatarImage}
        />
        <Text style={styles.userNameText}>{onboardingData.fname} {onboardingData.lname}</Text>
      </View>
      <BasicButton
        title={buttonMessage}
        onPress={initiateUploadProcess}
        style={{ marginBottom: 60, marginTop: 20}}
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
    justifyContent: 'center',
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
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: '#616161',
  }
})