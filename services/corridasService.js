import {Storage} from "../storage.js"
import {uuid,hoje} from "../utils.js"
import {AppState} from "../state.js"
import {VeiculoService} from "./veiculoService.js"

const KEY="corridas"

export const CorridaService = {

  listar(){
    return Storage.get(KEY)
  },

  iniciar(kmInicial){

    AppState.corridaAtiva={
      id:uuid(),
      veiculoId:AppState.veiculoAtivo.id,
      kmInicial,
      dataInicio:hoje()
    }

    localStorage.setItem("corridaAtiva",
      JSON.stringify(AppState.corridaAtiva)
    )
  },

  finalizar(kmFinal,valor){

    const corrida = JSON.parse(localStorage.getItem("corridaAtiva"))

    if(kmFinal <= corrida.kmInicial)
      throw "KM inválido"

    corrida.kmFinal=kmFinal
    corrida.valor=valor
    corrida.distancia=kmFinal-corrida.kmInicial
    corrida.dataFim=hoje()

    const lista=this.listar()
    lista.push(corrida)

    Storage.save(KEY,lista)

    this.atualizarKmVeiculo(corrida)

    localStorage.removeItem("corridaAtiva")

  },

  atualizarKmVeiculo(corrida){

    const lista=VeiculoService.listar()

    const v = lista.find(v=>v.id===corrida.veiculoId)
    v.kmAtual = corrida.kmFinal

    Storage.save("veiculos",lista)

  }

}
