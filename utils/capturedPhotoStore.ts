let capturedPhoto: string | null = null;

export function setCapturedPhoto(
  uri: string,
): void {
  if (!uri.trim()) {
    return;
  }

  capturedPhoto = uri;
}

export function consumeCapturedPhoto():
  | string
  | null {
  const photo =
    capturedPhoto;

  capturedPhoto = null;

  return photo;
}