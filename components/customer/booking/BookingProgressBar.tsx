import React, {
  memo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

type Props = {
  progress: number;
};

function BookingProgressBar({
  progress,
}: Props) {

  return (

    <View style={styles.track}>

      <View
        style={[
          styles.fill,
          {
            width: `${progress}%`,
          },
        ]}
      />

    </View>

  );

}

export default memo(
  BookingProgressBar
);

const styles = StyleSheet.create({

  track: {

    height: 10,

    borderRadius: 999,

    backgroundColor: "#E2E8F0",

    overflow: "hidden",

  },

  fill: {

    height: "100%",

    borderRadius: 999,

    backgroundColor: "#FF6B00",

  },

});