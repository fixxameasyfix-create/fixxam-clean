import {
  useRef,
  useState,
} from "react";

import { router } from "expo-router";

import {
  ref as storageRef,
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

import {
  clearCustomerDraft,
} from "@/utils/customerSignupDraft";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  validateCompleteCustomerRegistration,
} from "@/hooks/useCustomerValidation";

import useCustomerRegistration from "@/hooks/useCustomerRegistration";

/* ==============================================================
   TYPES
============================================================== */

export type CustomerRegistrationSource =
  | "new"
  | "worker";

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

  registrationSource?: CustomerRegistrationSource;
};

/* ==============================================================
   HELPERS
============================================================== */

function getErrorCode(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (
        error as {
          code?: unknown;
        }
      ).code ?? "",
    );
  }

  return "";
}

/* ==============================================================
   HOOK
============================================================== */

export default function useCompleteCustomerRegistration() {
  const [loading, setLoading] =
    useState(false);

  /*
   * Prevent rapid double submission.
   *
   * useState alone is not sufficient because
   * multiple events can enter an async function
   * before React applies the state update.
   */
  const submissionLockRef =
    useRef(false);

  const {
    registerCustomer,
  } =
    useCustomerRegistration();

  /* ============================================================
     COMPLETE REGISTRATION
  ============================================================ */

  const completeRegistration =
    async (
      data: Props,
    ) => {
      /*
       * --------------------------------------------------------
       * PREVENT DOUBLE SUBMISSION
       * --------------------------------------------------------
       */

      if (
        submissionLockRef.current
      ) {
        return;
      }

      submissionLockRef.current =
        true;

      try {
        setLoading(true);

        /*
         * ------------------------------------------------------
         * REGISTRATION SOURCE
         * ------------------------------------------------------
         *
         * NEW:
         * Normal customer registration.
         *
         * WORKER:
         * Existing worker account is being upgraded
         * with the customer role.
         */
        const registrationSource =
          data.registrationSource ??
          "new";

        /*
         * ------------------------------------------------------
         * COMPLETE FORM VALIDATION
         * ------------------------------------------------------
         *
         * IMPORTANT:
         *
         * registrationSource MUST be passed here.
         *
         * Without it, the validation layer assumes:
         *
         *     registrationSource = "new"
         *
         * and incorrectly validates Worker → Customer
         * using the new-customer email/password rules.
         *
         * For Worker → Customer, Firebase Auth remains
         * the authoritative source for:
         *
         * - existing password
         * - account identity
         * - email verification
         */
        const isValid =
          validateCompleteCustomerRegistration({
            ...data,

            registrationSource,
          });

        if (!isValid) {
          return;
        }

        /*
         * ------------------------------------------------------
         * CREATE / COMPLETE CUSTOMER REGISTRATION
         * ------------------------------------------------------
         *
         * NEW:
         * - creates/reuses the appropriate Firebase account
         *
         * WORKER:
         * - reuses the authenticated worker UID
         * - reauthenticates the worker
         * - reloads Firebase Auth state
         * - verifies worker email
         * - adds the customer role
         * - creates customerProfile
         * - preserves workerProfile
         */

        const result =
          await registerCustomer({
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

            emailVerified:
              data.emailVerified,

            phoneVerified:
              data.phoneVerified,

            password:
              data.password,

            confirmPassword:
              data.confirmPassword,

            acceptedTerms:
              data.acceptedTerms,

            /*
             * Photo is handled below so that
             * the existing storage flow remains
             * compatible with the current profile
             * structure.
             */
            photoURL:
              null,

            registrationSource,
          });

        const userId =
          result.uid;

        if (!userId) {
          throw new Error(
            "Unable to determine the authenticated user.",
          );
        }

        /*
         * ------------------------------------------------------
         * PROFILE PHOTO
         * ------------------------------------------------------
         *
         * Worker → Customer:
         *
         * users/{uid}
         *   customerProfile.photoUrl
         *
         * The worker's top-level photoUrl is NOT changed.
         *
         * New customer:
         *
         * users/{uid}.photoUrl
         *
         * remains the existing compatibility behavior.
         */

        if (data.photo) {
          const response =
            await fetch(
              data.photo,
            );

          if (!response.ok) {
            throw new Error(
              "Unable to read the selected profile photo.",
            );
          }

          const blob =
            await response.blob();

          const photoRef =
            storageRef(
              storage,
              `users/${userId}/customer-profile-photo`,
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

          const photoUrl =
            await getDownloadURL(
              photoRef,
            );

          /*
           * ----------------------------------------------------
           * WORKER → CUSTOMER PHOTO
           * ----------------------------------------------------
           *
           * Never overwrite the worker's
           * existing top-level profile photo.
           */

          if (
            registrationSource ===
            "worker"
          ) {
            await updateDoc(
              doc(
                db,
                "users",
                userId,
              ),
              {
                "customerProfile.photoUrl":
                  photoUrl,

                updatedAt:
                  new Date(),
              },
            );
          } else {
            /*
             * --------------------------------------------------
             * NEW CUSTOMER PHOTO
             * --------------------------------------------------
             */

            await updateDoc(
              doc(
                db,
                "users",
                userId,
              ),
              {
                photoUrl,

                updatedAt:
                  new Date(),
              },
            );
          }
        }

        /*
         * ------------------------------------------------------
         * CLEAR SAVED REGISTRATION DRAFT
         * ------------------------------------------------------
         *
         * Clear only after registration and
         * optional photo processing succeed.
         */

        await clearCustomerDraft();

        /*
         * ------------------------------------------------------
         * SUCCESS
         * ------------------------------------------------------
         */

        showSuccess(
          "Success",
          "Your customer account has been created successfully.",
        );

        /*
         * ------------------------------------------------------
         * NAVIGATION
         * ------------------------------------------------------
         */

        router.dismissAll();

        router.replace(
          "/(auth)/customer-setup-complete",
        );
      } catch (
        error: unknown
      ) {
        console.error(
          "CUSTOMER_REGISTRATION_ERROR:",
          error,
        );

        const code =
          getErrorCode(error);

        /*
         * ------------------------------------------------------
         * EMAIL ALREADY IN USE
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/email-already-in-use"
        ) {
          showError(
            "Account Exists",
            "This email is already linked to another account. Please log in instead.",
          );

          router.replace(
            "/(auth)/login",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * CREDENTIAL ALREADY IN USE
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/credential-already-in-use"
        ) {
          showError(
            "Account Exists",
            "This contact is already linked to another account.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * PROVIDER ALREADY LINKED
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/provider-already-linked"
        ) {
          showError(
            "Already Linked",
            "This sign-in method is already linked to your account.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * RECENT LOGIN REQUIRED
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/requires-recent-login"
        ) {
          showError(
            "Verification Required",
            "Please verify your account again before completing registration.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * INVALID CREDENTIAL
         * ------------------------------------------------------
         */

        if (
          code ===
            "auth/invalid-credential" ||
          code ===
            "auth/wrong-password"
        ) {
          showError(
            "Incorrect Password",
            "The existing Fixxam password you entered is incorrect.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * USER NOT FOUND
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/user-not-found"
        ) {
          showError(
            "Account Not Found",
            "Your Fixxam account could not be found. Please log in again.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * NETWORK ERROR
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/network-request-failed"
        ) {
          showError(
            "Connection Error",
            "Check your internet connection and try again.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * TOO MANY REQUESTS
         * ------------------------------------------------------
         */

        if (
          code ===
          "auth/too-many-requests"
        ) {
          showError(
            "Too Many Attempts",
            "Too many verification attempts. Please wait a moment and try again.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * GENERIC ERROR
         * ------------------------------------------------------
         */

        showError(
          "Registration Failed",
          error instanceof Error
            ? error.message
            : "Unable to complete registration.",
        );
      } finally {
        setLoading(false);

        submissionLockRef.current =
          false;
      }
    };

  return {
    loading,
    completeRegistration,
  };
}