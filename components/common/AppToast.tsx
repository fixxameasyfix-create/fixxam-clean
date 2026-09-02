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
        borderLeftColor: "#2563EB",
        borderRadius: 18,
        minHeight: 70,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
      }}
      text2Style={{
        fontSize: 14,
        color: "#64748B",
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#EF4444",
        borderRadius: 18,
        minHeight: 70,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
      }}
      text2Style={{
        fontSize: 14,
        color: "#64748B",
      }}
    />
  ),
};