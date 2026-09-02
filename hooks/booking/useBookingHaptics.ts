import { useMemo } from "react";

import * as Haptics from "expo-haptics";

export default function useBookingHaptics() {

  return useMemo(
    () => ({

      async selection() {

        await Haptics.selectionAsync();

      },

      async success() {

        await Haptics.notificationAsync(

          Haptics.NotificationFeedbackType.Success

        );

      },

      async warning() {

        await Haptics.notificationAsync(

          Haptics.NotificationFeedbackType.Warning

        );

      },

      async error() {

        await Haptics.notificationAsync(

          Haptics.NotificationFeedbackType.Error

        );

      },

      async impactLight() {

        await Haptics.impactAsync(

          Haptics.ImpactFeedbackStyle.Light

        );

      },

      async impactMedium() {

        await Haptics.impactAsync(

          Haptics.ImpactFeedbackStyle.Medium

        );

      },

      async impactHeavy() {

        await Haptics.impactAsync(

          Haptics.ImpactFeedbackStyle.Heavy

        );

      },

    }),
    []
  );

}