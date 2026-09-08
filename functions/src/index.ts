import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

import {
  HttpsError,
  onCall,
  onRequest,
} from "firebase-functions/v2/https";

import {
  defineSecret,
  defineString,
} from "firebase-functions/params";

import {
  AccessToken,
  TrackSource,
} from "livekit-server-sdk";

import { Resend } from "resend";

dotenv.config();

admin.initializeApp();

const resend = new Resend(
  process.env.RESEND_API_KEY ?? "",
);

/* ============================================================
   LIVEKIT
============================================================ */

/**
 * LiveKit credentials stay on Firebase Functions only.
 *
 * Never expose these values inside the React Native app.
 */
const LIVEKIT_API_KEY =
  defineSecret(
    "LIVEKIT_API_KEY",
  );

const LIVEKIT_API_SECRET =
  defineSecret(
    "LIVEKIT_API_SECRET",
  );

/**
 * Example:
 *
 * wss://your-project.livekit.cloud
 *
 * This is configuration, not a secret.
 */
const LIVEKIT_URL =
  defineString(
    "LIVEKIT_URL",
  );

const LIVEKIT_TOKEN_TTL_SECONDS =
  5 * 60;

type FixxamCallRole =
  | "customer"
  | "worker";

type FixxamCallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "failed";

type LiveKitCallTokenRequest = {
  callId?: unknown;
};

function cleanLiveKitString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isFixxamCallRole(
  value: unknown,
): value is FixxamCallRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

function isFixxamCallStatus(
  value: unknown,
): value is FixxamCallStatus {
  return (
    value === "ringing" ||
    value === "accepted" ||
    value === "connected" ||
    value === "declined" ||
    value === "missed" ||
    value === "ended" ||
    value === "failed"
  );
}

/* ============================================================
   GET LIVEKIT CALL TOKEN
============================================================ */

/**
 * Secure authenticated endpoint used by both:
 *
 * - customer
 * - worker
 *
 * Requirements:
 *
 * - Firebase Auth user must exist
 * - calls/{callId} must exist
 * - user must be caller or callee
 * - call must be accepted/connected
 *
 * Permissions:
 *
 * - join this room only
 * - publish microphone only
 * - subscribe to remote audio
 */
