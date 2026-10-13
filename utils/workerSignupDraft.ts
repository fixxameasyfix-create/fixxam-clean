import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY =
  "@fixxam_worker_signup_draft";

const MIN_STEP = 1;
const MAX_STEP = 8;

export type WorkerSignupDraft = {
  step: number;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  emailOtp: string;
  emailVerified: boolean;

  password: string;
  confirmPassword: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  /* ============================================================
     SERVICE INFORMATION
  ============================================================ */

  serviceAddress: string;

  latitude: number | null;
  longitude: number | null;

  hourlyRate: string;

  phoneNumber: string;

  /* ============================================================
     PROFILE
  ============================================================ */

  photo: string | null;

  about: string;

  workGallery: string[];

  acceptedTerms: boolean;
};

function normalizeStep(
  step: number,
): number {
  return Math.max(
    MIN_STEP,
    Math.min(
      MAX_STEP,
      Number(step) || MIN_STEP,
    ),
  );
}

function normalizeEmail(
  email: string,
): string {
  return email
    .trim()
    .toLowerCase();
}

function normalizeCoordinate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

export async function saveWorkerDraft(
  draft: WorkerSignupDraft,
): Promise<void> {
  try {
    const normalizedDraft: WorkerSignupDraft = {
      step: normalizeStep(
        draft.step,
      ),

      firstName:
        draft.firstName.trim(),

      surname:
        draft.surname.trim(),

      otherName:
        draft.otherName.trim(),

      email:
        normalizeEmail(
          draft.email,
        ),

      emailOtp:
        draft.emailOtp,

      emailVerified:
        Boolean(
          draft.emailVerified,
        ),

      password:
        draft.password,

      confirmPassword:
        draft.confirmPassword,

      category:
        draft.category,

      subcategory:
        draft.subcategory,

      selectedServices:
        Array.isArray(
          draft.selectedServices,
        )
          ? draft.selectedServices
          : [],

      experience:
        draft.experience,

      /*
       * State and LGA remain part
       * of the professional profile.
       */
      state:
        draft.state,

      lga:
        draft.lga,

      /* ========================================================
         SERVICE INFORMATION
      ======================================================== */

      serviceAddress:
        draft.serviceAddress.trim(),

      latitude:
        normalizeCoordinate(
          draft.latitude,
        ),

      longitude:
        normalizeCoordinate(
          draft.longitude,
        ),

      hourlyRate:
        draft.hourlyRate,

      phoneNumber:
        draft.phoneNumber.trim(),

      /* ========================================================
         PROFILE
      ======================================================== */

      photo:
        draft.photo ?? null,

      about:
        draft.about.trim(),

      workGallery:
        Array.isArray(
          draft.workGallery,
        )
          ? draft.workGallery
          : [],

      acceptedTerms:
        Boolean(
          draft.acceptedTerms,
        ),
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalizedDraft,
      ),
    );
  } catch (error) {
    console.error(
      "SAVE WORKER DRAFT ERROR:",
      error,
    );
  }
}

export async function loadWorkerDraft(): Promise<
  WorkerSignupDraft | null
> {
  try {
    const value =
      await AsyncStorage.getItem(
        STORAGE_KEY,
      );

    if (!value) {
      return null;
    }

    const parsed: unknown =
      JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const data =
      parsed as Partial<
        WorkerSignupDraft
      >;

    return {
      step: normalizeStep(
        data.step ?? MIN_STEP,
      ),

      firstName:
        typeof data.firstName ===
        "string"
          ? data.firstName
          : "",

      surname:
        typeof data.surname ===
        "string"
          ? data.surname
          : "",

      otherName:
        typeof data.otherName ===
        "string"
          ? data.otherName
          : "",

      email:
        typeof data.email ===
        "string"
          ? normalizeEmail(
              data.email,
            )
          : "",

      emailOtp:
        typeof data.emailOtp ===
        "string"
          ? data.emailOtp
          : "",

      emailVerified:
        Boolean(
          data.emailVerified,
        ),

      password:
        typeof data.password ===
        "string"
          ? data.password
          : "",

      confirmPassword:
        typeof data.confirmPassword ===
        "string"
          ? data.confirmPassword
          : "",

      category:
        typeof data.category ===
        "string"
          ? data.category
          : "",

      subcategory:
        typeof data.subcategory ===
        "string"
          ? data.subcategory
          : "",

      selectedServices:
        Array.isArray(
          data.selectedServices,
        )
          ? data.selectedServices.filter(
              (
                service,
              ): service is string =>
                typeof service ===
                "string",
            )
          : [],

      experience:
        typeof data.experience ===
        "string"
          ? data.experience
          : "",

      state:
        typeof data.state ===
        "string"
          ? data.state
          : "",

      lga:
        typeof data.lga ===
        "string"
          ? data.lga
          : "",

      /* ========================================================
         SERVICE INFORMATION
      ======================================================== */

      serviceAddress:
        typeof data.serviceAddress ===
        "string"
          ? data.serviceAddress
          : "",

      latitude:
        normalizeCoordinate(
          data.latitude,
        ),

      longitude:
        normalizeCoordinate(
          data.longitude,
        ),

      hourlyRate:
        typeof data.hourlyRate ===
        "string"
          ? data.hourlyRate
          : "",

      phoneNumber:
        typeof data.phoneNumber ===
        "string"
          ? data.phoneNumber
          : "",

      /* ========================================================
         PROFILE
      ======================================================== */

      photo:
        typeof data.photo ===
        "string"
          ? data.photo
          : null,

      about:
        typeof data.about ===
        "string"
          ? data.about
          : "",

      workGallery:
        Array.isArray(
          data.workGallery,
        )
          ? data.workGallery.filter(
              (
                uri,
              ): uri is string =>
                typeof uri ===
                  "string" &&
                uri.trim().length > 0,
            )
          : [],

      acceptedTerms:
        Boolean(
          data.acceptedTerms,
        ),
    };
  } catch (error) {
    console.error(
      "LOAD WORKER DRAFT ERROR:",
      error,
    );

    return null;
  }
}

export async function clearWorkerDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "CLEAR WORKER DRAFT ERROR:",
      error,
    );
  }
}