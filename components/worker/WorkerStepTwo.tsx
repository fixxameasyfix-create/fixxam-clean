import React from "react";

import WorkerContactInfo from "@/components/worker/WorkerContactInfo";

type Props = {
  email: string;
  emailOtp: string;
  phone: string;
  otp: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  setEmail: (value: string) => void;
  setEmailOtp: (value: string) => void;
  setPhone: (value: string) => void;
  setOtp: (value: string) => void;

  setEmailVerified: (value: boolean) => void;
  setPhoneVerified: (value: boolean) => void;
};

export default function WorkerStepTwo({
  email,
  emailOtp,
  phone,
  otp,
  emailVerified,
  phoneVerified,
  setEmail,
  setEmailOtp,
  setPhone,
  setOtp,
  setEmailVerified,
  setPhoneVerified,
}: Props) {
  return (
    <WorkerContactInfo
      email={email}
      emailOtp={emailOtp}
      phone={phone}
      otp={otp}
      emailVerified={emailVerified}
      phoneVerified={phoneVerified}
      setEmail={setEmail}
      setEmailOtp={setEmailOtp}
      setPhone={setPhone}
      setOtp={setOtp}
      setEmailVerified={setEmailVerified}
      setPhoneVerified={setPhoneVerified}
    />
  );
}