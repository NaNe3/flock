import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import { useTheme } from "../../hooks/ThemeProvider";

const BasicBottomSheet = forwardRef(({ 
  setVisibility,
  title,
  backgroundColor = null,
  handleStyle = null,
  titleColor = null,
  children
}, ref) => {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  const bottomSheetRef = useRef(null);
  const opacity = useRef(new Animated.Value(0)).current
  const foregroundTapped = useRef(false)

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) setVisibility(false)
  }, []);

  useImperativeHandle(ref, () => ({
    closeBottomSheet: () => {
      closeBottomSheet()
    },
  }));

  const closeBottomSheet = () => {
    foregroundTapped.current = true
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setVisibility(false))
    bottomSheetRef.current.close()
  }
  ref = closeBottomSheet

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
        backgroundStyle={{ backgroundColor: backgroundColor || theme.primaryBackground }}
        handleStyle={handleStyle}
        handleIndicatorStyle={{ backgroundColor: '#aaa', width: 40, height: 6 }}
      >
        <BottomSheetView style={[
          styles.contentContainer,
          { backgroundColor: backgroundColor || theme.primaryBackground },
          { height: 'auto' },
        ]}>
          {title && (
            <Text style={[
              styles.sheetTitle,
              { color: titleColor || theme.secondaryText },
            ]}>
              {title}
            </Text>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
})

export default BasicBottomSheet

function style(theme) {
  return StyleSheet.create({
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
      backgroundColor: theme.heckaGray2,
    },
  })
}