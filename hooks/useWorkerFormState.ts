import { useState } from "react";

export function useWorkerFormState() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [otherName, setOtherName] = useState("");

  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [phoneVerified, setPhoneVerified] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [photo, setPhoto] =
    useState<string | null>(null);

  const [category, setCategory] =
    useState("");

  const [subcategory, setSubcategory] =
    useState("");

  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);

  const [experience, setExperience] =
    useState("");

  const [state, setState] =
    useState("");

  const [lga, setLga] =
    useState("");

  const [about, setAbout] =
    useState("");

  /* ============================================================
     WORK GALLERY
  ============================================================ */

  const [workGallery, setWorkGallery] =
    useState<string[]>([]);

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

    category,
    setCategory,

    subcategory,
    setSubcategory,

    selectedServices,
    setSelectedServices,

    experience,
    setExperience,

    state,
    setState,

    lga,
    setLga,

    about,
    setAbout,

    workGallery,
    setWorkGallery,

    loading,
    setLoading,
  };
}