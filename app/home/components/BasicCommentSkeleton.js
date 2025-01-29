import { StyleSheet, View } from "react-native"
import SkeletonBox from "../../components/SkeletonBox"

export default function BasicCommentSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBox style={styles.avatarBox} />
      <View style={styles.commentBox}>
        <SkeletonBox style={styles.commentHeader} />
        <SkeletonBox style={styles.commentContent} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 13,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  commentBox: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    width: '50%',
    height: 15,
    marginBottom: 5,
    borderRadius: 5,
  },
  commentContent: {
    height: 50,
    width: '100%',
    borderRadius: 5,
  },
})