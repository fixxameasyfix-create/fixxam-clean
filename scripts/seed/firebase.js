const fs = require("fs");
const path = require("path");

const {
  initializeApp,
  getApps,
  cert,
} = require("firebase-admin/app");

const {
  getFirestore,
} = require("firebase-admin/firestore");

/* ============================================================
   SERVICE ACCOUNT
============================================================ */

const serviceAccountPath = path.resolve(
  process.cwd(),
  "serviceAccountKey.json"
);

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(
    `Firebase service account not found:\n${serviceAccountPath}`
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

/* ============================================================
   VALIDATE CREDENTIALS
============================================================ */

if (
  !serviceAccount.project_id ||
  !serviceAccount.client_email ||
  !serviceAccount.private_key
) {
  throw new Error(
    "Invalid Firebase service account credentials."
  );
}

/* ============================================================
   FIREBASE ADMIN INITIALIZATION
============================================================ */

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId:
            serviceAccount.project_id,

          clientEmail:
            serviceAccount.client_email,

          privateKey:
            serviceAccount.private_key.replace(
              /\\n/g,
              "\n"
            ),
        }),
      });

/* ============================================================
   FIRESTORE
============================================================ */

const db = getFirestore(app);

/* ============================================================
   EXPORT
============================================================ */

module.exports = {
  app,
  db,
};