import { useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, Text, View, Animated } from "react-native"

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

// export default function EmojiBurst({ emoji, count }) {
//   const [emojis, setEmojis] = useState([])
//   const [emojisOffset, setEmojisOffset] = useState([])

//   useEffect(() => {
//     const newEmojisOffset = Array.from({ length: count }, () => [
//       Math.floor(Math.random() * width),
//       Math.floor((Math.random() * height)-height)
//     ])

//     const newEmojis = newEmojisOffset.map((offset, index) => {
//       return <Emoji index={index} emoji={emoji} offset={offset} />
//     })

//     setEmojis(newEmojis)
//   }, [])

//   return (
//     <View 
//       style={styles.container}
//       pointerEvents="none"
//     >
//       {emojis}
//     </View>
//   )
// }

export default function EmojiBurst({ emoji, callback }) {
  const [rotation] = useState(Math.random() < 0.5 ? Math.random() * 30 : Math.random() * -30)
  const [size] = useState(Math.random() * 90 + 50)
  const [offset] = useState([
    Math.floor(Math.random() * width),
    -150
  ])

  const locValue = useRef(new Animated.Value(offset[1])).current

  useEffect(() => {
    Animated.timing(locValue, {
      toValue: height+500,
      duration: 2000,
      useNativeDriver: false
    }).start(() => callback())
  }, [locValue, offset])

  return (
    <Animated.View 
      style={{ position: 'absolute', left: offset[0]-40, bottom: locValue }}
    >
      <Text style={[styles.emoji, { transform: [{ rotate: `${rotation}deg` }], fontSize: size }]}>
        {emoji}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
})