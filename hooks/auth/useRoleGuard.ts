import {
  useEffect,
} from "react";

import {
  router,
} from "expo-router";

import useUserProfile from "@/hooks/auth/useUserProfile";

type Props = {
  role: "customer" | "worker";
};

export default function useRoleGuard({
  role,
}: Props) {

  const {
    profile,
    loading,
  } = useUserProfile();

  useEffect(() => {

    if (
      loading ||
      !profile
    ) {
      return;
    }

    if (
      profile.activeRole !== role
    ) {

      router.replace(

        profile.activeRole === "worker"
          ? "/(worker)/(tabs)/home"
          : "/(customer)/(tabs)/home",

      );

    }

  }, [
    loading,
    profile,
    role,
  ]);

  return {

    loading,

    profile,

  };

}