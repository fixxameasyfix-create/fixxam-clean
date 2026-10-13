import { useState } from "react";

export function useWorkerFormState() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [otherName, setOtherName] = useState("");

  /* ============================================================
     EMAIL
  ============================================================ */

  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  /* ============================================================
     PASSWORD
  ============================================================ */

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ============================================================
     ACCOUNT
  ============================================================ */

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /* ============================================================
     PROFILE
  ============================================================ */

  const [photo, setPhoto] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [experience, setExperience] = useState("");

  /* ============================================================
     SERVICE AREA
     State + LGA remain part of the professional profile step.
  ============================================================ */

  const [state, setState] = useState("");
  const [lga, setLga] = useState("");

  /* ============================================================
     SERVICE INFORMATION
  ============================================================ */

  const [serviceAddress, setServiceAddress] = useState("");

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [hourlyRate, setHourlyRate] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");

  /* ============================================================
     ABOUT
  ============================================================ */

  const [about, setAbout] = useState("");

  /* ============================================================
     WORK GALLERY
  ============================================================ */

  const [workGallery, setWorkGallery] =
    useState<string[]>([]);

  /* ============================================================
     LOADING
  ============================================================ */

  const [loading, setLoading] = useState(false);

  return {
    /* ----------------------------------------------------------
       PERSONAL INFORMATION
    ---------------------------------------------------------- */

    firstName,
    setFirstName,

    surname,
    setSurname,

    otherName,
    setOtherName,

    /* ----------------------------------------------------------
       EMAIL
    ---------------------------------------------------------- */

    email,
    setEmail,

    emailOtp,
    setEmailOtp,

    emailVerified,
    setEmailVerified,

    /* ----------------------------------------------------------
       PASSWORD
    ---------------------------------------------------------- */

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

    /* ----------------------------------------------------------
       ACCOUNT
    ---------------------------------------------------------- */

    acceptedTerms,
    setAcceptedTerms,

    /* ----------------------------------------------------------
       WORKER PROFILE
    ---------------------------------------------------------- */

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

    /* ----------------------------------------------------------
       SERVICE AREA
    ---------------------------------------------------------- */

    state,
    setState,

    lga,
    setLga,

    /* ----------------------------------------------------------
       SERVICE INFORMATION
    ---------------------------------------------------------- */

    serviceAddress,
    setServiceAddress,

    latitude,
    setLatitude,

    longitude,
    setLongitude,

    hourlyRate,
    setHourlyRate,

    phoneNumber,
    setPhoneNumber,

    /* ----------------------------------------------------------
       ABOUT
    ---------------------------------------------------------- */

    about,
    setAbout,

    /* ----------------------------------------------------------
       WORK GALLERY
    ---------------------------------------------------------- */

    workGallery,
    setWorkGallery,

    /* ----------------------------------------------------------
       LOADING
    ---------------------------------------------------------- */

    loading,
    setLoading,
  };
}