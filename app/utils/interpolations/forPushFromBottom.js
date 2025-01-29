import { Animated } from "react-native";

export const forPushFromBottom = ({ current, next, inverted, layouts: { screen } }) => {
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.height, 0],
      extrapolate: 'clamp',
    }),
    inverted
  );

  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -screen.height],
          extrapolate: 'clamp',
        }),
        inverted
      )
    : 0;

  return {
    cardStyle: {
      transform: [
        { translateY: translateFocused },
        { translateY: translateUnfocused },
      ],
    },
  };
};