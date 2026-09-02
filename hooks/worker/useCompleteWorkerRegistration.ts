import { useState } from "react";
import { router } from "expo-router";

import { clearWorkerDraft } from "@/utils/workerSignupDraft";

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

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  password: string;
  confirmPassword: string;

  category: string;
  subcategory: string;

  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  photo: string | null;

  about: string;

  workGallery: string[];

  acceptedTerms: boolean;

  isLoggedIn: boolean;
};

export default function useCompleteWorkerRegistration() {
  const [loading, setLoading] =
    useState(false);

  const completeRegistration = async (
    data: Props,
  ) => {
    /* ==========================================================
       PREVENT DOUBLE SUBMISSION
    ========================================================== */

    if (loading) {
      return;
    }

    /* ==========================================================
       VALIDATION
    ========================================================== */

    if (
      !validateCompleteRegistration({
        ...data,
        isLoggedIn: data.isLoggedIn,
      })
    ) {
      return;
    }

    try {
      setLoading(true);

      /* ========================================================
         REGISTER WORKER
      ======================================================== */

      await registerWorker({
        firstName:
          data.firstName,

        surname:
          data.surname,

        otherName:
          data.otherName,

        email:
          data.email,

        phone:
          data.phone,

        phoneVerified:
          data.phoneVerified,

        password:
          data.password,

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

        photo:
          data.photo,

        about:
          data.about,

        workGallery:
          data.workGallery,
      });

      /* ========================================================
         CLEAR SAVED DRAFT
      ======================================================== */

      await clearWorkerDraft();

      /* ========================================================
         SUCCESS
      ======================================================== */

      showSuccess(
        "Success",
        data.isLoggedIn
          ? "Worker profile created successfully."
          : "Worker account created successfully.",
      );

      /* ========================================================
         NAVIGATION
      ======================================================== */

      if (data.isLoggedIn) {
        router.replace(
          "/(auth)/select-account",
        );
      } else {
        router.replace(
          "/(worker)/(tabs)/home",
        );
      }
    } catch (error: any) {
      /* ========================================================
         EXISTING ACCOUNT
      ======================================================== */

      if (
        error?.code ===
        "auth/email-already-in-use"
      ) {
        showError(
          "Account Exists",
          "Login first then add worker role.",
        );

        router.replace(
          "/(auth)/login",
        );

        return;
      }

      /* ========================================================
         GENERAL ERROR
      ======================================================== */

      showError(
        "Registration Failed",
        error?.message ??
          "Unknown error.",
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