export const getLiveKitCallToken =
  onCall(
    {
      secrets: [
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET,
      ],

      timeoutSeconds: 15,

      memory: "256MiB",
    },

    async (request) => {
      /* ======================================================
         AUTH
      ====================================================== */

      const userId =
        cleanLiveKitString(
          request.auth?.uid,
        );

      if (!userId) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in to join a Fixxam call.",
        );
      }

      /* ======================================================
         CALL ID
      ====================================================== */

      const requestData =
        request.data as
          | LiveKitCallTokenRequest
          | undefined
          | null;

      const callId =
        cleanLiveKitString(
          requestData?.callId,
        );

      if (
        !callId ||
        callId.length > 128 ||
        callId.includes("/")
      ) {
        throw new HttpsError(
          "invalid-argument",
          "A valid callId is required.",
        );
      }

      /* ======================================================
         LOAD CALL
      ====================================================== */

      const callSnapshot =
        await admin
          .firestore()
          .collection("calls")
          .doc(callId)
          .get();

      if (!callSnapshot.exists) {
        throw new HttpsError(
          "not-found",
          "This call is no longer available.",
        );
      }

      const call =
        callSnapshot.data();

      if (!call) {
        throw new HttpsError(
          "internal",
          "Call information is unavailable.",
        );
      }

      /* ======================================================
         PARTICIPANTS
      ====================================================== */

      const callerId =
        cleanLiveKitString(
          call.callerId,
        );

      const calleeId =
        cleanLiveKitString(
          call.calleeId,
        );

      if (
        !callerId ||
        !calleeId
      ) {
        console.error(
          "FIXXAM_LIVEKIT_INVALID_CALL_PARTICIPANTS:",
          {
            callId,
          },
        );

        throw new HttpsError(
          "internal",
          "Call participant information is invalid.",
        );
      }

      /* ======================================================
         ROLES
      ====================================================== */

      if (
        !isFixxamCallRole(
          call.callerRole,
        ) ||
        !isFixxamCallRole(
          call.calleeRole,
        )
      ) {
        console.error(
          "FIXXAM_LIVEKIT_INVALID_CALL_ROLES:",
          {
            callId,
          },
        );

        throw new HttpsError(
          "internal",
          "Call role information is invalid.",
        );
      }

      /* ======================================================
         AUTHORIZATION
      ====================================================== */

      const isCaller =
        callerId === userId;

      const isCallee =
        calleeId === userId;

      if (
        !isCaller &&
        !isCallee
      ) {
        throw new HttpsError(
          "permission-denied",
          "You are not a participant in this call.",
        );
      }

      const participantRole:
        FixxamCallRole =
        isCaller
          ? call.callerRole
          : call.calleeRole;

      /* ======================================================
         STATUS
      ====================================================== */

      if (
        !isFixxamCallStatus(
          call.status,
        )
      ) {
        throw new HttpsError(
          "internal",
          "Call status is invalid.",
        );
      }

      const callStatus =
        call.status;

      /*
       * Do not allow either side into LiveKit
       * before the recipient accepts the call.
       *
       * "connected" is permitted for reconnects.
       */
      if (
        callStatus !== "accepted" &&
        callStatus !== "connected"
      ) {
        if (
          callStatus === "ringing"
        ) {
          throw new HttpsError(
            "failed-precondition",
            "The call has not been accepted yet.",
          );
        }

        throw new HttpsError(
          "failed-precondition",
          "This call is no longer active.",
        );
      }

      /* ======================================================
         LIVEKIT CONFIG
      ====================================================== */

      const apiKey =
        LIVEKIT_API_KEY
          .value()
          .trim();

      const apiSecret =
        LIVEKIT_API_SECRET
          .value()
          .trim();

      const liveKitUrl =
        LIVEKIT_URL
          .value()
          .trim()
          .replace(
            /\/+$/,
            "",
          );

      if (
        !apiKey ||
        !apiSecret
      ) {
        console.error(
          "FIXXAM_LIVEKIT_CREDENTIALS_MISSING",
        );

        throw new HttpsError(
          "internal",
          "Voice calling is temporarily unavailable.",
        );
      }

      if (
        !liveKitUrl.startsWith(
          "wss://",
        )
      ) {
        console.error(
          "FIXXAM_LIVEKIT_URL_INVALID",
        );

        throw new HttpsError(
          "internal",
          "Voice calling is temporarily unavailable.",
        );
      }

      /* ======================================================
         ROOM
      ====================================================== */

      /*
       * Firestore call ID is already opaque.
       *
       * Do not use customer/worker:
       *
       * - name
       * - email
       * - phone number
       *
       * in LiveKit identity or room name.
       */
      const roomName =
        `fixxam_call_${callId}`;

      /*
       * Only two identities are needed inside
       * each private one-to-one call room.
       */
      const identity =
        isCaller
          ? "caller"
          : "callee";

      /* ======================================================
         TOKEN
      ====================================================== */

      const accessToken =
        new AccessToken(
          apiKey,
          apiSecret,
          {
            identity,

            ttl:
              LIVEKIT_TOKEN_TTL_SECONDS,
          },
        );

      accessToken.addGrant({
        roomJoin: true,

        room:
          roomName,

        /*
         * Required when using
         * canPublishSources.
         */
        canPublish: true,

        /*
         * Voice-only:
         *
         * no camera
         * no screen sharing
         */
        canPublishSources: [
          TrackSource.MICROPHONE,
        ],

        /*
         * Allow listening to the other
         * call participant.
         */
        canSubscribe: true,

        /*
         * No arbitrary data publishing
         * is needed for Fixxam voice.
         */
        canPublishData: false,

        canUpdateOwnMetadata: false,
      });

      const token =
        await accessToken.toJwt();

      console.log(
        "FIXXAM_LIVEKIT_CALL_TOKEN_ISSUED:",
        {
          callId,

          participantRole,

          callStatus,
        },
      );

      return {
        token,

        url:
          liveKitUrl,

        roomName,

        participantRole,

        expiresInSeconds:
          LIVEKIT_TOKEN_TTL_SECONDS,
      };
    },
  );

/* ============================================================
   AI
============================================================ */

export {
  customerAiV2,
} from "./ai/customer-ai";

export {
  customerAi,
  fixYourselfAi,
} from "./ai";

/* ============================================================
   AI BOOKING
============================================================ */

export {
  aiBookingResolve,
} from "./ai-booking";

/* ============================================================
   AI SEARCH
============================================================ */

export {
  aiSearchHelper,
} from "./ai-search-helper";

/* ============================================================
   REWARDS
============================================================ */

export {
  get90DayRewardStatus,
  claim90DayReward,
} from "./rewards/90DayReward";

export {
  getServicePromotionStatus,
  claimServicePromotionReward,
} from "./rewards/ServicePromotion";

/* ============================================================
   BOOKINGS
============================================================ */

