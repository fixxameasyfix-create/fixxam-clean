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

import { FixxamTokens } from "@/theme";

import {
  validateCustomerStepTwo,
  validateCustomerStepThree,
} from "@/hooks/useCustomerValidation";

import CustomerPersonalInfo from "@/components/customer/CustomerPersonalInfo";
import CustomerContactInfo from "@/components/customer/CustomerContactInfo";
import CustomerSecurity from "@/components/customer/CustomerSecurity";
import CustomerSignupFooter from "@/components/customer/CustomerSignupFooter";
import CustomerReview from "@/components/customer/CustomerReview";

import OtpVerification from "@/components/auth/OtpVerification";

import useCompleteCustomerRegistration from "@/hooks/customer/useCompleteCustomerRegistration";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import { useCustomerFormState } from "@/hooks/useCustomerFormState";

import {
  captureCustomerPhoto,
  pickCustomerPhoto,
} from "@/hooks/useCustomerPhoto";

import useCustomerDraft from "@/hooks/useCustomerDraft";
import useUserProfile from "@/hooks/auth/useUserProfile";

import { auth } from "@/firebase/config";

import {
  useCustomerRegistration,
} from "@/hooks/customer/useCustomerRegistration";

/* ==============================================================
   TYPES
============================================================== */

export type CustomerRegistrationSource =
  | "new"
  | "worker";

export type CustomerPrefillMode =
  | "worker"
  | "blank";

interface Props {
  step: number;

  setStep: React.Dispatch<
    React.SetStateAction<number>
  >;

  onExistingAccount: (
    email: string,
  ) => void;

  onResumeAvailable: (
    email: string,
  ) => void;

  resumeRequested: boolean;

  onResumeHandled: () => void;

  resetRequested: boolean;

  onResetHandled: () => void;

  registrationSource?: CustomerRegistrationSource;

