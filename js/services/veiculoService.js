import {addData, getAll, updateData} from "../storage.js"
import {uuid} from "../utils.js"

const STORE = "veiculos"

export const VeiculoService = {

  async listar(){
    return await getAll(STORE)
  },

  async criar(nome, consumo, combustivel){

    const veiculo = {
      id: uuid(),
      nome,
      consumo,
      combustivel,
      kmAtual: 0,
      ativo: false
    }

    await addData(STORE, veiculo)
  },

  async ativar(id){

    const lista = await this.listar()

    for(let v of lista){
      v.ativo = v.id === id
      await updateData(STORE, v)
    }
  }

}