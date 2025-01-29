import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { gen } from "../../utils/styling/colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { hapticImpactSoft, hapticSelect } from "../../utils/haptics";
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get('window').width

export function ActivityActionWheel({ selected, setSelected }) {
  const actions = ['CAMERA', 'COMMENT']
  const [itemPositions, setItemPositions] = useState([])
  const scrollX = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef(null)
  const itemRefs = useRef([])

  useFocusEffect(
    useCallback(() => {
      const positions = [];
      itemRefs.current.forEach((ref, index) => {
        ref.measure((fx, fy, width, height, px, py) => {
          positions[index] = { px, width };
          if (positions.length === actions.length) {
            setItemPositions(positions);
          }
        });
      });

      calculateScrollToX(0, false, 10)
    }, [])
  )


  const handlePress = (e, index) => {
    hapticImpactSoft()
    setSelected(index)
    calculateScrollToX(index, true)
  };

  const calculateScrollToX = (index, animated, optionalOffset=0) => {
    itemRefs.current[index].measure((fx, fy, width, height, px, py) => {
      const itemWidth = width;
      const scrollToX = px + (itemWidth / 2) - windowWidth / 2 + scrollX._value+optionalOffset;
      scrollViewRef.current.scrollTo({ x: scrollToX, animated: animated });
    });
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  )

  const handleScrollEnd = (e) => {
    hapticImpactSoft()
    const scrollXValue = e.nativeEvent.contentOffset.x;
    let closestIndex = 0;
    let minDistance = Infinity;

    itemPositions.forEach((position, index) => {
      const centerX = position.px + ((position.width+(26*index)) / 2)+20;
      const distance = Math.abs(centerX - (scrollXValue + windowWidth / 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // console.log('Closest item index:', closestIndex);
    // You can also set the selected item or perform other actions here
    setSelected(closestIndex);
    calculateScrollToX(closestIndex, true)
  }

  const getTextColor = (index) => {
    if (itemPositions.length === 0) return 'rgb(128, 128, 128)';

    const { px, width } = itemPositions[index];
    const centerX = px + ((width+(26*index)) / 2)+20;
    const inputRange = [
      centerX - windowWidth / 2 - (width) / 2,
      centerX - windowWidth / 2,
      centerX - windowWidth / 2 + (width) / 2
    ];
    const outputRange = ['rgb(128, 128, 128)', 'rgb(255, 255, 255)', 'rgb(128, 128, 128)'];
    return scrollX.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp'
    });
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      // onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={handleScrollEnd}
      scrollEventThrottle={16}
    >
      <View style={[styles.items]}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            activeOpacity={0.8}
            onPress={(e) => handlePress(e, index)}
            ref={ref => itemRefs.current[index] = ref}
          >
            <Animated.Text style={[styles.scollItem, { color: getTextColor(index) }]}>
              {action}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  items: {
    paddingHorizontal: 200,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  scollItem: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'nunito-bold',
    color: gen.darkGray,
    marginHorizontal: 8
  }
})