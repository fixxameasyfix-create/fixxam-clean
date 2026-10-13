import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  saveWorkerDraft,
  loadWorkerDraft,
  clearWorkerDraft,
} from "@/utils/workerSignupDraft";

const EMAIL_STEP = 1;
const OTP_STEP = 2;
const PASSWORD_STEP = 3;
const PERSONAL_STEP = 4;
const PROFILE_STEP = 5;
const SERVICE_INFO_STEP = 6;
const ABOUT_STEP = 7;
const REVIEW_STEP = 8;

const MIN_STEP = EMAIL_STEP;
const MAX_STEP = REVIEW_STEP;

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

  password: string;
  setPassword: (value: string) => void;

  confirmPassword: string;
  setConfirmPassword: (value: string) => void;

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

  serviceAddress: string;
  setServiceAddress: (value: string) => void;

  latitude: number | null;
  setLatitude: (value: number | null) => void;

  longitude: number | null;
  setLongitude: (value: number | null) => void;

  hourlyRate: string;
  setHourlyRate: (value: string) => void;

  phoneNumber: string;
  setPhoneNumber: (value: string) => void;

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

export function useWorkerDraft(props: Props) {
  const [visible, setVisible] = useState(false);

  const [draft, setDraft] =
    useState<
      Awaited<
        ReturnType<typeof loadWorkerDraft>
      >
    >(null);

  const [hydrated, setHydrated] = useState(false);

  const skipNextSaveRef = useRef(false);

  /*
   * LOAD DRAFT
   */
  useEffect(() => {
    let mounted = true;

    const hydrateDraft = async () => {
      try {
        const savedDraft =
          await loadWorkerDraft();

        if (!mounted) {
          return;
        }

        if (savedDraft) {
          const hasData = Boolean(
            savedDraft.email ||
            savedDraft.firstName ||
            savedDraft.surname ||
            savedDraft.otherName ||
            savedDraft.emailVerified ||
            savedDraft.password ||
            savedDraft.confirmPassword ||
            savedDraft.category ||
            savedDraft.subcategory ||
            savedDraft.selectedServices?.length ||
            savedDraft.experience ||
            savedDraft.state ||
            savedDraft.lga ||
            savedDraft.serviceAddress ||
            savedDraft.latitude !== null &&
              savedDraft.latitude !== undefined ||
            savedDraft.longitude !== null &&
              savedDraft.longitude !== undefined ||
            savedDraft.hourlyRate ||
            savedDraft.phoneNumber ||
            savedDraft.photo ||
            savedDraft.about ||
            savedDraft.workGallery?.length ||
            savedDraft.acceptedTerms ||
            savedDraft.step > EMAIL_STEP,
          );

          if (hasData) {
            setDraft(savedDraft);
            setVisible(true);
          }
        }
      } catch (error) {
        console.error(
          "LOAD WORKER DRAFT ERROR:",
          error,
        );
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    void hydrateDraft();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * SAVE DRAFT
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const hasData = Boolean(
      props.email.trim() ||
      props.firstName.trim() ||
      props.surname.trim() ||
      props.otherName.trim() ||
      props.emailVerified ||
      props.password ||
      props.confirmPassword ||
      props.category ||
      props.subcategory ||
      props.selectedServices.length ||
      props.experience ||
      props.state ||
      props.lga ||
      props.serviceAddress.trim() ||
      props.latitude !== null ||
      props.longitude !== null ||
      props.hourlyRate ||
      props.phoneNumber.trim() ||
      props.photo ||
      props.about.trim() ||
      props.workGallery.length ||
      props.acceptedTerms ||
      props.step > EMAIL_STEP
    );

    if (!hasData) {
      return;
    }

    const saveDraft = async () => {
      try {
        await saveWorkerDraft({
          step: Math.max(
            MIN_STEP,
            Math.min(
              MAX_STEP,
              props.step,
            ),
          ),

          firstName:
            props.firstName.trim(),

          surname:
            props.surname.trim(),

          otherName:
            props.otherName.trim(),

          email:
            props.email
              .trim()
              .toLowerCase(),

          emailOtp:
            props.emailOtp,

          emailVerified:
            props.emailVerified,

          password:
            props.password,

          confirmPassword:
            props.confirmPassword,

          category:
            props.category,

          subcategory:
            props.subcategory,

          selectedServices:
            props.selectedServices,

          experience:
            props.experience,

          state:
            props.state,

          lga:
            props.lga,

          serviceAddress:
            props.serviceAddress.trim(),

          latitude:
            props.latitude,

          longitude:
            props.longitude,

          hourlyRate:
            props.hourlyRate,

          phoneNumber:
            props.phoneNumber.trim(),

          photo:
            props.photo,

          about:
            props.about.trim(),

          workGallery:
            props.workGallery,

          acceptedTerms:
            props.acceptedTerms,
        });
      } catch (error) {
        console.error(
          "SAVE WORKER DRAFT ERROR:",
          error,
        );
      }
    };

    void saveDraft();
  }, [
    hydrated,

    props.step,

    props.firstName,
    props.surname,
    props.otherName,

    props.email,
    props.emailOtp,
    props.emailVerified,

    props.password,
    props.confirmPassword,

    props.category,
    props.subcategory,
    props.selectedServices,

    props.experience,

    props.state,
    props.lga,

    props.serviceAddress,
    props.latitude,
    props.longitude,
    props.hourlyRate,
    props.phoneNumber,

    props.photo,

    props.about,
    props.workGallery,

    props.acceptedTerms,
  ]);

  /*
   * CONTINUE DRAFT
   */
  const continueDraft = useCallback(() => {
    if (!draft) {
      return;
    }

    const restoredStep = Math.max(
      MIN_STEP,
      Math.min(
        MAX_STEP,
        Number(draft.step) ||
          EMAIL_STEP,
      ),
    );

    /*
     * PERSONAL INFORMATION
     */
    props.setFirstName(
      draft.firstName ?? "",
    );

    props.setSurname(
      draft.surname ?? "",
    );

    props.setOtherName(
      draft.otherName ?? "",
    );

    /*
     * EMAIL
     */
    props.setEmail(
      draft.email ?? "",
    );

    props.setEmailOtp(
      draft.emailOtp ?? "",
    );

    props.setEmailVerified(
      Boolean(
        draft.emailVerified,
      ),
    );

    /*
     * PASSWORD
     */
    props.setPassword(
      draft.password ?? "",
    );

    props.setConfirmPassword(
      draft.confirmPassword ?? "",
    );

    /*
     * PROFESSIONAL PROFILE
     */
    props.setCategory(
      draft.category ?? "",
    );

    props.setSubcategory(
      draft.subcategory ?? "",
    );

    props.setSelectedServices(
      Array.isArray(
        draft.selectedServices,
      )
        ? draft.selectedServices
        : [],
    );

    props.setExperience(
      draft.experience ?? "",
    );

    /*
     * STATE / LGA
     *
     * These remain on the professional
     * profile step.
     */
    props.setState(
      draft.state ?? "",
    );

    props.setLga(
      draft.lga ?? "",
    );

    /*
     * SERVICE INFORMATION
     */
    props.setServiceAddress(
      draft.serviceAddress ?? "",
    );

    props.setLatitude(
      typeof draft.latitude === "number"
        ? draft.latitude
        : null,
    );

    props.setLongitude(
      typeof draft.longitude === "number"
        ? draft.longitude
        : null,
    );

    props.setHourlyRate(
      draft.hourlyRate ?? "",
    );

    props.setPhoneNumber(
      draft.phoneNumber ?? "",
    );

    /*
     * PROFILE PHOTO
     */
    props.setPhoto(
      draft.photo ?? null,
    );

    /*
     * ABOUT
     */
    props.setAbout(
      draft.about ?? "",
    );

    /*
     * WORK GALLERY
     */
    props.setWorkGallery(
      Array.isArray(
        draft.workGallery,
      )
        ? draft.workGallery
        : [],
    );

    /*
     * TERMS
     */
    props.setAcceptedTerms(
      Boolean(
        draft.acceptedTerms,
      ),
    );

    /*
     * RESTORE EXACT STEP
     */
    props.setStep(
      restoredStep,
    );

    setVisible(false);
  }, [
    draft,

    props.setFirstName,
    props.setSurname,
    props.setOtherName,

    props.setEmail,
    props.setEmailOtp,
    props.setEmailVerified,

    props.setPassword,
    props.setConfirmPassword,

    props.setCategory,
    props.setSubcategory,
    props.setSelectedServices,

    props.setExperience,

    props.setState,
    props.setLga,

    props.setServiceAddress,
    props.setLatitude,
    props.setLongitude,
    props.setHourlyRate,
    props.setPhoneNumber,

    props.setPhoto,

    props.setAbout,
    props.setWorkGallery,

    props.setAcceptedTerms,

    props.setStep,
  ]);

  /*
   * START OVER
   */
  const startOver = useCallback(async () => {
    try {
      await clearWorkerDraft();
    } catch (error) {
      console.error(
        "CLEAR WORKER DRAFT ERROR:",
        error,
      );
    }

    skipNextSaveRef.current = true;

    props.setStep(EMAIL_STEP);

    /*
     * PERSONAL
     */
    props.setFirstName("");
    props.setSurname("");
    props.setOtherName("");

    /*
     * EMAIL / OTP
     */
    props.setEmail("");
    props.setEmailOtp("");
    props.setEmailVerified(false);

    /*
     * PASSWORD
     */
    props.setPassword("");
    props.setConfirmPassword("");

    /*
     * PROFESSIONAL PROFILE
     */
    props.setCategory("");
    props.setSubcategory("");
    props.setSelectedServices([]);

    props.setExperience("");

    props.setState("");
    props.setLga("");

    /*
     * SERVICE INFORMATION
     */
    props.setServiceAddress("");
    props.setLatitude(null);
    props.setLongitude(null);
    props.setHourlyRate("");
    props.setPhoneNumber("");

    /*
     * MEDIA / ABOUT
     */
    props.setPhoto(null);
    props.setAbout("");
    props.setWorkGallery([]);

    /*
     * TERMS
     */
    props.setAcceptedTerms(false);

    /*
     * DRAFT MODAL
     */
    setDraft(null);
    setVisible(false);
  }, [
    props.setStep,

    props.setFirstName,
    props.setSurname,
    props.setOtherName,

    props.setEmail,
    props.setEmailOtp,
    props.setEmailVerified,

    props.setPassword,
    props.setConfirmPassword,

    props.setCategory,
    props.setSubcategory,
    props.setSelectedServices,

    props.setExperience,

    props.setState,
    props.setLga,

    props.setServiceAddress,
    props.setLatitude,
    props.setLongitude,
    props.setHourlyRate,
    props.setPhoneNumber,

    props.setPhoto,

    props.setAbout,
    props.setWorkGallery,

    props.setAcceptedTerms,
  ]);

  /*
   * CLOSE
   */
  const close = useCallback(() => {
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