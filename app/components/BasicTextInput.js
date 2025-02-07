import { forwardRef, useEffect, useRef, useState } from 'react'
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native'

import { getPrimaryColor } from '../utils/getColorVariety'
import { useTheme } from '../hooks/ThemeProvider'

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
  const { theme } = useTheme()
  const [styles, setStyles] = useState(getStyle(theme))
  useEffect(() => { setStyles(getStyle(theme)) }, [theme])
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
        placeholderTextColor={theme.actionText}
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

export default BasicTextInput

function getStyle(theme) {
  return StyleSheet.create({
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
      borderColor: theme.primaryBorder,
      fontFamily: 'nunito-bold',
      fontSize: 18,
      maxHeight: 140,
      color: theme.actionText,
    },
  })
}