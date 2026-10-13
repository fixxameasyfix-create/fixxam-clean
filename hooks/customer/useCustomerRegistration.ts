import { useCallback, useState } from "react";

import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
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

  password: string;
  confirmPassword: string;

  acceptedTerms: boolean;

  photoURL?: string | null;

  registrationSource?: CustomerRegistrationSource;
}

interface FirebaseErrorLike {
  code?: unknown;
  message?: unknown;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeEmail(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(value?: string): string {
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
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
}

function getErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (error as FirebaseErrorLike).code ?? "",
    );
  }

  return "";
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as FirebaseErrorLike).message ?? "",
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
  const code = getErrorCode(error);

  switch (code) {
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

    case "auth/network-request-failed":
      return new Error(
        "Network error. Please check your internet connection and try again.",
      );

    case "auth/too-many-requests":
      return new Error(
        "Too many verification attempts. Please wait a moment and try again.",
      );

    case "auth/operation-not-allowed":
      return new Error(
        "Email/password authentication is not enabled for this account.",
      );

    case "auth/quota-exceeded":
      return new Error(
        "Verification email limit reached. Please try again later.",
      );

    case "permission-denied":
    case "firestore/permission-denied":
      return new Error(
        "You do not have permission to complete this registration.",
      );

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

  if (!data.acceptedTerms) {
    throw new Error(
      "Please accept the Terms and Conditions.",
    );
  }

  /* ----------------------------------------------------------
     WORKER → CUSTOMER
  ---------------------------------------------------------- */

  if (
    data.registrationSource ===
    "worker"
  ) {
    /*
     * For Worker → Customer,
     * confirmPassword is the EXISTING
     * worker account password.
     *
     * We NEVER use it to create
     * another Firebase account.
     */
    const existingPassword =
      data.confirmPassword.trim();

    if (!existingPassword) {
      throw new Error(
        "Please enter your existing Fixxam password.",
      );
    }

    if (
      existingPassword.length < 6 ||
      existingPassword.length > 20
    ) {
      throw new Error(
        "Please enter your existing Fixxam password.",
      );
    }

    return;
  }

  /* ----------------------------------------------------------
     NEW CUSTOMER
  ---------------------------------------------------------- */

  const email =
    normalizeEmail(data.email);

  const phone =
    normalizePhone(data.phone);

  if (!email && !phone) {
    throw new Error(
      "Please provide your email address.",
    );
  }

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
  const [
    loading,
    setLoading,
  ] = useState(false);

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
          email
            .trim()
            .toLowerCase()
        );
      },
      [],
    );

  /* ==========================================================
     SEND WORKER EMAIL VERIFICATION
  ========================================================== */

  const sendWorkerEmailVerification =
    useCallback(
      async (
        currentUser: User,
      ): Promise<void> => {
        if (!currentUser.email) {
          throw new Error(
            "Your worker account does not have a valid email address. Please log in again.",
          );
        }

        /*
         * Always reload before checking verification
         * so Firebase Auth has the latest server state.
         */
        await reload(currentUser);

        const refreshedUser =
          auth.currentUser;

        if (!refreshedUser) {
          throw new Error(
            "Your worker session has expired. Please log in again.",
          );
        }

        /*
         * Already verified.
         *
         * No verification email is necessary.
         */
        if (
          refreshedUser.emailVerified
        ) {
          return;
        }

        /*
         * Send verification email to the
         * EXISTING worker email.
         *
         * We do not create another account.
         */
        await sendEmailVerification(
          refreshedUser,
        );
      },
      [],
    );

  /* ==========================================================
     REAUTHENTICATE EXISTING WORKER
  ========================================================== */

  const reauthenticateWorker =
    useCallback(
      async (
        currentUser: User,
        existingPassword: string,
      ): Promise<User> => {
        const email =
          currentUser.email?.trim();

        if (!email) {
          throw new Error(
            "Your worker account does not have a valid email address. Please log in again.",
          );
        }

        const password =
          existingPassword.trim();

        if (!password) {
          throw new Error(
            "Please enter your existing Fixxam password.",
          );
        }

        /*
         * Authenticate against the EXISTING
         * worker Firebase account.
         *
         * This does NOT create another user.
         */
        const credential =
          EmailAuthProvider.credential(
            email,
            password,
          );

        await reauthenticateWithCredential(
          currentUser,
          credential,
        );

        /*
         * Refresh Firebase Auth state.
         */
        await reload(currentUser);

        const refreshedUser =
          auth.currentUser;

        if (!refreshedUser) {
          throw new Error(
            "Your worker session has expired. Please log in again.",
          );
        }

        /*
         * IMPORTANT:
         *
         * We intentionally DO NOT reject an
         * unverified email here.
         *
         * Password verification and email
         * verification are two separate steps.
         */
        return refreshedUser;
      },
      [],
    );

  /* ==========================================================
     VERIFY WORKER PASSWORD
     
     Used before moving Step 4 → Step 5.
     
     This verifies:
     - current worker session
     - existing worker password
     
     It does NOT:
     - create customer account
     - modify Firestore
     - require email verification yet
  ========================================================== */

  const verifyExistingWorkerPassword =
    useCallback(
      async (
        password: string,
      ): Promise<{
        success: boolean;
        error?: string;
      }> => {
        const currentUser =
          auth.currentUser;

        if (!currentUser) {
          return {
            success: false,
            error:
              "Your worker session has expired. Please log in again.",
          };
        }

        try {
          await reauthenticateWorker(
            currentUser,
            password,
          );

          return {
            success: true,
          };
        } catch (error: unknown) {
          const mapped =
            mapRegistrationError(
              error,
            );

          return {
            success: false,
            error: mapped.message,
          };
        }
      },
      [reauthenticateWorker],
    );

  /* ==========================================================
     VERIFY WORKER EMAIL BEFORE ROLE CREATION
     
     This is the important new flow:
     
     1. Reload Firebase user.
     2. If already verified → continue.
     3. If not verified → send verification email.
     4. Throw a clear message so UI stops.
     
     After the worker verifies the email,
     pressing Create Customer Account again
     will reload Firebase Auth and continue.
  ========================================================== */

  const ensureWorkerEmailVerified =
    useCallback(
      async (
        currentUser: User,
      ): Promise<User> => {
        /*
         * Always reload first.
         *
         * This is critical because the user may
         * have verified the email outside the app.
         */
        await reload(currentUser);

        let refreshedUser =
          auth.currentUser;

        if (!refreshedUser) {
          throw new Error(
            "Your worker session has expired. Please log in again.",
          );
        }

        /*
         * Email already verified.
         */
        if (
          refreshedUser.emailVerified
        ) {
          return refreshedUser;
        }

        /*
         * Send verification email.
         */
        await sendWorkerEmailVerification(
          refreshedUser,
        );

        /*
         * Registration must stop here.
         *
         * The worker needs to open the email
         * and verify it first.
         */
        throw new Error(
          "Your worker email is not verified. We sent a verification email to your worker email. Please verify it, then return here and press Create Customer Account again.",
        );
      },
      [sendWorkerEmailVerification],
    );

  /* ==========================================================
     RESOLVE AUTHENTICATED USER
  ========================================================== */

  const resolveAuthenticatedUser =
    useCallback(
      async (
        data: RegisterCustomerInput,
      ): Promise<User> => {
        /* ------------------------------------------------------
           WORKER → CUSTOMER
        ------------------------------------------------------ */

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
           * First verify the EXISTING worker
           * password.
           */
          const authenticatedUser =
            await reauthenticateWorker(
              currentUser,
              data.confirmPassword,
            );

          /*
           * Then verify the worker email.
           *
           * If not verified, this sends the
           * verification email and stops.
           *
           * If already verified, the same
           * Firebase UID continues.
           */
          return ensureWorkerEmailVerified(
            authenticatedUser,
          );
        }

        /* ------------------------------------------------------
           NEW CUSTOMER
        ------------------------------------------------------ */

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
         * If the currently authenticated
         * account already owns this email,
         * keep using the same account.
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
         * ONLY normal NEW CUSTOMER registration
         * creates a new Firebase account.
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
        ensureWorkerEmailVerified,
        reauthenticateWorker,
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

        /* ------------------------------------------------------
           WORKER → CUSTOMER
        ------------------------------------------------------ */

        if (
          data.registrationSource ===
          "worker"
        ) {
          /*
           * The same Firebase UID is retained.
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

          /*
           * IMPORTANT:
           *
           * arrayUnion("customer")
           * preserves the existing worker role.
           *
           * Example:
           *
           * ["worker"]
           *
           * becomes:
           *
           * ["worker", "customer"]
           */
          await setDoc(
            userRef,
            {
              uid: user.uid,

              customerProfile,

              roles:
                arrayUnion(
                  "customer",
                ),

              activeRole:
                "customer",

              emailVerified:
                user.emailVerified,

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          );

          return;
        }

        /* ------------------------------------------------------
           NEW CUSTOMER
        ------------------------------------------------------ */

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
         * Prevent duplicate submission.
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
           * Validate all input first.
           */
          validateRegistrationInput(
            data,
          );

          /*
           * Resolve the correct Firebase user.
           *
           * Worker → Customer:
           * EXISTING worker UID.
           *
           * New Customer:
           * NEW Firebase UID.
           */
          const user =
            await resolveAuthenticatedUser(
              data,
            );

          /*
           * Only after authentication and
           * email verification succeed do we
           * modify Firestore.
           */
          await saveCustomerProfile(
            data,
            user,
          );

          return {
            success: true,
            uid: user.uid,
          };
        } catch (error: unknown) {
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

  return {
    registerCustomer,

    verifyExistingWorkerPassword,

    /*
     * Expose this so the UI can optionally
     * provide a "Resend verification email"
     * button later.
     */
    sendWorkerEmailVerification,

    /*
     * Explicit helper for checking the
     * worker's current Firebase verification state.
     */
    ensureWorkerEmailVerified,

    loading,
  };
}

export default useCustomerRegistration;