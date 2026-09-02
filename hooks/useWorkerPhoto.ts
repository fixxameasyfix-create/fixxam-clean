import * as ImagePicker from "expo-image-picker";

/* ============================================================
   PROFILE PHOTO
============================================================ */

export async function captureWorkerPhoto() {
  const result =
    await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

export async function uploadWorkerPhoto() {
  const result =
    await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

/* ============================================================
   WORK GALLERY
============================================================ */

export async function uploadWorkerWorkPhotos(
  currentCount: number,
  maxImages = 6,
) {
  const remaining =
    maxImages - currentCount;

  if (remaining <= 0) {
    return [];
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

  if (result.canceled) {
    return [];
  }

  return result.assets
    .map((asset) => asset.uri)
    .filter(Boolean);
}