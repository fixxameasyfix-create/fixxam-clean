import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  saveCustomerDraft,
  loadCustomerDraft,
  clearCustomerDraft,
} from "@/utils/customerSignupDraft";

type CustomerDraft = {
  step?: number;

  firstName?: string;
  surname?: string;
  otherName?: string;

  email?: string;
  emailOtp?: string;
  emailVerified?: boolean;

  phone?: string;
  otp?: string;
  phoneVerified?: boolean;

  acceptedTerms?: boolean;
};

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

  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
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

  acceptedTerms,
  setAcceptedTerms,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const [draft, setDraft] =
    useState<CustomerDraft | null>(null);

  /*
   * LOAD EXISTING DRAFT
   */
  useEffect(() => {
    let mounted = true;

    const loadDraft = async () => {
      try {
        const savedDraft =
          await loadCustomerDraft();

        if (!mounted || !savedDraft) {
          return;
        }

        const hasData =
          Boolean(savedDraft.firstName) ||
          Boolean(savedDraft.surname) ||
          Boolean(savedDraft.otherName) ||
          Boolean(savedDraft.email) ||
          Boolean(savedDraft.phone);

        if (!hasData) {
          return;
        }

        setDraft(
          savedDraft as CustomerDraft,
        );

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

  /*
   * SAVE DRAFT
   */
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await saveCustomerDraft({
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

          acceptedTerms,
        });
      } catch (error) {
        console.error(
          "FIXXAM_CUSTOMER_DRAFT_SAVE_ERROR:",
          error,
        );
      }
    };

    void saveDraft();
  }, [
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

    acceptedTerms,
  ]);

  /*
   * CONTINUE DRAFT
   */
  const continueDraft = () => {
    if (!draft) {
      return;
    }

    setStep(
      typeof draft.step === "number"
        ? draft.step
        : 1,
    );

    setFirstName(
      draft.firstName ?? "",
    );

    setSurname(
      draft.surname ?? "",
    );

    setOtherName(
      draft.otherName ?? "",
    );

    setEmail(
      draft.email ?? "",
    );

    setEmailOtp(
      draft.emailOtp ?? "",
    );

    setEmailVerified(
      draft.emailVerified === true,
    );

    setPhone(
      draft.phone ?? "",
    );

    setOtp(
      draft.otp ?? "",
    );

    setPhoneVerified(
      draft.phoneVerified === true,
    );

    setAcceptedTerms(
      draft.acceptedTerms === true,
    );

    setVisible(false);
  };

  /*
   * START OVER
   */
  const startOver = async () => {
    try {
      await clearCustomerDraft();

      setDraft(null);
      setVisible(false);
    } catch (error) {
      console.error(
        "FIXXAM_CUSTOMER_DRAFT_CLEAR_ERROR:",
        error,
      );
    }
  };

  /*
   * CLOSE
   */
  const close = () => {
    setVisible(false);
  };

  return {
    visible,
    draft,
    continueDraft,
    startOver,
    close,
  };
}