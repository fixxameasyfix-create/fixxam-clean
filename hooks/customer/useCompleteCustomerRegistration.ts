import { useState } from "react";
import { router } from "expo-router";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
  storage,
} from "@/firebase/config";

import { clearCustomerDraft } from "@/utils/customerSignupDraft";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  validateCompleteCustomerRegistration,
} from "@/hooks/useCustomerValidation";

import {
  registerCustomer,
} from "@/hooks/useCustomerRegistration";

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

  acceptedTerms: boolean;

  photo: string | null;

  isLoggedIn: boolean;
};

export default function useCompleteCustomerRegistration() {
  const [loading, setLoading] =
    useState(false);

  const completeRegistration = async (
    data: Props,
  ) => {
    if (
      !validateCompleteCustomerRegistration({
        ...data,
      })
    ) {
      return;
    }

    try {
      setLoading(true);

      /* ========================================================
         STEP 1
         Create customer account/profile
      ======================================================== */

      const user =
        await registerCustomer({
          firstName: data.firstName,
          surname: data.surname,
          otherName: data.otherName,

          email: data.email,
          phone: data.phone,

          password: data.password,

          photoURL: null,
        });

      /* ========================================================
         STEP 2
         Upload profile photo
      ======================================================== */

      if (data.photo) {
        const response =
          await fetch(data.photo);

        if (!response.ok) {
          throw new Error(
            "Unable to read the selected profile photo.",
          );
        }

        const blob =
          await response.blob();

        const photoRef =
          ref(
            storage,
            `users/${user.uid}/profile-photo`,
          );

        await uploadBytes(
          photoRef,
          blob,
          {
            contentType:
              blob.type ||
              "image/jpeg",
          },
        );

        const photoURL =
          await getDownloadURL(
            photoRef,
          );

        /* ======================================================
           STEP 3
           Save photo URL
        ====================================================== */

        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
          ),
          {
            photoURL,
            updatedAt:
              new Date(),
          },
        );
      }

      /* ========================================================
         STEP 4
         Clear registration draft
      ======================================================== */

      await clearCustomerDraft();

      showSuccess(
        "Success",
        data.isLoggedIn
          ? "Customer profile created successfully."
          : "Customer account created successfully.",
      );

      /* ========================================================
         STEP 5
         Navigate
      ======================================================== */

      if (data.isLoggedIn) {
        router.replace(
          "/(auth)/select-account",
        );
      } else {
        router.replace(
          "/(auth)/customer-setup-complete",
        );
      }
    } catch (error: any) {
      if (
        error?.code ===
        "auth/email-already-in-use"
      ) {
        showError(
          "Account Exists",
          "Login first then add customer role.",
        );

        router.replace(
          "/(auth)/login",
        );

        return;
      }

      showError(
        "Registration Failed",
        error?.message ||
          "Unable to complete registration.",
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