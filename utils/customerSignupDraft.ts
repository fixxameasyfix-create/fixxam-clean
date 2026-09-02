import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@fixxam_customer_signup_draft";

export type CustomerSignupDraft = {
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

  acceptedTerms: boolean;
};

export async function saveCustomerDraft(
  draft: CustomerSignupDraft
) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(draft)
    );
  } catch (error) {
    console.log(
      "SAVE CUSTOMER DRAFT ERROR:",
      error
    );
  }
}

export async function loadCustomerDraft() {
  try {
    const data =
      await AsyncStorage.getItem(
        STORAGE_KEY
      );

    if (!data) {
      return null;
    }

    return JSON.parse(
      data
    ) as CustomerSignupDraft;

  } catch (error) {
    console.log(
      "LOAD CUSTOMER DRAFT ERROR:",
      error
    );

    return null;
  }
}

export async function clearCustomerDraft() {
  try {
    await AsyncStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    console.log(
      "CLEAR CUSTOMER DRAFT ERROR:",
      error
    );
  }
}