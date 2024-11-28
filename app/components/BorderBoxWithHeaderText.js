import { View, StyleSheet, Text, Touchable, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5';

import { gen } from '../utils/styling/colors';

export default function BorderBoxWithHeaderText({ 
  children, 
  recommended=false,
  innunciated=false,
  onPress=null,
  backgroundColor='#fff',
  title=null
}) {
  return (
    <TouchableOpacity 
      activeOpacity={onPress !== null ? 0.7 : 1 } 
      onPress={onPress}
    >
      <View style={[styles.planBox, (recommended || innunciated) && styles.recommended ]}>
        {
          recommended ? (
            <View style={[styles.boxHeader, { backgroundColor: backgroundColor }]}>
              <Text style={[styles.boxHeaderText, styles.recommended]}>
                <Icon name='star' size={15} color={gen.orange} />
                &nbsp;RECOMMENDED
              </Text>
            </View>
          ) : title !== null && (
            <View style={[styles.boxHeader, { backgroundColor: backgroundColor }]}>
              <Text style={[styles.boxHeaderText, { color: title[1] }]}>
                <Icon name={title[2]} size={15} color={title[1]} />
                &nbsp;{title[0]}
              </Text>
            </View>
          )
        }
        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  planBox: {
    width: '100%',
    borderColor: gen.lightGray,
    borderWidth: 5,
    borderRadius: 15,
    marginBottom: 20,
  }, 
  boxHeader: {
    paddingHorizontal: 10,
    marginTop: -13,
    marginLeft: 15,
    alignSelf: 'flex-start',
  },
  boxHeaderText: {
    fontSize: 15,
    fontFamily: 'nunito-bold',
    color: '#000',
  },
  recommended: {
    borderColor: gen.orange,
    color: gen.orange,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
})