import { addData, getAll, getByDateRange, updateData } from "../storage.js"
import { auth } from "../firebase.js"
import { criarCorrida } from "../core/index.js"
import { uuid, hoje } from "../utils.js"
import { AppState } from "../state.js"
import { VeiculoService } from "./veiculoService.js"

const KEY = "corridas"

// A corrida em andamento fica só neste aparelho (um por usuário)
function chaveAtiva() {
  return `corridaAtiva:${auth.currentUser?.uid}`
}

function lerAtiva() {
  try {
    return JSON.parse(localStorage.getItem(chaveAtiva()))
  } catch {
    return null
  }
}

export const CorridaService = {

  async listar() {
    return await getAll(KEY)
  },

  async listarPorPeriodo(inicio, fim) {
    return await getByDateRange(KEY, "data", inicio, fim)
  },

  obterAtiva() {
    return lerAtiva()
  },

  async iniciar(kmInicial) {
    const veiculo = await VeiculoService.obterAtivo()
    if (!veiculo) throw new Error("Cadastre e ative um veículo antes de iniciar uma corrida")
    if (lerAtiva()) throw new Error("Já existe uma corrida em andamento")

    const corrida = {
      id: uuid(),
      veiculoId: veiculo.id,
      kmInicial: kmInicial ?? veiculo.kmAtual,
      dataInicio: hoje()
    }

    localStorage.setItem(chaveAtiva(), JSON.stringify(corrida))
    AppState.corridaAtiva = corrida
    return corrida
  },

  async finalizar(kmFinal, valor) {
    const ativa = lerAtiva()
    if (!ativa) throw new Error("Nenhuma corrida em andamento")

    // criarCorrida valida km e valor (lança erro se estiver errado)
    const corrida = criarCorrida({
      id: ativa.id,
      veiculoId: ativa.veiculoId,
      kmInicial: ativa.kmInicial,
      kmFinal,
      valor,
      data: ativa.dataInicio
    })
    corrida.dataFim = hoje()

    await addData(KEY, corrida)
    await this.atualizarKmVeiculo(corrida)

    localStorage.removeItem(chaveAtiva())
    AppState.corridaAtiva = null
    return corrida
  },

  cancelar() {
    localStorage.removeItem(chaveAtiva())
    AppState.corridaAtiva = null
  },

  async atualizarKmVeiculo(corrida) {
    const lista = await VeiculoService.listar()
    const veiculo = lista.find(v => v.id === corrida.veiculoId)
    if (!veiculo) return

    veiculo.kmAtual = corrida.kmFinal
    await updateData("veiculos", veiculo)
  }

}
