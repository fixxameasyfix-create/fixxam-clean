import React, {
  memo,
  type PropsWithChildren,
} from "react";

import Animated, {
  FadeInUp,
  useReducedMotion,
} from "react-native-reanimated";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props =
  PropsWithChildren;

/* ==============================================================
   COMPONENT
============================================================== */

function MessageAnimation({
  children,
}: Props) {
  const reduceMotion =
    useReducedMotion();

  return (
    <Animated.View
      entering={
        reduceMotion
          ? undefined
          : FadeInUp.duration(
              FixxamTokens.motion
                .normal,
            )
      }
    >
      {children}
    </Animated.View>
  );
}

export default memo(
  MessageAnimation,
);