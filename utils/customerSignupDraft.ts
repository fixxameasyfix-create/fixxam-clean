import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@fixxam_customer_signup_draft";

const DRAFT_VERSION = 2;

const DRAFT_MAX_AGE_MS =
  7 * 24 * 60 * 60 * 1000;

export type CustomerSignupDraft = {
  version: number;

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

  password: string;
  confirmPassword: string;

  acceptedTerms: boolean;

  photo: string | null;

  updatedAt: number;
};

function isValidDraft(
  value: unknown,
): value is CustomerSignupDraft {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const draft =
    value as Partial<CustomerSignupDraft>;

  return (
    typeof draft.version === "number" &&
    typeof draft.step === "number" &&
    typeof draft.firstName === "string" &&
    typeof draft.surname === "string" &&
    typeof draft.otherName === "string" &&
    typeof draft.email === "string" &&
    typeof draft.emailOtp === "string" &&
    typeof draft.emailVerified === "boolean" &&
    typeof draft.phone === "string" &&
    typeof draft.otp === "string" &&
    typeof draft.phoneVerified === "boolean" &&
    typeof draft.password === "string" &&
    typeof draft.confirmPassword === "string" &&
    typeof draft.acceptedTerms === "boolean" &&
    (
      typeof draft.photo === "string" ||
      draft.photo === null
    ) &&
    typeof draft.updatedAt === "number"
  );
}

export async function saveCustomerDraft(
  draft: CustomerSignupDraft,
): Promise<void> {
  try {
    const safeDraft: CustomerSignupDraft = {
      version: DRAFT_VERSION,

      step: Math.max(
        1,
        Math.min(
          5,
          Math.floor(draft.step),
        ),
      ),

      firstName:
        draft.firstName.trim(),

      surname:
        draft.surname.trim(),

      otherName:
        draft.otherName.trim(),

      email:
        draft.email
          .trim()
          .toLowerCase(),

      emailOtp:
        draft.emailOtp,

      emailVerified:
        draft.emailVerified,

      phone:
        draft.phone.trim(),

      otp:
        draft.otp,

      phoneVerified:
        draft.phoneVerified,

      password:
        draft.password,

      confirmPassword:
        draft.confirmPassword,

      acceptedTerms:
        draft.acceptedTerms,

      photo:
        draft.photo ?? null,

      updatedAt:
        Date.now(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(safeDraft),
    );
  } catch (error) {
    console.error(
      "SAVE CUSTOMER DRAFT ERROR:",
      error,
    );
  }
}

export async function loadCustomerDraft(): Promise<
  CustomerSignupDraft | null
> {
  try {
    const data =
      await AsyncStorage.getItem(
        STORAGE_KEY,
      );

    if (!data) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(data);

    if (!isValidDraft(parsed)) {
      await clearCustomerDraft();
      return null;
    }

    const age =
      Date.now() -
      parsed.updatedAt;

    if (
      age < 0 ||
      age > DRAFT_MAX_AGE_MS
    ) {
      await clearCustomerDraft();
      return null;
    }

    return {
      ...parsed,

      version:
        parsed.version ||
        DRAFT_VERSION,
    };
  } catch (error) {
    console.error(
      "LOAD CUSTOMER DRAFT ERROR:",
      error,
    );

    return null;
  }
}

export async function hasCustomerDraft(): Promise<boolean> {
  const draft =
    await loadCustomerDraft();

  return Boolean(
    draft?.email,
  );
}

export async function getCustomerDraftEmail(): Promise<
  string | null
> {
  const draft =
    await loadCustomerDraft();

  return draft?.email || null;
}

export async function clearCustomerDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "CLEAR CUSTOMER DRAFT ERROR:",
      error,
    );
  }
}