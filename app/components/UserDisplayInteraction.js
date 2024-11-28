import { StyleSheet } from "react-native"
import FadeInView from "./FadeInView"
import Avatar from "./Avatar"
import Icon from 'react-native-vector-icons/FontAwesome'


export default function UserDisplayInteraction({ path, mediaType, top }) {
  return (
    <FadeInView
      style={{
        position: 'absolute',
        top: top,
        right: -40,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      time={100}
      >
      <Avatar 
        imagePath={path}
        type="profile"
        style={{
          height: 25,
          width: 25,
          borderRadius: 50,
          marginRight: -10,
        }}
      />
      <Icon name="heart" size={13} color={"red"} style={{
          postion: 'absolute',
          right: 0,
          top: 10,
        }}
      />
    </FadeInView>
  )
}

const styles = StyleSheet.create({

})
