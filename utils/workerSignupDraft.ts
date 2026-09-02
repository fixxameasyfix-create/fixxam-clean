import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@fixxam_worker_signup_draft";

export type WorkerSignupDraft = {
  step: number;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  emailOtp: string;
  emailVerified: boolean;

  phone: string;
  otp: string;
  phoneVerified: boolean;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  photo: string | null;

  about: string;

  workGallery: string[];

  acceptedTerms: boolean;
};

export async function saveWorkerDraft(
  draft: WorkerSignupDraft,
) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft),
    );
  } catch (error) {
    console.log(
      "Save Worker Draft Error",
      error,
    );
  }
}

export async function loadWorkerDraft() {
  try {
    const value =
      await AsyncStorage.getItem(
        STORAGE_KEY,
      );

    if (!value) {
      return null;
    }

    return JSON.parse(
      value,
    ) as WorkerSignupDraft;
  } catch (error) {
    console.log(
      "Load Worker Draft Error",
      error,
    );

    return null;
  }
}

export async function clearWorkerDraft() {
  try {
    await AsyncStorage.removeItem(
      STORAGE_KEY,
    );
  } catch (error) {
    console.log(
      "Clear Worker Draft Error",
      error,
    );
  }
}