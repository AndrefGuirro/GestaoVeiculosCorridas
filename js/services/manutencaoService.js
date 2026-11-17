import { addData, getAll, getByField, updateData, deleteData } from "../storage.js"
import { criarManutencao, realizarManutencao } from "../core/index.js"
import { VeiculoService } from "./veiculoService.js"
import { AppState } from "../state.js"

const KEY = "manutencoes"

export const ManutencaoService = {

  async listar() {
    return await getAll(KEY)
  },

  async listarDoVeiculo(veiculoId) {
    return await getByField(KEY, "veiculoId", veiculoId)
  },

  async criar({ veiculoId, tipo, valor = 0, kmReferencia = 0, intervaloKm = null }) {
    const manutencao = criarManutencao({ veiculoId, tipo, valor, kmReferencia, intervaloKm })
    await addData(KEY, manutencao)
    return manutencao
  },

  // Ao realizar a manutenção, o ciclo recomeça a partir do km informado.
  // Se esse km for maior que o do odômetro, o odômetro do veículo avança junto.
  async marcarRealizada(manutencao, { km, valor = null }) {
    const atualizada = realizarManutencao(manutencao, { km, valor })
    await updateData(KEY, atualizada)

    const veiculos = await VeiculoService.listar()
    const veiculo = veiculos.find(v => v.id === manutencao.veiculoId)
    if (veiculo && km > (veiculo.kmAtual || 0)) {
      veiculo.kmAtual = km
      await updateData("veiculos", veiculo)
      if (veiculo.ativo) AppState.veiculoAtivo = veiculo
    }

    return atualizada
  },

  async excluir(id) {
    await deleteData(KEY, id)
  }

}
