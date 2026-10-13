import { useState } from "react";

export type CustomerFormInitialValues = {
  firstName?: string;
  surname?: string;
  otherName?: string;
  email?: string;
  emailOtp?: string;
  phone?: string;
  otp?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: boolean;
  photo?: string | null;
};

export function useCustomerFormState(
  initialValues?: CustomerFormInitialValues,
) {
  const [firstName, setFirstName] = useState(
    initialValues?.firstName ?? "",
  );

  const [surname, setSurname] = useState(
    initialValues?.surname ?? "",
  );

  const [otherName, setOtherName] = useState(
    initialValues?.otherName ?? "",
  );

  const [email, setEmail] = useState(
    initialValues?.email ?? "",
  );

  const [emailOtp, setEmailOtp] = useState(
    initialValues?.emailOtp ?? "",
  );

  const [phone, setPhone] = useState(
    initialValues?.phone ?? "",
  );

  const [otp, setOtp] = useState(
    initialValues?.otp ?? "",
  );

  const [
    emailVerified,
    setEmailVerified,
  ] = useState(
    initialValues?.emailVerified ?? false,
  );

  const [
    phoneVerified,
    setPhoneVerified,
  ] = useState(
    initialValues?.phoneVerified ?? false,
  );

  const [password, setPassword] = useState(
    initialValues?.password ?? "",
  );

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState(
    initialValues?.confirmPassword ?? "",
  );

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(
    initialValues?.acceptedTerms ?? false,
  );

  const [photo, setPhoto] = useState<string | null>(
    initialValues?.photo ?? null,
  );

  const [loading, setLoading] = useState(false);

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