export {
  onBookingCompleted,
} from "./bookings/onBookingCompleted";

/* ============================================================
   WORKER LOCATION
============================================================ */

export {
  syncWorkerLocation,
} from "./workers/syncWorkerLocation";

export {
  backfillWorkerGeohashes,
} from "./workers/backfillWorkerGeohashes";

/* ============================================================
   SERVICE REQUEST
============================================================ */

export {
  sendServiceRequest,
} from "./serviceRequests/sendServiceRequest";

/* ============================================================
   CUSTOMER PUSH NOTIFICATIONS
============================================================ */

export {
  bookingCreatedNotifications,
  bookingNotifications,
} from "./notifications/bookingNotifications";

/* ============================================================
   MARKET ORDER NOTIFICATIONS
============================================================ */

export {
  marketOrderCreatedNotifications,
  marketOrderNotifications,
} from "./notifications/marketOrderNotifications";

/* ============================================================
   PASSWORD RESET OTP
============================================================ */

export const sendPasswordResetOtp =
  onRequest(
    {
      invoker: "public",
    },
    async (req, res) => {
      try {
        const { email } =
          req.body;

        if (!email) {
          res.status(400).json({
            success: false,
            message:
              "Email is required",
          });

          return;
        }

        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();

        const otp =
          Math.floor(
            100000 +
              Math.random() *
                900000,
          ).toString();

        await admin
          .firestore()
          .collection(
            "password_reset_otps",
          )
          .doc(
            normalizedEmail,
          )
          .set({
            email:
              normalizedEmail,

            otp,

            expiresAt:
              Date.now() +
              5 * 60 * 1000,

            createdAt:
              admin.firestore
                .FieldValue
                .serverTimestamp(),
          });

        const result =
          await resend.emails.send({
            from:
              "Fixxam <noreply@fixxamapp.com>",

            to:
              normalizedEmail,

            subject:
              "Fixxam Password Reset OTP",

            html: `
              <div style="font-family:sans-serif">
                <h2>Password Reset</h2>

                <p>Your OTP code is:</p>

                <h1>${otp}</h1>

                <p>
                  This code expires in 5 minutes.
                </p>
              </div>
            `,
          });

        console.log(
          "FIXXAM_PASSWORD_RESET_OTP_SENT:",
          result,
        );

        res.json({
          success: true,
        });
      } catch (error) {
        console.error(
          "FIXXAM_SEND_PASSWORD_RESET_OTP_ERROR:",
          error,
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to send OTP",
        });
      }
    },
  );

/* ============================================================
   SIGNUP EMAIL OTP
============================================================ */

export const sendSignupEmailOtp =
  onRequest(
    {
      invoker: "public",
    },
    async (req, res) => {
      try {
        const { identifier } =
          req.body;

        if (!identifier) {
          res.status(400).json({
            success: false,
            message:
              "Email or phone number is required",
          });

          return;
        }

        const cleanIdentifier =
          String(identifier)
            .trim()
            .toLowerCase();

        const isEmail =
          cleanIdentifier.includes(
            "@",
          );

        if (!isEmail) {
          res.status(400).json({
            success: false,
            message:
              "Password reset by phone is not available yet.",
          });

          return;
        }

        const email =
          cleanIdentifier;

        const otp =
          Math.floor(
            100000 +
              Math.random() *
                900000,
          ).toString();

        await admin
          .firestore()
          .collection(
            "signup_email_otps",
          )
          .doc(email)
          .set({
            email,

            otp,

            expiresAt:
              Date.now() +
              5 * 60 * 1000,

            createdAt:
              admin.firestore
                .FieldValue
                .serverTimestamp(),
          });

        await resend.emails.send({
          from:
            "Fixxam <noreply@fixxamapp.com>",

          to: email,

          subject:
            "Fixxam Email Verification",

          html: `
            <div style="font-family:sans-serif">
              <h2>Email Verification</h2>

              <p>Your OTP Code:</p>

              <h1>${otp}</h1>

              <p>
                Expires in 5 minutes.
              </p>
            </div>
          `,
        });

        res.json({
          success: true,
        });
      } catch (error) {
        console.error(
          "FIXXAM_SEND_SIGNUP_OTP_ERROR:",
          error,
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to send OTP",
        });
      }
    },
  );

/* ============================================================
   VERIFY SIGNUP EMAIL OTP
============================================================ */

