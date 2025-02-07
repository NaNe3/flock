import { useEffect, useRef, useState } from "react"
import { Animated, Image, StyleSheet, TouchableOpacity, View } from "react-native"
import VideoPreview from "./VideoPreview"

import { checkIfFileExistsWithPath, downloadFileWithPath, getLocalUriForFile } from "../utils/db-download"
import LoadingOverlay from "../home/components/LoadingOverlay"
import { useTheme } from "../hooks/ThemeProvider"

export default function Media({
  path,
  type = "video",
  includeBottomShadow = false,
  soundEnabled=null,
  declareLoadingState,
  style
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(getStyle(theme))
  useEffect(() => { setStyles(getStyle(theme)) }, [theme])

  const [mediaPath, setMediaPath] = useState(getLocalUriForFile(path))
  const [mediaType, setMediaType] = useState(type)
  const [mediaDownloaded, setMediaDownloaded] = useState(null)
  const [loadingAnimation] = useState(new Animated.Value(0))
  const [muted, setMuted] = useState(!soundEnabled ?? false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    setMediaDownloaded(false)
    mediaAllocation()
  }, [path])

  useEffect(() => {
    setMuted(!soundEnabled)
  }, [soundEnabled])

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
      {mediaDownloaded ? (
        <>
          {
            mediaType === "video"
              ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setPlaying(playing === true ? false : true)
                  }}
                  style={[style, { flex: 1}]}
                >
                  <VideoPreview
                    source={mediaPath} 
                    muted={muted}
                    includeBottomShadow={includeBottomShadow}
                    declareLoadingState={declareLoadingState}
                    style={[styles.media, style]} 
                    playing={playing}
                  />
                </TouchableOpacity>
              )
              : (
                <Image
                  source={mediaPath} 
                  onLoadStart={() => declareLoadingState(true)}
                  onLoad={() => declareLoadingState(false)}
                  style={[styles.media, style]} 
                />
              )
          }
        </>
      ) : (
        <LoadingOverlay />
      )}
    </Animated.View>
  )
}

function getStyle(theme) {
  return StyleSheet.create({
    mediaBox: {
      backgroundColor: theme.lightGray,
      overflow: 'hidden',
    },
    media: {
      borderRadius: 10,
    }
  })
}