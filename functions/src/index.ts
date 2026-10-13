

import * as admin from "firebase-admin";
import crypto from "node:crypto";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { AccessToken, TrackSource } from "livekit-server-sdk";
import { Resend } from "resend";

admin.initializeApp();
const db = admin.firestore();

/* SECRETS */
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const LIVEKIT_API_KEY = defineSecret("LIVEKIT_API_KEY");
const LIVEKIT_API_SECRET = defineSecret("LIVEKIT_API_SECRET");
const LIVEKIT_URL = defineString("LIVEKIT_URL");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;

function normalizeEmail(value: unknown): string { return typeof value === "string" ? value.trim().toLowerCase() : ""; }
function normalizeOtp(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function isValidEmail(email: string): boolean { return email.length > 3 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidOtp(otp: string): boolean { return /^\d{6}$/.test(otp); }
function generateOtp(): string { return crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0"); }
function generateResetToken(): string { return crypto.randomBytes(32).toString("hex"); }
function hashResetToken(token: string): string { return crypto.createHash("sha256").update(token).digest("hex"); }

/* LIVEKIT TYPES */
const LIVEKIT_TOKEN_TTL_SECONDS = 5 * 60;
type FixxamCallRole = "customer" | "worker";
type FixxamCallStatus = "ringing" | "accepted" | "connected" | "declined" | "missed" | "ended" | "failed";
type LiveKitCallTokenRequest = { callId?: unknown; };
function cleanLiveKitString(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function isFixxamCallRole(value: unknown): value is FixxamCallRole { return value === "customer" || value === "worker"; }
function isFixxamCallStatus(value: unknown): value is FixxamCallStatus { return value === "ringing" || value === "accepted" || value === "connected" || value === "declined" || value === "missed" || value === "ended" || value === "failed"; }

/* GET LIVEKIT TOKEN */
export const getLiveKitCallToken = onCall({ secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET], timeoutSeconds: 15, memory: "256MiB", minInstances: 1, cpu: 1, concurrency: 80 }, async (request) => {
  const userId = cleanLiveKitString(request.auth?.uid);
  if (!userId) throw new HttpsError("unauthenticated", "You must be signed in to join a Fixxam call.");
  const requestData = request.data as LiveKitCallTokenRequest | undefined | null;
  const callId = cleanLiveKitString(requestData?.callId);
  if (!callId || callId.length > 128 || callId.includes("/")) throw new HttpsError("invalid-argument", "A valid callId is required.");
  const callSnapshot = await db.collection("calls").doc(callId).get();
  if (!callSnapshot.exists) throw new HttpsError("not-found", "This call is no longer available.");
  const call = callSnapshot.data();
  if (!call) throw new HttpsError("internal", "Call information is unavailable.");
  const callerId = cleanLiveKitString(call.callerId);
  const calleeId = cleanLiveKitString(call.calleeId);
  if (!callerId || !calleeId) throw new HttpsError("internal", "Call participant information is invalid.");
  if (!isFixxamCallRole(call.callerRole) || !isFixxamCallRole(call.calleeRole)) throw new HttpsError("internal", "Call role information is invalid.");
  const isCaller = callerId === userId; const isCallee = calleeId === userId;
  if (!isCaller && !isCallee) throw new HttpsError("permission-denied", "You are not a participant in this call.");
  const participantRole: FixxamCallRole = isCaller ? call.callerRole : call.calleeRole;
  if (!isFixxamCallStatus(call.status)) throw new HttpsError("internal", "Call status is invalid.");
  const callStatus = call.status;
  const canJoinLiveKit = callStatus === "accepted" || callStatus === "connected" || (callStatus === "ringing" && isCaller);
  if (!canJoinLiveKit) { if (callStatus === "ringing") throw new HttpsError("failed-precondition", "The call has not been accepted yet."); throw new HttpsError("failed-precondition", "This call is no longer active."); }
  const apiKey = LIVEKIT_API_KEY.value().trim(); const apiSecret = LIVEKIT_API_SECRET.value().trim(); const liveKitUrl = LIVEKIT_URL.value().trim().replace(/\/+$/, "");
  if (!apiKey || !apiSecret) throw new HttpsError("internal", "Voice calling is temporarily unavailable.");
  if (!liveKitUrl.startsWith("wss://")) throw new HttpsError("internal", "Voice calling is temporarily unavailable.");
  const roomName = `fixxam_call_${callId}`; const identity = isCaller ? "caller" : "callee";
  const accessToken = new AccessToken(apiKey, apiSecret, { identity, ttl: LIVEKIT_TOKEN_TTL_SECONDS });
  accessToken.addGrant({ roomJoin: true, room: roomName, canPublish: true, canPublishSources: [TrackSource.MICROPHONE], canSubscribe: true, canPublishData: false, canUpdateOwnMetadata: false });
  const token = await accessToken.toJwt();
  return { token, url: liveKitUrl, roomName, participantRole, expiresInSeconds: LIVEKIT_TOKEN_TTL_SECONDS };
});

/* AI, BOOKINGS, etc - ka bar su kamar yadda suke */
export { customerAiV2 } from "./ai/customer-ai";
export { customerAi, fixYourselfAi } from "./ai";
export { aiBookingResolve } from "./ai-booking";
export { identifySparePart } from "./spare-parts";
export { aiSearchHelper } from "./ai-search-helper";
export { get90DayRewardStatus, claim90DayReward } from "./rewards/90DayReward";
export { getServicePromotionStatus, claimServicePromotionReward } from "./rewards/ServicePromotion";
export { onBookingCompleted } from "./bookings/onBookingCompleted";
export { setBookingOfferExpiry, expireBookingOffers } from "./bookings/expireBookingOffers";
export { syncWorkerLocation } from "./workers/syncWorkerLocation";
export { backfillWorkerGeohashes } from "./workers/backfillWorkerGeohashes";
export { deleteShop } from "./shops/deleteShop";
export { sendServiceRequest } from "./serviceRequests/sendServiceRequest";
export { bookingCreatedNotifications, bookingNotifications } from "./notifications/bookingNotifications";
export { createWorkerCallContact } from "./calls/createWorkerCallContact";
export { marketOrderCreatedNotifications, marketOrderNotifications } from "./notifications/marketOrderNotifications";
export { shopRequestCreatedNotifications, shopRequestNotifications } from "./notifications/shopRequestNotifications";
export { workerReviewCreated, workerReviewUpdated, workerReviewDeleted } from "./reviews/workerReviewAggregation";
export { onWorkerReviewCreated } from "./reviews/onWorkerReviewCreated";
export { incomingCallNotifications, callStatusNotifications, expireMissedCall } from "./notifications/callNotifications";
export { createWorkerBookingCall } from "./calls/createWorkerBookingCall";
export { syncCompletedJobsFromBookings, syncCompletedJobsFromOrders, syncCompletedJobsFromShopRequests } from "./workers/workerCompletedJobs";
export { expireProductDeals } from "./deals/expireProductDeals";
export { savedWorkerCreatedNotification } from "./saved/savedWorkerNotifications";
export { backfillWorkerCompletedJobs } from "./workers/backfillWorkerCompletedJobs";
export { shopReviewAggregation } from "./reviews/shopReviewAggregation";

/* PASSWORD RESET OTP */
export const sendPasswordResetOtp = onRequest({ invoker: "public", secrets: [RESEND_API_KEY] }, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) { res.status(400).json({ success: false, message: "Email is required." }); return; }
    if (!isValidEmail(email)) { res.status(400).json({ success: false, message: "Please provide a valid email address." }); return; }
    const otp = generateOtp(); const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await db.collection("password_reset_otps").doc(email).set({ email, otpHash, expiresAt: Date.now() + OTP_EXPIRY_MS, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    const resend = new Resend(RESEND_API_KEY.value());
    await resend.emails.send({ from: "Fixxam <onboarding@resend.dev>", to: email, subject: "Fixxam Password Reset OTP", html: `<div style="font-family:sans-serif"><h2>Password Reset</h2><p>Your OTP code is:</p><h1>${otp}</h1><p>This code expires in 5 minutes.</p></div>` });
    console.log("OTP SENT TO", email, "OTP:", otp);
    res.json({ success: true });
  } catch (error) { console.error("FIXXAM_SEND_PASSWORD_RESET_OTP_ERROR:", error); res.status(500).json({ success: false, message: "Failed to send OTP." }); }
});

/* SIGNUP EMAIL OTP */
export const sendSignupEmailOtp = onRequest({ invoker: "public", secrets: [RESEND_API_KEY] }, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.identifier);
    if (!email) { res.status(400).json({ success: false, message: "Email is required." }); return; }
    if (!isValidEmail(email)) { res.status(400).json({ success: false, message: "Please provide a valid email address." }); return; }
    try { await admin.auth().getUserByEmail(email); res.status(409).json({ success: false, code: "ACCOUNT_EXISTS", message: "This email is already registered. Please log in instead." }); return; } catch (error: unknown) { const errorCode = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code) : ""; if (errorCode !== "auth/user-not-found") { console.error("FIXXAM_SIGNUP_EMAIL_ACCOUNT_CHECK_ERROR:", error); res.status(500).json({ success: false, message: "Unable to check this email right now." }); return; } }
    const otp = generateOtp(); const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await db.collection("signup_email_otps").doc(email).set({ email, otpHash, expiresAt: Date.now() + OTP_EXPIRY_MS, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    const resend = new Resend(RESEND_API_KEY.value());
    await resend.emails.send({ from: "Fixxam <onboarding@resend.dev>", to: email, subject: "Fixxam Email Verification", html: `<div style="font-family:sans-serif"><h2>Email Verification</h2><p>Your OTP Code:</p><h1>${otp}</h1><p>Expires in 5 minutes.</p></div>` });
    console.log("OTP SENT TO", email, "OTP:", otp);
    res.json({ success: true });
  } catch (error) { console.error("FIXXAM_SEND_SIGNUP_OTP_ERROR:", error); res.status(500).json({ success: false, message: "Failed to send OTP." }); }
});

