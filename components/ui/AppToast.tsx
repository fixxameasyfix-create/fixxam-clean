import React from "react";
import {
  BaseToast,
  ErrorToast,
} from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#FF6B00",
        borderLeftWidth: 5,
        borderRadius: 18,
        marginHorizontal: 16,
        minHeight: 70,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        borderLeftWidth: 5,
        borderRadius: 18,
        marginHorizontal: 16,
        minHeight: 70,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
};