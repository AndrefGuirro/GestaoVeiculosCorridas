import {Storage} from "../storage.js"
import {uuid} from "../utils.js"

const KEY="manutencoes"

export const ManutencaoService={

  listar(){
    return Storage.get(KEY)
  },

  criar(tipo,kmIntervalo,valor){

    const lista=this.listar()

    lista.push({
      id:uuid(),
      tipo,
      kmIntervalo,
      valor,
      status:"pendente"
    })

    Storage.save(KEY,lista)

  },

  marcarRealizada(id,kmAtual){

    const lista=this.listar()
    const m = lista.find(x=>x.id===id)

    m.status="realizada"
    m.kmReferencia=kmAtual

    Storage.save(KEY,lista)

  }

}
