import { useEffect, useState } from "react"
import { Animated, Image, StyleSheet, View } from "react-native"

import { gen } from "../utils/styling/colors"
import { checkIfImageExistsWithPath, downloadAvatarWithPath, getLocalUriForImage } from "../utils/db-download"

export default function Avatar({
  imagePath,
  type = "profile",
  style
}) {
  const [avatarPath, setAvatarPath] = useState(getLocalUriForImage(imagePath))
  const [avatarDownloaded, setAvatarDownloaded] = useState(null)
  const [loadingAnimation] = useState(new Animated.Value(0))

  useEffect(() => {
    const avatarAllocation = async () => {
      try {
        const avatar = await checkIfImageExistsWithPath(imagePath)
        const fileUri = getLocalUriForImage(imagePath)

        if (avatar.exists === true) {
          setAvatarPath({ uri: fileUri })
          setAvatarDownloaded(true)
        } else if (avatar.exists === false) {
          const { uri, error } = await downloadAvatarWithPath(`public/${type}/`, fileUri.split("/").pop())
          if (!error) {
            // image is downloaded correctly.
            // wait for the image to be recognizable by the system
            // 10 seconds has been alloted here
            let iterations = [0, 100]
            const intervalId = setInterval(async () => {
              if (iterations[0] <= iterations[1]) {
                const { exists } = await checkIfImageExistsWithPath(uri);
                if (exists) {
                  clearInterval(intervalId);
                  setAvatarPath({ uri: fileUri });
                  setAvatarDownloaded(true);
                }
                iterations[0] += 1;
              } else {
                clearInterval(intervalId);
                console.error("Error downloading avatar, ITERATED OUT");
              }
            }, 100);
          } else {
            console.error("Error downloading avatar", error);
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    setAvatarDownloaded(false)
    avatarAllocation()
  }, [])

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(loadingAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [loadingAnimation])

  const backgroundColor = loadingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#d3d3d3', '#BBB'], 
  });

  return (
    <Animated.View style={[styles.avatarBox, style, { backgroundColor }]}>
      {avatarDownloaded && (
        <Image 
          source={avatarPath}
          style={[styles.avatar, style]}
        />
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  avatarBox: {
    backgroundColor: gen.lightGray,
    overflow: 'hidden',
  },
  avatar: {

  }
})