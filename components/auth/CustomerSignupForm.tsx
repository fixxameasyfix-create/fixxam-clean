import React, { useEffect } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Spacing } from "@/theme";

import useCustomerProfilePrefill from "@/hooks/customer/useCustomerProfilePrefill";

import {
  validateCustomerStepOne,
  validateCustomerStepTwo,
  validateCustomerStepThree,
} from "@/hooks/useCustomerValidation";

import CustomerPersonalInfo from "@/components/customer/CustomerPersonalInfo";
import CustomerContactInfo from "@/components/customer/CustomerContactInfo";
import CustomerSecurity from "@/components/customer/CustomerSecurity";
import CustomerSignupFooter from "@/components/customer/CustomerSignupFooter";
import CustomerReview from "@/components/customer/CustomerReview";
import CustomerPhoto from "@/components/customer/CustomerPhoto";

import useCompleteCustomerRegistration from "@/hooks/customer/useCompleteCustomerRegistration";

import { AppButton } from "@/components/ui";

import { useCustomerFormState } from "@/hooks/useCustomerFormState";

import { useCustomerDraft } from "@/hooks/useCustomerDraft";

import FixxamResponseModal from "@/components/modal/FixxamResponseModal";

import {
  captureCustomerPhoto,
  pickCustomerPhoto,
} from "@/hooks/useCustomerPhoto";

interface Props {
  step: number;
  setStep: React.Dispatch<
    React.SetStateAction<number>
  >;
}

export default function CustomerSignupForm({
  step,
  setStep,
}: Props) {
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
  } = useCustomerFormState();

  /* ============================================================
     EXISTING PROFILE
  ============================================================ */

  const { isLoggedIn } =
    useCustomerProfilePrefill({
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

  const draft = useCustomerDraft({
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

  acceptedTerms,
  setAcceptedTerms,
});

  /* ============================================================
     REGISTRATION
  ============================================================ */

  const {
    loading: registrationLoading,
    completeRegistration,
  } =
    useCompleteCustomerRegistration();

  /* ============================================================
     LOGGED-IN CUSTOMER
  ============================================================ */

  useEffect(() => {
    if (isLoggedIn && step < 3) {
      setStep(3);
    }
  }, [
    isLoggedIn,
    step,
    setStep,
  ]);

  /* ============================================================
     PHOTO
  ============================================================ */

  const handleTakePhoto = async () => {
    const uri =
      await captureCustomerPhoto();

    if (uri) {
      setPhoto(uri);
    }
  };

  const handleChoosePhoto = async () => {
    const uri =
      await pickCustomerPhoto();

    if (uri) {
      setPhoto(uri);
    }
  };

  const handleSkipPhoto = () => {
    setStep(
      (previous) => previous + 1,
    );
  };

  /* ============================================================
     NEXT STEP
  ============================================================ */

  const nextStep = () => {
    /* ----------------------------------------------------------
       STEP 1 — PERSONAL INFORMATION
    ---------------------------------------------------------- */

    if (!isLoggedIn && step === 1) {
      const valid =
        validateCustomerStepOne({
          firstName,
          surname,
        });

      if (!valid) {
        return;
      }
    }

    /* ----------------------------------------------------------
       STEP 2 — CONTACT INFORMATION
    ---------------------------------------------------------- */

    if (!isLoggedIn && step === 2) {
      const valid =
        validateCustomerStepTwo({
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
       STEP 3 — SECURITY
    ---------------------------------------------------------- */

    if (step === 3) {
      const valid =
        validateCustomerStepThree({
          password,
          confirmPassword,
        });

      if (!valid) {
        return;
      }
    }

    /* ----------------------------------------------------------
       STEP 4 — PHOTO
       
       Photo is optional.
       Customer can continue even without photo.
    ---------------------------------------------------------- */

    setStep(
      (previous) => previous + 1,
    );
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = () => {
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

      acceptedTerms,

      photo,

      isLoggedIn,
    });
  };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* ==================================================
              STEP 1 — PERSONAL INFORMATION
          ================================================== */}

          {!isLoggedIn &&
            step === 1 && (
              <View
                style={
                  styles.formSection
                }
              >
                <CustomerPersonalInfo
                  firstName={
                    firstName
                  }
                  surname={
                    surname
                  }
                  otherName={
                    otherName
                  }
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
              </View>
            )}

          {/* ==================================================
              STEP 2 — CONTACT INFORMATION
          ================================================== */}

          {!isLoggedIn &&
            step === 2 && (
              <View
                style={
                  styles.formSection
                }
              >
                <CustomerContactInfo
                  email={email}
                  emailOtp={
                    emailOtp
                  }
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
              </View>
            )}

          {/* ==================================================
              STEP 3 — SECURITY
          ================================================== */}

          {step === 3 && (
            <View
              style={
                styles.formSection
              }
            >
              <CustomerSecurity
                password={
                  password
                }
                confirmPassword={
                  confirmPassword
                }
                setPassword={
                  setPassword
                }
                setConfirmPassword={
                  setConfirmPassword
                }
              />
            </View>
          )}

          {/* ==================================================
              STEP 4 — PROFILE PHOTO
          ================================================== */}

          {step === 4 && (
            <View
              style={
                styles.formSection
              }
            >
              <CustomerPhoto
                photo={photo}
                onTakePhoto={
                  handleTakePhoto
                }
                onChoosePhoto={
                  handleChoosePhoto
                }
                onSkip={
                  handleSkipPhoto
                }
              />
            </View>
          )}

          {/* ==================================================
              STEP 5 — REVIEW
          ================================================== */}

          {step === 5 && (
            <View
              style={
                styles.reviewSection
              }
            >
              <CustomerReview
                firstName={
                  firstName
                }
                surname={
                  surname
                }
                otherName={
                  otherName
                }
                email={email}
                phone={phone}
                photo={photo}
              />

              <View
                style={
                  styles.termsSection
                }
              >
                <CustomerSignupFooter
                  acceptedTerms={
                    acceptedTerms
                  }
                  setAcceptedTerms={
                    setAcceptedTerms
                  }
                  loading={
                    loading ||
                    registrationLoading
                  }
                  onSubmit={
                    handleSubmit
                  }
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ======================================================
            CONTINUE BUTTON
        ====================================================== */}

        {step < 5 && (
          <View
            style={
              styles.bottomAction
            }
          >
            <AppButton
              title="Continue"
              variant="customer"
              onPress={nextStep}
            />
          </View>
        )}

        {/* ======================================================
            DRAFT MODAL
        ====================================================== */}

        <FixxamResponseModal
          visible={
            draft.visible
          }
          variant="customer"
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
    </KeyboardAvoidingView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 14,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 4,
    paddingBottom: 12,
  },

  formSection: {
    width: "100%",
    paddingBottom: 4,
  },

  reviewSection: {
    width: "100%",
    paddingBottom: 6,
  },

  termsSection: {
    marginTop: 10,
  },

  bottomAction: {
    paddingTop: 8,
    paddingBottom: Spacing.sm,
    backgroundColor: "#FFFFFF",
  },
});