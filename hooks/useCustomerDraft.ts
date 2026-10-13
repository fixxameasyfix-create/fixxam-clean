import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  saveCustomerDraft,
  loadCustomerDraft,
  clearCustomerDraft,
  type CustomerSignupDraft,
} from "@/utils/customerSignupDraft";

type Props = {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;

  firstName: string;
  setFirstName: (value: string) => void;

  surname: string;
  setSurname: (value: string) => void;

  otherName: string;
  setOtherName: (value: string) => void;

  email: string;
  setEmail: (value: string) => void;

  emailOtp: string;
  setEmailOtp: (value: string) => void;

  emailVerified: boolean;
  setEmailVerified: (value: boolean) => void;

  phone: string;
  setPhone: (value: string) => void;

  otp: string;
  setOtp: (value: string) => void;

  phoneVerified: boolean;
  setPhoneVerified: (value: boolean) => void;

  password?: string;
  setPassword?: (value: string) => void;

  confirmPassword?: string;
  setConfirmPassword?: (
    value: string,
  ) => void;

  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;

  photo?: string | null;
  setPhoto?: (
    value: string | null,
  ) => void;
};

export function useCustomerDraft({
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

  password = "",
  setPassword,

  confirmPassword = "",
  setConfirmPassword,

  acceptedTerms,
  setAcceptedTerms,

  photo = null,
  setPhoto,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const [draft, setDraft] =
    useState<CustomerSignupDraft | null>(
      null,
    );

  /* ============================================================
     LOAD EXISTING DRAFT
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadDraft = async () => {
      try {
        const savedDraft =
          await loadCustomerDraft();

        if (
          !mounted ||
          !savedDraft
        ) {
          return;
        }

        const hasData =
          Boolean(savedDraft.email) ||
          Boolean(savedDraft.firstName) ||
          Boolean(savedDraft.surname) ||
          Boolean(savedDraft.photo);

        if (!hasData) {
          return;
        }

        setDraft(savedDraft);
        setVisible(true);
      } catch (error) {
        console.error(
          "FIXXAM_CUSTOMER_DRAFT_LOAD_ERROR:",
          error,
        );
      }
    };

    void loadDraft();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     SAVE DRAFT
  ============================================================ */

  useEffect(() => {
    /*
     * Do not create an empty draft.
     */
    const hasRegistrationData =
      Boolean(email.trim()) ||
      Boolean(firstName.trim()) ||
      Boolean(surname.trim()) ||
      Boolean(password) ||
      Boolean(photo);

    if (!hasRegistrationData) {
      return;
    }

    const timeout =
      setTimeout(() => {
        const saveDraft = async () => {
          try {
            const draftData: CustomerSignupDraft = {
              version: 2,

              step,

              firstName,
              surname,
              otherName,

              email,
              emailOtp,
              emailVerified,

              phone,
              otp,
              phoneVerified,

              password,
              confirmPassword,

              acceptedTerms,

              photo,

              updatedAt: Date.now(),
            };

            await saveCustomerDraft(
              draftData,
            );
          } catch (error) {
            console.error(
              "FIXXAM_CUSTOMER_DRAFT_SAVE_ERROR:",
              error,
            );
          }
        };

        void saveDraft();
      }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    acceptedTerms,
    confirmPassword,
    email,
    emailOtp,
    emailVerified,
    firstName,
    otherName,
    password,
    phone,
    otp,
    phoneVerified,
    photo,
    step,
    surname,
  ]);

  /* ============================================================
     CONTINUE DRAFT
  ============================================================ */

  const continueDraft =
    useCallback(async () => {
      if (!draft) {
        return;
      }

      const savedStep = Math.max(
        1,
        Math.min(5, draft.step),
      );

      /*
       * Restore current step.
       */
      setStep(savedStep);

      /*
       * Restore personal information.
       */
      setFirstName(
        draft.firstName,
      );

      setSurname(
        draft.surname,
      );

      setOtherName(
        draft.otherName,
      );

      /*
       * Restore email state.
       */
      setEmail(
        draft.email,
      );

      setEmailOtp(
        draft.emailOtp,
      );

      setEmailVerified(
        draft.emailVerified,
      );

      /*
       * Restore phone state.
       */
      setPhone(
        draft.phone,
      );

      setOtp(
        draft.otp,
      );

      setPhoneVerified(
        draft.phoneVerified,
      );

      /*
       * Restore password.
       */
      setPassword?.(
        draft.password,
      );

      setConfirmPassword?.(
        draft.confirmPassword,
      );

      /*
       * Restore terms.
       */
      setAcceptedTerms(
        draft.acceptedTerms,
      );

      /*
       * Restore profile photo.
       */
      setPhoto?.(
        draft.photo,
      );

      /*
       * Close resume prompt after
       * the draft has been restored.
       */
      setVisible(false);
    }, [
      draft,
      setAcceptedTerms,
      setConfirmPassword,
      setEmail,
      setEmailOtp,
      setEmailVerified,
      setFirstName,
      setOtherName,
      setPassword,
      setPhone,
      setPhoneVerified,
      setPhoto,
      setStep,
      setSurname,
      setOtp,
    ]);

  /* ============================================================
     START OVER
  ============================================================ */

  const startOver =
    useCallback(async () => {
      try {
        await clearCustomerDraft();

        setDraft(null);
        setVisible(false);

        /*
         * Reset all local form state.
         */
        setStep(1);

        setFirstName("");
        setSurname("");
        setOtherName("");

        setEmail("");
        setEmailOtp("");
        setEmailVerified(false);

        setPhone("");
        setOtp("");
        setPhoneVerified(false);

        setPassword?.("");
        setConfirmPassword?.("");

        setAcceptedTerms(false);

        setPhoto?.(null);
      } catch (error) {
        console.error(
          "FIXXAM_CUSTOMER_DRAFT_CLEAR_ERROR:",
          error,
        );
      }
    }, [
      setAcceptedTerms,
      setConfirmPassword,
      setEmail,
      setEmailOtp,
      setEmailVerified,
      setFirstName,
      setOtherName,
      setPassword,
      setPhone,
      setPhoneVerified,
      setPhoto,
      setStep,
      setSurname,
      setOtp,
    ]);

  /* ============================================================
     CLOSE
  ============================================================ */

  const close =
    useCallback(() => {
      setVisible(false);
    }, []);

  return {
    visible,
    draft,
    continueDraft,
    startOver,
    close,
  };
}

export default useCustomerDraft;