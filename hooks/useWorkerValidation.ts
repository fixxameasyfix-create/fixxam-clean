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
  category: string;
  subcategory: string;
  selectedServices: string[];
  experience: string;
  state: string;
  lga: string;
};

type StepFourProps = {
  photo: string | null;

  password: string;

  confirmPassword: string;

  acceptedTerms: boolean;

  isLoggedIn?: boolean;
};

export function validateStepOne({
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

export function validateStepTwo({
  email,
  phone,
  emailVerified,
  phoneVerified,
}: StepTwoProps) {

  if (!email.trim() && !phone.trim()) {
    showError(
      "Contact Required",
      "Enter email or phone number."
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

export function validateStepThree({
  category,
  subcategory,
  selectedServices,
  experience,
  state,
  lga,
}: StepThreeProps) {

  if (!category) {
    showError(
      "Category Required",
      "Please select a category."
    );
    return false;
  }

  if (!subcategory) {
    showError(
      "Subcategory Required",
      "Please select a subcategory."
    );
    return false;
  }

  if (selectedServices.length === 0) {
    showError(
      "Service Required",
      "Select at least one service."
    );
    return false;
  }

  if (!experience.trim()) {
    showError(
      "Experience Required",
      "Please enter your experience."
    );
    return false;
  }

  if (!state || !lga) {
    showError(
      "Location Required",
      "Select your state and local government."
    );
    return false;
  }

  return true;
}
export function validateStepFour({
  photo,
  password,
  confirmPassword,
  acceptedTerms,
  isLoggedIn = false,
}: StepFourProps) {

  if (!photo) {
    showError(
      "Photo Required",
      "Upload your passport photo."
    );
    return false;
  }

if (!isLoggedIn) {

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

}

  if (!acceptedTerms) {
    showError(
      "Terms Required",
      "Accept the Terms & Conditions."
    );
    return false;
  }

  return true;
}

type CompleteRegistrationProps = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  password: string;
  confirmPassword: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  photo: string | null;

  acceptedTerms: boolean;

  isLoggedIn?: boolean;
};

export function validateCompleteRegistration({
  firstName,
  surname,
  otherName,

  email,
  phone,

  emailVerified,
  phoneVerified,

  password,
  confirmPassword,

  category,
  subcategory,
  selectedServices,

  experience,

  state,
  lga,

  photo,

  acceptedTerms,

  isLoggedIn = false,
}: CompleteRegistrationProps) {

  if (
    !validateStepOne({
      firstName,
      surname,
    })
  ) {
    return false;
  }

  if (
    !validateStepTwo({
      email,
      phone,
      emailVerified,
      phoneVerified,
    })
  ) {
    return false;
  }

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

  if (
    !validateStepFour({
      photo,
      password,
      confirmPassword,
      acceptedTerms,
      isLoggedIn,
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

    if (
      !phoneRegex.test(phone.trim())
    ) {
      showError(
        "Invalid Phone Number",
        "Phone number must be 11 digits."
      );
      return false;
    }
  }

  if (!email.trim()) {
    showError(
      "Email Required",
      "Email is currently required to create worker account."
    );
    return false;
  }

  return true;
}