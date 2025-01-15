import { useEvent } from 'expo'
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useVideoPlayer, VideoView, } from 'expo-video'
import { useCallback, useEffect, useRef, useState } from "react"
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'

import { gen } from '../utils/styling/colors'
import hexToRgba from '../utils/hexToRgba'

export default function VideoPreview({ 
  source,
  muted = false,
  includeBottomShadow = false,
  onPress,
  style = {},
  timeToPause
 }) {
  const [percentage, setPercentage] = useState(0)
  const player = useVideoPlayer(source, player => {
    player.loop = true
    player.muted = muted
    player.allowsExternalPlayback = false
    player.staysActiveInBackground = false
  }, error => {
    console.error('Error loading video:', error)
  })
  

  useEffect(() => {
    const playback = setInterval(() => {
      if (player) {
        const completion = (player.currentTime / player.duration) * 100;
        if (!isNaN(completion)) setPercentage(completion);
      }
    }, 20);

    return () => {
      clearInterval(playback);
    }
  }, [player])

  useEffect(() => {
    if (player) player.muted = muted
  }, [muted])

  useEffect(() => {
    if (player) {
      if (timeToPause) {
        player.pause()
      }
    }
  }, [timeToPause])

  // PAUSE VIDEO WHEN SCREEN IS NOT FOCUSED
  useFocusEffect(
    useCallback(() => {
      if (player) player.play()

      return () => {
        try {
          if (player) {
            player.pause()
          }
        } catch (error) { }
      }
    }, [])
  )

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'readyToPlay') {
      player.play()
    }
  }, [status])


  return (
    <View style={styles.video}>
      <VideoView 
        style={[styles.video, style]} 
        player={player} 
        contentFit="cover"
        nativeControls={false}
      />
      {includeBottomShadow && (
        <LinearGradient
          colors={['transparent', hexToRgba(gen.heckaGray, 0.8), gen.heckaGray]}
          style={{ height: 130, width: '100%', position: 'absolute', bottom: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
        />
      )}
      <View style={[styles.progressBar, { width: `${percentage}%`}]} />
    </View>
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
  progressBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    width: 0,
    backgroundColor: '#fff'
  }
})