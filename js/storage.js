import { auth, db } from "./firebase.js"
import { collection, doc, getDocs, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"

// Estrutura no Firestore:
//   users/{uid}                      -> perfil do usuário
//   users/{uid}/veiculos/{id}
//   users/{uid}/corridas/{id}
//   users/{uid}/manutencoes/{id}
//   users/{uid}/abastecimentos/{id}
// Cada usuário só enxerga os próprios dados (veja as regras no Firebase).
const USERS_COLLECTION = "users"

function getUserId(){
  const user = auth.currentUser
  if(!user) throw new Error("Usuário não autenticado")
  return user.uid
}

function userDocRef(){
  return doc(db, USERS_COLLECTION, getUserId())
}

function getCollectionRef(storeName){
  return collection(userDocRef(), storeName)
}

export async function addData(storeName, data){
  const ref = doc(getCollectionRef(storeName), data.id)
  await setDoc(ref, data)
  return true
}

export async function getAll(storeName){
  const snapshot = await getDocs(getCollectionRef(storeName))
  return snapshot.docs.map(doc => doc.data())
}

// Busca só os registros cujo campo de data (texto ISO) está entre dois instantes.
// Lê menos documentos do que getAll, o que economiza a cota gratuita do Firestore.
export async function getByDateRange(storeName, campo, inicio, fim){
  const q = query(
    getCollectionRef(storeName),
    where(campo, ">=", inicio.toISOString()),
    where(campo, "<=", fim.toISOString())
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data())
}

export async function updateData(storeName, data){
  const ref = doc(getCollectionRef(storeName), data.id)
  await setDoc(ref, data)
  return true
}

export async function saveUserProfile(profile){
  const ref = userDocRef()
  await setDoc(ref, { profile, updatedAt: new Date().toISOString() }, { merge: true })
}
