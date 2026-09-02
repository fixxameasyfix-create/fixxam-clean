import { create } from "zustand";

interface WorkerSignupState {
  firstName: string;
  surname: string;
  otherName: string;
  email: string;
  phone: string;
  password: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;
  state: string;
  lga: string;
  about: string;

  photo: string | null;

  setData: (data: Partial<WorkerSignupState>) => void;
}

export const useWorkerSignupStore =
  create<WorkerSignupState>((set) => ({
    firstName: "",
    surname: "",
    otherName: "",
    email: "",
    phone: "",
    password: "",

    category: "",
    subcategory: "",

    selectedServices: [],

    experience: "",
    state: "",
    lga: "",
    about: "",

    photo: null,

    setData: (data) =>
      set((state) => ({
        ...state,
        ...data,
      })),
  }));