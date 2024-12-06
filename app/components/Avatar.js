import { useEffect, useState } from "react"
import { Animated, Image, StyleSheet, View } from "react-native"

import FadeInView from "./FadeInView"

import { gen } from "../utils/styling/colors"
import { checkIfFileExistsWithPath, downloadFileWithPath, getLocalUriForFile } from "../utils/db-download"

export default function Avatar({
  imagePath,
  type = "profile",
  style
}) {
  const [avatarPath, setAvatarPath] = useState(getLocalUriForFile(imagePath))
  const [avatarDownloaded, setAvatarDownloaded] = useState(null)
  const [downloadRequired, setDownloadRequired] = useState(false)
  const [loadingAnimation] = useState(new Animated.Value(0))

  useEffect(() => {
    const avatarAllocation = async () => {
      try {
        const avatar = await checkIfFileExistsWithPath(imagePath)
        const fileUri = getLocalUriForFile(imagePath)

        if (avatar.exists === true) {
          setAvatarPath({ uri: fileUri })
          setAvatarDownloaded(true)
        } else if (avatar.exists === false) {
          setDownloadRequired(true)
          const { uri, error } = await downloadFileWithPath('avatars', `public/${type}/`, fileUri.split("/").pop())
          if (!error) {
            // image is downloaded correctly.
            // wait for the image to be recognizable by the system
            // 10 seconds has been alloted here
            let iterations = [0, 100]
            const intervalId = setInterval(async () => {
              if (iterations[0] <= iterations[1]) {
                const { exists } = await checkIfFileExistsWithPath(uri);
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

    if (imagePath) {
      setAvatarDownloaded(false)
      avatarAllocation()
    }
  }, [imagePath])

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
        <FadeInView
          style={{ flex: 1 }}
          time={downloadRequired ? 500 : 0}
        >
          <Image 
            source={avatarPath}
            style={[styles.avatar, style]}
          />
        </FadeInView>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  avatarBox: {
    backgroundColor: gen.tertiaryBackground,
    overflow: 'hidden',
  },
  avatar: {

  }
})