import React, { memo } from "react";

import WorkerContactInfo from "@/components/worker/WorkerContactInfo";

type Props = {
  email: string;
  emailOtp: string;
  emailVerified: boolean;
  setEmail: (value: string) => void;
  setEmailOtp: (value: string) => void;
  setEmailVerified: (value: boolean) => void;
  onOtpSent?: () => void;
  onExistingAccount?: (email: string) => void;
};

function WorkerStepTwo({
  email,
  emailOtp,
  emailVerified,
  setEmail,
  setEmailOtp,
  setEmailVerified,
  onOtpSent,
  onExistingAccount,
}: Props) {
  return (
    <WorkerContactInfo
      email={email}
      emailOtp={emailOtp}
      emailVerified={emailVerified}
      setEmail={setEmail}
      setEmailOtp={setEmailOtp}
      setEmailVerified={setEmailVerified}
      onOtpSent={onOtpSent}
      onExistingAccount={onExistingAccount}
    />
  );
}

export default memo(WorkerStepTwo);