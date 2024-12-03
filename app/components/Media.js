import { useEffect, useState } from "react"
import { Animated, Image, StyleSheet, View } from "react-native"
import VideoPreview from "./VideoPreview"

import { gen } from "../utils/styling/colors"
import { checkIfFileExistsWithPath, downloadFileWithPath, getLocalUriForFile } from "../utils/db-download"

export default function Media({
  path,
  type = "video",
  style
}) {
  const [mediaPath, setMediaPath] = useState(getLocalUriForFile(path))
  const [mediaDownloaded, setMediaDownloaded] = useState(null)
  const [loadingAnimation] = useState(new Animated.Value(0))

  useEffect(() => {
    const mediaAllocation = async () => {
      try {
        const media = await checkIfFileExistsWithPath(mediaPath)
        const fileUri = getLocalUriForFile(mediaPath)

        if (media.exists === true) {
          setMediaPath({ uri: fileUri })
          setMediaDownloaded(true)
        } else if (media.exists === false) {
          const { uri, error } = await downloadFileWithPath('media', `public/${type}/`, fileUri.split("/").pop())
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
                  setMediaPath({ uri: fileUri });
                  setMediaDownloaded(true);
                }
                iterations[0] += 1;
              } else {
                clearInterval(intervalId);
                console.error("Error downloading Media, ITERATED OUT");
              }
            }, 100);
          } else {
            console.error("Error downloading Media", error);
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    setMediaDownloaded(false)
    mediaAllocation()
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
  })

  return (
    <Animated.View style={[styles.mediaBox, style, { backgroundColor }]}>
      {
        mediaDownloaded && type === "video" 
          ? <VideoPreview source={mediaPath} muted={true} style={[styles.media, style]} />
          : <Image source={mediaPath} style={[styles.media, style]} />
      }
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  mediaBox: {
    backgroundColor: gen.lightGray,
    overflow: 'hidden',
  },
  media: {
    borderRadius: 10,
  }
})