import { useEvent } from 'expo'
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect } from "react"

export default function VideoPreview({ 
  source,
  muted = false,
  style = {},
 }) {
  const player = useVideoPlayer(source, player => {
    player.loop = true;
    player.muted = muted;
    player.play();
  }, error => {
    console.error('Error loading video:', error)
  })

  useEffect(() => {
    const tempTimeout = setTimeout(() => {
      if (player) player.play()
    }, 1000)

    return () => {
      clearTimeout(tempTimeout)
      if (player) {
        player.release();
      }
    }
  }, [player])

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  const handlePress = () => {
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
  }

  return (
    <TouchableOpacity 
      style={{ flex: 1 }}
      onPress={handlePress}
      activeOpacity={1}
    >
      <VideoView 
        style={[styles.video, style]} 
        player={player} 
        allowsPictureInPicture 
        contentFit="cover"
        nativeControls={false}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
})