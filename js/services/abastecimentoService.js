import { addData, getAll, getByDateRange, getByField, updateData } from "../storage.js"
import { criarAbastecimento, calcularMediaTanqueCheio } from "../core/index.js"
import { VeiculoService } from "./veiculoService.js"
import { AppState } from "../state.js"

const KEY = "abastecimentos"

export const AbastecimentoService = {

  async listar() {
    return await getAll(KEY)
  },

  async listarPorPeriodo(inicio, fim) {
    return await getByDateRange(KEY, "data", inicio, fim)
  },

  // Grava o abastecimento e, se for o caso, atualiza o odômetro e a média de consumo do veículo.
  // Devolve { abastecimento, media } (media é null quando ainda não deu para calcular).
  async criar({ veiculoId, combustivel, kmReferencia, litros, valor, tanqueCheio = false }) {
    // criarAbastecimento valida tudo antes de qualquer gravação
    const abastecimento = criarAbastecimento({
      veiculoId,
      combustivel,
      kmReferencia,
      litros,
      valor,
      tanqueCheio
    })

    await addData(KEY, abastecimento)

    const veiculos = await VeiculoService.listar()
    const veiculo = veiculos.find(v => v.id === veiculoId)
    let media = null

    if (veiculo) {
      let mudou = false

      // O odômetro só avança (um km menor que o atual não o diminui)
      if (kmReferencia > (veiculo.kmAtual || 0)) {
        veiculo.kmAtual = kmReferencia
        mudou = true
      }

      if (abastecimento.tanqueCheio) {
        const doVeiculo = await getByField(KEY, "veiculoId", veiculoId)
        const calculada = calcularMediaTanqueCheio(doVeiculo)
        if (calculada && calculada > 0) {
          media = Math.round(calculada * 10) / 10
          if (media > 0) {
            veiculo.mediaConsumo = media
            mudou = true
          }
        }
      }

      if (mudou) {
        await updateData("veiculos", veiculo)
        if (veiculo.ativo) AppState.veiculoAtivo = veiculo
      }
    }

    return { abastecimento, media }
  }

}
