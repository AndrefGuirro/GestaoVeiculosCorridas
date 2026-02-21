import { addData, getAll } from "../storage.js"
import { uuid } from "../utils.js"

const KEY = "abastecimentos"

export const AbastecimentoService = {

  async listar() {
    return await getAll(KEY)
  },

  async criar({ veiculoId, km, litros, valor, cheio }) {

    const abastecimento = {
      id: uuid(),
      veiculoId,
      km,
      litros,
      valor,
      cheio,
      data: new Date()
    }

    await addData(KEY, abastecimento)
  }

}