export {
  getAuth,
  onAuthStateChanged,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,

  fetchSignInMethodsForEmail,

  signOut,
  sendPasswordResetEmail,

  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,

  updateProfile,
} from "firebase/auth";