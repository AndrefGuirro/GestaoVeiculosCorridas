import { auth, db } from "./firebase.js"
import { collection, doc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"

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

export async function updateData(storeName, data){
  const ref = doc(getCollectionRef(storeName), data.id)
  await setDoc(ref, data)
  return true
}

export async function saveUserProfile(profile){
  const ref = userDocRef()
  await setDoc(ref, { profile, updatedAt: new Date().toISOString() }, { merge: true })
}
