import { addData, getAll, getByField, getByDateRange, updateData, deleteData } from "../storage.js"
import { criarManutencao, realizarManutencao, criarServico } from "../core/index.js"
import { VeiculoService } from "./veiculoService.js"
import { AppState } from "../state.js"

const KEY = "manutencoes"
const HISTORICO = "historicoManutencoes"

export const ManutencaoService = {

  async listar() {
    return await getAll(KEY)
  },

  async listarDoVeiculo(veiculoId) {
    return await getByField(KEY, "veiculoId", veiculoId)
  },

  // Histórico de todos os veículos (cada manutenção feita fica registrada aqui)
  async listarHistorico() {
    return await getAll(HISTORICO)
  },

  // Histórico só do período (mês), para gastar menos leituras no Firestore
  async listarHistoricoPorPeriodo(inicio, fim) {
    return await getByDateRange(HISTORICO, "data", inicio, fim)
  },

  // Cadastra o item de manutenção e já registra no histórico a primeira vez em que foi feita
  async criar({ veiculoId, tipo, valor = 0, kmReferencia = 0, intervaloKm = null }) {
    const manutencao = criarManutencao({ veiculoId, tipo, valor, kmReferencia, intervaloKm })
    const servico = criarServico({
      veiculoId,
      manutencaoId: manutencao.id,
      tipo: manutencao.tipo,
      km: kmReferencia,
      valor,
      data: manutencao.dataUltima
    })
    await addData(KEY, manutencao)
    await addData(HISTORICO, servico)
    return manutencao
  },

  // Ao realizar a manutenção, o ciclo recomeça a partir do km informado e a vez fica registrada no histórico.
  // Se esse km for maior que o do odômetro, o odômetro do veículo avança junto.
  async marcarRealizada(manutencao, { km, valor = null }) {
    const atualizada = realizarManutencao(manutencao, { km, valor })
    const servico = criarServico({
      veiculoId: manutencao.veiculoId,
      manutencaoId: manutencao.id,
      tipo: manutencao.tipo,
      km,
      valor: valor ?? 0,
      data: atualizada.dataUltima
    })
    await addData(HISTORICO, servico)
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
