import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native"
import Icon from 'react-native-vector-icons/FontAwesome6'

import FadeInView from "../../components/FadeInView"
import Avatar from "../../components/Avatar"
import { timeAgoGeneral } from "../../utils/timeDiff"
import { getColorLight } from "../../utils/getColorVariety"
import { hapticSelect } from "../../utils/haptics"

// invitationStatus potential values:
// null = not invited
// pending = invited
// accepted = accepted

export default function InvitePersonRow({ 
  person,
  onPress,
  invitationStatus,
  buffering,
  theme,
  styles,
  ...props
}) {
  let displayText = ''
  if (person.fname) displayText += person.fname[0]
  if (person.lname) displayText += person.lname[0]
  const notInvitable = invitationStatus === 'pending' || invitationStatus === 'accepted'
  const inviteIcon = invitationStatus === null ? 'plus' : invitationStatus === 'invite' ? 'paper-plane' : null
  const inviteText = invitationStatus === null ? 'ADD' : invitationStatus === 'invite' ? 'INVITE' : 'CANCEL'

  return (
    <FadeInView 
      time={100}
      style={[styles.personRow, person.type === 'contact' && { paddingHorizontal: 10 }]}
    >
      <View style={styles.personInformation}>
        <View style={[styles.avatarContainer, { borderColor: invitationStatus === 'accepted' ? person.color : theme.primaryBorder }]}>
          {
            person.type !== 'contact' 
              ? <Avatar
                  imagePath={person.avatar_path}
                  type='profile'
                  style={styles.avatar}
                />
              : <View style={[styles.avatar, styles.contactAvatar]}>
                  <Text style={styles.avatarText}>{displayText}</Text>
                </View>
          }
        </View>
        <View style={styles.personNameBox}>
          <Text 
            style={styles.personName}
            ellipsizeMode='tail'
            numberOfLines={1}
          >{`${person.fname ?? ''} ${person.lname ?? ''}`}</Text>
          {person.type !== 'contact' && <Text style={styles.personLastStudied}>studied {timeAgoGeneral(person.last_studied)}</Text>}
        </View>
      </View>
      {
        invitationStatus !== "accepted" ? (
          <TouchableOpacity
            style={[
              styles.interactButton, // primaryColor
              { backgroundColor: person.color },
              notInvitable && person.type !== 'contact' && { backgroundColor: getColorLight(person.color) }, // primaryColorLight
              person.type === 'contact' && styles.contactBackground
            ]}
            activeOpacity={0.7}
            onPress={onPress}
          >
            {
              buffering 
                ? <ActivityIndicator size='small' color={notInvitable ? person.color : '#fff'} style={styles.buttonText} />
                : (
                  <Text style={[styles.buttonText, notInvitable && { color: person.color }]}>
                    <Icon name={!notInvitable && inviteIcon} />
                    {` ${inviteText}`}
                  </Text>
                )
            }
          </TouchableOpacity>
        ) : (
          <></>
          // <TouchableOpacity 
          //   activeOpacity={0.7}
          //   onPress={() => {
          //     hapticSelect()
          //     props.setSelectedPerson(person)
          //     props.setPersonBottomSheetVisible(true)
          //   }}
          //   style={[styles.ellipsisContainer, { backgroundColor: getColorLight(person.color) }]}
          // >
          //   <Icon name='ellipsis' size={20} color={person.color} />
          // </TouchableOpacity>
        )
      }
    </FadeInView>
  )
}