  prefillMode?: CustomerPrefillMode;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function CustomerSignupForm({
  step,
  setStep,
  onExistingAccount,
  onResumeAvailable,
  resumeRequested,
  onResumeHandled,
  resetRequested,
  onResetHandled,
  registrationSource = "new",
  prefillMode = "blank",
}: Props) {
  /* ============================================================
     MODE
  ============================================================ */

  const isWorkerRegistration =
    registrationSource === "worker";

  const shouldPrefillWorker =
    isWorkerRegistration &&
    prefillMode === "worker";

  /* ============================================================
     STATE
  ============================================================ */

  const [
    otpScreenVisible,
    setOtpScreenVisible,
  ] = useState(false);

  const [
    passwordVerificationLoading,
    setPasswordVerificationLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState<string | null>(null);

  const resumeInProgressRef =
    useRef(false);

  const workerPrefillAppliedRef =
    useRef(false);

  /* ============================================================
     FORM STATE
  ============================================================ */

  const {
    loading,

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

    phoneVerified,
    setPhoneVerified,

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
  } = useCustomerFormState();

  const [
    phoneOtp,
    setPhoneOtp,
  ] = useState("");

  /* ============================================================
     USER PROFILE
  ============================================================ */

  const {
    profile: userProfile,
    loading: profileLoading,
  } = useUserProfile();

  /* ============================================================
     FIREBASE AUTH EMAIL
  ============================================================ */

  const firebaseAuthEmail =
    auth.currentUser?.email?.trim() ?? "";

  /*
   * Firebase Authentication is the source
   * of truth for the authenticated worker email.
   *
   * Firestore profile email is only a fallback.
   */
  const resolvedWorkerEmail =
    firebaseAuthEmail ||
    userProfile?.email?.trim() ||
    "";

  /* ============================================================
     REGISTRATION
  ============================================================ */

  const {
    loading: registrationLoading,
    completeRegistration,
  } = useCompleteCustomerRegistration();

  const {
    verifyExistingWorkerPassword,
  } = useCustomerRegistration();

  /* ============================================================
     DRAFT
  ============================================================ */

  const {
    visible: draftVisible,
    draft,
    continueDraft,
    startOver,
  } = useCustomerDraft({
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

    otp: phoneOtp,
    setOtp: setPhoneOtp,

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
  });

  /* ============================================================
     WORKER PREFILL
  ============================================================ */

  useEffect(() => {
    if (!isWorkerRegistration) {
      return;
    }

    if (profileLoading) {
      return;
    }

    if (workerPrefillAppliedRef.current) {
      return;
    }

    /*
     * Worker → Customer always uses the
     * authenticated Firebase email.
     */
    if (resolvedWorkerEmail) {
      setEmail(resolvedWorkerEmail);
    }

    /*
     * "Make a new registration"
     * keeps personal information independent.
     */
    if (!shouldPrefillWorker) {
      workerPrefillAppliedRef.current = true;
      return;
    }

    if (!userProfile) {
      return;
    }

    setFirstName(userProfile.firstName ?? "");
    setSurname(userProfile.surname ?? "");
    setOtherName(userProfile.otherName ?? "");
    setEmail(resolvedWorkerEmail);
    setPhone(userProfile.phone ?? "");
    setPhoto(userProfile.photoUrl ?? null);

    /*
     * This value is only used for UI state.
     * Authoritative verification is performed
     * by Firebase Auth.
     */
    setEmailVerified(
      auth.currentUser?.emailVerified ?? false,
    );

    /*
     * Worker → Customer does not reuse
     * the customer phone verification state.
     */
    setPhoneVerified(false);

    workerPrefillAppliedRef.current = true;
  }, [
    isWorkerRegistration,
    profileLoading,
    shouldPrefillWorker,
    userProfile,
    resolvedWorkerEmail,
    setFirstName,
    setSurname,
    setOtherName,
    setEmail,
    setPhone,
    setPhoto,
    setEmailVerified,
    setPhoneVerified,
  ]);

  /* ============================================================
     DRAFT AVAILABLE
  ============================================================ */

  useEffect(() => {
    if (isWorkerRegistration) {
      return;
    }

    if (
      resumeInProgressRef.current ||
      resumeRequested ||
      !draftVisible ||
      !draft?.email
    ) {
      return;
    }

    onResumeAvailable(draft.email);
  }, [
    draft,
    draftVisible,
    isWorkerRegistration,
    onResumeAvailable,
    resumeRequested,
  ]);

  /* ============================================================
     RESUME
  ============================================================ */

  useEffect(() => {
    if (isWorkerRegistration) {
      return;
    }

    if (!resumeRequested || !draft) {
      return;
    }

    resumeInProgressRef.current = true;

    let mounted = true;

    const resume = async () => {
      const savedStep = Math.max(
        1,
        Math.min(5, draft.step),
      );

      const savedEmailVerified =
        draft.emailVerified;

      await continueDraft();

      if (!mounted) {
        return;
      }

      setOtpScreenVisible(
        savedStep === 2 && !savedEmailVerified,
      );

      onResumeHandled();
    };

    void resume();

    return () => {
      mounted = false;
    };
  }, [
    resumeRequested,
    draft,
    continueDraft,
    onResumeHandled,
    isWorkerRegistration,
  ]);

  /* ============================================================
     RESET
  ============================================================ */

  useEffect(() => {
    if (isWorkerRegistration || !resetRequested) {
      return;
    }

    let mounted = true;

    const reset = async () => {
      await startOver();

      if (!mounted) {
        return;
      }

      resumeInProgressRef.current = false;
      setOtpScreenVisible(false);
      onResetHandled();
    };

    void reset();

    return () => {
      mounted = false;
    };
  }, [
    onResetHandled,
    resetRequested,
    startOver,
    isWorkerRegistration,
  ]);

  /* ============================================================
     EXISTING ACCOUNT
  ============================================================ */

  const handleExistingAccount = useCallback(
    (existingEmail: string) => {
      setOtpScreenVisible(false);
      onExistingAccount(existingEmail);
    },
    [onExistingAccount],
  );

  /* ============================================================
     OTP SENT
  ============================================================ */

  const handleOtpSent = useCallback(() => {
    setEmailOtp("");
    setOtpScreenVisible(true);
    setStep(2);
  }, [
    setEmailOtp,
    setStep,
  ]);

  /* ============================================================
     OTP VERIFIED
  ============================================================ */

  const handleOtpVerified = useCallback(
    (verified: boolean) => {
      setEmailVerified(verified);

      if (verified) {
        setOtpScreenVisible(false);
        setStep(3);
      }
    },
    [
      setEmailVerified,
      setStep,
    ],
  );

  /* ============================================================
     PHOTO
  ============================================================ */

  const handleTakePhoto = useCallback(async () => {
    const uri = await captureCustomerPhoto();

    if (uri) {
      setPhoto(uri);
    }
  }, [setPhoto]);

  const handleChoosePhoto = useCallback(async () => {
    const uri = await pickCustomerPhoto();

    if (uri) {
      setPhoto(uri);
    }
  }, [setPhoto]);

  /* ============================================================
     CONFIRM PASSWORD CHANGE
  ============================================================ */

  const handleConfirmPasswordChange = useCallback(
    (value: string) => {
      setConfirmPassword(value);

      if (passwordError) {
        setPasswordError(null);
      }
    },
    [
      passwordError,
      setConfirmPassword,
    ],
  );

  /* ============================================================
     VERIFY WORKER PASSWORD BEFORE REVIEW
  ============================================================ */

  const verifyWorkerPasswordBeforeReview =
    useCallback(
      async (): Promise<boolean> => {
        const existingPassword =
          confirmPassword.trim();

        if (!existingPassword) {
          setPasswordError(
            "Please enter your existing Fixxam password.",
          );
          return false;
        }

        setPasswordError(null);
        setPasswordVerificationLoading(true);

        try {
          const result =
            await verifyExistingWorkerPassword(
              existingPassword,
            );

          if (!result.success) {
            setPasswordError(
              result.error ??
                "The password you entered is incorrect.",
            );

            return false;
          }

          /*
           * Firebase Auth has successfully
           * reauthenticated and confirmed the
           * worker account.
           */
          setEmailVerified(true);

          const verifiedEmail =
            auth.currentUser?.email?.trim();

          if (verifiedEmail) {
            setEmail(verifiedEmail);
          }

          setPasswordError(null);

          return true;
        } catch (error) {
          console.error(
            "VERIFY_WORKER_PASSWORD_ERROR:",
            error,
          );

          setPasswordError(
            error instanceof Error
              ? error.message
              : "The password verification failed. Please try again.",
          );

          return false;
        } finally {
          setPasswordVerificationLoading(false);
        }
      },
      [
        confirmPassword,
        setEmail,
        setEmailVerified,
        verifyExistingWorkerPassword,
      ],
    );

  /* ============================================================
     NEXT STEP
  ============================================================ */

  const nextStep = useCallback(async () => {
    /* --------------------------------------------------------
       WORKER → CUSTOMER
    -------------------------------------------------------- */

    if (isWorkerRegistration) {
      if (step === 4) {
        const cleanFirstName = firstName.trim();
        const cleanSurname = surname.trim();

        if (!cleanFirstName || !cleanSurname) {
          return;
        }

        const passwordValid =
          await verifyWorkerPasswordBeforeReview();

        if (!passwordValid) {
          return;
        }

        setStep(5);
        return;
      }

      if (step < 4) {
        setStep(4);
      }

      return;
    }

    /* --------------------------------------------------------
       NORMAL CUSTOMER — STEP 1
    -------------------------------------------------------- */

    if (step === 1) {
      return;
    }

    /* --------------------------------------------------------
       NORMAL CUSTOMER — STEP 2
    -------------------------------------------------------- */

    if (step === 2) {
      if (!emailVerified) {
        return;
      }

      const valid = validateCustomerStepTwo({
        email,
        phone,
        emailVerified,
        phoneVerified,
      });

      if (!valid) {
        return;
      }

      setStep(3);
      return;
    }

    /* --------------------------------------------------------
       NORMAL CUSTOMER — STEP 3
    -------------------------------------------------------- */

    if (step === 3) {
      const valid = validateCustomerStepThree({
        password,
        confirmPassword,
      });

      if (!valid) {
        return;
      }

      setStep(4);
      return;
    }

    /* --------------------------------------------------------
       NORMAL CUSTOMER — STEP 4
    -------------------------------------------------------- */

    if (step === 4) {
      const cleanFirstName = firstName.trim();
      const cleanSurname = surname.trim();

      if (!cleanFirstName || !cleanSurname) {
        return;
      }

      setStep(5);
      return;
    }

    if (step < 5) {
      setStep(previous => previous + 1);
    }
  }, [
    confirmPassword,
    email,
    emailVerified,
    firstName,
    isWorkerRegistration,
    password,
    phone,
    phoneVerified,
    setStep,
    step,
    surname,
    verifyWorkerPasswordBeforeReview,
  ]);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = useCallback(() => {
    const finalEmail =
      isWorkerRegistration
        ? email.trim() ||
          auth.currentUser?.email?.trim() ||
          ""
        : email.trim();

    void completeRegistration({
      firstName,
      surname,
      otherName,

      email: finalEmail,
      phone,

      emailVerified,
      phoneVerified,

      password,
      confirmPassword,

      acceptedTerms,

      photo,

      registrationSource,
    });
  }, [
    acceptedTerms,
    completeRegistration,
    confirmPassword,
    email,
    emailVerified,
    firstName,
    isWorkerRegistration,
    otherName,
    password,
    phone,
    phoneVerified,
    photo,
    registrationSource,
    surname,
  ]);

  /* ============================================================
     LOADING
  ============================================================ */

  const isLoading =
    loading ||
    registrationLoading ||
    passwordVerificationLoading;

  const workerProfileLoading =
    shouldPrefillWorker && profileLoading;

  /* ============================================================
     PROFILE ERROR
  ============================================================ */

  if (
    shouldPrefillWorker &&
    !profileLoading &&
    !userProfile
  ) {
    return (
      <View style={styles.errorContainer}>
        <AppText
          variant="bodyMedium"
          weight="bold"
          style={styles.errorTitle}
        >
          Unable to load your worker profile
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          style={styles.errorText}
        >
          Please go back and try again.
        </AppText>
      </View>
    );
  }

  /* ============================================================
     REVIEW EMAIL
  ============================================================ */

  const reviewEmail =
    email.trim() ||
    (isWorkerRegistration
      ? auth.currentUser?.email?.trim() ?? ""
      : "");

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.container}>
      {/* ======================================================
          BACKGROUND — ADDED ONLY
      ====================================================== */}

      <View
        pointerEvents="none"
        style={styles.signupBackground}
      >
        <View style={styles.blueShape} />
        <View style={styles.blueCircle} />
        <View style={styles.lightBlueCircle} />
      </View>

      {/* ======================================================
          EXISTING CONTENT — PRESERVED
      ====================================================== */}

      <View style={styles.content}>
        {/* ====================================================
            STEP 1
        ==================================================== */}

        {step === 1 &&
          !otpScreenVisible &&
          !isWorkerRegistration && (
            <View style={styles.formSection}>
              <CustomerContactInfo
                email={email}
                emailOtp={emailOtp}
                emailVerified={emailVerified}
                setEmail={setEmail}
                setEmailOtp={setEmailOtp}
                setEmailVerified={setEmailVerified}
                onExistingAccount={handleExistingAccount}
                onOtpSent={handleOtpSent}
                registrationSource={registrationSource}
                prefillMode={prefillMode}
              />
            </View>
          )}

        {/* ====================================================
            STEP 2
        ==================================================== */}

        {step === 2 &&
          otpScreenVisible &&
          !isWorkerRegistration && (
            <View style={styles.formSection}>
              <OtpVerification
                type="email"
                value={email}
                otp={emailOtp}
                onOtpChange={setEmailOtp}
                variant="customer"
                verified={emailVerified}
                onVerified={handleOtpVerified}
                mode="verify"
                initialOtpSent
              />
            </View>
          )}

        {/* ====================================================
            STEP 3
        ==================================================== */}

        {step === 3 &&
          !isWorkerRegistration && (
            <View style={styles.formSection}>
              <CustomerSecurity
                password={password}
                confirmPassword={confirmPassword}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                registrationSource={registrationSource}
                prefillMode={prefillMode}
              />
            </View>
          )}

        {/* ====================================================
            STEP 4
        ==================================================== */}

        {step === 4 && (
          <View style={styles.formSection}>
            <CustomerPersonalInfo
              firstName={firstName}
              surname={surname}
              otherName={otherName}
              setFirstName={setFirstName}
              setSurname={setSurname}
              setOtherName={setOtherName}
              photo={photo}
              onCapturePhoto={handleTakePhoto}
              onUploadPhoto={handleChoosePhoto}
              registrationSource={registrationSource}
              prefillMode={prefillMode}
            />

            {isWorkerRegistration && (
              <View style={styles.workerSecuritySection}>
                <CustomerSecurity
                  password={password}
                  confirmPassword={confirmPassword}
                  setPassword={setPassword}
                  setConfirmPassword={
                    handleConfirmPasswordChange
                  }
                  registrationSource={registrationSource}
                  prefillMode={prefillMode}
                />

                {passwordError ? (
                  <AppText
                    variant="caption"
                    style={styles.passwordError}
                  >
                    {passwordError}
                  </AppText>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            STEP 5
        ==================================================== */}

        {step === 5 && (
          <View style={styles.reviewSection}>
            <CustomerReview
              firstName={firstName}
              surname={surname}
              otherName={otherName}
              email={reviewEmail}
              phone={phone}
              photo={photo}
            />

            <View style={styles.termsSection}>
              <CustomerSignupFooter
                acceptedTerms={acceptedTerms}
                setAcceptedTerms={setAcceptedTerms}
                loading={isLoading}
                onSubmit={handleSubmit}
              />
            </View>
          </View>
        )}
      </View>

      {/* ======================================================
          CONTINUE
      ====================================================== */}

      {step >= 3 && step < 5 && (
        <View style={styles.bottomAction}>
          <AppButton
            title={
              isWorkerRegistration &&
              passwordVerificationLoading
                ? "Checking password..."
                : "Continue"
            }
            variant="customer"
            onPress={() => {
              void nextStep();
            }}
            loading={
              isLoading ||
              workerProfileLoading
            }
            disabled={
              isLoading ||
              workerProfileLoading
            }
          />
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignSelf: "stretch",
    position: "relative",
    backgroundColor: "#F4F8FF",
    overflow: "hidden",
  },

  /* Background decoration */
  signupBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    backgroundColor: "#F4F8FF",
  },

  blueShape: {
    position: "absolute",
    top: -115,
    right: -95,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "#B9E0FF",
  },

  blueCircle: {
    position: "absolute",
    top: -155,
    right: -155,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#70BCEB",
  },

  lightBlueCircle: {
    position: "absolute",
    top: 480,
    right: -100,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 22,
    borderColor: "#E3F1FF",
  },

  /* Content: moved slightly down */
  content: {
    width: "100%",
    flexGrow: 1,
    alignSelf: "stretch",
    paddingHorizontal: FixxamTokens.spacing.md,
    paddingTop: 24,
    paddingBottom: FixxamTokens.spacing.lg,
    zIndex: 1,
  },

  formSection: {
    width: "100%",
    alignSelf: "stretch",
  },

  workerSecuritySection: {
    width: "100%",
    marginTop: FixxamTokens.spacing.lg,
    paddingTop: FixxamTokens.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },

  passwordError: {
    marginTop: FixxamTokens.spacing.xs,
    color: "#DC2626",
    lineHeight: 18,
  },

  reviewSection: {
    width: "100%",
    alignSelf: "stretch",
    paddingBottom: FixxamTokens.spacing.md,
  },

  termsSection: {
    width: "100%",
    marginTop: FixxamTokens.spacing.md,
  },

  bottomAction: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: FixxamTokens.spacing.md,
    paddingTop: FixxamTokens.spacing.sm,
    paddingBottom: FixxamTokens.spacing.md,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    zIndex: 2,
  },

  errorContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: FixxamTokens.spacing.lg,
    backgroundColor: "#F4F8FF",
  },

  errorTitle: {
    textAlign: "center",
  },

  errorText: {
    marginTop: FixxamTokens.spacing.xs,
    textAlign: "center",
  },
});