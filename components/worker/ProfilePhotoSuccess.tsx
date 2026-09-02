import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

export default function ProfilePhotoSuccess() {
  return (
    <View style={styles.container}>
      <AppText
        color="#16A34A"
        weight="semibold"
      >
        ✓ Verified Photo
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  alignSelf: "center",
  flexDirection: "row",

  backgroundColor: "#ECFDF5",

  borderWidth: 1,
  borderColor: "#BBF7D0",

  paddingHorizontal: 16,
  paddingVertical: 8,

  borderRadius: 999,

  marginTop: 16,
  marginBottom: 24,
},
});