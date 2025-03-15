import { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome5'

import { hapticSelect } from '../utils/haptics'
import { getLocallyStoredVariable, getUserIdFromLocalStorage } from '../utils/localStorage'
import { useTheme } from '../hooks/ThemeProvider'

import BorderBoxWithHeaderText from '../components/BorderBoxWithHeaderText'
import Avatar from '../components/Avatar'
import FadeInView from '../components/FadeInView'
import InviteRow from './components/InviteRow'
import SimpleHeader from '../components/SimpleHeader'

const GroupBox = ({
  innunciated=false,
  group,
  groups,
  setGroups,
  navigation,
  userId,
}) => {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
  const { group_id, group_name, group_image, group_plan, members, status } = group
  const leader = members.find(member => member.is_leader)

  return (
    <BorderBoxWithHeaderText
      title={innunciated ? ["NEW ACTIVITY", theme.primaryColor, "fire"] : null}
      innunciated={innunciated}
      style={{ margin: 20 }}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.groupContainer}
        onPress={() => {
          navigation.navigate('GroupChat', {
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
              style={{ fontFamily: 'nunito-bold', fontSize: 18, color: theme.actionText }}
              numberOfLines={1}
              ellipsizeMode='tail'
            >{group_name}</Text>
            {
              status !== 'pending' ? (
                <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, color: theme.gray }}>
                  <Icon name='users' size={12} color={theme.gray} /> {members.length} MEMBERS
                </Text>
              ) : (
                <Text 
                  style={{ fontFamily: 'nunito-bold', fontSize: 12, color: theme.gray }}
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
        <Icon name='chevron-right' size={20} color={theme.gray} />
      </TouchableOpacity>
      {
        status === 'pending' && (
          <View style={{ width: '100%', marginTop: 15 }}>
            <InviteRow setGroups={setGroups} userId={userId} groupId={group_id}/>
          </View>
        )
      }
    </BorderBoxWithHeaderText>
  )
}

export default function GroupPage({ navigation }) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])
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
      <SimpleHeader 
        title={"Groups"}
        navigation={navigation}
      />
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
              <Icon name='plus' size={20} color={theme.actionText} /> NEW GROUP
            </Text>
          </TouchableOpacity>
        </FadeInView>
        {/* <EmptySpace size={70} /> */}
      </ScrollView>
    </View>
  )
}

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
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
      borderColor: theme.primaryBorder,
      borderWidth: 5,
    },
    createButtonText: {
      fontFamily: 'nunito-bold', 
      fontSize: 18, 
      color: theme.actionText,
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
    //   backgroundColor: theme.secondaryBackground,
    //   borderRadius: 30,
    // }
  })
}