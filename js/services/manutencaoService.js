import { addData, getAll, updateData } from "../storage.js"
import { uuid } from "../utils.js"

const KEY = "manutencoes"

export const ManutencaoService = {

  async listar() {
    return await getAll(KEY)
  },

  async criar(tipo, kmIntervalo, valor) {

    const manutencao = {
      id: uuid(),
      tipo,
      kmIntervalo,
      valor,
      status: "pendente"
    }

    await addData(KEY, manutencao)
  },

  async marcarRealizada(id, kmAtual) {

    const lista = await this.listar()

    const m = lista.find(x => x.id === id)

    if (!m) return

    m.status = "realizada"
    m.kmReferencia = kmAtual

    await updateData(KEY, m)
  }

}