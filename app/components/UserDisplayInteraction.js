import FadeInView from "./FadeInView"
import Icon from 'react-native-vector-icons/FontAwesome'
import { useTheme } from "../hooks/ThemeProvider"


export default function UserDisplayInteraction({ top }) {
  const { theme } = useTheme()
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
      <Icon name="bookmark" size={26} color={theme.tertiaryText} />
    </FadeInView>
  )
}
