import React, {
  memo,
} from "react";

import {
  Image,
  StyleSheet,
} from "react-native";

type Props = {
  uri: string;
};

function BookingPhotoImage({
  uri,
}: Props) {

  return (

    <Image
      source={{
        uri,
      }}
      resizeMode="cover"
      style={styles.image}
    />

  );

}

export default memo(
  BookingPhotoImage
);

const styles = StyleSheet.create({

  image: {

    width: "100%",

    height: "100%",

    borderRadius: 18,

  },

});