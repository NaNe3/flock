import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as ImagePicker from 'expo-image-picker'

import SimpleHeader from "../../../components/SimpleHeader"

import { hapticError, hapticImpactSoft, hapticSelect } from "../../../utils/haptics"
import SelectPhoto from "../../../components/SelectPhoto"
import { getPrimaryColor } from "../../../utils/getColorVariety"
import BasicButton from "../../../components/BasicButton"
import { getUserIdFromLocalStorage, setAttributeForObjectInLocalStorage } from "../../../utils/localStorage"
import { uploadAvatar } from "../../../utils/db-image"
import { downloadFileWithPath } from "../../../utils/db-download"
import { useTheme } from "../../../hooks/ThemeProvider"

const { width } = Dimensions.get('window')

export default function ChangeProfilePicture({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const insets = useSafeAreaInsets()
  const [color, setColor] = useState(theme.gray)
  const [image, setImage] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [buttonMessage, setButtonMessage] = useState('continue')

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setColor(color)
    }
    init()
  }, [])

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
    setUploading(true)
    setButtonMessage('uploading')

    try {
      const userId = await getUserIdFromLocalStorage()
      const { data, error } = await uploadAvatar(image, userId)
      
      if (data && !error) {
        const { uri } = await downloadFileWithPath('avatars', 'public/profile/', data.path.split('/').pop())
        await setAttributeForObjectInLocalStorage('user_information', 'avatar_path', uri)

        //finish logic here
        navigation.goBack()
      } else {
        setDisabled(true)
        setButtonMessage('try a different photo 1')
      }
    } catch (error) {
      setDisabled(true)
      console.log(error)
      setButtonMessage('try a different photo 2')
    }
    setUploading(false)
  }

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Change profile picture"
        onPress={() => {
          if (!uploading) {
            hapticSelect()
            navigation.goBack()
          } else {
            hapticError()
          }
        }}
      />
      <View style={styles.contentContainer}>
        <SelectPhoto
          image={image}
          color={color}
          pickImage={pickImage}
          containerStyle={[styles.avatarContainer, { width: width-100, height: width-100 }]}
          imageStyle={styles.avatarImage}
        />
        <BasicButton
          title={buttonMessage}
          onPress={() => {
            hapticImpactSoft()
            initiateUploadProcess()
          }}
          style={[styles.nextButton, { bottom: insets.bottom + 15 }]}
          disabled={disabled}
        />
      </View>
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
      backgroundColor: theme.secondaryBackground,
      alignItems: 'center',
    },
    avatarContainer: {
      borderWidth: 7,
      borderColor: theme.primaryBorder,
      borderRadius: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 7,
      marginTop: 50
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 1000,
    },
    nextButton: {
      position: 'absolute',
      alignSelf: 'center',
    },
  })
}