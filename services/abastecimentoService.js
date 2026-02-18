import {Storage} from "../storage.js"
import {uuid} from "../utils.js"

const KEY="abastecimentos"

export const AbastecimentoService={

  listar(){
    return Storage.get(KEY)
  },

  criar({veiculoId,km,litros,valor,cheio}){

    const lista=this.listar()

    lista.push({
      id:uuid(),
      veiculoId,
      km,
      litros,
      valor,
      cheio,
      data:new Date()
    })

    Storage.save(KEY,lista)

  }

}
