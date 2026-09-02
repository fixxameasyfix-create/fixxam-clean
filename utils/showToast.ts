import Toast from "react-native-toast-message";

export const showSuccess = (
  title: string,
  message: string
) => {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    visibilityTime: 4000,
  });
};

export const showError = (
  title: string,
  message: string
) => {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    visibilityTime: 4000,
  });
};