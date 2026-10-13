import {
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  clearWorkerDraft,
} from "@/utils/workerSignupDraft";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  validateCompleteRegistration,
} from "@/hooks/useWorkerValidation";

import {
  registerWorker,
} from "@/hooks/useWorkerRegistration";

/* ============================================================
   TYPES
============================================================ */

type WorkerRegistrationSource =
  | "customer"
  | "new";

type Props = {
  registrationSource: WorkerRegistrationSource;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  emailVerified: boolean;

  password: string;
  confirmPassword: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  serviceAddress: string;

  latitude: number | null;
  longitude: number | null;

  hourlyRate: string;

  phoneNumber: string;

  photo: string | null;

  about: string;

  workGallery: string[];

  acceptedTerms: boolean;
};

/* ============================================================
   HOOK
============================================================ */

export default function useCompleteWorkerRegistration() {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const completeRegistration =
    async (
      data: Props,
    ) => {
      if (loading) {
        return;
      }

      /*
       * Customer registration has already
       * confirmed the existing Firebase
       * account password through re-authentication.
       *
       * Therefore:
       * - do NOT validate password length
       * - do NOT validate confirmPassword
       * - do NOT create/change the password
       *
       * New registration still uses the
       * normal complete-registration validation.
       */
      if (
        data.registrationSource ===
        "new"
      ) {
        if (
          !validateCompleteRegistration(
            data,
          )
        ) {
          return;
        }
      } else {
        /*
         * Customer → Worker
         *
         * Validate the registration data
         * without treating the password as
         * a new account password.
         */
        const {
          password: _password,
          confirmPassword:
            _confirmPassword,
          ...customerValidationData
        } = data;

        if (
          !validateCompleteRegistration(
            {
              ...customerValidationData,

              /*
               * Password is intentionally
               * omitted from customer validation.
               */
              password: "",
              confirmPassword: "",
            },
          )
        ) {
          return;
        }
      }

      try {
        setLoading(true);

        await registerWorker({
          registrationSource:
            data.registrationSource,

          firstName:
            data.firstName,

          surname:
            data.surname,

          otherName:
            data.otherName,

          email:
            data.email,

          emailVerified:
            data.emailVerified,

          /*
           * IMPORTANT:
           *
           * For customer registration,
           * this remains empty.
           *
           * registerWorker must NOT attempt
           * to create a new Firebase account
           * when registrationSource === "customer".
           */
          password:
            data.registrationSource ===
            "new"
              ? data.password
              : "",

          category:
            data.category,

          subcategory:
            data.subcategory,

          selectedServices:
            data.selectedServices,

          experience:
            data.experience,

          state:
            data.state,

          lga:
            data.lga,

          serviceAddress:
            data.serviceAddress,

          latitude:
            data.latitude,

          longitude:
            data.longitude,

          hourlyRate:
            data.hourlyRate,

          phoneNumber:
            data.phoneNumber,

          photo:
            data.photo,

          about:
            data.about,

          workGallery:
            data.workGallery,
        });

        /*
         * Registration succeeded.
         * Remove the unfinished worker draft.
         */
        await clearWorkerDraft();

        showSuccess(
          "Success",
          data.registrationSource ===
            "customer"
            ? "Your provider profile has been created successfully."
            : "Worker account created successfully.",
        );

        router.replace(
          "/(auth)/worker-setup-complete" as never,
        );
      } catch (
        error: any
      ) {
        console.error(
          "COMPLETE_WORKER_REGISTRATION_ERROR:",
          error,
        );

        /*
         * This should normally only happen
         * for new account creation.
         */
        if (
          error?.code ===
          "auth/email-already-in-use"
        ) {
          showError(
            "Account Exists",
            "This email is already registered. Please log in instead.",
          );

          router.replace(
            "/(auth)/login",
          );

          return;
        }

        /*
         * Customer account/session problem.
         */
        if (
          error?.code ===
            "auth/user-not-found" ||
          error?.code ===
            "auth/requires-recent-login"
        ) {
          showError(
            "Session Expired",
            "Your customer session has expired. Please sign in again and continue.",
          );

          router.replace(
            "/(auth)/login",
          );

          return;
        }

        showError(
          "Registration Failed",
          error?.message ??
            "Unable to create your provider profile right now.",
        );
      } finally {
        setLoading(false);
      }
    };

  return {
    loading,
    completeRegistration,
  };
}