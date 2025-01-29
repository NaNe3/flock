import { useCallback, useEffect, useRef, useState } from "react"
import { Animated, PanResponder, StyleSheet, TouchableOpacity, View } from "react-native"
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome6'
import { useEvent } from 'expo'
import { useVideoPlayer, VideoView, } from 'expo-video'
import { LinearGradient } from 'expo-linear-gradient'

import { gen } from '../utils/styling/colors'
import hexToRgba from '../utils/hexToRgba'

export default function VideoPreview({ 
  source,
  muted = false,
  includeBottomShadow = false,
  declareLoadingState = () => {},
  style = {},
  playing=null
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
      if (playing === true) {
        player.play()
      } else if (playing === false) {
        player.pause()
      }
    }
  }, [playing])

  useEffect(() => {
    if (status === 'readyToPlay') {
      declareLoadingState(false)
      player.play()
    } else {
      declareLoadingState(true)
    }
  }, [status])

  // PAUSE VIDEO WHEN SCREEN IS NOT FOCUSED
  useFocusEffect(
    useCallback(() => {
      if (player) player.play()

      return () => {
        try {
          if (player) player.pause()
        } catch (error) { }
      }
    }, [])
  )

  const { status } = useEvent(player, 'statusChange', { status: player.status });

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
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%`}]} />
      </View>
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
  progressBarContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
  },
  progressBar: {
    height: 3,
    width: 0,
    backgroundColor: '#fff'
  },
})