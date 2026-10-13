import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from "firebase/auth";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

import AuthHeader from "@/components/auth/AuthHeader";

import WorkerStepOne from "@/components/worker/WorkerStepOne";
import WorkerStepTwo from "@/components/worker/WorkerStepTwo";
import WorkerStepThree from "@/components/worker/WorkerStepThree";
import WorkerStepFour from "@/components/worker/WorkerStepFour";
import WorkerServiceInfoStep from "@/components/worker/WorkerServiceInfoStep";
import WorkerReview from "@/components/worker/WorkerReview";
import WorkerNavigation from "@/components/worker/WorkerNavigation";
import WorkerSecurity from "@/components/worker/WorkerSecurity";

import FixxamResponseModal from "@/components/modal/FixxamResponseModal";

import OtpVerification from "@/components/auth/OtpVerification";

import {
  validatePasswordStep,
  validateStepTwo,
  validateStepThree,
  validateServiceInformationStep,
  validateProfileStep,
  type WorkerRegistrationSource,
} from "@/hooks/useWorkerValidation";

import { useWorkerFormState } from "@/hooks/useWorkerFormState";

import { useWorkerSteps } from "@/hooks/useWorkerSteps";

import { useWorkerDraft } from "@/hooks/useWorkerDraft";

import {
  captureWorkerPhoto,
  uploadWorkerPhoto,
} from "@/hooks/useWorkerPhoto";

import useWorkerWorkGallery from "@/hooks/worker/useWorkerWorkGallery";

import useCompleteWorkerRegistration from "@/hooks/worker/useCompleteWorkerRegistration";

import useUserProfile from "@/hooks/auth/useUserProfile";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const EMAIL_STEP = 1;
const OTP_STEP = 2;
const PASSWORD_STEP = 3;
const PERSONAL_STEP = 4;
const PROFILE_STEP = 5;
const SERVICE_INFO_STEP = 6;
const ABOUT_STEP = 7;
const REVIEW_STEP = 8;

/* ============================================================
   TYPES
============================================================ */

