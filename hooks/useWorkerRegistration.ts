import {
  auth,
  db,
} from "@/firebase/config";

import {
  createUserWithEmailAndPassword,
} from "@/firebase/firebaseAuth";

import {
  syncWorkerPublicProfile,
} from "@/firebase/queries/workerPublicProfiles";

import {
  uploadWorkerImage,
} from "@/services/worker/workerProfileService";

import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

/* ============================================================
   TYPES
============================================================ */

export type WorkerRegistrationSource =
  | "customer"
  | "new";

type WorkerRegistrationProps = {
  registrationSource: WorkerRegistrationSource;

  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  emailVerified: boolean;

  password: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  serviceAddress: string;

  latitude: number | null;
  longitude: number | null;

  hourlyRate: string;

  phoneNumber: string;

  photo: string | null;

  about: string;

  workGallery: string[];
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeStringArray(
  values: unknown,
): string[] {
  if (
    !Array.isArray(values)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .filter(
          (
            value,
          ): value is string =>
            typeof value ===
            "string",
        )
        .map(
          value =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function buildFullName({
  firstName,
  otherName,
  surname,
}: {
  firstName: string;
  otherName: string;
  surname: string;
}): string {
  return [
    firstName,
    otherName,
    surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function isHttpUrl(
  value: unknown,
): value is string {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  return /^https?:\/\//i.test(
    value.trim(),
  );
}

function normalizeCoordinate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function normalizeHourlyRate(
  value: unknown,
): number {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (
    typeof value !== "string"
  ) {
    return 0;
  }

  const normalized =
    value
      .replace(/,/g, "")
      .trim();

  if (!normalized) {
    return 0;
  }

  const parsed =
    Number(normalized);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

/* ============================================================
   UPLOAD PROFILE PHOTO
============================================================ */

async function uploadRegistrationPhoto(
  uid: string,
  photo: string | null,
): Promise<string> {
  const normalizedPhoto =
    cleanString(photo);

  if (!normalizedPhoto) {
    return "";
  }

  /*
   * If the customer photo is already a remote URL,
   * use it as the initial worker photo value.
   *
   * This is still only a copied worker value.
   */
  if (
    isHttpUrl(
      normalizedPhoto,
    )
  ) {
    return normalizedPhoto;
  }

  const fileName =
    `worker-profile-${Date.now()}.jpg`;

  const uploadedPhotoUrl =
    await uploadWorkerImage(
      uid,
      normalizedPhoto,
      fileName,
      "profile",
    );

  if (
    !isHttpUrl(
      uploadedPhotoUrl,
    )
  ) {
    throw new Error(
      "Worker profile photo upload did not return a valid URL.",
    );
  }

  return uploadedPhotoUrl;
}

/* ============================================================
   UPLOAD WORK GALLERY
============================================================ */

async function uploadRegistrationGallery(
  uid: string,
  gallery: string[],
): Promise<string[]> {
  const normalizedGallery =
    normalizeStringArray(
      gallery,
    ).slice(0, 6);

  if (
    normalizedGallery.length ===
    0
  ) {
    return [];
  }

  const uploadedGallery =
    await Promise.all(
      normalizedGallery.map(
        async (
          imageUri,
          index,
        ) => {
          if (
            isHttpUrl(
              imageUri,
            )
          ) {
            return imageUri;
          }

          const fileName =
            `worker-gallery-${Date.now()}-${index + 1}.jpg`;

          const uploadedUrl =
            await uploadWorkerImage(
              uid,
              imageUri,
              fileName,
              "gallery",
            );

          if (
            !isHttpUrl(
              uploadedUrl,
            )
          ) {
            throw new Error(
              `Worker gallery image ${
                index + 1
              } upload did not return a valid URL.`,
            );
          }

          return uploadedUrl;
        },
      ),
    );

  return uploadedGallery.filter(
    isHttpUrl,
  );
}

/* ============================================================
   REGISTER WORKER
============================================================ */

export async function registerWorker({
  registrationSource,

  firstName,
  surname,
  otherName,

  email,
  emailVerified,

  password,

  category,
  subcategory,
  selectedServices,

  experience,

  state,
  lga,

  serviceAddress,

  latitude,
  longitude,

  hourlyRate,

  phoneNumber,

  photo,
  about,

  workGallery,
}: WorkerRegistrationProps) {
  try {
    /* ========================================================
       NORMALIZE
    ======================================================== */

    const normalizedFirstName =
      cleanString(
        firstName,
      );

    const normalizedSurname =
      cleanString(
        surname,
      );

    const normalizedOtherName =
      cleanString(
        otherName,
      );

    const normalizedEmail =
      cleanString(
        email,
      ).toLowerCase();

    const normalizedCategory =
      cleanString(
        category,
      );

    const normalizedSubcategory =
      cleanString(
        subcategory,
      );

    const normalizedExperience =
      cleanString(
        experience,
      );

    const normalizedState =
      cleanString(
        state,
      );

    const normalizedLga =
      cleanString(
        lga,
      );

    const normalizedServiceAddress =
      cleanString(
        serviceAddress,
      );

    const normalizedPhoneNumber =
      cleanString(
        phoneNumber,
      );

    const normalizedAbout =
      cleanString(
        about,
      );

    const normalizedSelectedServices =
      normalizeStringArray(
        selectedServices,
      );

    const normalizedWorkGallery =
      normalizeStringArray(
        workGallery,
      ).slice(0, 6);

    const normalizedLatitude =
      normalizeCoordinate(
        latitude,
      );

    const normalizedLongitude =
      normalizeCoordinate(
        longitude,
      );

    const normalizedHourlyRate =
      normalizeHourlyRate(
        hourlyRate,
      );

    const fullName =
      buildFullName({
        firstName:
          normalizedFirstName,

        otherName:
          normalizedOtherName,

        surname:
          normalizedSurname,
      });

    /* ========================================================
       VALIDATION
    ======================================================== */

    if (
      registrationSource !==
        "customer" &&
      registrationSource !==
        "new"
    ) {
      throw new Error(
        "Invalid worker registration source.",
      );
    }

    if (!emailVerified) {
      throw new Error(
        "Email must be verified before creating a worker profile.",
      );
    }

    if (!normalizedEmail) {
      throw new Error(
        "Worker email is required.",
      );
    }

    if (!normalizedFirstName) {
      throw new Error(
        "First name is required.",
      );
    }

    if (!normalizedSurname) {
      throw new Error(
        "Surname is required.",
      );
    }

    if (!fullName) {
      throw new Error(
        "Worker full name is required.",
      );
    }

    if (!normalizedCategory) {
      throw new Error(
        "Worker category is required.",
      );
    }

    if (!normalizedSubcategory) {
      throw new Error(
        "Worker subcategory is required.",
      );
    }

    if (
      normalizedSelectedServices.length ===
      0
    ) {
      throw new Error(
        "At least one worker service is required.",
      );
    }

    if (!normalizedExperience) {
      throw new Error(
        "Worker experience is required.",
      );
    }

    if (!normalizedState) {
      throw new Error(
        "Worker state is required.",
      );
    }

    if (!normalizedLga) {
      throw new Error(
        "Worker local government is required.",
      );
    }

    if (!normalizedServiceAddress) {
      throw new Error(
        "Service address is required.",
      );
    }

    if (
      normalizedHourlyRate <=
      0
    ) {
      throw new Error(
        "Hourly rate must be greater than zero.",
      );
    }

    if (!normalizedPhoneNumber) {
      throw new Error(
        "Phone number is required.",
      );
    }

    /* ========================================================
       GPS
    ======================================================== */

    /*
     * GPS is optional.
     *
     * Address remains the canonical service
     * location when GPS is unavailable.
     */
    const serviceLocation = {
      address:
        normalizedServiceAddress,

      state:
        normalizedState,

      lga:
        normalizedLga,

      latitude:
        normalizedLatitude,

      longitude:
        normalizedLongitude,
    };

    /* ========================================================
       AUTH USER
    ======================================================== */

    const currentUser =
      auth.currentUser;

    let workerUid =
      currentUser?.uid ?? "";

    /* ========================================================
       AUTHENTICATION RULE
       
       customer source:
       → MUST already be authenticated.

       new source:
       → authenticated user keeps the same UID.
       → unauthenticated user gets a new UID.
    ======================================================== */

    if (!currentUser) {
      if (
        registrationSource ===
        "customer"
      ) {
        throw new Error(
          "You must be signed in to use your customer details.",
        );
      }

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

      workerUid =
        userCredential.user.uid;
    }

    if (!workerUid) {
      throw new Error(
        "Unable to determine the worker account.",
      );
    }

    /* ========================================================
       UPLOAD MEDIA
    ======================================================== */

    const photoUrl =
      await uploadRegistrationPhoto(
        workerUid,
        photo,
      );

    const uploadedWorkGallery =
      await uploadRegistrationGallery(
        workerUid,
        normalizedWorkGallery,
      );

    /* ========================================================
       WORKER PROFILE
       
       IMPORTANT:
       
       This is the independent worker snapshot.
       
       When customer details were used during
       registration, these values are copied here
       only once.
    ======================================================== */

    const workerProfile = {
      firstName:
        normalizedFirstName,

      surname:
        normalizedSurname,

      otherName:
        normalizedOtherName,

      email:
        normalizedEmail,

      phoneNumber:
        normalizedPhoneNumber,

      category:
        normalizedCategory,

      subcategory:
        normalizedSubcategory,

      selectedServices:
        normalizedSelectedServices,

      serviceDetails: {
        state:
          normalizedState,

        subcategory:
          normalizedSubcategory,
      },

      experience:
        normalizedExperience,

      hourlyRate:
        normalizedHourlyRate,

      state:
        normalizedState,

      lga:
        normalizedLga,

      serviceLocation,

      photoUrl,

      about:
        normalizedAbout,

      workGallery:
        uploadedWorkGallery,

      latitude:
        normalizedLatitude,

      longitude:
        normalizedLongitude,

      /*
       * Useful for auditing how the worker
       * profile was initially created.
       */
      registrationSource,
    };

    const userRef =
      doc(
        db,
        "users",
        workerUid,
      );

    /* ========================================================
       NEW AUTHENTICATED ACCOUNT
       
       This branch only runs when there was no
       current authenticated user.
    ======================================================== */

    if (!currentUser) {
      const userPayload = {
        uid:
          workerUid,

        roles: [
          "worker",
        ],

        activeRole:
          "worker",

        firstName:
          normalizedFirstName,

        surname:
          normalizedSurname,

        otherName:
          normalizedOtherName,

        fullName,

        email:
          normalizedEmail,

        phoneNumber:
          normalizedPhoneNumber,

        verified:
          true,

        online:
          false,

        available:
          true,

        rating:
          0,

        totalReviews:
          0,

        completedJobs:
          0,

        totalBookings:
          0,

        totalEarnings:
          0,

        category:
          normalizedCategory,

        subcategory:
          normalizedSubcategory,

        selectedServices:
          normalizedSelectedServices,

        experience:
          normalizedExperience,

        hourlyRate:
          normalizedHourlyRate,

        photoUrl,

        aboutMe:
          normalizedAbout,

        workGallery:
          uploadedWorkGallery,

        serviceLocation,

        serviceAddress:
          normalizedServiceAddress,

        workerProfile,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      const publicProfile = {
        uid:
          workerUid,

        firstName:
          normalizedFirstName,

        otherName:
          normalizedOtherName,

        surname:
          normalizedSurname,

        fullName,

        name:
          fullName,

        photoUrl,

        rating:
          0,

        online:
          false,

        available:
          true,

        workerProfile,
      };

      /* ------------------------------------------------------
         SAVE USER
      ------------------------------------------------------ */

      await setDoc(
        userRef,
        userPayload,
      );

      /* ------------------------------------------------------
         SAVE PUBLIC WORKER PROFILE
      ------------------------------------------------------ */

      await syncWorkerPublicProfile(
        workerUid,
        publicProfile,
      );

      /* ------------------------------------------------------
         CANONICAL MEDIA
      ------------------------------------------------------ */

      await Promise.all([
        setDoc(
          userRef,
          {
            photoUrl,

            workGallery:
              uploadedWorkGallery,

            "workerProfile.photoUrl":
              photoUrl,

            "workerProfile.workGallery":
              uploadedWorkGallery,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        ),

        setDoc(
          doc(
            db,
            "workerPublicProfiles",
            workerUid,
          ),
          {
            photoUrl,

            workGallery:
              uploadedWorkGallery,

            "workerProfile.photoUrl":
              photoUrl,

            "workerProfile.workGallery":
              uploadedWorkGallery,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        ),
      ]);

      return {
        success: true,
        uid: workerUid,
      };
    }

    /* ========================================================
       EXISTING AUTH USER → WORKER
       
       CRITICAL:
       
       DO NOT overwrite customer-level fields.
       
       We only:
         1. Add worker role
         2. Set activeRole
         3. Create/update workerProfile
       
       Customer profile stays untouched.
    ======================================================== */

    const existingCustomerWorkerPayload = {
      roles:
        arrayUnion(
          "worker",
        ),

      activeRole:
        "worker",

      workerProfile,

      updatedAt:
        serverTimestamp(),
    };

    const publicProfile = {
      uid:
        workerUid,

      firstName:
        normalizedFirstName,

      otherName:
        normalizedOtherName,

      surname:
        normalizedSurname,

      fullName,

      name:
        fullName,

      photoUrl,

      rating:
        0,

      online:
        false,

      available:
        true,

      workerProfile,
    };

    /* --------------------------------------------------------
       SAVE WORKER DATA
       
       merge:true preserves all customer data.
    -------------------------------------------------------- */

    await setDoc(
      userRef,
      existingCustomerWorkerPayload,
      {
        merge: true,
      },
    );

    /* --------------------------------------------------------
       SAVE PUBLIC WORKER PROFILE
    -------------------------------------------------------- */

    await syncWorkerPublicProfile(
      workerUid,
      publicProfile,
    );

    /* --------------------------------------------------------
       CANONICAL WORKER MEDIA
    -------------------------------------------------------- */

    await Promise.all([
      setDoc(
        userRef,
        {
          "workerProfile.photoUrl":
            photoUrl,

          "workerProfile.workGallery":
            uploadedWorkGallery,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      ),

      setDoc(
        doc(
          db,
          "workerPublicProfiles",
          workerUid,
        ),
        {
          photoUrl,

          workGallery:
            uploadedWorkGallery,

          "workerProfile.photoUrl":
            photoUrl,

          "workerProfile.workGallery":
            uploadedWorkGallery,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      ),
    ]);

    return {
      success: true,
      uid: workerUid,
    };
  } catch (
    error
  ) {
    console.error(
      "REGISTER_WORKER_ERROR:",
      error,
    );

    throw error;
  }
}