import { addData, getAll } from "../storage.js"
import { criarAbastecimento } from "../core/index.js"

const KEY = "abastecimentos"

export const AbastecimentoService = {

  async listar() {
    return await getAll(KEY)
  },

  async criar({ veiculoId, combustivel, kmReferencia, litros, valor, tanqueCheio = false }) {
    const abastecimento = criarAbastecimento({
      veiculoId,
      combustivel,
      kmReferencia,
      litros,
      valor,
      tanqueCheio
    })

    await addData(KEY, abastecimento)
    return abastecimento
  }

}
