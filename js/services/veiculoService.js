import {Storage} from "../storage.js"
import {uuid} from "../utils.js"
import {AppState} from "../state.js"

const KEY="veiculos"

export const VeiculoService = {

  listar(){
    return Storage.get(KEY)
  },

  criar(nome, consumo, combustivel){

    const lista = this.listar()

    const veiculo={
      id:uuid(),
      nome,
      consumo,
      combustivel,
      kmAtual:0,
      ativo:false
    }

    lista.push(veiculo)
    Storage.save(KEY, lista)

  },

  ativar(id){

    const lista=this.listar()

    lista.forEach(v=>{
      v.ativo = v.id===id
      if(v.ativo) AppState.veiculoAtivo=v
    })

    Storage.save(KEY,lista)

  }

}
