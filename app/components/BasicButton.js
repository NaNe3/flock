import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { hapticSuccess } from '../utils/haptics';

export default function BasicButton({ title, onPress, style: customStyling, disabled = false, icon }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled) {
          hapticSuccess();
          onPress();
        }
      }}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonContainer,
        customStyling,
        { backgroundColor: disabled ? "#ffecb2" : "#FFBF00" },
        { shadowColor: disabled ? '#b7a774' : '#ba7700' },
        isPressed && styles.pressed,
      ]}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text style={styles.buttonText}>
        {icon && (
          <Icon name={icon} size={26} color="#fff" style={{ marginRight: 10 }} />
        )}
        { icon && ' ' }
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '80%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#ba7700',
    shadowOffset: { width: 0, height: 4 }, // Position the shadow directly at the bottom
    shadowOpacity: 1, // Make the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
  },
  pressed: {
    shadowOffset: { width: 0, height: 1 }, // Adjust the shadow position when pressed
    shadowOpacity: 1, // Keep the shadow fully opaque
    shadowRadius: 0, // Remove the blur effect
    transform: [{ translateY: 3 }]
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'nunito-bold',
  },
});



// import React from "react";
// import { Text, StyleSheet, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome'
// import { hapticSuccess } from '../utils/haptics'

// export default function BasicButton({ title, onPress, style, disabled=false, icon }) {
//   return (
//     <TouchableOpacity 
//       onPress={() => {
//         if (!disabled) {
//           hapticSuccess()
//           onPress()
//         }
//       }}
//       style={[
//         styles.buttonContainer, style, { backgroundColor: disabled ? "#ffecb2" : "#FFBF00" }
//       ]}
//       disabled={disabled}
//     >
//       <Text style={styles.buttonText}>{icon && (
//         <Icon name={icon} size={26} color="#fff" style={{ marginRight: 10 }} />
//       )} {title}</Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   buttonContainer: {
//     width: '80%',
//     backgroundColor: '#FFBF00',
//     padding: 10,
//     borderRadius: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 24,
//     fontFamily: 'nunito-bold',
//     textAlign: 'center',
//   }
// });