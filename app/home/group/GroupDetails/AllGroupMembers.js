import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from "react-native"
import SimpleHeader from "../../../components/SimpleHeader"

import { gen } from "../../../utils/styling/colors"
import Avatar from "../../../components/Avatar"

export default function AllGroupMembers({ navigation, route }) {
  const { members } = route.params

  return (
    <View style={styles.container}>
      <SimpleHeader
        navigation={navigation}
        title="Member list"
      />
      <ScrollView style={styles.contentContainer}>
      {
        members && members.map((member, index) => {
          return (
            <View 
              key={index}
              style={styles.optionRow}
            >
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
                onPress={() => {
                  // navigation.navigate(row.location)}
                  // console.log('navigate to', member)
                }}
              >
                <View style={styles.avatarImageContainer}>
                  <Avatar
                    imagePath={member.avatar_path}
                    type="user"
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.userNameLeft}>
                  <Text style={styles.optionRowText}>{member.fname} {member.lname}</Text>
                  <Text style={styles.optionRowTextSecondary}>active today</Text>
                </View>
              </TouchableOpacity>
            </View>
          )
        })
      }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.secondaryBackground,
  },
  contentContainer: {
    flex: 1
  },
  optionRow: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionRowText: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: gen.primaryText
  },
  optionRowTextSecondary: {
    fontFamily: 'nunito-bold',
    fontSize: 14,
    marginTop: -3,
    color: gen.secondaryText
  },
  avatarImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: gen.gray,
    padding: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  userNameLeft: {
    marginLeft: 10,
  }
})