import React from "react";

import ProfessionalInfoSection from "@/components/worker/ProfessionalInfoSection";
import LocationSelector from "@/components/worker/LocationSelector";

type Props = {
  category: string;
  subcategory: string;
  selectedServices: string[];
  experience: string;

  state: string;
  lga: string;

  setCategory: (value: string) => void;
  setSubcategory: (value: string) => void;

  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  setExperience: (value: string) => void;

  setState: (value: string) => void;
  setLga: (value: string) => void;
};

export default function WorkerStepThree({
  category,
  subcategory,
  selectedServices,
  experience,
  state,
  lga,
  setCategory,
  setSubcategory,
  setSelectedServices,
  setExperience,
  setState,
  setLga,
}: Props) {
  return (
    <>
      <ProfessionalInfoSection
        category={category}
        subcategory={subcategory}
        selectedServices={selectedServices}
        experience={experience}
        setCategory={setCategory}
        setSubcategory={setSubcategory}
        setSelectedServices={setSelectedServices}
        setExperience={setExperience}
      />

      <LocationSelector
        state={state}
        lga={lga}
        setState={setState}
        setLga={setLga}
      />
    </>
  );
}