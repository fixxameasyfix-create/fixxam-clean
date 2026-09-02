export type UserRole =
  | "customer"
  | "worker"
  | "admin";

export interface User {
  id: string;

  firstName: string;

  surname: string;

  otherName?: string;

  fullName: string;

  email: string;

  phone: string;

  photoUrl: string;

  roles: UserRole[];

  defaultRole: UserRole;

  emailVerified: boolean;

  phoneVerified: boolean;

  active: boolean;

  blocked: boolean;

  createdAt: any;

  updatedAt: any;

  lastLogin: any;
}