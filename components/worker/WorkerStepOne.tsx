import React, { memo } from "react";

import WorkerPersonalInfo from "@/components/worker/WorkerPersonalInfo";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  setFirstName: (
    value: string,
  ) => void;

  setSurname: (
    value: string,
  ) => void;

  setOtherName: (
    value: string,
  ) => void;

  photo: string | null;

  onCapturePhoto: () => void;

  onUploadPhoto: () => void;

  readOnly?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerStepOne({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
  photo,
  onCapturePhoto,
  onUploadPhoto,
  readOnly = false,
}: Props) {
  return (
    <WorkerPersonalInfo
      firstName={
        firstName
      }
      surname={
        surname
      }
      otherName={
        otherName
      }
      setFirstName={
        setFirstName
      }
      setSurname={
        setSurname
      }
      setOtherName={
        setOtherName
      }
      photo={
        photo
      }
      onCapturePhoto={
        onCapturePhoto
      }
      onUploadPhoto={
        onUploadPhoto
      }
      readOnly={
        readOnly
      }
    />
  );
}

export default memo(
  WorkerStepOne,
);