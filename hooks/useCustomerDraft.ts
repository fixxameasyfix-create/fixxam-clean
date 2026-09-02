import { useState, useEffect } from "react";

import {
  saveCustomerDraft,
  loadCustomerDraft,
  clearCustomerDraft,
} from "@/utils/customerSignupDraft";

type Props = {
  step: number;
  setStep: React.Dispatch<
    React.SetStateAction<number>
  >;

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
  setEmailVerified: (
    value: boolean
  ) => void;

  phone: string;
  setPhone: (value: string) => void;

  otp: string;
  setOtp: (value: string) => void;

  phoneVerified: boolean;
  setPhoneVerified: (
    value: boolean
  ) => void;

  acceptedTerms: boolean;
  setAcceptedTerms: (
    value: boolean
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

  acceptedTerms,
  setAcceptedTerms,

}: Props) {

  const [visible, setVisible] =
    useState(false);

  const [draft, setDraft] =
    useState<any>(null);

  useEffect(() => {

    loadCustomerDraft().then(
      (draft) => {

        if (!draft) return;

        const hasData =
          draft.firstName ||
          draft.surname ||
          draft.otherName ||
          draft.email ||
          draft.phone;

        if (!hasData) return;

        setDraft(draft);
        setVisible(true);

      }
    );

  }, []);
  useEffect(() => {

  saveCustomerDraft({

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
const continueDraft = () => {

  if (!draft) return;

  setStep(draft.step);

  setFirstName(draft.firstName);
  setSurname(draft.surname);
  setOtherName(draft.otherName);

  setEmail(draft.email);
  setEmailOtp(draft.emailOtp);
  setEmailVerified(draft.emailVerified);

  setPhone(draft.phone);
  setOtp(draft.otp);
  setPhoneVerified(draft.phoneVerified);

  setAcceptedTerms(
    draft.acceptedTerms
  );

  setVisible(false);

};

const startOver = async () => {

  await clearCustomerDraft();

  setVisible(false);

};

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