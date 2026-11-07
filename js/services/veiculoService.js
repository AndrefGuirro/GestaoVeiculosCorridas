import { addData, getAll, updateData } from "../storage.js"
import { criarVeiculo, ativarVeiculo } from "../core/index.js"
import { AppState } from "../state.js"

const STORE = "veiculos"

export const VeiculoService = {

  async listar() {
    return await getAll(STORE)
  },

  async criar({ nome, combustivel, mediaConsumo = null, kmAtual = 0 }) {
    const lista = await this.listar()
    const veiculo = criarVeiculo({ nome, combustivel, mediaConsumo, kmAtual })

    // O primeiro veículo cadastrado já nasce como o veículo ativo
    if (lista.length === 0) veiculo.ativo = true

    await addData(STORE, veiculo)

    if (veiculo.ativo) AppState.veiculoAtivo = veiculo
    return veiculo
  },

  async ativar(id) {
    const lista = await this.listar()
    const atualizados = ativarVeiculo(lista, id)

    // Só grava os veículos que realmente mudaram
    for (const novo of atualizados) {
      const antigo = lista.find(v => v.id === novo.id)
      if (antigo.ativo !== novo.ativo) await updateData(STORE, novo)
    }

    AppState.veiculoAtivo = atualizados.find(v => v.ativo) || null
  },

  async obterAtivo() {
    const lista = await this.listar()
    const ativo = lista.find(v => v.ativo) || null
    AppState.veiculoAtivo = ativo
    return ativo
  }

}
