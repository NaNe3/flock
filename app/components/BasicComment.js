import { View, Text, StyleSheet } from 'react-native'
import { useState } from 'react';
import timeAgo from '../utils/timeDiff';



export default function BasicComment({ comment, user }) {
  const [timeSince, setTimeSince] = useState(timeAgo(comment.created_at));

  return (
    <View style={styles.comment}>
      <Text style={styles.commentUser}>{user} • {timeSince}</Text>
      <Text style={styles.commentText}>{comment.comment}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  comment: {
    padding: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D3D3D3',
  },
  commentUser: {
    fontSize: 14,
    color: '#616161',
    fontFamily: 'nunito-bold',
  },
  commentText: {
    fontSize: 18,
    fontFamily: 'nunito-bold',
  }
})