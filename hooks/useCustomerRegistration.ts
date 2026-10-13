import { useCallback, useState } from "react";

import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";

import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type CustomerRegistrationSource =
  | "new"
  | "worker";

export interface RegisterCustomerInput {
  firstName: string;
  surname: string;
  otherName?: string;

  email?: string;
  phone?: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  /*
   * New customer:
   *   password = new password
   *   confirmPassword = confirmation
   *
   * Worker → Customer:
   *   password = ""
   *   confirmPassword = existing worker password
   */
  password: string;
  confirmPassword: string;

  acceptedTerms: boolean;

  photoURL?: string | null;

  registrationSource?: CustomerRegistrationSource;
}

/* ============================================================
   FIREBASE ERROR
============================================================ */

interface FirebaseErrorLike {
  code?: unknown;
  message?: unknown;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeEmail(
  value?: string,
): string {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(
  value?: string,
): string {
  return value?.trim() ?? "";
}

function getFullName(
  firstName: string,
  surname: string,
  otherName?: string,
): string {
  return [
    firstName,
    otherName,
    surname,
  ]
    .map(
      (value) => value?.trim(),
    )
    .filter(Boolean)
    .join(" ");
}

function getErrorCode(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (error as FirebaseErrorLike).code ??
        "",
    );
  }

  return "";
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as FirebaseErrorLike).message ??
        "",
    );
  }

  return "";
}

/* ============================================================
   ERROR MAPPING
============================================================ */

function mapRegistrationError(
  error: unknown,
): Error {
  const code =
    getErrorCode(error);

  switch (code) {
    /* --------------------------------------------------------
       AUTH
    -------------------------------------------------------- */

    case "auth/email-already-in-use":
      return new Error(
        "This email is already registered. Please log in instead.",
      );

    case "auth/invalid-email":
      return new Error(
        "Please enter a valid email address.",
      );

    case "auth/weak-password":
      return new Error(
        "Your password is too weak. Please choose a stronger password.",
      );

    /* --------------------------------------------------------
       EXISTING PASSWORD
    -------------------------------------------------------- */

    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return new Error(
        "The password you entered is incorrect. Please enter your existing Fixxam password.",
      );

    case "auth/user-mismatch":
      return new Error(
        "The account verification did not match the signed-in account. Please log in again.",
      );

    case "auth/user-not-found":
      return new Error(
        "Your account could not be found. Please log in again.",
      );

    case "auth/user-disabled":
      return new Error(
        "Your account has been disabled. Please contact Fixxam support.",
      );

    case "auth/requires-recent-login":
      return new Error(
        "Please log in again before completing registration.",
      );

    /* --------------------------------------------------------
       NETWORK
    -------------------------------------------------------- */

    case "auth/network-request-failed":
      return new Error(
        "Network error. Please check your internet connection and try again.",
      );

    case "auth/too-many-requests":
      return new Error(
        "Too many verification attempts. Please wait a moment and try again.",
      );

    /* --------------------------------------------------------
       FIRESTORE
    -------------------------------------------------------- */

    case "permission-denied":
    case "firestore/permission-denied":
      return new Error(
        "You do not have permission to complete this registration.",
      );

    /* --------------------------------------------------------
       FALLBACK
    -------------------------------------------------------- */

    default:
      return new Error(
        getErrorMessage(error) ||
          "Unable to complete your Fixxam registration. Please try again.",
      );
  }
}

/* ============================================================
   VALIDATION
============================================================ */

function validateRegistrationInput(
  data: RegisterCustomerInput,
): void {
  const firstName =
    data.firstName.trim();

  const surname =
    data.surname.trim();

  /* ----------------------------------------------------------
     PERSONAL INFORMATION
  ---------------------------------------------------------- */

  if (!firstName) {
    throw new Error(
      "Please enter your first name.",
    );
  }

  if (!surname) {
    throw new Error(
      "Please enter your surname.",
    );
  }

  /* ----------------------------------------------------------
     TERMS
  ---------------------------------------------------------- */

  if (!data.acceptedTerms) {
    throw new Error(
      "Please accept the Terms and Conditions.",
    );
  }

  /* ==========================================================
     WORKER → CUSTOMER
  ========================================================== */

  if (
    data.registrationSource ===
    "worker"
  ) {
    /*
     * The existing password is only required
     * temporarily for Firebase reauthentication.
     *
     * We do NOT:
     *
     * - retrieve it
     * - store it
     * - change it
     * - write it to Firestore
     */

    if (
      !data.confirmPassword.trim()
    ) {
      throw new Error(
        "Please enter your existing Fixxam password.",
      );
    }

    return;
  }

  /* ==========================================================
     NEW CUSTOMER
  ========================================================== */

  const email =
    normalizeEmail(data.email);

  const phone =
    normalizePhone(data.phone);

  if (!email && !phone) {
    throw new Error(
      "Please provide your email address.",
    );
  }

  /*
   * Current Fixxam customer registration
   * uses email verification.
   */

  if (email && phone) {
    throw new Error(
      "Please use email verification for registration.",
    );
  }

  if (
    email &&
    !data.emailVerified
  ) {
    throw new Error(
      "Please verify your email address before continuing.",
    );
  }

  if (
    phone &&
    !data.phoneVerified
  ) {
    throw new Error(
      "Please verify your phone number before continuing.",
    );
  }

  /* ----------------------------------------------------------
     NEW PASSWORD
  ---------------------------------------------------------- */

  if (
    data.password.length < 6 ||
    data.password.length > 20
  ) {
    throw new Error(
      "Password must be between 6 and 20 characters.",
    );
  }

  if (
    data.password !==
    data.confirmPassword
  ) {
    throw new Error(
      "Passwords do not match.",
    );
  }
}

