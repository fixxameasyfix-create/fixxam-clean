import React, {
  useCallback,
  useEffect,
} from "react";

import {
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

import {
  Colors,
  FixxamTokens,
} from "@/theme";

const FIRST_STEP = 1;
const CONTACT_STEP = 2;
const SERVICE_STEP = 3;
const PROFILE_STEP = 4;
const REVIEW_STEP = 5;

export default function WorkerSignupForm() {
  const {
    step,
    setStep,
  } = useWorkerSteps();

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

  const {
    addWorkPhoto,
    removeWorkPhoto,
  } = useWorkerWorkGallery({
    workGallery,
    setWorkGallery,
  });

  const {
    loading: registrationLoading,
    completeRegistration,
  } =
    useCompleteWorkerRegistration();

  const nextStep =
    useCallback(() => {
      if (
        !isLoggedIn &&
        step === FIRST_STEP
      ) {
        const valid =
          validateStepOne({
            firstName,
            surname,
          });

        if (!valid) {
          return;
        }
      }

      if (
        !isLoggedIn &&
        step === CONTACT_STEP
      ) {
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

      if (
        step === SERVICE_STEP
      ) {
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

      setStep((previous) =>
        Math.min(
          previous + 1,
          REVIEW_STEP,
        ),
      );
    }, [
      category,
      email,
      emailVerified,
      experience,
      firstName,
      isLoggedIn,
      lga,
      phone,
      phoneVerified,
      selectedServices,
      setStep,
      state,
      step,
      subcategory,
      surname,
    ]);

  const prevStep =
    useCallback(() => {
      if (
        step <= FIRST_STEP
      ) {
        return;
      }

      setStep((previous) =>
        Math.max(
          previous - 1,
          FIRST_STEP,
        ),
      );
    }, [
      setStep,
      step,
    ]);

  const handleCapturePhoto =
    useCallback(async () => {
      const uri =
        await captureWorkerPhoto();

      if (uri) {
        setPhoto(uri);
      }
    }, [setPhoto]);

  const handleUploadPhoto =
    useCallback(async () => {
      const uri =
        await uploadWorkerPhoto();

      if (uri) {
        setPhoto(uri);
      }
    }, [setPhoto]);

  const handleToggleTerms =
    useCallback(() => {
      setAcceptedTerms(
        (current) => !current,
      );
    }, [setAcceptedTerms]);

  const handleLogin =
    useCallback(() => {
      router.replace(
        "/(auth)/login",
      );
    }, []);

  const handleCompleteRegistration =
    useCallback(() => {
      void completeRegistration({
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
      isLoggedIn,
      lga,
      otherName,
      password,
      phone,
      phoneVerified,
      photo,
      selectedServices,
      state,
      subcategory,
      surname,
      workGallery,
    ]);

  /*
   * Existing users already have
   * identity/contact information,
   * so start from service details.
   */
  useEffect(() => {
    if (
      isLoggedIn &&
      step < SERVICE_STEP
    ) {
      setStep(
        SERVICE_STEP,
      );
    }
  }, [
    isLoggedIn,
    setStep,
    step,
  ]);

  const busy =
    loading ||
    registrationLoading;

  return (
    <View style={styles.container}>
      {step === FIRST_STEP ? (
        <AuthHeader
          title="Join as a Worker"
          subtitle="Offer services and earn money with Fixxam."
          icon="professional"
          role="worker"
        />
      ) : null}

      {!isLoggedIn &&
      step === FIRST_STEP ? (
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
      ) : null}

      {!isLoggedIn &&
      step === CONTACT_STEP ? (
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
          setEmail={setEmail}
          setEmailOtp={
            setEmailOtp
          }
          setPhone={setPhone}
          setOtp={setOtp}
          setEmailVerified={
            setEmailVerified
          }
          setPhoneVerified={
            setPhoneVerified
          }
        />
      ) : null}

      {step === SERVICE_STEP ? (
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
      ) : null}

      {step === PROFILE_STEP ? (
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
      ) : null}

      {step === REVIEW_STEP ? (
        <WorkerReview
          photo={photo}
          firstName={firstName}
          surname={surname}
          otherName={otherName}
          email={email}
          phone={phone}
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
          about={about}
          workGallery={
            workGallery
          }
          state={state}
          lga={lga}
          isLoggedIn={
            isLoggedIn
          }
          password={password}
          confirmPassword={
            confirmPassword
          }
          acceptedTerms={
            acceptedTerms
          }
          onToggleTerms={
            handleToggleTerms
          }
          setPassword={
            setPassword
          }
          setConfirmPassword={
            setConfirmPassword
          }
        />
      ) : null}

      <View style={styles.navigation}>
        <WorkerNavigation
          step={step}
          loading={busy}
          onNext={nextStep}
          onBack={prevStep}
          onComplete={
            handleCompleteRegistration
          }
        />
      </View>

      {!isLoggedIn ? (
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
            onPress={handleLogin}
          >
            Login
          </AppText>
        </View>
      ) : null}

      <FixxamResponseModal
        visible={draft.visible}
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        Colors.background,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    navigation: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    loginContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,
    },
  });