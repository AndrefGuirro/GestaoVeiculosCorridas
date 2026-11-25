import { addData, getAll, getByDateRange, getByField, updateData, deleteData } from "../storage.js"
import { criarAbastecimento, editarAbastecimento, calcularMediaTanqueCheio } from "../core/index.js"
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

  // Atualiza o veículo depois de mexer num abastecimento: o odômetro só avança e,
  // se der para calcular, a média passa a ser a dos dois últimos tanques cheios.
  // Devolve a média calculada (ou null).
  async sincronizarVeiculo(veiculoId, km, recalcularMedia) {
    const veiculos = await VeiculoService.listar()
    const veiculo = veiculos.find(v => v.id === veiculoId)
    if (!veiculo) return null

    let mudou = false
    let media = null

    if (km > (veiculo.kmAtual || 0)) {
      veiculo.kmAtual = km
      mudou = true
    }

    if (recalcularMedia) {
      const calculada = calcularMediaTanqueCheio(await getByField(KEY, "veiculoId", veiculoId))
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
    return media
  },

  // Grava o abastecimento e atualiza o odômetro e a média do veículo.
  // Devolve { abastecimento, media } (media é null quando ainda não deu para calcular).
  async criar({ veiculoId, combustivel, kmReferencia, litros, valor, tanqueCheio = false }) {
    // criarAbastecimento valida tudo antes de qualquer gravação
    const abastecimento = criarAbastecimento({ veiculoId, combustivel, kmReferencia, litros, valor, tanqueCheio })
    await addData(KEY, abastecimento)
    const media = await this.sincronizarVeiculo(veiculoId, kmReferencia, abastecimento.tanqueCheio)
    return { abastecimento, media }
  },

  // Corrige um abastecimento já lançado e atualiza o veículo
  async editar(abastecimento, campos) {
    const atualizado = editarAbastecimento(abastecimento, campos)
    await updateData(KEY, atualizado)
    await this.sincronizarVeiculo(atualizado.veiculoId, atualizado.kmReferencia, true)
    return atualizado
  },

  // Apaga o abastecimento e recalcula a média do veículo com os que sobraram
  async excluir(abastecimento) {
    await deleteData(KEY, abastecimento.id)
    await this.sincronizarVeiculo(abastecimento.veiculoId, 0, true)
  }

}
