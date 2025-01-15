import { forwardRef, useEffect, useState } from 'react'
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native'

import { hapticSelect } from '../utils/haptics'
import { gen } from '../utils/styling/colors'
import { getPrimaryColor } from '../utils/getColorVariety'

const BasicTextInput = forwardRef(({
  placeholder, 
  keyboardType, 
  value, 
  onChangeText, 
  style, 
  containerStyle, 
  focus=true, 
  onFocus = () => {},
  onBlur = () => {},
  selection,
  multiline=false,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(null)

  useEffect(() => {
    const init = async () => {
      const color = await getPrimaryColor()
      setPrimaryColor(color)
    }

    init()
  })

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.textInput,
          style,
          (isFocused && focus) && { borderColor: primaryColor },
        ]}
        placeholderTextColor={gen.actionText}
        onFocus={() => {
          setIsFocused(true)
          onFocus()
        }}
        onBlur={() => {
          setIsFocused(false)
          onBlur()
        }}
        multiline={multiline}
        numberOfLines={4}
        selection={selection}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    padding: 20,
    marginTop: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: gen.primaryBorder,
    fontFamily: 'nunito-bold',
    fontSize: 18,
    maxHeight: 140,
    color: gen.actionText,
  },
});

export default BasicTextInput;