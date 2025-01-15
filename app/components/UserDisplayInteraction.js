import { StyleSheet } from "react-native"
import FadeInView from "./FadeInView"
import Avatar from "./Avatar"
import Icon from 'react-native-vector-icons/FontAwesome'
import { gen } from "../utils/styling/colors"


export default function UserDisplayInteraction({ top }) {
  return (
    <FadeInView
      style={{
        position: 'absolute',
        top: top+10,
        right: -35,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      time={100}
    >
      <Icon name="bookmark" size={26} color={gen.tertiaryText} />
    </FadeInView>
  )
}

const styles = StyleSheet.create({

})
