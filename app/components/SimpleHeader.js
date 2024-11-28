import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { hapticSelect } from '../utils/haptics'

const SimpleHeader = ({
  navigation, 
  functionalNavigation = null,
  title = null,
  middleTitle = null,
  showChapterTitle,
  component = null,
  rightIcon = null,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showChapterTitle ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [showChapterTitle])

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => { 
            hapticSelect()
            if (functionalNavigation !== null) {
              functionalNavigation()
            } else {
              navigation.goBack() 
            }
          }} 
          style={[{ flexDirection: 'row', alignItems: 'center' }, !title && { width: 50, height: 50}]}
          activeOpacity={0.7}
        >
          <Icon 
            name='chevron-left'
            size={20}
            color='#000'
          />
          { title && (
            <Text style={{ fontFamily: 'nunito-bold', fontSize: 23, marginLeft: 10 }}>{title}</Text>
          )}
          { component !== null && component }
        </TouchableOpacity>
        { showChapterTitle && middleTitle !== null &&
          <Animated.Text
            style={{ fontFamily: 'nunito-bold', fontSize: 23, opacity: fadeAnim, flex: 1, textAlign: 'center' }}
            numberOfLines={1}
            ellipsizeMode={'tail'}
          >
            {
              middleTitle.includes("Joseph Smith") || middleTitle.includes("Doctrine And Covenants")
                ? middleTitle.includes("Joseph Smith")
                  ? `JS${middleTitle.replace("Joseph Smith", "")}`
                  : `D&C${middleTitle.replace("Doctrine And Covenants", "")}`
                : middleTitle
            }
          </Animated.Text> 
        }
        { rightIcon !== null && rightIcon }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 110,
    backgroundColor: '#fff'
  },
  headerContent: {
    marginTop: 50,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
})

export default SimpleHeader