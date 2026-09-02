import React, {
  useEffect,
  useState,
} from "react";

import {
  Redirect,
} from "expo-router";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useAuth,
} from "@/contexts/AuthContext";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type UserProfile = {
  roles?: string[];

  activeRole?:
    | "customer"
    | "worker";
};

type Destination =
  | "customer"
  | "worker"
  | "role-selection";

/* ============================================================
   SCREEN
============================================================ */

export default function Index() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    destination,
    setDestination,
  ] = useState<Destination | null>(
    null,
  );

  /* ==========================================================
     RESOLVE DESTINATION
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const resolveDestination =
      async () => {
        /* ======================================================
           WAIT FOR FIREBASE AUTH
        ====================================================== */

        if (authLoading) {
          return;
        }

        /* ======================================================
           GUEST USER
           
           Guests can browse the customer experience.
        ====================================================== */

        if (!user) {
          if (mounted) {
            setDestination(
              "customer",
            );
          }

          return;
        }

        /* ======================================================
           LOAD USER PROFILE
        ====================================================== */

        try {
          setProfileLoading(
            true,
          );

          const userRef =
            doc(
              db,
              "users",
              user.uid,
            );

          const snapshot =
            await getDoc(
              userRef,
            );

          if (!mounted) {
            return;
          }

          /* ====================================================
             USER PROFILE DOES NOT EXIST
          ==================================================== */

          if (!snapshot.exists()) {
            setDestination(
              "role-selection",
            );

            return;
          }

          const profile =
            snapshot.data() as UserProfile;

          const roles =
            Array.isArray(
              profile.roles,
            )
              ? profile.roles
              : [];

          /* ====================================================
             ACTIVE WORKER
          ==================================================== */

          if (
            profile.activeRole ===
              "worker" &&
            roles.includes(
              "worker",
            )
          ) {
            setDestination(
              "worker",
            );

            return;
          }

          /* ====================================================
             ACTIVE CUSTOMER
          ==================================================== */

          if (
            profile.activeRole ===
              "customer" &&
            roles.includes(
              "customer",
            )
          ) {
            setDestination(
              "customer",
            );

            return;
          }

          /* ====================================================
             FALLBACK CUSTOMER
             
             For older profiles that have roles
             but don't have activeRole.
          ==================================================== */

          if (
            roles.includes(
              "customer",
            )
          ) {
            setDestination(
              "customer",
            );

            return;
          }

          /* ====================================================
             FALLBACK WORKER
          ==================================================== */

          if (
            roles.includes(
              "worker",
            )
          ) {
            setDestination(
              "worker",
            );

            return;
          }

          /* ====================================================
             NO VALID ROLE
          ==================================================== */

          setDestination(
            "role-selection",
          );
        } catch (error) {
          console.error(
            "RESOLVE_APP_DESTINATION_ERROR:",
            error,
          );

          /*
           * Keep the existing safe fallback:
           * if profile resolution fails,
           * send the user to role selection.
           */
          if (mounted) {
            setDestination(
              "role-selection",
            );
          }
        } finally {
          if (mounted) {
            setProfileLoading(
              false,
            );
          }
        }
      };

    resolveDestination();

    return () => {
      mounted = false;
    };
  }, [
    user,
    authLoading,
  ]);

  /* ==========================================================
     NATIVE SPLASH IS STILL VISIBLE
     
     IMPORTANT:
     
     Do NOT render ActivityIndicator here.
     Do NOT render "Loading Fixxam...".
     
     app/_layout.tsx controls the native splash.
  ========================================================== */

  if (
    authLoading ||
    profileLoading ||
    !destination
  ) {
    return null;
  }

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  if (
    destination ===
    "customer"
  ) {
    return (
      <Redirect
        href="/(customer)/(tabs)/home"
      />
    );
  }

  /* ==========================================================
     WORKER
  ========================================================== */

  if (
    destination ===
    "worker"
  ) {
    return (
      <Redirect
        href="/(worker)/(tabs)/home"
      />
    );
  }

  /* ==========================================================
     ROLE SELECTION
  ========================================================== */

  return (
    <Redirect
      href="/(auth)/role-selection"
    />
  );
}