import { showError } from "@/utils/showToast";

/* ============================================================
REGISTRATION SOURCE
============================================================ */

export type WorkerRegistrationSource =
  | "customer"
  | "new";

/* ============================================================
STEP 1 — EMAIL
============================================================ */

type StepOneProps = {
  email: string;
  emailVerified: boolean;
};

export function validateStepOne({
  email,
  emailVerified,
}: StepOneProps): boolean {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    showError(
      "Email Required",
      "Enter your email address to continue.",
    );

    return false;
  }

  const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    showError(
      "Invalid Email",
      "Please enter a valid email address.",
    );

    return false;
  }

  if (/@vmail\.com$/i.test(normalizedEmail)) {
    showError(
      "Invalid Email",
      "Please use a different email address.",
    );

    return false;
  }

  if (!emailVerified) {
    showError(
      "Email Not Verified",
      "Verify your email before continuing.",
    );

    return false;
  }

  return true;
}

/* ============================================================
STEP 2 — PASSWORD
============================================================ */

type PasswordStepProps = {
  password: string;
  confirmPassword: string;
};

export function validatePasswordStep({
  password,
  confirmPassword,
}: PasswordStepProps): boolean {
  if (
    password.length < 6 ||
    password.length > 20
  ) {
    showError(
      "Invalid Password",
      "Passwords must be between 6 and 20 characters.",
    );

    return false;
  }

  if (password !== confirmPassword) {
    showError(
      "Password Mismatch",
      "Passwords do not match.",
    );

    return false;
  }

  return true;
}

/* ============================================================
STEP 3 — PERSONAL INFORMATION
============================================================ */

type StepTwoProps = {
  firstName: string;
  surname: string;
};

export function validateStepTwo({
  firstName,
  surname,
}: StepTwoProps): boolean {
  const normalizedFirstName =
    firstName.trim();

  const normalizedSurname =
    surname.trim();

  if (
    !normalizedFirstName ||
    !normalizedSurname
  ) {
    showError(
      "Missing Information",
      "Please complete your personal information.",
    );

    return false;
  }

  if (
    normalizedFirstName.length < 2 ||
    normalizedFirstName.length > 20
  ) {
    showError(
      "Invalid First Name",
      "First name must be between 2 and 20 characters.",
    );

    return false;
  }

  if (
    normalizedSurname.length < 2 ||
    normalizedSurname.length > 20
  ) {
    showError(
      "Invalid Surname",
      "Surname must be between 2 and 20 characters.",
    );

    return false;
  }

  return true;
}

/* ============================================================
STEP 4 — WORKER PROFESSIONAL PROFILE
============================================================ */

type StepThreeProps = {
  category: string;
  subcategory: string;
  selectedServices: string[];
  experience: string;
  state: string;
  lga: string;
};

export function validateStepThree({
  category,
  subcategory,
  selectedServices,
  experience,
  state,
  lga,
}: StepThreeProps): boolean {
  if (!category.trim()) {
    showError(
      "Category Required",
      "Please select a category.",
    );

    return false;
  }

  if (!subcategory.trim()) {
    showError(
      "Subcategory Required",
      "Please select a subcategory.",
    );

    return false;
  }

  if (selectedServices.length === 0) {
    showError(
      "Service Required",
      "Select at least one service.",
    );

    return false;
  }

  if (!experience.trim()) {
    showError(
      "Experience Required",
      "Please enter your experience.",
    );

    return false;
  }

  if (
    !state.trim() ||
    !lga.trim()
  ) {
    showError(
      "Location Required",
      "Select your state and local government.",
    );

    return false;
  }

  return true;
}

/* ============================================================
STEP 5 — SERVICE INFORMATION
============================================================ */

type ServiceInformationStepProps = {
  serviceAddress: string;
  latitude: number | null;
  longitude: number | null;
  hourlyRate: string;
  phoneNumber: string;
};

export function validateServiceInformationStep({
  serviceAddress,
  latitude,
  longitude,
  hourlyRate,
  phoneNumber,
}: ServiceInformationStepProps): boolean {
  const normalizedAddress =
    serviceAddress.trim();

  const normalizedPhone =
    phoneNumber.trim();

  const normalizedRate =
    hourlyRate
      .replace(/,/g, "")
      .trim();

  /* ----------------------------------------------------------
  SERVICE ADDRESS
  ---------------------------------------------------------- */

  if (!normalizedAddress) {
    showError(
      "Service Address Required",
      "Enter the address where you provide your services.",
    );

    return false;
  }

  if (
    normalizedAddress.length < 5 ||
    normalizedAddress.length > 200
  ) {
    showError(
      "Invalid Service Address",
      "Service address must be between 5 and 200 characters.",
    );

    return false;
  }

  /* ----------------------------------------------------------
  HOURLY RATE
  ---------------------------------------------------------- */

  if (!normalizedRate) {
    showError(
      "Hourly Rate Required",
      "Enter your hourly service rate.",
    );

    return false;
  }

  const parsedRate =
    Number(normalizedRate);

  if (
    !Number.isFinite(parsedRate) ||
    parsedRate <= 0
  ) {
    showError(
      "Invalid Hourly Rate",
      "Enter a valid hourly rate greater than zero.",
    );

    return false;
  }

  if (parsedRate > 10_000_000) {
    showError(
      "Invalid Hourly Rate",
      "Hourly rate is too high.",
    );

    return false;
  }

  /* ----------------------------------------------------------
  PHONE NUMBER — OPTIONAL

  Empty phone:
    ✅ allowed

  Phone provided:
    ✅ must contain 10–15 digits
  ---------------------------------------------------------- */

  if (normalizedPhone) {
    const phoneDigits =
      normalizedPhone.replace(
        /[\s\-().+]/g,
        "",
      );

    if (
      !/^\d{10,15}$/.test(
        phoneDigits,
      )
    ) {
      showError(
        "Invalid Phone Number",
        "Enter a valid phone number.",
      );

      return false;
    }
  }

  /* ----------------------------------------------------------
  GPS LOCATION

  GPS is optional.

  If one coordinate exists, both must
  exist and both must be valid.
  ---------------------------------------------------------- */

  const hasLatitude =
    latitude !== null;

  const hasLongitude =
    longitude !== null;

  if (
    hasLatitude !==
    hasLongitude
  ) {
    showError(
      "Invalid Location",
      "Your current location is incomplete. Please try again.",
    );

    return false;
  }

  if (
    latitude !== null &&
    longitude !== null
  ) {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      showError(
        "Invalid Location",
        "Your current location is invalid. Please try again.",
      );

      return false;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      showError(
        "Invalid Latitude",
        "The selected location has an invalid latitude.",
      );

      return false;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      showError(
        "Invalid Longitude",
        "The selected location has an invalid longitude.",
      );

      return false;
    }
  }

  return true;
}

