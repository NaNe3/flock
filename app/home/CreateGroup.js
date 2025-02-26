import { Profiler, useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { CommonActions } from '@react-navigation/native';

import BasicTextInput from '../components/BasicTextInput';
import EmptySpace from '../components/EmptySpace';
import SimpleHeader from '../components/SimpleHeader';
import BasicButton from '../components/BasicButton';
import AddPeopleToGroup from './AddPeopleToGroup';
import SelectPhoto from '../components/SelectPhoto';

import { getLocalUriForFile } from '../utils/db-download';
import { createGroup } from '../utils/db-image';
import { hapticImpactSoft, hapticSelect } from '../utils/haptics';
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from '../utils/localStorage';
import Avatar from '../components/Avatar';
import { getGroupsForUser } from '../utils/db-relationship';
import { useTheme } from '../hooks/ThemeProvider';
import PlanSelection from './components/PlanSelection';
import { useModal } from '../hooks/UniversalModalProvider';

const GroupDetails = ({
  image,
  setImage,
  groupName,
  setGroupName
}) => {
  const { theme } = useTheme()
  const { setVisible, setModal, setTitle, closeBottomSheet } = useModal()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 1,
    })

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      setImage(result.assets[0].uri)
    }
  }

  const handleShowPlan = () => {
    hapticImpactSoft()
    setVisible(true)
    setModal(
      <PlanSelection
        onSelect={(plan) => {
          closeBottomSheet()
        }}
      />
    )
    setTitle('select plan')
  }

  return (
    <>
      <SelectPhoto 
        image={image}
        pickImage={pickImage}
        containerStyle={styles.groupPhoto}
        imageStyle={{ width: '100%', height: '100%', borderRadius: 15 }} 
        contentType='icon'
      />

      <BasicTextInput
        placeholder="Group Name" 
        keyboardType="default"
        value={groupName}
        onChangeText={setGroupName}
        style={{
          borderWidth: 0,
          fontSize: 30,
          textAlign: 'center',
        }}
        multiline
      />

      <Text style={styles.sectionHeader}>select plan</Text>
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.sectionContainer}
        onPress={handleShowPlan}
      >
        <View style={styles.book}>
          <Text style={styles.innerBookText}>Come</Text>
          <Text style={styles.innerBookText}>Follow</Text>
          <Text style={styles.innerBookText}>Me</Text>
        </View>

        <View style={styles.planDetails}>
          <Text style={styles.bookText}>Come Follow Me</Text>
          <Text style={{ fontFamily: 'nunito-bold', fontSize: 13, color: theme.gray }}>11,456 studying</Text>
        </View>
      </TouchableOpacity>
    </>
  )
}

