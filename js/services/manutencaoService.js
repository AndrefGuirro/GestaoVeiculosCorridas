import { addData, getAll, getByField, getByDateRange, updateData, deleteData } from "../storage.js"
import { criarManutencao, realizarManutencao, criarServico, editarServico } from "../core/index.js"
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

  // O odômetro do veículo só avança (um km menor que o atual não o diminui)
  async avancarOdometro(veiculoId, km) {
    const veiculos = await VeiculoService.listar()
    const veiculo = veiculos.find(v => v.id === veiculoId)
    if (!veiculo || !(km > (veiculo.kmAtual || 0))) return

    veiculo.kmAtual = km
    await updateData("veiculos", veiculo)
    if (veiculo.ativo) AppState.veiculoAtivo = veiculo
  },

  // Registra uma manutenção feita. Se o veículo já tem um item com esse nome, o ciclo dele recomeça
  // a partir do km informado; se não tem, o item é criado. A vez fica sempre guardada no histórico.
  async criar({ veiculoId, tipo, valor = 0, kmReferencia = 0, intervaloKm = null }) {
    const novo = criarManutencao({ veiculoId, tipo, valor, kmReferencia, intervaloKm })
    const existentes = await this.listarDoVeiculo(veiculoId)
    const antigo = existentes.find(m => m.tipo.toLowerCase() === novo.tipo.toLowerCase())

    // Sem intervalo informado, mantém o que o item já tinha
    const item = antigo
      ? { ...realizarManutencao(antigo, { km: kmReferencia, valor }), intervaloKm: intervaloKm ?? antigo.intervaloKm }
      : novo

    const servico = criarServico({
      veiculoId,
      manutencaoId: item.id,
      tipo: item.tipo,
      km: kmReferencia,
      valor,
      data: item.dataUltima
    })

    await addData(HISTORICO, servico)
    await addData(KEY, item)
    await this.avancarOdometro(veiculoId, kmReferencia)
    return item
  },

  // Deixa o item igual ao registro mais recente do histórico (km, valor, data e nome).
  // Sem nenhum registro sobrando, o item também é apagado.
  async sincronizarItem(manutencaoId) {
    const itens = await getAll(KEY)
    const item = itens.find(m => m.id === manutencaoId)
    if (!item) return

    const registros = (await getByField(HISTORICO, "manutencaoId", manutencaoId))
      .sort((a, b) => b.data.localeCompare(a.data) || b.km - a.km)

    if (registros.length === 0) return await deleteData(KEY, manutencaoId)

    const ultimo = registros[0]
    await updateData(KEY, { ...item, tipo: ultimo.tipo, kmReferencia: ultimo.km, valor: ultimo.valor, dataUltima: ultimo.data })
  },

  // Corrige um registro do histórico e acerta o item e o odômetro
  async editarServico(servico, campos) {
    const atualizado = editarServico(servico, campos)
    await updateData(HISTORICO, atualizado)
    await this.sincronizarItem(servico.manutencaoId)
    await this.avancarOdometro(servico.veiculoId, atualizado.km)
    return atualizado
  },

  // Apaga um registro do histórico e acerta o item
  async excluirServico(servico) {
    await deleteData(HISTORICO, servico.id)
    await this.sincronizarItem(servico.manutencaoId)
  },

  // Apaga só o item da lista de controle; o histórico continua guardado
  async excluir(id) {
    await deleteData(KEY, id)
  }

}