/* ============================================================
PROFILE PHOTO — OPTIONAL
============================================================ */

type ProfileStepProps = {
  photo: string | null;
};

export function validateProfileStep({
  photo,
}: ProfileStepProps): boolean {
  if (!photo) {
    return true;
  }

  if (
    typeof photo !== "string" ||
    !photo.trim()
  ) {
    return true;
  }

  return true;
}

/* ============================================================
COMPLETE REGISTRATION
============================================================ */

type CompleteRegistrationProps = {
  registrationSource:
    WorkerRegistrationSource;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  emailVerified: boolean;

  password: string;
  confirmPassword: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  /* ----------------------------------------------------------
  SERVICE INFORMATION
  ---------------------------------------------------------- */

  serviceAddress: string;

  latitude: number | null;
  longitude: number | null;

  hourlyRate: string;

  phoneNumber: string;

  /* ----------------------------------------------------------
  PROFILE
  ---------------------------------------------------------- */

  photo: string | null;

  acceptedTerms: boolean;
};

export function validateCompleteRegistration({
  registrationSource,

  firstName,
  surname,
  otherName,

  email,
  emailVerified,

  password,
  confirmPassword,

  category,
  subcategory,
  selectedServices,

  experience,

  state,
  lga,

  serviceAddress,
  latitude,
  longitude,
  hourlyRate,
  phoneNumber,

  photo,

  acceptedTerms,
}: CompleteRegistrationProps): boolean {
  /* ----------------------------------------------------------
  REGISTRATION SOURCE
  ---------------------------------------------------------- */

  if (
    registrationSource !== "new" &&
    registrationSource !== "customer"
  ) {
    showError(
      "Registration Error",
      "Invalid registration type.",
    );

    return false;
  }

  /* ----------------------------------------------------------
  EMAIL + PASSWORD

  NEW REGISTRATION ONLY

  Customer → Worker already has an authenticated
  Firebase account and password verification is
  handled through Firebase reauthentication.
  ---------------------------------------------------------- */

  if (
    registrationSource === "new"
  ) {
    if (
      !validateStepOne({
        email,
        emailVerified,
      })
    ) {
      return false;
    }

    if (
      !validatePasswordStep({
        password,
        confirmPassword,
      })
    ) {
      return false;
    }
  }

  /* ----------------------------------------------------------
  CUSTOMER PASSWORD SECURITY

  For customer → worker registration, the password
  has already been verified using Firebase
  reauthenticateWithCredential().

  We intentionally do not validate or store the
  existing Firebase password here.
  ---------------------------------------------------------- */

  /* ----------------------------------------------------------
  PERSONAL INFORMATION
  ---------------------------------------------------------- */

  if (
    !validateStepTwo({
      firstName,
      surname,
    })
  ) {
    return false;
  }

  /* ----------------------------------------------------------
  WORKER PROFESSIONAL PROFILE
  ---------------------------------------------------------- */

  if (
    !validateStepThree({
      category,
      subcategory,
      selectedServices,
      experience,
      state,
      lga,
    })
  ) {
    return false;
  }

  /* ----------------------------------------------------------
  SERVICE INFORMATION
  ---------------------------------------------------------- */

  if (
    !validateServiceInformationStep({
      serviceAddress,
      latitude,
      longitude,
      hourlyRate,
      phoneNumber,
    })
  ) {
    return false;
  }

  /* ----------------------------------------------------------
  PROFILE PHOTO

  Optional — does not block registration.
  ---------------------------------------------------------- */

  if (
    !validateProfileStep({
      photo,
    })
  ) {
    return false;
  }

  /* ----------------------------------------------------------
  OTHER NAME
  ---------------------------------------------------------- */

  const normalizedOtherName =
    otherName.trim();

  if (
    normalizedOtherName.length > 20
  ) {
    showError(
      "Invalid Other Name",
      "Other name cannot exceed 20 characters.",
    );

    return false;
  }

  /* ----------------------------------------------------------
  TERMS
  ---------------------------------------------------------- */

  if (!acceptedTerms) {
    showError(
      "Terms Required",
      "Accept the Terms & Conditions.",
    );

    return false;
  }

  return true;
}