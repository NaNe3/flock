import { useEffect, useState } from "react"
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native"
import VideoPreview from "./VideoPreview"

import { gen } from "../utils/styling/colors"
import { checkIfFileExistsWithPath, downloadFileWithPath, getLocalUriForFile } from "../utils/db-download"

export default function Media({
  path,
  type = "video",
  onPress,
  onPressIn,
  onPressOut,
  includeBottomShadow = false,
  soundEnabled=null,
  style
}) {
  const [mediaPath, setMediaPath] = useState(getLocalUriForFile(path))
  const [mediaType, setMediaType] = useState(type)
  const [mediaDownloaded, setMediaDownloaded] = useState(null)
  const [loadingAnimation] = useState(new Animated.Value(0))
  const [muted, setMuted] = useState(!soundEnabled ?? false)

  const [timeToPause, setTimeToPause] = useState(false)

  useEffect(() => {
    setMediaDownloaded(false)
    mediaAllocation()
  }, [path])

  useEffect(() => {
    setMuted(!soundEnabled)
  }, [soundEnabled])

  // useEffect(() => {
  //   if (path) {

  //     const newPath = { uri: getLocalUriForFile(path) }
  //     setMediaPath(newPath)
  //     setMediaType(type)
  //   }
  // }, [path])

  // useEffect(() => {
  //   setMediaDownloaded(false)
  //   mediaAllocation()
  // }, [])

  const mediaAllocation = async () => {
    try {
      const media = await checkIfFileExistsWithPath(path)
      const fileUri = getLocalUriForFile(path)

      if (media.exists === true) {
        setMediaPath({ uri: fileUri })
        setMediaType(type)
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
                setMediaType(type);
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
        mediaDownloaded && mediaType === "video"
          ? (
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={(event) => {
                event.persist()
                setTimeToPause(true)
                setTimeout(() => {
                  onPressOut(event)
                  setTimeToPause(false)
                }, 10)
              }}
              onPress={onPress}
              activeOpacity={1}
              style={[style, { flex: 1}]}
            >
              <VideoPreview
                source={mediaPath} 
                muted={muted}
                includeBottomShadow={includeBottomShadow}
                style={[styles.media, style]} 

                timeToPause={timeToPause}
              />
            </TouchableOpacity>
          )
          : (
            <TouchableOpacity 
              onPress={onPress} 
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              activeOpacity={1}
              style={[style, { flex: 1}]}
            >
              <Image 
                source={mediaPath} 
                onPress={onPress}
                onLoadStart={() => console.log("loading")}
                onLoad={() => console.log("loaded")}
                style={[styles.media, style]} 
              />
            </TouchableOpacity>

          )
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