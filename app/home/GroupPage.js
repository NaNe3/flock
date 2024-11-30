import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { hapticSelect } from '../utils/haptics'
import { getGroupsForUser } from '../utils/db-relationship'
import { gen } from '../utils/styling/colors'

import BorderBoxWithHeaderText from '../components/BorderBoxWithHeaderText'
import EmptySpace from '../components/EmptySpace'
import Avatar from '../components/Avatar'
import InteractiveHeaderBar from '../components/InteractiveHeaderBar'
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from '../utils/localStorage'
import FadeInView from '../components/FadeInView'

const GroupBox = ({ 
  innunciated=false,
  group,
  navigation
}) => {
  const { group_id, group_name, group_image, group_plan, members } = group

  return (
    <BorderBoxWithHeaderText 
      onPress={() => {
        navigation.navigate('Group', {
          group_id,
          group_name,
          group_image,
          group_plan,
          members
        })
      }}
      title={innunciated ? ["NEW ACTIVITY", gen.primaryColor, "fire"] : null}
      innunciated={innunciated}
    >
      <View style={styles.groupContainer}>
        <Avatar 
          imagePath={group_image} 
          type="group"
          style={styles.groupImage} 
        />
        <View style={styles.groupContent}>
          <View style={{ flex: 1 }}>
            <Text 
              style={{ fontFamily: 'nunito-bold', fontSize: 18, color: gen.actionText }}
              numberOfLines={1}
              ellipsizeMode='tail'
            >{group_name}</Text>
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, color: gen.gray }}>
              <Icon name='users' size={12} color={gen.gray} /> {members.length} MEMBERS
            </Text>
          </View>
          <View style={styles.groupMembers}>
            {
              members.map((member, index) => {
                return (
                  <Avatar 
                    key={index} 
                    imagePath={member.avatar_path} 
                    type="profile"
                    style={styles.memberImage} 
                  />
                )
              })
            }
          </View>
        </View>
      </View>
    </BorderBoxWithHeaderText>
  )
}

export default function GroupPage({ navigation }) {
  const [groups, setGroups] = useState([])
  const [localGroups, setLocalGroups] = useState([])

  useEffect(() => {
    const getGroups = async () => {
      // GET GROUPS FROM LOCAL STORAGE
      const result = JSON.parse(await getLocallyStoredVariable('user_groups'))
      setLocalGroups(result)

      // CURRENTLY HANDLED ON home.js
      // GET GROUPS FROM SERVER
      // const userId = await getUserIdFromLocalStorage()
      // const { data } = await getGroupsForUser(userId)
      // setGroups(data)

      // SET GROUPS IN LOCAL STORAGE 
      await setLocallyStoredVariable('user_groups', JSON.stringify(data))
    }

    getGroups()
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* <GroupBox innunciated /> */}
        {
          groups.length >= 0 && groups.map((group, index) => {
            return <GroupBox key={index} navigation={navigation} group={group} /> 
          })
        }
        {
          groups.length === 0 && localGroups.length > 0 && localGroups.map((group, index) => {
            return <GroupBox key={index} navigation={navigation} group={group} />
          })
        }
        <TouchableOpacity 
          style={styles.createGroupButton}
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate('CreateGroup')
            hapticSelect()
          }}
        >
          <Text style={styles.createButtonText}>
            <Icon name='plus' size={20} color={gen.actionText} /> NEW GROUP
          </Text>
        </TouchableOpacity>
        <EmptySpace size={70} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  groupContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  groupMembers: {
    width: '100%',
    flexDirection: 'row',
  },
  memberImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginRight: 5,
  },
  groupImage: {
    width: 80,
    height: 110,
    borderRadius: 10,
  },
  groupContent: {
    flex: 1,
    marginLeft: 20,
  },
  createGroupButton: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 20,
    borderColor: gen.primaryBorder,
    borderWidth: 5,
  },
  createButtonText: {
    fontFamily: 'nunito-bold', 
    fontSize: 18, 
    color: gen.actionText,
    textAlign: 'center', 
    paddingVertical: 20 
  }
})