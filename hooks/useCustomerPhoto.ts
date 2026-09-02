import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function captureCustomerPhoto() {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Camera Permission",
      "Please allow camera access to take your profile photo.",
    );

    return null;
  }

  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}

export async function pickCustomerPhoto() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Photo Permission",
      "Please allow photo library access to choose your profile photo.",
    );

    return null;
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}