/* ============================================================
   HOOK
============================================================ */

export function useCustomerRegistration() {
  const [loading, setLoading] =
    useState(false);

  /* ==========================================================
     CURRENT USER EMAIL CHECK
  ========================================================== */

  const currentUserMatchesEmail =
    useCallback(
      (email: string): boolean => {
        const currentUser =
          auth.currentUser;

        if (!currentUser?.email) {
          return false;
        }

        return (
          currentUser.email
            .trim()
            .toLowerCase() ===
          email.trim().toLowerCase()
        );
      },
      [],
    );

  /* ==========================================================
     VERIFY EXISTING WORKER PASSWORD
  ========================================================== */

  const verifyExistingPassword =
    useCallback(
      async (
        existingPassword: string,
      ): Promise<boolean> => {
        try {
          /*
           * The user must already be authenticated.
           */

          const currentUser =
            auth.currentUser;

          if (!currentUser) {
            throw new Error(
              "Your worker session has expired. Please log in again.",
            );
          }

          /*
           * Firebase Auth email is authoritative.
           */

          const email =
            currentUser.email?.trim();

          if (!email) {
            throw new Error(
              "Your Fixxam account does not have a valid email address. Please log in again.",
            );
          }

          /*
           * Never allow an empty password
           * to reach Firebase.
           */

          if (
            !existingPassword.trim()
          ) {
            throw new Error(
              "Please enter your existing Fixxam password.",
            );
          }

          /*
           * Create a temporary credential.
           *
           * IMPORTANT:
           *
           * The password is NOT saved.
           * The password is NOT written to Firestore.
           * The password is NOT retrieved from Firebase.
           */

          const credential =
            EmailAuthProvider.credential(
              email,
              existingPassword,
            );

          /*
           * Firebase performs the actual
           * password verification here.
           */

          await reauthenticateWithCredential(
            currentUser,
            credential,
          );

          /*
           * Confirm Firebase still has
           * an authenticated user.
           */

          if (!auth.currentUser) {
            throw new Error(
              "Your worker session has expired. Please log in again.",
            );
          }

          return true;
        } catch (error: unknown) {
          /*
           * Convert Firebase errors into the same
           * friendly messages used by registration.
           */

          throw mapRegistrationError(
            error,
          );
        }
      },
      [],
    );

  /* ==========================================================
     RESOLVE AUTHENTICATED USER
  ========================================================== */

  const resolveAuthenticatedUser =
    useCallback(
      async (
        data: RegisterCustomerInput,
      ): Promise<User> => {
        /* ======================================================
           WORKER → CUSTOMER
        ====================================================== */

        if (
          data.registrationSource ===
          "worker"
        ) {
          const currentUser =
            auth.currentUser;

          if (!currentUser) {
            throw new Error(
              "Your worker session has expired. Please log in again.",
            );
          }

          /*
           * Reauthenticate the EXISTING Firebase
           * account using the password supplied
           * by the user.
           *
           * This does NOT create another UID.
           */

          await verifyExistingPassword(
            data.confirmPassword,
          );

          const refreshedUser =
            auth.currentUser;

          if (!refreshedUser) {
            throw new Error(
              "Your worker session has expired. Please log in again.",
            );
          }

          return refreshedUser;
        }

        /* ======================================================
           NEW CUSTOMER
        ====================================================== */

        const email =
          normalizeEmail(data.email);

        if (!email) {
          throw new Error(
            "A verified email address is required.",
          );
        }

        if (!data.emailVerified) {
          throw new Error(
            "Please verify your email address before continuing.",
          );
        }

        const currentUser =
          auth.currentUser;

        /*
         * Preserve an already authenticated account
         * when the email matches.
         */

        if (
          currentUser &&
          currentUserMatchesEmail(
            email,
          )
        ) {
          return currentUser;
        }

        /*
         * Only normal new registration creates
         * a new Firebase Auth account.
         */

        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            data.password,
          );

        return credential.user;
      },
      [
        currentUserMatchesEmail,
        verifyExistingPassword,
      ],
    );

  /* ==========================================================
     SAVE CUSTOMER PROFILE
  ========================================================== */

  const saveCustomerProfile =
    useCallback(
      async (
        data: RegisterCustomerInput,
        user: User,
      ): Promise<void> => {
        /* ------------------------------------------------------
           IDENTITY
        ------------------------------------------------------ */

        const email =
          data.registrationSource ===
          "worker"
            ? user.email?.trim() ||
              normalizeEmail(
                data.email,
              )
            : normalizeEmail(
                data.email,
              ) ||
              user.email ||
              "";

        const phone =
          normalizePhone(
            data.phone,
          ) ||
          user.phoneNumber ||
          "";

        /* ------------------------------------------------------
           PERSONAL INFORMATION
        ------------------------------------------------------ */

        const firstName =
          data.firstName.trim();

        const surname =
          data.surname.trim();

        const otherName =
          data.otherName?.trim() ||
          null;

        const fullName =
          getFullName(
            firstName,
            surname,
            otherName ??
              undefined,
          );

        const userRef =
          doc(
            db,
            "users",
            user.uid,
          );

        /* ======================================================
           WORKER → CUSTOMER
        ====================================================== */

        if (
          data.registrationSource ===
          "worker"
        ) {
          /*
           * IMPORTANT:
           *
           * Only customerProfile + role state
           * are changed.
           *
           * Worker information remains intact.
           */

          const customerProfile = {
            uid: user.uid,

            firstName,
            surname,
            otherName,

            fullName,

            email:
              email || null,

            phone:
              phone || null,

            emailVerified:
              user.emailVerified,

            /*
             * No new phone verification is performed.
             */

            phoneVerified:
              Boolean(
                data.phoneVerified,
              ),

            photoUrl:
              data.photoURL ??
              null,

            registrationStatus:
              "active",

            savedCount: 0,

            reviewCount: 0,

            orderCount: 0,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          };

          await setDoc(
            userRef,
            {
              customerProfile,

              roles:
                arrayUnion(
                  "customer",
                ),

              activeRole:
                "customer",

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          );

          return;
        }

        /* ======================================================
           NEW CUSTOMER
        ====================================================== */

        const customerProfile = {
          uid: user.uid,

          firstName,
          surname,
          otherName,

          fullName,

          email:
            email || null,

          phone:
            phone || null,

          emailVerified:
            Boolean(
              data.emailVerified,
            ),

          phoneVerified:
            Boolean(
              data.phoneVerified,
            ),

          photoUrl:
            data.photoURL ??
            null,

          registrationStatus:
            "active",

          savedCount: 0,

          reviewCount: 0,

          orderCount: 0,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        };

        await setDoc(
          userRef,
          {
            uid: user.uid,

            firstName,
            surname,
            otherName,

            fullName,

            email:
              email || null,

            phone:
              phone || null,

            emailVerified:
              Boolean(
                data.emailVerified,
              ),

            phoneVerified:
              Boolean(
                data.phoneVerified,
              ),

            activeRole:
              "customer",

            photoUrl:
              data.photoURL ??
              null,

            registrationStatus:
              "active",

            savedCount: 0,

            reviewCount: 0,

            orderCount: 0,

            customerProfile,

            roles:
              arrayUnion(
                "customer",
              ),

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );
      },
      [],
    );

  /* ==========================================================
     REGISTER CUSTOMER
  ========================================================== */

  const registerCustomer =
    useCallback(
      async (
        data: RegisterCustomerInput,
      ) => {
        /*
         * Prevent duplicate submissions.
         */

        if (loading) {
          return {
            success: false,
            uid: undefined,
          };
        }

        setLoading(true);

        try {
          /*
           * 1. Validate input.
           */

          validateRegistrationInput(
            data,
          );

          /*
           * 2. Resolve authenticated user.
           *
           * Worker:
           *   existing UID + password reauthentication
           *
           * New:
           *   existing matching account OR
           *   new Firebase Auth account
           */

          const user =
            await resolveAuthenticatedUser(
              data,
            );

          /*
           * 3. ONLY after authentication succeeds,
           *    write the customer profile.
           */

          await saveCustomerProfile(
            data,
            user,
          );

          return {
            success: true,
            uid: user.uid,
          };
        } catch (
          error: unknown
        ) {
          console.error(
            "CUSTOMER_REGISTRATION_ERROR:",
            error,
          );

          throw mapRegistrationError(
            error,
          );
        } finally {
          setLoading(false);
        }
      },
      [
        loading,
        resolveAuthenticatedUser,
        saveCustomerProfile,
      ],
    );

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {
    registerCustomer,

    /*
     * Used by CustomerSignupForm to verify the
     * existing worker password BEFORE Step 5.
     */
    verifyExistingPassword,

    loading,
  };
}

export default useCustomerRegistration;