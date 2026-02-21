const DB_NAME = "motoGestorDB"
const DB_VERSION = 1

let db = null

export function initDB(){

  return new Promise((resolve, reject)=>{

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject("Erro ao abrir banco")

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event)=>{
      db = event.target.result

      if(!db.objectStoreNames.contains("veiculos")){
        db.createObjectStore("veiculos", { keyPath:"id" })
      }

      if(!db.objectStoreNames.contains("corridas")){
        db.createObjectStore("corridas", { keyPath:"id" })
      }

      if(!db.objectStoreNames.contains("manutencoes")){
        db.createObjectStore("manutencoes", { keyPath:"id" })
      }

      if(!db.objectStoreNames.contains("abastecimentos")){
        db.createObjectStore("abastecimentos", { keyPath:"id" })
      }
    }

  })
}

export function addData(storeName, data){

  return new Promise((resolve, reject)=>{

    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    const request = store.add(data)

    request.onsuccess = ()=> resolve(true)
    request.onerror = ()=> reject("Erro ao adicionar")
  })
}

export function getAll(storeName){

  return new Promise((resolve, reject)=>{

    const transaction = db.transaction(storeName, "readonly")
    const store = transaction.objectStore(storeName)

    const request = store.getAll()

    request.onsuccess = ()=> resolve(request.result)
    request.onerror = ()=> reject("Erro ao buscar")
  })
}

export function updateData(storeName, data){

  return new Promise((resolve, reject)=>{

    const transaction = db.transaction(storeName, "readwrite")
    const store = transaction.objectStore(storeName)

    const request = store.put(data)

    request.onsuccess = ()=> resolve(true)
    request.onerror = ()=> reject("Erro ao atualizar")
  })
}