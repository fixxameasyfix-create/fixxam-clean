import {
  useEffect,
} from "react";

import {
  auth,
} from "@/firebase/config";

import useUserProfile from "@/hooks/auth/useUserProfile";

type Props = {

  setFirstName: (value: string) => void;

  setSurname: (value: string) => void;

  setOtherName: (value: string) => void;

  setEmail: (value: string) => void;

  setPhone: (value: string) => void;

  setEmailVerified: (value: boolean) => void;

  setPhoneVerified: (value: boolean) => void;

};

export default function useCustomerProfilePrefill({

  setFirstName,

  setSurname,

  setOtherName,

  setEmail,

  setPhone,

  setEmailVerified,

  setPhoneVerified,

}: Props) {

  const {

    profile,

  } = useUserProfile();

  const isLoggedIn =
    !!auth.currentUser;

  useEffect(() => {

    if (
      !isLoggedIn ||
      !profile
    ) {
      return;
    }

    setFirstName(
      profile.firstName ?? "",
    );

    setSurname(
      profile.surname ?? "",
    );

    setOtherName(
      profile.otherName ?? "",
    );

    setEmail(
      profile.email ?? "",
    );

    setPhone(
      profile.phone ?? "",
    );

    setEmailVerified(true);

    setPhoneVerified(true);

  }, [

    isLoggedIn,

    profile,

    setFirstName,

    setSurname,

    setOtherName,

    setEmail,

    setPhone,

    setEmailVerified,

    setPhoneVerified,

  ]);

  return {

    isLoggedIn,

    profile,

  };

}