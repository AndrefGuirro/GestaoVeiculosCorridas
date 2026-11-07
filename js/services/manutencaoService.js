import { addData, getAll, updateData } from "../storage.js"
import { criarManutencao } from "../core/index.js"
import { hoje } from "../utils.js"

const KEY = "manutencoes"

export const ManutencaoService = {

  async listar() {
    return await getAll(KEY)
  },

  async criar({ veiculoId, tipo, valor, kmReferencia, intervaloKm }) {
    const manutencao = criarManutencao({ veiculoId, tipo, valor, kmReferencia, intervaloKm })
    await addData(KEY, manutencao)
    return manutencao
  },

  // Ao realizar a manutenção, o ciclo recomeça a partir do km informado
  async marcarRealizada(id, kmAtual) {
    const lista = await this.listar()
    const m = lista.find(x => x.id === id)
    if (!m) return

    m.status = "ok"
    m.kmReferencia = kmAtual
    m.dataUltima = hoje()

    await updateData(KEY, m)
  }

}
