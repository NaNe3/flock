import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Touchable } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { hapticSelect } from '../utils/haptics'
import { acceptGroupInvitation, rejectGroupInvitation } from '../utils/db-relationship'
import { gen } from '../utils/styling/colors'

import BorderBoxWithHeaderText from '../components/BorderBoxWithHeaderText'
import EmptySpace from '../components/EmptySpace'
import Avatar from '../components/Avatar'
import { getLocallyStoredVariable, getUserIdFromLocalStorage, setLocallyStoredVariable } from '../utils/localStorage'
import FadeInView from '../components/FadeInView'
import InviteRow from './components/InviteRow'

const GroupBox = ({ 
  innunciated=false,
  group,
  groups,
  setGroups,
  navigation,
  userId,
}) => {
  const { group_id, group_name, group_image, group_plan, members, status } = group
  const leader = members.find(member => member.is_leader)

  return (
    <BorderBoxWithHeaderText
      title={innunciated ? ["NEW ACTIVITY", gen.primaryColor, "fire"] : null}
      innunciated={innunciated}
      style={{ margin: 20 }}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.groupContainer}
        onPress={() => {
          navigation.navigate('Group', {
            groups,
            group_id,
            group_name,
            group_image,
            group_plan,
            members,
            status,
            userId
          })
        }}
      >
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
            {
              status !== 'pending' ? (
                <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, color: gen.gray }}>
                  <Icon name='users' size={12} color={gen.gray} /> {members.length} MEMBERS
                </Text>
              ) : (
                <Text 
                  style={{ fontFamily: 'nunito-bold', fontSize: 12, color: gen.gray }}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >
                  invited by {leader.fname} {leader.lname}
                </Text>
              )
            }
          </View>
          <View style={styles.groupMembers}>
            {
              members
                .slice(0, members.length >= 6 ? 6 : members.length)
                .map((member, index) => {
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
        <Icon name='chevron-right' size={20} color={gen.gray} />
      </TouchableOpacity>
      {
        status === 'pending' && (
          <View style={{ width: '100%', marginTop: 15 }}>
            <InviteRow setGroups={setGroups} userId={userId} groupId={group_id}/>
          </View>
          // <View style={styles.inviteRow}>
          //   <TouchableOpacity 
          //     activeOpacity={0.7}
          //     style={[styles.button, styles.acceptButton]}
          //     onPress={() => {
          //       hapticSelect()
          //       acceptGroupInvitation(userId, group_id)
          //       // update group status in local storage and hook
          //       setGroups(prev => {
          //         const newGroups = prev.map(g => g.group_id === group_id ? { ...g, status: 'accepted' } : g)
          //         return newGroups
          //       })
          //     }}
          //   >
          //     <Text style={styles.buttonText}>ACCEPT</Text>
          //   </TouchableOpacity>
          //   <View style={{ width: 10 }} />
          //   <TouchableOpacity 
          //     activeOpacity={0.7}
          //     style={[styles.button, styles.rejectButton]}
          //     onPress={() => {
          //       hapticSelect()
          //       rejectGroupInvitation(userId, group_id)
          //       // update group status in local storage and hook
          //       setGroups(prev => {
          //         const newGroups = prev.filter(g => g.group_id !== group_id)
          //         setLocallyStoredVariable('user_groups', JSON.stringify(newGroups))
          //         return newGroups
          //       })
          //     }}
          //   >
          //     <Text style={styles.buttonText}>REJECT</Text>
          //   </TouchableOpacity>
          // </View>
        )
      }
    </BorderBoxWithHeaderText>
  )
}

export default function GroupPage({ navigation }) {
  const [userId, setUserId] = useState('')
  const [groups, setGroups] = useState([])


  useFocusEffect(
    useCallback(() => {
      const getGroups = async () => {
        // GET GROUPS FROM LOCAL STORAGE
        const userId = await getUserIdFromLocalStorage()        
        setUserId(userId)

        const result = JSON.parse(await getLocallyStoredVariable('user_groups')).map(group => {
          const isGroupAccessible = group.members.find(member => member.id === userId).status
          return { ...group, status: isGroupAccessible }
        })
        setGroups(result)
      }
      getGroups()
    }, [])
  )

  return (
    <View style={styles.container}>
      {/* <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
        </View>
      </View> */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* <GroupBox innunciated /> */}
        <FadeInView 
          style={{ flex: 1}}
          time={300}
        >
          {
            groups.length >= 0 && groups.map((group, index) => {
              return <GroupBox 
                setGroups={setGroups} 
                groups={groups}
                group={group} 
                key={index} 
                navigation={navigation} 
                userId={userId} 
              />
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
        </FadeInView>
        {/* <EmptySpace size={70} /> */}
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
    alignItems: 'center',
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
    // width: 80,
    // height: 110,
    width: 60,
    height: 80,
    borderRadius: 7,
  },
  groupContent: {
    flex: 1,
    marginLeft: 15,
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
  },
  searchBarContainer: { 
    height: 50, 
    flexDirection: 'row',
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  // searchBar: {
  //   flex: 1,
  //   backgroundColor: gen.secondaryBackground,
  //   borderRadius: 30,
  // }
})