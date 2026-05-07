import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { firebaseConfig } from "./firebaseConfig.js"

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
let recaptchaVerifier = null

export function initFirebase() {
  return Promise.resolve(app)
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function signInWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  return await signOut(auth)
}

export function initRecaptcha(containerId) {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: "invisible",
      callback: () => {}
    }, auth)
  }
  return recaptchaVerifier
}

export async function sendPhoneVerification(phoneNumber) {
  const verifier = initRecaptcha("recaptcha-container")
  await verifier.render()
  return await signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export async function confirmPhoneCode(confirmationResult, code) {
  return await confirmationResult.confirm(code)
}