export const verifySignupEmailOtp =
  onRequest(
    {
      invoker: "public",
    },
    async (req, res) => {
      try {
        const {
          email,
          otp,
        } = req.body;

        if (!email || !otp) {
          res.status(400).json({
            success: false,
            message:
              "Email and OTP required",
          });

          return;
        }

        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();

        const normalizedOtp =
          String(otp).trim();

        const otpDoc =
          await admin
            .firestore()
            .collection(
              "signup_email_otps",
            )
            .doc(
              normalizedEmail,
            )
            .get();

        if (!otpDoc.exists) {
          res.status(404).json({
            success: false,
            message:
              "OTP not found",
          });

          return;
        }

        const data =
          otpDoc.data();

        if (!data) {
          res.status(404).json({
            success: false,
            message:
              "OTP data missing",
          });

          return;
        }

        if (
          typeof data.expiresAt !==
            "number" ||
          Date.now() >
            data.expiresAt
        ) {
          res.status(400).json({
            success: false,
            message:
              "OTP expired",
          });

          return;
        }

        if (
          String(data.otp) !==
          normalizedOtp
        ) {
          res.status(400).json({
            success: false,
            message:
              "Invalid OTP",
          });

          return;
        }

        await admin
          .firestore()
          .collection(
            "signup_email_otps",
          )
          .doc(
            normalizedEmail,
          )
          .delete();

        res.json({
          success: true,
          message:
            "Email verified",
        });
      } catch (error) {
        console.error(
          "FIXXAM_VERIFY_SIGNUP_OTP_ERROR:",
          error,
        );

        res.status(500).json({
          success: false,
          message:
            "Verification failed",
        });
      }
    },
  );

/* ============================================================
   VERIFY PASSWORD RESET OTP
============================================================ */

export const verifyPasswordResetOtp =
  onRequest(
    {
      invoker: "public",
    },
    async (req, res) => {
      try {
        const {
          email,
          otp,
        } = req.body;

        if (!email || !otp) {
          res.status(400).json({
            success: false,
            message:
              "Email and OTP are required",
          });

          return;
        }

        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();

        const normalizedOtp =
          String(otp).trim();

        const otpDoc =
          await admin
            .firestore()
            .collection(
              "password_reset_otps",
            )
            .doc(
              normalizedEmail,
            )
            .get();

        if (!otpDoc.exists) {
          res.status(404).json({
            success: false,
            message:
              "OTP record not found",
          });

          return;
        }

        const otpData =
          otpDoc.data();

        if (!otpData) {
          res.status(404).json({
            success: false,
            message:
              "OTP data missing",
          });

          return;
        }

        if (
          typeof otpData.expiresAt !==
            "number" ||
          Date.now() >
            otpData.expiresAt
        ) {
          res.status(400).json({
            success: false,
            message:
              "OTP has expired",
          });

          return;
        }

        if (
          String(
            otpData.otp,
          ) !== normalizedOtp
        ) {
          res.status(400).json({
            success: false,
            message:
              "Invalid OTP",
          });

          return;
        }

        await admin
          .firestore()
          .collection(
            "password_reset_otps",
          )
          .doc(
            normalizedEmail,
          )
          .delete();

        res.json({
          success: true,
          message:
            "OTP verified successfully",
        });
      } catch (error) {
        console.error(
          "FIXXAM_VERIFY_PASSWORD_RESET_OTP_ERROR:",
          error,
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to verify OTP",
        });
      }
    },
  );

/* ============================================================
   RESET PASSWORD
============================================================ */

export const resetPassword =
  onRequest(
    {
      invoker: "public",
    },
    async (req, res) => {
      try {
        const {
          email,
          password,
        } = req.body;

        if (
          !email ||
          !password
        ) {
          res.status(400).json({
            success: false,
            message:
              "Email and password are required",
          });

          return;
        }

        const normalizedEmail =
          String(email)
            .trim()
            .toLowerCase();

        const cleanPassword =
          String(password);

        if (
          cleanPassword.length <
          8
        ) {
          res.status(400).json({
            success: false,
            message:
              "Password must be at least 8 characters.",
          });

          return;
        }

        const user =
          await admin
            .auth()
            .getUserByEmail(
              normalizedEmail,
            );

        await admin
          .auth()
          .updateUser(
            user.uid,
            {
              password:
                cleanPassword,
            },
          );

        await admin
          .firestore()
          .collection(
            "password_reset_otps",
          )
          .doc(
            normalizedEmail,
          )
          .delete();

        res.json({
          success: true,
          message:
            "Password updated successfully",
        });
      } catch (error) {
        console.error(
          "FIXXAM_RESET_PASSWORD_ERROR:",
          error,
        );

        res.status(500).json({
          success: false,
          message:
            "Failed to update password",
        });
      }
    },
  );