import { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import { constants } from "../../utils/styling/colors";

const height = Dimensions.get('window').height;
const modalHeight = Math.floor(height * 0.7)

export default function BasicBottomSheet({ 
  setVisibility,
  title,
  backgroundColor = constants.heckaGray2,
  handleStyle = null,
  titleColor = '#fff',
  height = modalHeight,
  children
}) {
  const bottomSheetRef = useRef(null);
  const opacity = useRef(new Animated.Value(0)).current
  const foregroundTapped = useRef(false)

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) setVisibility(false)
  }, []);

  const closeBottomSheet = () => {
    foregroundTapped.current = true
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setVisibility(false))
    bottomSheetRef.current.close()
  }

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()
  }, [])

  // the reason there are defualt values for backgroundColor and height is because the component was originally static
  // originally the modal in Capture.js had these default values

  const handleAnimate = (fromIndex, toIndex) => {
    if (toIndex === -1 && !foregroundTapped.current) {
      closeBottomSheet()
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.shadowContainer}
        activeOpacity={1}
        onPress={closeBottomSheet}
      >
        <Animated.View style={[ styles.shadow, { opacity }]} />
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        onAnimate={handleAnimate}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor }}
        handleStyle={handleStyle}
        handleIndicatorStyle={{ backgroundColor: '#aaa', width: 40, height: 6 }}
      >
        <BottomSheetView style={[
          styles.contentContainer,
          backgroundColor && { backgroundColor },
          height && { height },
        ]}>
          {title && (
            <Text style={[
              styles.sheetTitle,
              titleColor && { color: titleColor }
            ]}>
              {title}
            </Text>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  shadowContainer: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  shadow: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'nunito-bold',
    color: '#fff',
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: constants.heckaGray2,
  },
})