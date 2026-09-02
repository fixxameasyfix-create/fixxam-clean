import React, {
  useEffect,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

import AuthHeader from "@/components/auth/AuthHeader";

import WorkerStepOne from "@/components/worker/WorkerStepOne";
import WorkerStepTwo from "@/components/worker/WorkerStepTwo";
import WorkerStepThree from "@/components/worker/WorkerStepThree";
import WorkerStepFour from "@/components/worker/WorkerStepFour";
import WorkerReview from "@/components/worker/WorkerReview";
import WorkerNavigation from "@/components/worker/WorkerNavigation";

import FixxamResponseModal from "@/components/modal/FixxamResponseModal";

import useWorkerProfilePrefill from "@/hooks/worker/useWorkerProfilePrefill";

import {
  validateStepOne,
  validateStepTwo,
  validateStepThree,
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

export default function WorkerSignupForm() {
  /* ============================================================
     STEP
  ============================================================ */

  const {
    step,
    setStep,
  } = useWorkerSteps();

  /* ============================================================
     FORM STATE
  ============================================================ */

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
  } = useWorkerFormState();

  /* ============================================================
     EXISTING PROFILE
  ============================================================ */

  const {
    isLoggedIn,
  } = useWorkerProfilePrefill({
    setFirstName,
    setSurname,
    setOtherName,
    setEmail,
    setPhone,
    setEmailVerified,
    setPhoneVerified,
  });

  /* ============================================================
     DRAFT
  ============================================================ */

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

    phone,
    setPhone,

    otp,
    setOtp,

    phoneVerified,
    setPhoneVerified,

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

    photo,
    setPhoto,

    about,
    setAbout,

    workGallery,
    setWorkGallery,

    acceptedTerms,
    setAcceptedTerms,
  });

  /* ============================================================
     WORK GALLERY
  ============================================================ */

  const {
    addWorkPhoto,
    removeWorkPhoto,
  } = useWorkerWorkGallery({
    workGallery,
    setWorkGallery,
  });

  /* ============================================================
     REGISTRATION
  ============================================================ */

  const {
    loading: registrationLoading,
    completeRegistration,
  } =
    useCompleteWorkerRegistration();

  /* ============================================================
     NEXT STEP
  ============================================================ */

  const nextStep = () => {
    /* ----------------------------------------------------------
       STEP 1
    ---------------------------------------------------------- */

    if (!isLoggedIn && step === 1) {
      const valid =
        validateStepOne({
          firstName,
          surname,
        });

      if (!valid) {
        return;
      }
    }

    /* ----------------------------------------------------------
       STEP 2
    ---------------------------------------------------------- */

    if (!isLoggedIn && step === 2) {
      const valid =
        validateStepTwo({
          email,
          phone,
          emailVerified,
          phoneVerified,
        });

      if (!valid) {
        return;
      }
    }

    /* ----------------------------------------------------------
       STEP 3
    ---------------------------------------------------------- */

    if (step === 3) {
      const valid =
        validateStepThree({
          category,
          subcategory,
          selectedServices,
          experience,
          state,
          lga,
        });

      if (!valid) {
        return;
      }
    }

    /* ----------------------------------------------------------
       STEP 4
       PHOTO + ABOUT + GALLERY ARE OPTIONAL
    ---------------------------------------------------------- */

    setStep((previous) =>
      Math.min(
        previous + 1,
        5,
      ),
    );
  };

  /* ============================================================
     PREVIOUS STEP
  ============================================================ */

  const prevStep = () => {
    if (step <= 1) {
      return;
    }

    setStep((previous) =>
      Math.max(
        previous - 1,
        1,
      ),
    );
  };

  /* ============================================================
     PROFILE PHOTO
  ============================================================ */

  const handleCapturePhoto =
    async () => {
      const uri =
        await captureWorkerPhoto();

      if (uri) {
        setPhoto(uri);
      }
    };

  const handleUploadPhoto =
    async () => {
      const uri =
        await uploadWorkerPhoto();

      if (uri) {
        setPhoto(uri);
      }
    };

  /* ============================================================
     LOGGED-IN WORKER
  ============================================================ */

  useEffect(() => {
    if (
      isLoggedIn &&
      step < 3
    ) {
      setStep(3);
    }
  }, [
    isLoggedIn,
    step,
    setStep,
  ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      {step === 1 && (
        <AuthHeader
          title="Join as a Worker"
          subtitle="Offer services and earn money with Fixxam."
          icon="construct"
          variant="worker"
        />
      )}

      {/* ======================================================
          STEP 1
      ====================================================== */}

      {!isLoggedIn &&
        step === 1 && (
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
          />
        )}

      {/* ======================================================
          STEP 2
      ====================================================== */}

      {!isLoggedIn &&
        step === 2 && (
          <WorkerStepTwo
            email={email}
            emailOtp={emailOtp}
            phone={phone}
            otp={otp}
            emailVerified={
              emailVerified
            }
            phoneVerified={
              phoneVerified
            }
            setEmail={
              setEmail
            }
            setEmailOtp={
              setEmailOtp
            }
            setPhone={
              setPhone
            }
            setOtp={
              setOtp
            }
            setEmailVerified={
              setEmailVerified
            }
            setPhoneVerified={
              setPhoneVerified
            }
          />
        )}

      {/* ======================================================
          STEP 3
      ====================================================== */}

      {step === 3 && (
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
          setState={
            setState
          }
          setLga={
            setLga
          }
        />
      )}

      {/* ======================================================
          STEP 4
          PROFILE + ABOUT + WORK GALLERY
      ====================================================== */}

      {step === 4 && (
        <WorkerStepFour
          photo={photo}
          onUploadPhoto={
            handleUploadPhoto
          }
          onCapturePhoto={
            handleCapturePhoto
          }
          about={about}
          setAbout={setAbout}
          workGallery={
            workGallery
          }
          onAddWorkPhoto={
            addWorkPhoto
          }
          onRemoveWorkPhoto={
            removeWorkPhoto
          }
        />
      )}

      {/* ======================================================
          STEP 5
      ====================================================== */}

{step === 5 && (
  <WorkerReview
    photo={photo}

    firstName={firstName}
    surname={surname}
    otherName={otherName}

    email={email}
    phone={phone}

    category={category}
    subcategory={subcategory}

    selectedServices={
      selectedServices
    }

    experience={experience}

    about={about}

    workGallery={
      workGallery
    }

    state={state}
    lga={lga}

    isLoggedIn={
      isLoggedIn
    }

    password={
      password
    }

    confirmPassword={
      confirmPassword
    }

    acceptedTerms={
      acceptedTerms
    }

    onToggleTerms={() =>
      setAcceptedTerms(
        !acceptedTerms,
      )
    }

    setPassword={
      setPassword
    }

    setConfirmPassword={
      setConfirmPassword
    }
  />
)}

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <View
        style={
          styles.navigation
        }
      >
        <WorkerNavigation
          step={step}
          loading={
            loading ||
            registrationLoading
          }
          onNext={
            nextStep
          }
          onBack={
            prevStep
          }
          onComplete={() =>
            completeRegistration({
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

              about,

              workGallery,

              acceptedTerms,

              isLoggedIn,
            })
          }
        />
      </View>

      {/* ======================================================
          LOGIN
      ====================================================== */}

      <View
        style={
          styles.loginContainer
        }
      >
        <AppText
          style={
            styles.loginText
          }
        >
          Already have an account?
        </AppText>

        <Pressable
          onPress={() =>
            router.replace(
              "/(auth)/login",
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Login"
        >
          <AppText
            color="#FF6B00"
            weight="bold"
          >
            Login
          </AppText>
        </Pressable>
      </View>

      {/* ======================================================
          DRAFT MODAL
      ====================================================== */}

      <FixxamResponseModal
        visible={
          draft.visible
        }
        variant="worker"
        title="Continue Registration"
        message="We found an unfinished registration. Would you like to continue where you stopped?"
        confirmText="Continue"
        cancelText="Start Over"
        onConfirm={
          draft.continueDraft
        }
        onCancel={
          draft.startOver
        }
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        "#FFFFFF",

      paddingBottom: 16,
    },

    navigation: {
      marginTop: 8,

      paddingHorizontal: 16,
    },

    loginContainer: {
      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap: 4,

      marginTop: 12,

      marginBottom: 8,
    },

    loginText: {
      fontSize: 12,

      color: "#64748B",
    },
  });