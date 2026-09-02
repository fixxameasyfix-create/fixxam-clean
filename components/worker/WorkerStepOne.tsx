import React from "react";

import WorkerPersonalInfo from "@/components/worker/WorkerPersonalInfo";

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setOtherName: (value: string) => void;
};

export default function WorkerStepOne({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
}: Props) {
  return (
    <WorkerPersonalInfo
      firstName={firstName}
      surname={surname}
      otherName={otherName}
      setFirstName={setFirstName}
      setSurname={setSurname}
      setOtherName={setOtherName}
    />
  );
}