export const verifySignupEmailOtp = onRequest({ invoker: "public" }, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email); const otp = normalizeOtp(req.body?.otp);
    if (!email || !otp) { res.status(400).json({ success: false, message: "Email and OTP are required." }); return; }
    if (!isValidEmail(email) || !isValidOtp(otp)) { res.status(400).json({ success: false, message: "Invalid email or OTP." }); return; }
    const otpDoc = await db.collection("signup_email_otps").doc(email).get();
    if (!otpDoc.exists) { res.status(400).json({ success: false, message: "Invalid or expired OTP." }); return; }
    const data = otpDoc.data(); if (!data) { res.status(400).json({ success: false, message: "Invalid or expired OTP." }); return; }
    if (typeof data.expiresAt !== "number" || Date.now() >= data.expiresAt) { await otpDoc.ref.delete(); res.status(400).json({ success: false, message: "OTP has expired." }); return; }
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (data.otpHash !== otpHash) { res.status(400).json({ success: false, message: "Invalid OTP." }); return; }
    await otpDoc.ref.delete(); res.json({ success: true, message: "Email verified." });
  } catch (error) { console.error("FIXXAM_VERIFY_SIGNUP_OTP_ERROR:", error); res.status(500).json({ success: false, message: "Verification failed." }); }
});

