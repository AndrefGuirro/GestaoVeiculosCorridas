import { addData, getAll, updateData } from "../storage.js"
import { uuid, hoje } from "../utils.js"
import { AppState } from "../state.js"
import { VeiculoService } from "./veiculoService.js"

const KEY = "corridas"

export const CorridaService = {

  async listar() {
    return await getAll(KEY)
  },

  iniciar(kmInicial) {

    AppState.corridaAtiva = {
      id: uuid(),
      veiculoId: AppState.veiculoAtivo.id,
      kmInicial,
      dataInicio: hoje()
    }

    localStorage.setItem(
      "corridaAtiva",
      JSON.stringify(AppState.corridaAtiva)
    )
  },

  async finalizar(kmFinal, valor) {

    const corrida = JSON.parse(localStorage.getItem("corridaAtiva"))

    if (!corrida) throw "Nenhuma corrida ativa"

    if (kmFinal <= corrida.kmInicial)
      throw "KM inválido"

    corrida.kmFinal = kmFinal
    corrida.valor = valor
    corrida.distancia = kmFinal - corrida.kmInicial
    corrida.dataFim = hoje()

    // 🔹 salva corrida no IndexedDB
    await addData(KEY, corrida)

    // 🔹 atualiza km do veículo
    await this.atualizarKmVeiculo(corrida)

    localStorage.removeItem("corridaAtiva")
  },

  async atualizarKmVeiculo(corrida) {

    const lista = await VeiculoService.listar()

    const v = lista.find(v => v.id === corrida.veiculoId)

    if (!v) return

    v.kmAtual = corrida.kmFinal

    // 🔹 usa updateData agora (não existe mais Storage.save)
    await updateData("veiculos", v)
  }

}