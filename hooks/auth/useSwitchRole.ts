import { useState } from "react";


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

export type UserRole = "customer" | "worker";

export default function useSwitchRole() {
  const [loading, setLoading] = useState(false);

  const switchRole = async (
    role: UserRole
  ): Promise<boolean> => {
    try {
      const user = auth.currentUser;

      if (!user) {
        showError(
          "Authentication Required",
          "Please sign in again."
        );

        return false;
      }

      setLoading(true);

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      await updateDoc(userRef, {
        activeRole: role,
      });

      showSuccess(
        "Account Switched",
        `You are now using your ${role} account.`
      );

      
      return true;
    } catch (error) {
      console.log(
        "SWITCH ROLE ERROR:",
        error
      );

      showError(
        "Switch Failed",
        "Unable to switch account."
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    switchRole,
  };
}