export const verifyPasswordResetOtp = onRequest({ invoker: "public" }, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email); const otp = normalizeOtp(req.body?.otp);
    if (!email || !otp) { res.status(400).json({ success: false, message: "Email and OTP are required." }); return; }
    if (!isValidEmail(email) || !isValidOtp(otp)) { res.status(400).json({ success: false, message: "Invalid email or OTP." }); return; }
    const otpDoc = await db.collection("password_reset_otps").doc(email).get();
    if (!otpDoc.exists) { res.status(400).json({ success: false, message: "Invalid or expired OTP." }); return; }
    const data = otpDoc.data(); if (!data) { res.status(400).json({ success: false, message: "Invalid or expired OTP." }); return; }
    if (typeof data.expiresAt !== "number" || Date.now() >= data.expiresAt) { await otpDoc.ref.delete(); res.status(400).json({ success: false, message: "OTP has expired." }); return; }
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (data.otpHash !== otpHash) { res.status(400).json({ success: false, message: "Invalid OTP." }); return; }
    const resetToken = generateResetToken(); const resetTokenHash = hashResetToken(resetToken);
    await db.collection("password_reset_tokens").doc(resetTokenHash).set({ email, expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    await otpDoc.ref.delete(); res.json({ success: true, resetToken, expiresInSeconds: RESET_TOKEN_EXPIRY_MS / 1000 });
  } catch (error) { console.error("FIXXAM_VERIFY_PASSWORD_RESET_OTP_ERROR:", error); res.status(500).json({ success: false, message: "Failed to verify OTP." }); }
});

export const resetPassword = onRequest({ invoker: "public" }, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email); const password = typeof req.body?.password === "string" ? req.body.password : ""; const resetToken = typeof req.body?.resetToken === "string" ? req.body.resetToken.trim() : "";
    if (!email || !password || !resetToken) { res.status(400).json({ success: false, message: "Email, password and reset token are required." }); return; }
    if (!isValidEmail(email)) { res.status(400).json({ success: false, message: "Invalid email address." }); return; }
    if (password.length < 8 || password.length > 128) { res.status(400).json({ success: false, message: "Password must be between 8 and 128 characters." }); return; }
    if (resetToken.length < 32 || resetToken.length > 128) { res.status(400).json({ success: false, message: "Invalid or expired reset token." }); return; }
    const resetTokenHash = hashResetToken(resetToken); const tokenRef = db.collection("password_reset_tokens").doc(resetTokenHash); const tokenSnapshot = await tokenRef.get();
    if (!tokenSnapshot.exists) { res.status(400).json({ success: false, message: "Invalid or expired reset token." }); return; }
    const tokenData = tokenSnapshot.data(); if (!tokenData || tokenData.email !== email || typeof tokenData.expiresAt !== "number" || Date.now() >= tokenData.expiresAt) { await tokenRef.delete(); res.status(400).json({ success: false, message: "Invalid or expired reset token." }); return; }
    const user = await admin.auth().getUserByEmail(email); await admin.auth().updateUser(user.uid, { password }); await tokenRef.delete();
    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) { console.error("FIXXAM_RESET_PASSWORD_ERROR:", error); res.status(500).json({ success: false, message: "Failed to update password." }); }
});