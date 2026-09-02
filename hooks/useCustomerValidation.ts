import { showError } from "@/utils/showToast";

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

  isLoggedIn: boolean;
};

export function validateCustomerStepOne({
  firstName,
  surname,
}: StepOneProps) {

  if (!firstName.trim() || !surname.trim()) {
    showError(
      "Missing Information",
      "Please complete your personal information."
    );
    return false;
  }

  if (
    firstName.trim().length < 2 ||
    firstName.trim().length > 20
  ) {
    showError(
      "Invalid First Name",
      "First name must be between 2 and 20 characters."
    );
    return false;
  }

  if (
    surname.trim().length < 2 ||
    surname.trim().length > 20
  ) {
    showError(
      "Invalid Surname",
      "Surname must be between 2 and 20 characters."
    );
    return false;
  }

  return true;
}

export function validateCustomerStepTwo({
  email,
  phone,
  emailVerified,
  phoneVerified,
}: StepTwoProps) {

  if (!email.trim() && !phone.trim()) {
    showError(
      "Contact Required",
      "Enter your email or phone number."
    );
    return false;
  }

  if (email.trim() && !emailVerified) {
    showError(
      "Email Not Verified",
      "Verify your email first."
    );
    return false;
  }

  if (phone.trim() && !phoneVerified) {
    showError(
      "Phone Not Verified",
      "Verify your phone number first."
    );
    return false;
  }

  return true;
}

export function validateCustomerStepThree({
  password,
  confirmPassword,
}: StepThreeProps) {

  if (!password || !confirmPassword) {
    showError(
      "Password Required",
      "Enter your password."
    );
    return false;
  }

  if (
    password.length < 6 ||
    password.length > 20
  ) {
    showError(
      "Invalid Password",
      "Password must be between 6 and 20 characters."
    );
    return false;
  }

  if (password !== confirmPassword) {
    showError(
      "Password Mismatch",
      "Passwords do not match."
    );
    return false;
  }

  return true;
}

export function validateCompleteCustomerRegistration({
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

  isLoggedIn,
}: CompleteCustomerRegistrationProps) {

  if (
    !isLoggedIn &&
    !validateCustomerStepOne({
      firstName,
      surname,
    })
  ) {
    return false;
  }

  if (
    !isLoggedIn &&
    !validateCustomerStepTwo({
      email,
      phone,
      emailVerified,
      phoneVerified,
    })
  ) {
    return false;
  }

  if (
    !validateCustomerStepThree({
      password,
      confirmPassword,
    })
  ) {
    return false;
  }

  if (
    otherName.trim() &&
    otherName.trim().length > 20
  ) {
    showError(
      "Invalid Other Name",
      "Other name cannot exceed 20 characters."
    );
    return false;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    email.trim() &&
    !emailRegex.test(email.trim())
  ) {
    showError(
      "Invalid Email",
      "Please enter a valid email address."
    );
    return false;
  }

  if (phone.trim()) {

    const phoneRegex =
      /^0\d{10}$/;

    if (!phoneRegex.test(phone.trim())) {
      showError(
        "Invalid Phone Number",
        "Phone number must be exactly 11 digits."
      );
      return false;
    }

  }

  if (!acceptedTerms) {
    showError(
      "Terms Required",
      "Accept the Terms & Conditions."
    );
    return false;
  }

  if (!email.trim()) {
    showError(
      "Email Required",
      "Email is currently required to create a customer account."
    );
    return false;
  }

  return true;
}