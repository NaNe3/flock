import { View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

import { getLocalUriForImage } from '../utils/db-download'
import SimpleHeader from '../components/SimpleHeader'
import BasicButton from '../components/BasicButton'
import { hapticSelect } from '../utils/haptics'
import { gen } from '../utils/styling/colors'

export default function Group({ navigation, route }) {
  const { group_id, group_name, group_image, group_plan, members } = route.params
  const group_avatar = getLocalUriForImage(group_image)

  return (
    <View style={styles.container}>
      <SimpleHeader navigation={navigation} 
        // title={group_name}
        rightIcon={
          <TouchableOpacity activeOpacity={0.7} >
            <Icon name="ellipsis-h" size={20} color="#000" />
          </TouchableOpacity>
        }
      />

      {/* ACTIVITY BARRRRRRR */}
      {/* <ScrollView 
        style={styles.activityBar}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {
          members.map((member, index) => {
            const member_avatar = getLocalUriForImage(member.avatar_path)
            return (
              <TouchableOpacity
                style={styles.memberPhoto}
                activeOpacity={0.7}
                key={index}
              >
                <Image key={index} source={{ uri: member_avatar }} style={{ width: '100%', height: '100%', borderRadius: 100 }} />   
              </TouchableOpacity>
            )
          })
        }
      </ScrollView> */}

      <ScrollView style={styles.contentContainer}>
        <View style={styles.landingContainer}>
          <View style={styles.landingContainerContent}>

            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: group_avatar }} style={styles.groupPhoto} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.planLabel}>
                    <Text style={{ fontFamily: 'nunito-bold', fontSize: 12, color: gen.gray, }}>COME FOLLOW ME</Text>
                  </View>
                </View>
                <Text 
                  style={styles.groupName}
                  numberOfLines={1}
                  ellipsizeMode='tail'
                >{group_name}</Text>
                <Text style={{ color: gen.gray, fontFamily: 'nunito-bold' }}>
                  <Icon name="users" color={gen.gray }/> 3 MEMBERS
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.planLayoutContainer}>
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 16, textAlign: 'center', color: gen.gray }}>YOU'RE THE FIRST TO STUDY!</Text>
            
            <BasicButton
              title='12 min'
              icon='clock-o'
              onPress={() => {
                hapticSelect()
              }}
              style={{ marginTop: 20, alignSelf: 'center' }}
            />
          </View>
        </View>

        <View style={styles.announcementContainer}>
          
        </View>

        <Text style={{ fontFamily: 'nunito-bold', fontSize: 24, color: gen.heckaGray2, textAlign: 'center', marginTop: 100, alignItems: 'center' }}>no activity</Text>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  landingContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingTop: 600,
    marginTop: -600,
  },
  landingContainerContent: { 
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  groupPhoto: {
    width: 80,
    height: 100,
    backgroundColor: gen.lightestGray,
    marginHorizontal: 20,
    borderRadius: 5,
  },
  groupName: {
    fontSize: 32,
    fontFamily: 'nunito-bold',
    color: '#000',
  },
  activityBar: {
    width: '100%',
    maxHeight: 100,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  memberPhoto: {
    width: 70,
    height: 70,
    padding: 3,
    borderWidth: 4,
    borderColor: gen.lightGray,
    borderRadius: 35,
    marginRight: 5
  },
  planLabel: {
    backgroundColor: gen.lightestGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  planLayoutContainer: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 20,
    borderTopWidth: 5,
    borderTopColor: gen.lightestGray,
  },
  announcementContainer: {

  }
})