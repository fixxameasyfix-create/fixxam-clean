import {
  useState,
  useEffect,
} from "react";

import {
  saveWorkerDraft,
  loadWorkerDraft,
  clearWorkerDraft,
} from "@/utils/workerSignupDraft";

type Props = {
  step: number;
  setStep: (value: number) => void;

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

  category: string;
  setCategory: (value: string) => void;

  subcategory: string;
  setSubcategory: (value: string) => void;

  selectedServices: string[];
  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  experience: string;
  setExperience: (value: string) => void;

  state: string;
  setState: (value: string) => void;

  lga: string;
  setLga: (value: string) => void;

  photo: string | null;
  setPhoto: (value: string | null) => void;

  about: string;
  setAbout: (value: string) => void;

  workGallery: string[];
  setWorkGallery: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
};

export function useWorkerDraft(
  props: Props,
) {
  const [visible, setVisible] =
    useState(false);

  const [draft, setDraft] =
    useState<any>(null);

  /* ============================================================
     LOAD DRAFT
  ============================================================ */

  useEffect(() => {
    loadWorkerDraft().then(
      (savedDraft) => {
        if (!savedDraft) {
          return;
        }

        const hasData =
          savedDraft.firstName ||
          savedDraft.surname ||
          savedDraft.otherName ||
          savedDraft.email ||
          savedDraft.phone ||
          savedDraft.category ||
          savedDraft.subcategory ||
          savedDraft.selectedServices?.length >
            0 ||
          savedDraft.experience ||
          savedDraft.state ||
          savedDraft.lga ||
          savedDraft.photo ||
          savedDraft.about ||
          savedDraft.workGallery?.length >
            0;

        if (!hasData) {
          return;
        }

        setDraft(savedDraft);
        setVisible(true);
      },
    );
  }, []);

  /* ============================================================
     SAVE DRAFT
  ============================================================ */

  useEffect(() => {
    saveWorkerDraft({
      step: props.step,

      firstName: props.firstName,
      surname: props.surname,
      otherName: props.otherName,

      email: props.email,
      emailOtp: props.emailOtp,
      emailVerified:
        props.emailVerified,

      phone: props.phone,
      otp: props.otp,
      phoneVerified:
        props.phoneVerified,

      category: props.category,
      subcategory:
        props.subcategory,

      selectedServices:
        props.selectedServices,

      experience:
        props.experience,

      state: props.state,
      lga: props.lga,

      photo: props.photo,

      about: props.about,

      workGallery:
        props.workGallery,

      acceptedTerms:
        props.acceptedTerms,
    });
  }, [
    props.step,

    props.firstName,
    props.surname,
    props.otherName,

    props.email,
    props.emailOtp,
    props.emailVerified,

    props.phone,
    props.otp,
    props.phoneVerified,

    props.category,
    props.subcategory,
    props.selectedServices,

    props.experience,

    props.state,
    props.lga,

    props.photo,

    props.about,

    props.workGallery,

    props.acceptedTerms,
  ]);

  /* ============================================================
     CONTINUE DRAFT
  ============================================================ */

  const continueDraft = () => {
    if (!draft) {
      return;
    }

    props.setStep(draft.step);

    props.setFirstName(
      draft.firstName ?? "",
    );

    props.setSurname(
      draft.surname ?? "",
    );

    props.setOtherName(
      draft.otherName ?? "",
    );

    props.setEmail(
      draft.email ?? "",
    );

    props.setEmailOtp(
      draft.emailOtp ?? "",
    );

    props.setEmailVerified(
      draft.emailVerified ?? false,
    );

    props.setPhone(
      draft.phone ?? "",
    );

    props.setOtp(
      draft.otp ?? "",
    );

    props.setPhoneVerified(
      draft.phoneVerified ?? false,
    );

    props.setCategory(
      draft.category ?? "",
    );

    props.setSubcategory(
      draft.subcategory ?? "",
    );

    props.setSelectedServices(
      draft.selectedServices ?? [],
    );

    props.setExperience(
      draft.experience ?? "",
    );

    props.setState(
      draft.state ?? "",
    );

    props.setLga(
      draft.lga ?? "",
    );

    props.setPhoto(
      draft.photo ?? null,
    );

    props.setAbout(
      draft.about ?? "",
    );

    props.setWorkGallery(
      draft.workGallery ?? [],
    );

    props.setAcceptedTerms(
      draft.acceptedTerms ?? false,
    );

    setVisible(false);
  };

  /* ============================================================
     START OVER
  ============================================================ */

  const startOver = async () => {
    await clearWorkerDraft();

    setVisible(false);
    setDraft(null);
  };

  /* ============================================================
     CLOSE
  ============================================================ */

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