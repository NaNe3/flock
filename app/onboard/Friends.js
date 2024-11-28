import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, Alert, Linking, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Contacts from 'expo-contacts';

import { getUsersFromListOfPhoneNumbers } from '../utils/db-users';

import BasicButton from '../components/BasicButton';
import EmptySpace from '../components/EmptySpace';
import BasicTextInput from '../components/BasicTextInput';
import { gen } from '../utils/styling/colors';

// TO DO LIST
// 1. Add a cancel button to the search input
// 2. Add a link to the app settings if the user denies access to contacts
// 3. Check which users already have accounts and display +ADD button instead

export default function Friends({ setCurrentScreen }) {
  const [contacts, setContacts] = useState([])
  const [viewableContacts, setViewableContacts] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [peopleInvited, setPeopleInvited] = useState([])
  const [contactsThatAreUsers, setContactsThatAreUsers] = useState([])
  const [permissionWitheld, setPermissionWitheld] = useState(false)
  const [numberToDisplay, setNumberToDisplay] = useState(50)

  useEffect(() => {
    if (contacts.length > 0) {
      if (searchInput) {
        const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchInput.toLowerCase()))
        setViewableContacts(filteredContacts)
      } else {
        setViewableContacts(contacts)
      }
    }
  }, [searchInput])

  useEffect(() => {
    const fetchContactsPermission = async () => {
      const status = await getAccessToContacts()
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        })
        if (data) {
          const peopleWithPhoneNumbers = data.filter(contact => {
            if (contact.phoneNumbers) return contact
          })
          setContacts(peopleWithPhoneNumbers)
          setViewableContacts(peopleWithPhoneNumbers)
          findUsersInContacts(peopleWithPhoneNumbers)
        } else {
          setPermissionWitheld(true)
        }
      } else {
        setPermissionWitheld(true)
      }
    }
    fetchContactsPermission()
  }, [])

  const findUsersInContacts = async (contacts) => {
    const phoneNumbers = contacts.map(contact => {
      if (contact.phoneNumbers) return contact.phoneNumbers[0].digits
    })
    const users = await getUsersFromListOfPhoneNumbers(phoneNumbers)
    setContactsThatAreUsers(users.map(user => user.phone_number))
  }

  const sendPrescriptedMessage = (contact) => {
    const message = `Hello ${contact.name}, PLEEEEEEEEAS study with me!!!!!`
    const phoneNumber = contact.phoneNumbers[0].digits
    const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`
  
    Linking.openURL(url).catch(err => console.error('An error occurred', err))
    setPeopleInvited(prev => [...prev, contact])
  }

  const getAccessToContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      return status
    } catch (error) {
      console.log('Error getting contacts permission:', error)
      setPermissionWitheld(true)
      Alert.alert(
        'Permission Required',
        'This app needs access to your contacts. Please enable contacts permission in the app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openAppSettings() },
        ],
        { cancelable: false }
      )
      return error
    }
  }

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rue}>INVITE ({peopleInvited.length}/5)</Text>
      {
        contacts.length === 0 &&
          (permissionWitheld
            ? (
              <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                <BasicButton
                  title="Enable Contacts"
                  onPress={openAppSettings}
                  style={{ width: 'auto', textAlign: 'center', paddingHorizontal: 20 }}
                />
              </View>
            )
            : <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}><ActivityIndicator size="large" color="#AAA" /></View>)
      }
      <ScrollView 
        style={styles.contactsContainer}
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
      >
        {
          contacts.length > 0 && (
            <BasicTextInput 
              placeholder='Search'
              keyboardType='default'
              value={searchInput}
              onChangeText={(text) => setSearchInput(text)}
              style={{
                padding: 10,
                backgroundColor: '#D3D3D3',
                borderRadius: 50,
                marginBottom: 40,
              }}
              containerStyle={{
                flex: 1
              }}
              focus={false}
            />
          )
        }
        {viewableContacts && viewableContacts.map((contact, index) => {
          if (index > numberToDisplay) return null

          const digits  = contact.phoneNumbers ? contact.phoneNumbers[0].digits : null
          const buttonInfo = { title: null, icon: null, color: null, backgroundColor: null }

          if (contactsThatAreUsers.includes(digits)) {
            if (peopleInvited.includes(contact)) {
              buttonInfo.title = 'ADDED'
              buttonInfo.color = '#FFF'
              buttonInfo.backgroundColor = gen.orangeDisabled
              buttonInfo.icon = 'check'
            } else {
              buttonInfo.title = 'ADD'
              buttonInfo.color = '#FFF'
              buttonInfo.backgroundColor = gen.orange
              buttonInfo.icon = 'plus'
            }
          } else {
            if (peopleInvited.includes(contact)) {
              buttonInfo.title = 'SENT'
              buttonInfo.color = gen.gray
              buttonInfo.backgroundColor = gen.lightGray
              buttonInfo.icon = 'send'
            } else {
              buttonInfo.title = 'INVITE'
              buttonInfo.color = '#000'
              buttonInfo.backgroundColor = gen.lightGray
              buttonInfo.icon = 'send'
            }
          }


          return (
            <View key={index} style={styles.contactContainer}>
              <View style={styles.contactInfo}>
                {contact.imageAvailable ? (
                  <Image source={{ uri: contact?.image.uri }} style={styles.contactImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.initials}>{contact?.name[0] ?? null}</Text>
                  </View>
                )}
                <Text 
                  style={styles.contactName}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >{contact.name}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: buttonInfo.backgroundColor }]}
                onPress={() => {
                  if (!peopleInvited.includes(contact) && buttonInfo.title !== "ADD") {
                    sendPrescriptedMessage(contact)
                  } else {
                    setPeopleInvited(prev => [...prev, contact])
                  }
                }}
                activeOpacity={peopleInvited.includes(contact) ? 1 : 0.5}
              >
                <Text style={[{ fontFamily: 'nunito-bold', fontSize: 14, }, { color: buttonInfo.color }]}>
                  <Icon name={buttonInfo.icon} size={12} color={buttonInfo.color} /> 
                  {
                    ' ' + buttonInfo.title
                  }
                </Text>
              </TouchableOpacity>
            </View>
          )
        })}
        <EmptySpace size={130} />
      </ScrollView>
      <BasicButton
        title="Lets Roll"
        onPress={() => setCurrentScreen(prev => prev + 1)}
        style={{ position: 'absolute', bottom: 60 }}
        disabled={peopleInvited.length < 5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contactsContainer: {
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  rue: {
    fontSize: 24,
    fontFamily: 'nunito-bold',
    marginTop: 60,
    marginBottom: 20,
  },
  contactContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: gen.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 18,
    fontFamily: 'nunito-regular',
    flexShrink: 1,
    overflow: 'hidden',
  },
  sendButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: gen.lightGray,
    borderRadius: 15,
  }
});