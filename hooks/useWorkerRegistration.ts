import {
  auth,
  db,
} from "@/firebase/config";

import {
  createUserWithEmailAndPassword,
} from "@/firebase/firebaseAuth";

import {
  getServiceDetails,
} from "@/firebase/queries/serviceDetails";

import {
  syncWorkerPublicProfile,
} from "@/firebase/queries/workerPublicProfiles";

import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import * as Location from "expo-location";

type WorkerRegistrationProps = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;
  phoneVerified: boolean;

  password: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  photo: string | null;

  about: string;

  workGallery: string[];
};

export async function registerWorker({
  firstName,
  surname,
  otherName,

  email,
  phone,
  phoneVerified,

  password,

  category,
  subcategory,
  selectedServices,

  experience,

  state,
  lga,

  photo,
  about,

  workGallery,
}: WorkerRegistrationProps) {
  try {
    let latitude: number | null = null;
    let longitude: number | null = null;

    /* =========================================================
       LOCATION
    ========================================================= */

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.High,
          });

        latitude =
          currentLocation.coords.latitude;

        longitude =
          currentLocation.coords.longitude;
      }
    } catch (error) {
      console.log(
        "Failed to get current location:",
        error,
      );
    }

    /* =========================================================
       NORMALIZE DATA
    ========================================================= */

    const photoUrl =
      photo?.trim() || "";

    const normalizedPhone =
      phone.trim();

    const normalizedAbout =
      about.trim();

    const normalizedWorkGallery =
      Array.isArray(workGallery)
        ? workGallery
            .filter(
              (uri) =>
                typeof uri === "string" &&
                uri.trim().length > 0,
            )
            .map((uri) => uri.trim())
            .slice(0, 6)
        : [];

    const currentUser =
      auth.currentUser;

    /* =========================================================
       NEW USER
    ========================================================= */

    if (!currentUser) {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

      const newUser =
        userCredential.user;

      await newUser.reload();

      /* =======================================================
         LOAD SERVICE DETAILS
      ======================================================= */

      const selectedServiceObjects =
        [];

      for (
        const serviceId of selectedServices
      ) {
        const service =
          await getServiceDetails(
            serviceId,
          );

        selectedServiceObjects.push(
          service,
        );
      }

      /* =======================================================
         CREATE USER DOCUMENT
      ======================================================= */

      await setDoc(
        doc(
          db,
          "users",
          newUser.uid,
        ),
        {
          uid: newUser.uid,

          roles: [
            "customer",
            "worker",
          ],

          activeRole: "worker",

          firstName:
            firstName.trim(),

          surname:
            surname.trim(),

          otherName:
            otherName.trim(),

          email:
            email.trim(),

          phoneNumber:
            normalizedPhone,

          phoneVerified,

          verified: false,

          online: false,

          available: true,

          rating: 0,

          totalReviews: 0,

          completedJobs: 0,

          totalBookings: 0,

          totalEarnings: 0,

          workerProfile: {
            category:
              category.trim(),

            subcategory:
              subcategory.trim(),

            selectedServices,

            serviceDetails:
              selectedServiceObjects,

            experience:
              experience.trim(),

            state:
              state.trim(),

            lga:
              lga.trim(),

            photoUrl,

            about:
              normalizedAbout,

            workGallery:
              normalizedWorkGallery,

            hourlyRate: 0,

            latitude,

            longitude,
          },

          createdAt:
            serverTimestamp(),
        },
      );

      /* =======================================================
         PUBLIC WORKER PROFILE
      ======================================================= */

      await syncWorkerPublicProfile(
        newUser.uid,
        {
          uid:
            newUser.uid,

          firstName:
            firstName.trim(),

          otherName:
            otherName.trim(),

          surname:
            surname.trim(),

          rating: 0,

          online: false,

          available: true,

          workerProfile: {
            category:
              category.trim(),

            subcategory:
              subcategory.trim(),

            experience:
              experience.trim(),

            about:
              normalizedAbout,

            hourlyRate: 0,

            photoUrl,

            latitude,

            longitude,

            selectedServices,

            workGallery:
              normalizedWorkGallery,

            serviceDetails: {
              state:
                state.trim(),

              subcategory:
                subcategory.trim(),
            },
          },
        },
      );

      return;
    }

    /* =========================================================
       EXISTING USER
    ========================================================= */

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid,
      );

    /* =========================================================
       LOAD SERVICE DETAILS
    ========================================================= */

    const selectedServiceObjects =
      [];

    for (
      const serviceId of selectedServices
    ) {
      const service =
        await getServiceDetails(
          serviceId,
        );

      selectedServiceObjects.push(
        service,
      );
    }

    /* =========================================================
       UPDATE USER DOCUMENT
    ========================================================= */

    await setDoc(
      userRef,
      {
        roles:
          arrayUnion(
            "worker",
          ),

        activeRole:
          "worker",

        firstName:
          firstName.trim(),

        surname:
          surname.trim(),

        otherName:
          otherName.trim(),

        email:
          email.trim(),

        phoneNumber:
          normalizedPhone,

        phoneVerified,

        verified: false,

        online: false,

        available: true,

        rating: 0,

        totalReviews: 0,

        completedJobs: 0,

        totalBookings: 0,

        totalEarnings: 0,

        workerProfile: {
          category:
            category.trim(),

          subcategory:
            subcategory.trim(),

          selectedServices,

          serviceDetails:
            selectedServiceObjects,

          experience:
            experience.trim(),

          state:
            state.trim(),

          lga:
            lga.trim(),

          photoUrl,

          about:
            normalizedAbout,

          workGallery:
            normalizedWorkGallery,

          hourlyRate: 0,

          latitude,

          longitude,
        },

        updatedAt:
          serverTimestamp(),
      },
      {
        merge: true,
      },
    );

    /* =========================================================
       UPDATE PUBLIC WORKER PROFILE
    ========================================================= */

    await syncWorkerPublicProfile(
      currentUser.uid,
      {
        uid:
          currentUser.uid,

        firstName:
          firstName.trim(),

        otherName:
          otherName.trim(),

        surname:
          surname.trim(),

        rating: 0,

        online: false,

        available: true,

        workerProfile: {
          category:
            category.trim(),

          subcategory:
            subcategory.trim(),

          experience:
            experience.trim(),

          about:
            normalizedAbout,

          hourlyRate: 0,

          photoUrl,

          latitude,

          longitude,

          selectedServices,

          workGallery:
            normalizedWorkGallery,

          serviceDetails: {
            state:
              state.trim(),

            subcategory:
              subcategory.trim(),
          },
        },
      },
    );
  } catch (error: any) {
    console.log(
      "REGISTER WORKER ERROR",
      error,
    );

    throw error;
  }
}