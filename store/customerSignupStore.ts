import { create } from "zustand";

interface CustomerSignupState {
  firstName: string;
  surname: string;
  otherName: string;
  email: string;
  phone: string;
  password: string;

  setData: (
    data: Partial<CustomerSignupState>
  ) => void;
}

export const useCustomerSignupStore =
  create<CustomerSignupState>((set) => ({
    firstName: "",
    surname: "",
    otherName: "",
    email: "",
    phone: "",
    password: "",

    setData: (data) =>
      set((state) => ({
        ...state,
        ...data,
      })),
  }));