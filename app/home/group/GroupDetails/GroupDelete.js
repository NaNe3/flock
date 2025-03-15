import { useEffect, useRef, useState } from "react"
import { Keyboard, StyleSheet, Text, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome'

import SimpleHeader from "../../../components/SimpleHeader"
import BasicTextInput from "../../../components/BasicTextInput"
import BasicButton from "../../../components/BasicButton"

import { deleteGroupByGroupId } from "../../../utils/db-image"
import { useTheme } from "../../../hooks/ThemeProvider"
import { useHolos } from "../../../hooks/HolosProvider"

export default function GroupDelete({ navigation, route }) {
  const { group_id, group_name, group_image } = route.params
  const { theme } = useTheme()
  const { setGroups } = useHolos()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const inputRef = useRef(null)
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(true)
  const [verification, setVerification] = useState('')

  useEffect(() => {
    if (verification === 'Okay') {
      setDeleteButtonDisabled(false)
      Keyboard.dismiss()
    } else {
      setDeleteButtonDisabled(true)
    }
  }, [verification])

  const handleDeleteGroup = async () => {
    setDeleteButtonDisabled(true) 
    const { error } = await deleteGroupByGroupId(group_id, group_image)
    setGroups(groups => groups.filter(group => group.group_id !== group_id))

    // TODO - handle error in group delete
    navigation.navigate('FriendsPage')
  }

  return (
    <View style={styles.container}>
      <SimpleHeader 
        title={`Delete group`}
        navigation={navigation}
      />
      <View style={styles.content}>
        <Text style={styles.confirmationText}>{group_name}</Text>
        <Text style={styles.secondaryText}>Type 'Okay' to confirm</Text>
        <BasicTextInput 
          ref={inputRef}
          placeholder='Okay'
          onChangeText={setVerification}
          value={verification}
          style={styles.inputBox}
        />
        <View style={styles.deleteButtonContainer}>
          <View style={styles.warningBox}>
            <Icon name="warning" size={20} color={theme.primaryText} />
            <Text style={styles.disclaimerText}>
              This action cannot be undone 😭
            </Text>
          </View>
          <BasicButton 
            title="delete"
            icon="trash"
            disabled={deleteButtonDisabled}
            onPress={handleDeleteGroup}
            style={styles.deleteButton}
          />
        </View>
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
    content: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
    },
    inputBox: {
      backgroundColor: theme.primaryBackground,
    },
    confirmationText: {
      fontFamily: 'nunito-bold',
      fontSize: 24,
      color: theme.primaryText,
    },
    secondaryText: {
      fontFamily: 'nunito-regular',
      fontSize: 16,
      color: theme.actionText,
    },
    disclaimerText: {
      fontFamily: 'nunito-regular',
      fontSize: 14,
      color: theme.actionText,
      marginHorizontal: 20,
    },
    deleteButtonContainer: {
      width: '100%',
      position: 'absolute',
      bottom: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteButton: {
      width: '100%',
      marginTop: 15,
      alignSelf: 'center',
    },
    warningBox: {
      flexDirection: 'row', 
      marginTop: 30, 
      padding: 20, 
      alignItems: 'center',
      backgroundColor: theme.primaryBackground,
      borderRadius: 10,
    }
  })
}