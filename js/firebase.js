import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
import { firebaseConfig } from "./firebaseConfig.js"

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

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

// Traduz os códigos de erro do Firebase para mensagens em português
export function mensagemErroAuth(error) {
  const mensagens = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-password": "Digite a senha.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado. Tente entrar.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/operation-not-allowed": "Login por e-mail ainda não está ativado no Firebase."
  }
  return mensagens[error?.code] || "Algo deu errado. Tente novamente."
}
