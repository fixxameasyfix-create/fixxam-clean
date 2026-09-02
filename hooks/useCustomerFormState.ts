import { useState } from "react";

export function useCustomerFormState() {
  const [firstName, setFirstName] =
    useState("");

  const [surname, setSurname] =
    useState("");

  const [otherName, setOtherName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [emailOtp, setEmailOtp] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [
    emailVerified,
    setEmailVerified,
  ] = useState(false);

  const [
    phoneVerified,
    setPhoneVerified,
  ] = useState(false);

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [photo, setPhoto] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  return {
    firstName,
    setFirstName,

    surname,
    setSurname,

    otherName,
    setOtherName,

    email,
    setEmail,

    emailOtp,
    setEmailOtp,

    phone,
    setPhone,

    otp,
    setOtp,

    emailVerified,
    setEmailVerified,

    phoneVerified,
    setPhoneVerified,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    acceptedTerms,
    setAcceptedTerms,

    photo,
    setPhoto,

    loading,
    setLoading,
  };
}