const GroupMembers = ({ friendsAdded, setFriendsAdded, setScreenVisible }) => {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [userAvatar, setUserAvatar] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const getUserInfo = async () => {
      const { avatar_path, fname, lname } = JSON.parse(await getLocallyStoredVariable('user_information'))
      setUserName(`${fname} ${lname}`)
      setUserAvatar(avatar_path)
    }

    getUserInfo()
  }, []) 

  return (
    <>
      <Text style={styles.sectionHeader}>add people</Text>
      <View style={styles.peopleContainer}>

        <View style={[styles.personRow, friendsAdded.length === 0 && { borderBottomWidth: 5 }]}>
          {userAvatar && (
            <Avatar 
              imagePath={userAvatar}
              type="profile"
              style={styles.friendImage}
            />
          )}
          <View>
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 18, color: theme.primaryText, marginLeft: 15 }}>{userName}</Text>
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 14, color: theme.secondaryText, marginLeft: 15 }}>leader</Text>
          </View>
        </View>

        {
          friendsAdded.map((friend, index) => {
            const avatar = getLocalUriForFile(friend.avatar_path)
            return (
              <View key={index} style={styles.personRow}>
                <Image source={{ uri: avatar }} style={styles.friendImage} />
                <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 20 }}>
                    <Text 
                      style={{ fontFamily: 'nunito-bold', fontSize: 18, color: theme.primaryText, marginLeft: 15, overflow: 'hidden' }}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                    >{friend.fname} {friend.lname}</Text>
                    <Text style={{ fontFamily: 'nunito-bold', fontSize: 14, color: theme.darkishGray, marginLeft: 15 }}>member</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => setFriendsAdded((prevState) => prevState.filter((person) => person.id !== friend.id)) }
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontFamily: 'nunito-bold', fontSize: 14, color: "#FFF" }}>
                      <Icon name='times' size={12} color="#FFF" /> KICK
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        }

        <TouchableOpacity 
          style={[styles.personRow, { borderBottomWidth: 0, height: 70 }]}
          onPress={() => {
            setScreenVisible('addPeople')
          }}
        >
          <Text style={[styles.bookText, { color: theme.actionText, textAlign: 'center', width: '100%' }]}>
            <Icon name='plus' size={16} color={theme.actionText} /> Add People
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default function CreateGroup({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const [leader, setLeader] = useState(null)
  const [image, setImage] = useState(null)
  const [friendsAdded, setFriendsAdded] = useState([])
  const [plan, setPlan] = useState(1)
  const [screenVisible, setScreenVisible] = useState('main')

  const [disabled, setDisabled] = useState(true)
  const [buttonText, setButtonText] = useState('Create Group')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    const getUserId = async () => {
      const userId = await getUserIdFromLocalStorage()
      setLeader(userId)
    }

    getUserId()
  }, [])

  useEffect(() => {
    if (image && groupName && friendsAdded.length > 0 && plan) {
      setDisabled(false)
    } else if (!disabled) {
      setDisabled(true)
    }
  }, [groupName, image, friendsAdded])

  const handleCreateButtonPressed = async (groupName, image, leader, friendsAdded, plan) => {
    hapticSelect()
    setDisabled(true)
    setButtonText('Creating...')

    const {status, error} = await createGroup(groupName, image, leader, friendsAdded, plan)

    if (status === 'ok') {
      // ADD NEW GROUP TO LOCAL STORAGE
      const { data } = await getGroupsForUser(leader)
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))

      navigation.goBack()
    } else {
      console.error('Error creating group:', error)
      setDisabled(true)
      setButtonText('Error creating group')
      // TODO - redesign group error message... Find the best way to handle this
    }
  }

  return (
    <View style={styles.container}>
      {screenVisible === 'main' ? (
        <>
          <SimpleHeader navigation={navigation} title='Create group' />
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <GroupDetails 
              image={image}
              setImage={setImage}
              groupName={groupName}
              setGroupName={setGroupName} 
            />
            <GroupMembers 
              friendsAdded={friendsAdded}
              setFriendsAdded={setFriendsAdded}
              setScreenVisible={setScreenVisible}
            />

            <View style={{ marginTop: 50, alignSelf: 'center', width: '100%' }}>
              <BasicButton
                title={buttonText}
                onPress={() => handleCreateButtonPressed(groupName, image, leader, friendsAdded, plan)}
                disabled={disabled}
                style={{ alignSelf: 'center', width: '100%' }}
              />
            </View>
            <EmptySpace size={80} />
          </ScrollView>
        </>
      ) : (
        <AddPeopleToGroup
          navigation={navigation}
          friendsAdded={friendsAdded}
          setFriendsAdded={setFriendsAdded}
          setScreenVisible={setScreenVisible}
        />
      )}
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    groupPhoto: {
      width: 150,
      height: 200,
      backgroundColor: theme.primaryBackground,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      borderWidth: 5,
      borderRadius: 20,
      borderColor: theme.primaryBorder,
    },
    sectionHeader: {
      fontFamily: 'nunito-bold',
      fontSize: 20,
      color: theme.actionText,
      marginVertical: 15,
    },
    sectionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 5,
      borderColor: theme.primaryBorder,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
    },
    book: {
      width: 60,
      height: 75,
      padding: 5,
      borderRadius: 10,
      backgroundColor: theme.maroon,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
      overflow: 'hidden',
    },
    innerBookText: {
      fontSize: 12,
      color: theme.orange,
      textAlign: 'center',
      fontFamily: 'nunito-bold',
    },
    bookText: {
      fontSize: 18,
      fontFamily: 'nunito-bold',
      color: theme.primaryText
    },
    planDetails: {
      flex: 1,
      justifyContent: 'space-between',
    },
    peopleContainer: {
      width: '100%',
      borderRadius: 15,
      borderWidth: 5,
      borderColor: theme.primaryBorder,
    },
    personRow: {
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 13,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 3,
      borderColor: theme.primaryBorder,
    },
    friendImage: {
      width: 40,
      height: 40,
      borderRadius: 10,
    },
    modal: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    removeButton: {
      paddingVertical: 5,
      paddingHorizontal: 12,
      backgroundColor: theme.red,
      borderRadius: 15,
    },
  })
}