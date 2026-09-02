import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

import { onRequest } from "firebase-functions/v2/https";
import { Resend } from "resend";

dotenv.config();

admin.initializeApp();

const resend = new Resend(
  process.env.RESEND_API_KEY ?? "",
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
  bookingNotifications,
} from "./notifications/bookingNotifications";



/* ============================================================
   MARKET ORDER NOTIFICATIONS
============================================================ */

export {
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