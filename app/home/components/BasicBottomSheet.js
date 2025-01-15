import { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import { gen } from "../../utils/styling/colors";

const height = Dimensions.get('window').height;
const modalHeight = Math.floor(height * 0.7)

export default function BasicBottomSheet({ 
  setVisibility,
  title,
  backgroundColor = gen.heckaGray2,
  titleColor = '#fff',
  height = modalHeight,
  children
}) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef(null);
  const opacity = useRef(new Animated.Value(0)).current

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) setVisibility(false)
  }, []);

  const closeBottomSheet = () => {
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
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  // the reason there are defualt values for backgroundColor and height is because the component was originally static
  // originally the modal in Capture.js had these default values


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
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: '#aaa' }}
      >
        <BottomSheetView style={[
          styles.contentContainer,
          backgroundColor && { backgroundColor },
          height && { height },
          { paddingBottom: 10+insets.bottom }
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
    backgroundColor: gen.heckaGray2,
  },
})