type WorkerSignupFormProps = {
  registrationSource?: WorkerRegistrationSource;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerSignupForm({
  registrationSource = "new",
}: WorkerSignupFormProps) {
  const { profile } = useUserProfile();

  const {
    step,
    setStep,
  } = useWorkerSteps();

  const [
    otpScreenVisible,
    setOtpScreenVisible,
  ] = useState(false);

  const [
    existingAccountVisible,
    setExistingAccountVisible,
  ] = useState(false);

  const [
    existingAccountEmail,
    setExistingAccountEmail,
  ] = useState("");

  const [
    passwordConfirming,
    setPasswordConfirming,
  ] = useState(false);

  const [
    passwordErrorVisible,
    setPasswordErrorVisible,
  ] = useState(false);

  const [
    passwordErrorMessage,
    setPasswordErrorMessage,
  ] = useState("");

  const [
    serviceInfoError,
    setServiceInfoError,
  ] = useState("");

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const {
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

    emailVerified,
    setEmailVerified,

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

    about,
    setAbout,

    workGallery,
    setWorkGallery,

    loading,
  } = useWorkerFormState();

  /* ==========================================================
     WORKER DRAFT
  ========================================================== */

  const draft = useWorkerDraft({
    step,
    setStep,

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

    emailVerified,
    setEmailVerified,

    password,
    setPassword,

    confirmPassword,
    setConfirmPassword,

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

    photo,
    setPhoto,

    about,
    setAbout,

    workGallery,
    setWorkGallery,

    acceptedTerms,
    setAcceptedTerms,
  });

  /* ==========================================================
     CUSTOMER → WORKER INITIAL PREFILL
  ========================================================== */

  const customerDetailsApplied =
    useRef(false);

  useEffect(() => {
    if (
      registrationSource !==
      "customer"
    ) {
      return;
    }

    if (
      customerDetailsApplied.current
    ) {
      return;
    }

    if (!profile) {
      return;
    }

    /*
     * Never overwrite an unfinished
     * worker registration.
     */
    if (draft.visible) {
      return;
    }

    customerDetailsApplied.current =
      true;

    /* --------------------------------------------------------
       PERSONAL DETAILS
    -------------------------------------------------------- */

    setFirstName(
      typeof profile.firstName ===
        "string"
        ? profile.firstName.trim()
        : "",
    );

    setSurname(
      typeof profile.surname ===
        "string"
        ? profile.surname.trim()
        : "",
    );

    setOtherName(
      typeof profile.otherName ===
        "string"
        ? profile.otherName.trim()
        : "",
    );

    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    setEmail(
      typeof profile.email ===
        "string"
        ? profile.email
            .trim()
            .toLowerCase()
        : "",
    );

    /*
     * Existing customer is already
     * authenticated.
     *
     * No worker email OTP is required.
     */
    setEmailOtp("");
    setEmailVerified(true);

    /* --------------------------------------------------------
       CUSTOMER PHONE
    -------------------------------------------------------- */

    const customerPhone =
      typeof profile.phone ===
        "string"
        ? profile.phone.trim()
        : "";

    /*
     * Customer phone is only an
     * initial value.
     *
     * If the customer has a phone:
     *   → prefill it.
     *
     * If the customer has no phone:
     *   → leave it empty.
     *
     * The phone remains editable and
     * optional throughout registration.
     */
    setPhoneNumber(
      customerPhone,
    );

    /* --------------------------------------------------------
       CUSTOMER PHOTO
    -------------------------------------------------------- */

    if (
      typeof profile.photoUrl ===
        "string" &&
      profile.photoUrl.trim()
    ) {
      setPhoto(
        profile.photoUrl.trim(),
      );
    }

    /* --------------------------------------------------------
       PASSWORD
    -------------------------------------------------------- */

    /*
     * NEVER fetch or copy the
     * Firebase password.
     *
     * Customer confirms their existing
     * password through Firebase
     * reauthentication.
     */
    setPassword("");
    setConfirmPassword("");

    setStep(
      PASSWORD_STEP,
    );
  }, [
    draft.visible,
    profile,
    registrationSource,

    setConfirmPassword,
    setEmail,
    setEmailOtp,
    setEmailVerified,

    setFirstName,
    setOtherName,

    setPassword,
    setPhoneNumber,
    setPhoto,

    setStep,
    setSurname,
  ]);

  /* ==========================================================
     WORK GALLERY
  ========================================================== */

  const {
    takeWorkPhoto,
    pickWorkPhotos,
    removeWorkPhoto,
    loading:
      workGalleryLoading,
  } = useWorkerWorkGallery({
    workGallery,
    setWorkGallery,
  });

  /* ==========================================================
     REGISTRATION
  ========================================================== */

  const {
    loading:
      registrationLoading,
    completeRegistration,
  } =
    useCompleteWorkerRegistration();

  /* ==========================================================
     OTP SCREEN
  ========================================================== */

  useEffect(() => {
    if (
      registrationSource ===
      "customer"
    ) {
      setOtpScreenVisible(false);
      return;
    }

    if (
      step === OTP_STEP &&
      !emailVerified
    ) {
      setOtpScreenVisible(true);
      return;
    }

    setOtpScreenVisible(false);
  }, [
    emailVerified,
    registrationSource,
    step,
  ]);

  /* ==========================================================
     EXISTING ACCOUNT
  ========================================================== */

  const handleExistingAccount =
    useCallback(
      (
        existingEmail: string,
      ) => {
        const normalizedEmail =
          existingEmail
            .trim()
            .toLowerCase();

        if (!normalizedEmail) {
          return;
        }

        setOtpScreenVisible(
          false,
        );

        setExistingAccountEmail(
          normalizedEmail,
        );

        setExistingAccountVisible(
          true,
        );
      },
      [],
    );

  /* ==========================================================
     EXISTING ACCOUNT LOGIN
  ========================================================== */

  const handleExistingAccountLogin =
    useCallback(() => {
      const identifier =
        existingAccountEmail.trim();

      if (!identifier) {
        setExistingAccountVisible(
          false,
        );

        return;
      }

      setExistingAccountVisible(
        false,
      );

      router.replace(
        `/(auth)/login?identifier=${encodeURIComponent(
          identifier,
        )}` as never,
      );
    }, [
      existingAccountEmail,
    ]);

  /* ==========================================================
     USE ANOTHER EMAIL
  ========================================================== */

  const handleUseAnotherEmail =
    useCallback(() => {
      setExistingAccountVisible(
        false,
      );

      setExistingAccountEmail("");

      setOtpScreenVisible(false);

      setEmail("");
      setEmailOtp("");
      setEmailVerified(false);

      setStep(
        EMAIL_STEP,
      );
    }, [
      setEmail,
      setEmailOtp,
      setEmailVerified,
      setStep,
    ]);

  /* ==========================================================
     OTP SENT
  ========================================================== */

  const handleOtpSent =
    useCallback(() => {
      setEmailOtp("");

      setOtpScreenVisible(true);

      setStep(
        OTP_STEP,
      );
    }, [
      setEmailOtp,
      setStep,
    ]);

  /* ==========================================================
     OTP VERIFIED
  ========================================================== */

  const handleOtpVerified =
    useCallback(
      (
        verified: boolean,
      ) => {
        setEmailVerified(
          verified,
        );

        if (!verified) {
          return;
        }

        setOtpScreenVisible(
          false,
        );

        setStep(
          PASSWORD_STEP,
        );
      },
      [
        setEmailVerified,
        setStep,
      ],
    );

  /* ==========================================================
     CONFIRM CUSTOMER PASSWORD
  ========================================================== */

  const confirmCustomerPassword =
    useCallback(
      async (): Promise<boolean> => {
        if (
          registrationSource !==
          "customer"
        ) {
          return true;
        }

        const enteredPassword =
          confirmPassword.trim();

        if (!enteredPassword) {
          setPasswordErrorMessage(
            "Please re-enter your existing Fixxam account password.",
          );

          setPasswordErrorVisible(
            true,
          );

          return false;
        }

        const auth = getAuth();

        const user =
          auth.currentUser;

        if (!user) {
          setPasswordErrorMessage(
            "Your customer session could not be found. Please sign in again.",
          );

          setPasswordErrorVisible(
            true,
          );

          return false;
        }

        const userEmail =
          user.email
            ?.trim()
            .toLowerCase();

        if (!userEmail) {
          setPasswordErrorMessage(
            "Your account does not have a valid email address for password confirmation.",
          );

          setPasswordErrorVisible(
            true,
          );

          return false;
        }

        const hasPasswordProvider =
          user.providerData.some(
            provider =>
              provider.providerId ===
              "password",
          );

        if (
          !hasPasswordProvider
        ) {
          setPasswordErrorMessage(
            "This account does not use an email and password sign-in method.",
          );

          setPasswordErrorVisible(
            true,
          );

          return false;
        }

        if (
          passwordConfirming
        ) {
          return false;
        }

        try {
          setPasswordConfirming(
            true,
          );

          setPasswordErrorVisible(
            false,
          );

          const credential =
            EmailAuthProvider.credential(
              userEmail,
              enteredPassword,
            );

          await reauthenticateWithCredential(
            user,
            credential,
          );

          /*
           * Do not keep the password
           * in local form state after
           * successful verification.
           */
          setConfirmPassword("");
          setPassword("");

          return true;
        } catch (error) {
          console.error(
            "WORKER_CUSTOMER_PASSWORD_CONFIRMATION_ERROR:",
            error,
          );

          const errorCode =
            typeof error ===
              "object" &&
            error !== null &&
            "code" in error
              ? String(
                  (
                    error as {
                      code?: unknown;
                    }
                  ).code ?? "",
                )
              : "";

          if (
            errorCode ===
              "auth/wrong-password" ||
            errorCode ===
              "auth/invalid-credential" ||
            errorCode ===
              "auth/invalid-login-credentials"
          ) {
            setPasswordErrorMessage(
              "The password you entered is incorrect. Please re-enter your Fixxam account password.",
            );
          } else {
            setPasswordErrorMessage(
              "We could not confirm your password. Please try again.",
            );
          }

          setPasswordErrorVisible(
            true,
          );

          return false;
        } finally {
          setPasswordConfirming(
            false,
          );
        }
      },
      [
        confirmPassword,
        passwordConfirming,
        registrationSource,
        setConfirmPassword,
        setPassword,
      ],
    );

  /* ==========================================================
     NEXT STEP
  ========================================================== */

  const nextStep =
    useCallback(() => {
      /* --------------------------------------------------------
         CUSTOMER → WORKER
         Never use email / OTP.
      -------------------------------------------------------- */

      if (
        registrationSource ===
        "customer"
      ) {
        if (
          step <
          PASSWORD_STEP
        ) {
          setStep(
            PASSWORD_STEP,
          );

          return;
        }
      }

      /* --------------------------------------------------------
         EMAIL
      -------------------------------------------------------- */

      if (
        step === EMAIL_STEP
      ) {
        return;
      }

      /* --------------------------------------------------------
         OTP
      -------------------------------------------------------- */

      if (
        step === OTP_STEP
      ) {
        return;
      }

      /* --------------------------------------------------------
         PASSWORD
      -------------------------------------------------------- */

      if (
        step === PASSWORD_STEP
      ) {
        if (
          registrationSource ===
          "customer"
        ) {
          if (
            passwordConfirming
          ) {
            return;
          }

          void confirmCustomerPassword()
            .then(
              confirmed => {
                if (!confirmed) {
                  return;
                }

                setStep(
                  PERSONAL_STEP,
                );
              },
            );

          return;
        }

        const valid =
          validatePasswordStep({
            password,
            confirmPassword,
          });

        if (!valid) {
          return;
        }

        setStep(
          PERSONAL_STEP,
        );

        return;
      }

      /* --------------------------------------------------------
         PERSONAL
      -------------------------------------------------------- */

      if (
        step === PERSONAL_STEP
      ) {
        const valid =
          validateStepTwo({
            firstName,
            surname,
          });

        if (!valid) {
          return;
        }

        setStep(
          PROFILE_STEP,
        );

        return;
      }

      /* --------------------------------------------------------
         PROFESSIONAL PROFILE
      -------------------------------------------------------- */

      if (
        step === PROFILE_STEP
      ) {
        const servicesValid =
          validateStepThree({
            category,
            subcategory,
            selectedServices,
            experience,
            state,
            lga,
          });

        if (!servicesValid) {
          return;
        }

        const profileValid =
          validateProfileStep({
            photo,
          });

        if (!profileValid) {
          return;
        }

        setStep(
          SERVICE_INFO_STEP,
        );

        return;
      }

      /* --------------------------------------------------------
         SERVICE INFORMATION
      -------------------------------------------------------- */

      if (
        step ===
        SERVICE_INFO_STEP
      ) {
        setServiceInfoError("");

        /*
         * Normalize phone before validation.
         *
         * Phone is OPTIONAL.
         *
         * Customer → Worker:
         * - existing customer phone is
         *   used as the initial value
         * - customer can edit it
         * - customer can remove it
         * - customer can add one if absent
         * - customer can continue without it
         */
        const normalizedPhoneNumber =
          phoneNumber
            .replace(
              /[^\d+]/g,
              "",
            )
            .trim();

        /*
         * Do NOT require a customer
         * phone number here.
         *
         * An empty phone is valid.
         */
        const serviceInfoValid =
          validateServiceInformationStep(
            {
              serviceAddress:
                serviceAddress.trim(),

              latitude,
              longitude,

              hourlyRate:
                hourlyRate.trim(),

              phoneNumber:
                normalizedPhoneNumber,
            },
          );

        if (!serviceInfoValid) {
          return;
        }

        /*
         * Keep the normalized value
         * in the actual form state.
         */
        if (
          normalizedPhoneNumber !==
          phoneNumber
        ) {
          setPhoneNumber(
            normalizedPhoneNumber,
          );
        }

        setStep(
          ABOUT_STEP,
        );

        return;
      }

      /* --------------------------------------------------------
         ABOUT
      -------------------------------------------------------- */

      if (
        step === ABOUT_STEP
      ) {
        setStep(
          REVIEW_STEP,
        );
      }
    }, [
      category,
      confirmCustomerPassword,
      confirmPassword,
      experience,
      firstName,
      hourlyRate,
      latitude,
      lga,
      longitude,
      password,
      passwordConfirming,
      phoneNumber,
      photo,
      registrationSource,
      selectedServices,
      serviceAddress,
      setPhoneNumber,
      setStep,
      state,
      step,
      subcategory,
      surname,
    ]);

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  const handleCapturePhoto =
    useCallback(
      async () => {
        const uri =
          await captureWorkerPhoto();

        if (uri) {
          setPhoto(uri);
        }
      },
      [setPhoto],
    );

  const handleUploadPhoto =
    useCallback(
      async () => {
        const uri =
          await uploadWorkerPhoto();

        if (uri) {
          setPhoto(uri);
        }
      },
      [setPhoto],
    );

  /* ==========================================================
     TERMS
  ========================================================== */

  const handleToggleTerms =
    useCallback(() => {
      setAcceptedTerms(
        current => !current,
      );
    }, [
      setAcceptedTerms,
    ]);

  /* ==========================================================
     LOGIN
  ========================================================== */

  const handleLogin =
    useCallback(() => {
      router.replace(
        "/(auth)/login",
      );
    }, []);

  /* ==========================================================
     COMPLETE REGISTRATION
  ========================================================== */

  const handleCompleteRegistration =
    useCallback(() => {
      void completeRegistration({
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

        about,
        workGallery,

        acceptedTerms,
      });
    }, [
      about,
      acceptedTerms,
      category,
      completeRegistration,
      confirmPassword,
      email,
      emailVerified,
      experience,
      firstName,
      hourlyRate,
      latitude,
      lga,
      longitude,
      otherName,
      password,
      phoneNumber,
      photo,
      registrationSource,
      selectedServices,
      serviceAddress,
      state,
      subcategory,
      surname,
      workGallery,
    ]);

  /* ==========================================================
     BUSY
  ========================================================== */

  const busy =
    loading ||
    registrationLoading ||
    workGalleryLoading ||
    passwordConfirming;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          STEP 1 — EMAIL
      ====================================================== */}

      {step === EMAIL_STEP &&
      registrationSource ===
        "new" &&
      !otpScreenVisible ? (
        <>
          <AuthHeader
            title="Let's get started"
            subtitle="Enter your email to create your Fixxam worker account."
            icon="mail"
            role="worker"
          />

          <WorkerStepTwo
            email={email}
            emailOtp={emailOtp}
            emailVerified={
              emailVerified
            }
            setEmail={setEmail}
            setEmailOtp={
              setEmailOtp
            }
            setEmailVerified={
              setEmailVerified
            }
            onOtpSent={
              handleOtpSent
            }
            onExistingAccount={
              handleExistingAccount
            }
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 2 — OTP
      ====================================================== */}

      {step === OTP_STEP &&
      registrationSource ===
        "new" &&
      otpScreenVisible ? (
        <>
          <AuthHeader
            title="Verify your email"
            subtitle={`Enter the 6-digit code sent to ${email}.`}
            icon="mail"
            role="worker"
          />

          <OtpVerification
            type="email"
            value={email}
            otp={emailOtp}
            onOtpChange={
              setEmailOtp
            }
            variant="worker"
            verified={
              emailVerified
            }
            onVerified={
              handleOtpVerified
            }
            mode="verify"
            initialOtpSent
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 3 — PASSWORD
      ====================================================== */}

      {step === PASSWORD_STEP ? (
        <>
          <AuthHeader
            title={
              registrationSource ===
              "customer"
                ? "Confirm your password"
                : "Create your password"
            }
            subtitle={
              registrationSource ===
              "customer"
                ? "Confirm your existing Fixxam account password to continue."
                : "Choose a secure password for your Fixxam account."
            }
            icon="lock"
            role="worker"
          />

          <WorkerSecurity
            password={password}
            confirmPassword={
              confirmPassword
            }
            setPassword={
              setPassword
            }
            setConfirmPassword={
              setConfirmPassword
            }
            registrationSource={
              registrationSource
            }
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 4 — PERSONAL
      ====================================================== */}

      {step === PERSONAL_STEP ? (
        <>
          <View
            style={
              styles.personalHeader
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.personalTitle
              }
            >
              {registrationSource ===
              "customer"
                ? "Complete your provider profile"
                : "Add profile information"}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.personalSubtitle
              }
            >
              {registrationSource ===
              "customer"
                ? "Your customer details are already available. Complete the remaining information to become a provider."
                : "Add your details to complete your profile."}
            </AppText>
          </View>

          <WorkerStepOne
            firstName={firstName}
            surname={surname}
            otherName={otherName}
            setFirstName={
              setFirstName
            }
            setSurname={
              setSurname
            }
            setOtherName={
              setOtherName
            }
            photo={photo}
            onCapturePhoto={
              handleCapturePhoto
            }
            onUploadPhoto={
              handleUploadPhoto
            }
            readOnly={
              registrationSource ===
              "customer"
            }
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 5 — PROFESSIONAL PROFILE
      ====================================================== */}

      {step === PROFILE_STEP ? (
        <>
          <AuthHeader
            title="Set up your professional profile"
            subtitle="Tell customers about the services you offer."
            icon="professional"
            role="worker"
          />

          <WorkerStepThree
            category={category}
            subcategory={
              subcategory
            }
            selectedServices={
              selectedServices
            }
            experience={
              experience
            }
            state={state}
            lga={lga}
            setCategory={
              setCategory
            }
            setSubcategory={
              setSubcategory
            }
            setSelectedServices={
              setSelectedServices
            }
            setExperience={
              setExperience
            }
            setState={setState}
            setLga={setLga}
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 6 — SERVICE INFORMATION
      ====================================================== */}

      {step ===
      SERVICE_INFO_STEP ? (
        <>
          <AuthHeader
            title="Service Information"
            subtitle="Tell customers where and how you provide your services."
            icon="location"
            role="worker"
          />

          <WorkerServiceInfoStep
            serviceAddress={
              serviceAddress
            }
            setServiceAddress={
              setServiceAddress
            }
            latitude={
              latitude
            }
            longitude={
              longitude
            }
            setLatitude={
              setLatitude
            }
            setLongitude={
              setLongitude
            }
            hourlyRate={
              hourlyRate
            }
            setHourlyRate={
              setHourlyRate
            }
            phoneNumber={
              phoneNumber
            }
            setPhoneNumber={
              setPhoneNumber
            }
          />

          {serviceInfoError ? (
            <AppText
              variant="caption"
              style={
                styles.serviceInfoError
              }
            >
              {
                serviceInfoError
              }
            </AppText>
          ) : null}
        </>
      ) : null}

      {/* ======================================================
          STEP 7 — ABOUT
      ====================================================== */}

      {step === ABOUT_STEP ? (
        <>
          <AuthHeader
            title="About You & Your Skills"
            subtitle="Tell customers a little about your experience and skills."
            icon="professional"
            role="worker"
          />

          <WorkerStepFour
            about={about}
            setAbout={setAbout}
            workGallery={
              workGallery
            }
            onAddWorkPhoto={
              () => undefined
            }
            onTakeWorkPhoto={
              takeWorkPhoto
            }
            onPickWorkPhotos={
              pickWorkPhotos
            }
            onRemoveWorkPhoto={
              removeWorkPhoto
            }
            loading={
              workGalleryLoading
            }
          />
        </>
      ) : null}

      {/* ======================================================
          STEP 8 — REVIEW
      ====================================================== */}

      {step === REVIEW_STEP ? (
        <>
          <AuthHeader
            title="Almost there!"
            subtitle="Review your information before creating your provider profile."
            icon="checkmark-circle"
            role="worker"
          />

          <WorkerReview
            firstName={firstName}
            surname={surname}
            otherName={otherName}
            email={email}
            category={category}
            subcategory={
              subcategory
            }
            selectedServices={
              selectedServices
            }
            experience={
              experience
            }
            state={state}
            lga={lga}
            serviceAddress={
              serviceAddress
            }
            latitude={
              latitude
            }
            longitude={
              longitude
            }
            hourlyRate={
              hourlyRate
            }
            phoneNumber={
              phoneNumber
            }
            photo={photo}
            about={about}
            workGallery={
              workGallery
            }
            acceptedTerms={
              acceptedTerms
            }
            onToggleTerms={
              handleToggleTerms
            }
          />
        </>
      ) : null}

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      {step >= PASSWORD_STEP ? (
        <View
          style={
            styles.navigation
          }
        >
          <WorkerNavigation
            step={step}
            totalSteps={
              REVIEW_STEP
            }
            loading={busy}
            onNext={nextStep}
            onComplete={
              handleCompleteRegistration
            }
          />
        </View>
      ) : null}

      {/* ======================================================
          LOGIN
      ====================================================== */}

      {registrationSource ===
      "new" ? (
        <View
          style={
            styles.loginContainer
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Already have an account?
          </AppText>

          <AppText
            variant="caption"
            weight="semibold"
            role="worker"
            tone="primary"
            accessibilityRole="link"
            accessibilityLabel="Login"
            onPress={
              handleLogin
            }
          >
            Login
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          PASSWORD ERROR
      ====================================================== */}

      <FixxamResponseModal
        visible={
          passwordErrorVisible
        }
        variant="worker"
        title="Password confirmation failed"
        message={
          passwordErrorMessage
        }
        confirmText="Try Again"
        onConfirm={() =>
          setPasswordErrorVisible(
            false,
          )
        }
        onCancel={() =>
          setPasswordErrorVisible(
            false,
          )
        }
      />

      {/* ======================================================
          EXISTING ACCOUNT
      ====================================================== */}

      <FixxamResponseModal
        visible={
          existingAccountVisible
        }
        variant="worker"
        title="Account already exists"
        message={`The email ${existingAccountEmail} is already registered. Please log in to continue, or use another email address.`}
        confirmText="Go to Login"
        cancelText="Use Another Email"
        onConfirm={
          handleExistingAccountLogin
        }
        onCancel={
          handleUseAnotherEmail
        }
      />

     {/* ======================================================
          DRAFT — FULL-SCREEN RESUME REGISTRATION
      ====================================================== */}

      <FixxamResponseModal
        visible={draft.visible}
        variant="worker"
        presentation="resume-registration"
        title="Resume your registration?"
        message="We found an incomplete registration for this email address."
        email={email}
        confirmText="Continue Registration"
        cancelText="Start Over"
        onConfirm={draft.continueDraft}
        onCancel={draft.startOver}
      />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    personalHeader: {
      alignItems:
        "center",
      marginTop:
        FixxamTokens.spacing.xs,
      marginBottom:
        FixxamTokens.spacing.md,
      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    personalTitle: {
      color:
        Colors.textPrimary,
    },

    personalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xs,
      maxWidth: 360,
    },

    serviceInfoError: {
      marginHorizontal:
        FixxamTokens.spacing.md,
      marginTop:
        FixxamTokens.spacing.sm,
      color:
        Colors.error,
    },

    navigation: {
      width: "100%",
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.sm,
      paddingBottom:
        FixxamTokens.spacing.xs,
    },

    loginContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        FixxamTokens.spacing.xs,
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.sm,
      paddingBottom:
        FixxamTokens.spacing.md,
    },
  });