import { useState } from "react";
import { Keyboard, StyleSheet, TextInput } from "react-native";
import { getFontSizeOfComment } from "../../utils/format-comment";

export function MessageInput({ navigation, comment, setComment, scrollToBottom, customColor }) {
  const [textSize, setTextSize] = useState(36)

  const handleInput = (e) => {
    const input = e.nativeEvent.text
    setComment(input)

    scrollToBottom()
    setTextSize(getFontSizeOfComment(input))
  }

  return (
    <TextInput
      multiline
      style={[
        styles.input,
        { fontSize: textSize },
        { color: customColor ? customColor : '#fff' }
      ]}
      value={comment}
      onChange={handleInput}
      scrollEnabled={false}
      placeholder="starting writing your message here!"
      placeholderTextColor={!customColor ? '#fff' : customColor}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    fontFamily: 'nunito-bold',
    textAlign: 'center'
  }
})