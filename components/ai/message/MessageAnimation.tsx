import React from "react";

import Animated, {
  FadeInUp,
} from "react-native-reanimated";

interface Props {
  children: React.ReactNode;
}

export default function MessageAnimation({
  children,
}: Props) {
  return (
    <Animated.View
      entering={FadeInUp
        .duration(260)
        .springify()
        .damping(18)}
    >
      {children}
    </Animated.View>
  );
}