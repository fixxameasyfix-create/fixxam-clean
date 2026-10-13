import { showError } from "@/utils/showToast";

/* ==============================================================
   TYPES
============================================================== */

type RegistrationSource =
  | "new"
  | "worker";

type StepOneProps = {
  firstName: string;
  surname: string;
};

type StepTwoProps = {
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

type StepThreeProps = {
  password: string;
  confirmPassword: string;
};

type CompleteCustomerRegistrationProps = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  password: string;
  confirmPassword: string;

  acceptedTerms: boolean;

  registrationSource?: RegistrationSource;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 20;

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

const NIGERIAN_PHONE_REGEX =
  /^\d{10}$/;

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==============================================================
   STEP ONE — PERSONAL INFORMATION
============================================================== */

export function validateCustomerStepOne({
  firstName,
  surname,
}: StepOneProps): boolean {
  const normalizedFirstName =
    firstName.trim();

  const normalizedSurname =
    surname.trim();

  /*
   * First name
   */
  if (!normalizedFirstName) {
    showError(
      "Missing Information",
      "Please enter your first name.",
    );

    return false;
  }

  if (
    normalizedFirstName.length <
      MIN_NAME_LENGTH ||
    normalizedFirstName.length >
      MAX_NAME_LENGTH
  ) {
    showError(
      "Invalid First Name",
      `First name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`,
    );

    return false;
  }

  /*
   * Surname
   */
  if (!normalizedSurname) {
    showError(
      "Missing Information",
      "Please enter your surname.",
    );

    return false;
  }

  if (
    normalizedSurname.length <
      MIN_NAME_LENGTH ||
    normalizedSurname.length >
      MAX_NAME_LENGTH
  ) {
    showError(
      "Invalid Surname",
      `Surname must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`,
    );

    return false;
  }

  return true;
}

/* ==============================================================
   STEP TWO — CONTACT & VERIFICATION
============================================================== */

export function validateCustomerStepTwo({
  email,
  phone,
  emailVerified,
  phoneVerified,
}: StepTwoProps): boolean {
  const normalizedEmail =
    email.trim();

  const normalizedPhone =
    phone.trim();

  const hasEmail =
    Boolean(normalizedEmail);

  const hasPhone =
    Boolean(normalizedPhone);

  /*
   * Exactly ONE contact method is required.
   */
  if (!hasEmail && !hasPhone) {
    showError(
      "Contact Required",
      "Enter your email or phone number.",
    );

    return false;
  }

  /*
   * Email and phone cannot both
   * be used in this signup flow.
   */
  if (hasEmail && hasPhone) {
    showError(
      "Choose One Contact",
      "Enter either your email or phone number.",
    );

    return false;
  }

  /*
   * EMAIL REGISTRATION
   */
  if (hasEmail) {
    if (
      !EMAIL_REGEX.test(
        normalizedEmail,
      )
    ) {
      showError(
        "Invalid Email",
        "Please enter a valid email address.",
      );

      return false;
    }

    if (!emailVerified) {
      showError(
        "Email Not Verified",
        "Verify your email first.",
      );

      return false;
    }

    return true;
  }

  /*
   * PHONE REGISTRATION
   */
  if (hasPhone) {
    /*
     * CustomerContactInfo normalizes
     * Nigerian phone numbers to:
     *
     * 9121350789
     */
    if (
      !NIGERIAN_PHONE_REGEX.test(
        normalizedPhone,
      )
    ) {
      showError(
        "Invalid Phone Number",
        "Enter a valid Nigerian phone number.",
      );

      return false;
    }

    if (!phoneVerified) {
      showError(
        "Phone Not Verified",
        "Verify your phone number first.",
      );

      return false;
    }

    return true;
  }

  return false;
}

/* ==============================================================
   STEP THREE — PASSWORD
============================================================== */

export function validateCustomerStepThree({
  password,
  confirmPassword,
}: StepThreeProps): boolean {
  if (
    !password ||
    !confirmPassword
  ) {
    showError(
      "Password Required",
      "Enter your password.",
    );

    return false;
  }

  if (
    password.length <
      MIN_PASSWORD_LENGTH ||
    password.length >
      MAX_PASSWORD_LENGTH
  ) {
    showError(
      "Invalid Password",
      `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
    );

    return false;
  }

  if (
    password !==
    confirmPassword
  ) {
    showError(
      "Password Mismatch",
      "Passwords do not match.",
    );

    return false;
  }

  return true;
}

/* ==============================================================
   OTHER NAME VALIDATION
============================================================== */

function validateOtherName(
  otherName: string,
): boolean {
  const normalizedOtherName =
    otherName.trim();

  /*
   * Other name is optional.
   */
  if (!normalizedOtherName) {
    return true;
  }

  if (
    normalizedOtherName.length >
    MAX_NAME_LENGTH
  ) {
    showError(
      "Invalid Other Name",
      `Other name cannot exceed ${MAX_NAME_LENGTH} characters.`,
    );

    return false;
  }

  return true;
}

/* ==============================================================
   EMAIL VALIDATION
============================================================== */

function validateEmail(
  email: string,
): boolean {
  const normalizedEmail =
    email.trim();

  /*
   * Email is optional at this helper
   * level because phone registration
   * is supported.
   */
  if (!normalizedEmail) {
    return true;
  }

  if (
    !EMAIL_REGEX.test(
      normalizedEmail,
    )
  ) {
    showError(
      "Invalid Email",
      "Please enter a valid email address.",
    );

    return false;
  }

  return true;
}

/* ==============================================================
   PHONE VALIDATION
============================================================== */

function validatePhone(
  phone: string,
): boolean {
  const normalizedPhone =
    phone.trim();

  /*
   * Phone is optional because email
   * registration is supported.
   */
  if (!normalizedPhone) {
    return true;
  }

  /*
   * CustomerContactInfo normalizes
   * supported Nigerian numbers to:
   *
   * 9121350789
   */
  if (
    !NIGERIAN_PHONE_REGEX.test(
      normalizedPhone,
    )
  ) {
    showError(
      "Invalid Phone Number",
      "Enter a valid Nigerian phone number.",
    );

    return false;
  }

  return true;
}

/* ==============================================================
   TERMS VALIDATION
============================================================== */

function validateTerms(
  acceptedTerms: boolean,
): boolean {
  if (acceptedTerms) {
    return true;
  }

  showError(
    "Terms Required",
    "Accept the Terms & Conditions.",
  );

  return false;
}

/* ==============================================================
   COMPLETE CUSTOMER REGISTRATION
============================================================== */

export function validateCompleteCustomerRegistration(
  data: CompleteCustomerRegistrationProps,
): boolean {
  const {
    firstName,
    surname,
    otherName,

    email,
    phone,

    emailVerified,
    phoneVerified,

    password,
    confirmPassword,

    acceptedTerms,

    registrationSource = "new",
  } = data;

  /* ============================================================
     PERSONAL INFORMATION
  ============================================================ */

  if (
    !validateCustomerStepOne({
      firstName,
      surname,
    })
  ) {
    return false;
  }

  /* ============================================================
     OTHER NAME
  ============================================================ */

  if (
    !validateOtherName(
      otherName,
    )
  ) {
    return false;
  }

  /* ============================================================
     WORKER → CUSTOMER
     
     IMPORTANT:
     
     A worker already has:
     
     - Firebase Auth account
     - Firebase Auth email
     - existing password
     - verified authentication state
     
     Therefore we MUST NOT use the
     new-customer contact/password
     validation here.
     
     Firebase Auth verification is
     handled by useCustomerRegistration()
     through:
     
       reauthenticateWithCredential()
       reload()
       currentUser.emailVerified
  ============================================================ */

  if (
    registrationSource ===
    "worker"
  ) {
    /*
     * Worker must accept the customer
     * terms before adding the customer
     * role.
     */
    if (
      !validateTerms(
        acceptedTerms,
      )
    ) {
      return false;
    }

    /*
     * Email/password verification is
     * intentionally NOT performed here.
     *
     * Do NOT trust:
     *
     *   emailVerified
     *   password
     *   confirmPassword
     *
     * from the form for the worker path.
     *
     * The registration service performs
     * the authoritative Firebase check.
     */
    return true;
  }

  /* ============================================================
     NEW CUSTOMER
     
     Normal email/phone registration.
  ============================================================ */

  /* ------------------------------------------------------------
     CONTACT & VERIFICATION
  ------------------------------------------------------------ */

  if (
    !validateCustomerStepTwo({
      email,
      phone,
      emailVerified,
      phoneVerified,
    })
  ) {
    return false;
  }

  /* ------------------------------------------------------------
     PASSWORD
  ------------------------------------------------------------ */

  if (
    !validateCustomerStepThree({
      password,
      confirmPassword,
    })
  ) {
    return false;
  }

  /* ------------------------------------------------------------
     EMAIL FORMAT
  ------------------------------------------------------------ */

  if (
    !validateEmail(email)
  ) {
    return false;
  }

  /* ------------------------------------------------------------
     PHONE FORMAT
  ------------------------------------------------------------ */

  if (
    !validatePhone(phone)
  ) {
    return false;
  }

  /* ------------------------------------------------------------
     TERMS
  ------------------------------------------------------------ */

  if (
    !validateTerms(
      acceptedTerms,
    )
  ) {
    return false;
  }

  return true;
}