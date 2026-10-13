import {
  useCallback,
  useState,
} from "react";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

/* ============================================================
   TYPES
============================================================ */

export type UserRole =
  | "customer"
  | "worker";

/* ============================================================
   SWITCH ROLE
============================================================ */

export default function useSwitchRole() {
  const [
    loading,
    setLoading,
  ] = useState(false);

  const switchRole =
    useCallback(
      async (
        role: UserRole,
      ): Promise<boolean> => {
        if (loading) {
          return false;
        }

        const user =
          auth.currentUser;

        if (!user) {
          showError(
            "Authentication Required",
            "Please sign in again.",
          );

          return false;
        }

        /*
         * IMPORTANT:
         *
         * This function only updates activeRole.
         *
         * The selected role has already been
         * validated by SelectAccount.
         *
         * Firestore Security Rules MUST still
         * enforce that the authenticated user
         * is allowed to set this role.
         */
        try {
          setLoading(true);

          const userRef =
            doc(
              db,
              "users",
              user.uid,
            );

          await updateDoc(
            userRef,
            {
              activeRole:
                role,
            },
          );

          showSuccess(
            "Account Switched",
            role === "customer"
              ? "You are now using your customer account."
              : "You are now using your worker account.",
          );

          return true;
        } catch (error) {
          console.error(
            "SWITCH_ROLE_ERROR:",
            error,
          );

          showError(
            "Switch Failed",
            "Unable to switch account. Please try again.",
          );

          return false;
        } finally {
          setLoading(false);
        }
      },
      [loading],
    );

  return {
    loading,
    switchRole,
  };
}