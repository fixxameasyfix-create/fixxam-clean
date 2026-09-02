import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  useAuth,
} from "@/hooks/useAuth";

export type UserRole =
  | "customer"
  | "worker";

export type WorkerProfile = {
  photoUrl?: string;

  category: string;
  subcategory: string;

  experience: string;

  state: string;
  lga: string;

  hourlyRate: number;

  verified?: boolean;

  totalJobs?: number;
  completedJobs?: number;

  rating?: number;
  earnings?: number;
};

export type UserProfile = {
  uid: string;

  firstName: string;
  otherName?: string;
  surname: string;

  email: string;
  phone: string;

  photoUrl?: string;

  roles: UserRole[];

  activeRole: UserRole;

  online?: boolean;

  /**
   * Customer statistics
   */
  verified?: boolean;

  totalOrders?: number;
  savedCount?: number;
  totalReviews?: number;

  /**
   * Worker statistics
   */
  totalJobs?: number;
  completedJobs?: number;
  rating?: number;
  earnings?: number;

  workerProfile?: WorkerProfile;
};

export default function useUserProfile() {
  const {
    user,
  } = useAuth();

  const [
    profile,
    setProfile,
  ] = useState<UserProfile | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);

      return;
    }

    setLoading(true);

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(null);
          setLoading(false);

          return;
        }

        const data =
          snapshot.data() as Omit<
            UserProfile,
            "uid"
          >;

        setProfile({
          uid: snapshot.id,
          ...data,

          roles: Array.isArray(data.roles)
            ? data.roles.filter(
                (
                  role
                ): role is UserRole =>
                  role === "customer" ||
                  role === "worker"
              )
            : ["customer"],

          activeRole:
            data.activeRole === "worker"
              ? "worker"
              : "customer",
        });

        setLoading(false);
      },
      (error) => {
        console.error(
          "useUserProfile:",
          error
        );

        setProfile(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  return {
    profile,
    loading,
  };
}