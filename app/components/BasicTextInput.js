import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native'
import { hapticSelect } from '../utils/haptics'
import { useState } from 'react';

export default function BasicTextInput({ 
  placeholder, 
  keyboardType, 
  value, 
  onChangeText, 
  style, 
  containerStyle, 
  focus=true, 
  onFocus = () => {},
  onBlur = () => {}
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => hapticSelect()}
        style={styles.touchable}
      >
        <TextInput
          placeholder={placeholder}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.textInput, 
            style,
            (isFocused && focus) && styles.textInputFocused
          ]}
          placeholderTextColor={(isFocused && focus) ? '#FFA300' : '#616161'}
          onFocus={() => {
            setIsFocused(true)
            onFocus()
          }}
          onBlur={() => {
            setIsFocused(false)
            onBlur()
          }}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  touchable: {
    width: '90%',
  },
  textInput: {
    width: '100%',
    padding: 20,
    marginTop: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D3D3D3',
    fontFamily: 'nunito-bold',
    fontSize: 18,
  },
  textInputFocused: {
    borderColor: '#FFBF00',
  },
});