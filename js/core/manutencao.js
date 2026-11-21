// Regras de negócio de manutenção

export function criarManutencao({
  id,
  veiculoId,
  tipo,
  valor = 0,
  kmReferencia = 0,
  intervaloKm = null
}) {
  const tipoLimpo = (tipo || "").trim()
  if (!veiculoId) throw new Error("Escolha um veículo")
  if (!tipoLimpo) throw new Error("Tipo de manutenção obrigatório")
  if (!Number.isFinite(kmReferencia) || kmReferencia < 0) throw new Error("KM inválido")
  if (!Number.isFinite(valor) || valor < 0) throw new Error("Valor inválido")
  if (intervaloKm !== null && !(intervaloKm > 0)) throw new Error("Intervalo de km inválido")

  return {
    id: id ?? crypto.randomUUID(),
    veiculoId,
    tipo: tipoLimpo,
    valor,
    kmReferencia,
    intervaloKm,
    status: "ok",
    dataUltima: new Date().toISOString()
  }
}

// Quantos km faltam para vencer (negativo = já passou; null = sem intervalo definido)
export function kmRestantes(manutencao, kmAtual) {
  if (!manutencao.intervaloKm) return null
  return manutencao.kmReferencia + manutencao.intervaloKm - kmAtual
}

// "pendente" (venceu), "atencao" (faltam 10% do intervalo ou menos), "ok" ou "sem-intervalo"
export function situacaoManutencao(manutencao, kmAtual) {
  const restantes = kmRestantes(manutencao, kmAtual)
  if (restantes === null) return "sem-intervalo"
  if (restantes <= 0) return "pendente"
  if (restantes <= manutencao.intervaloKm * 0.1) return "atencao"
  return "ok"
}

// Diz se a manutenção já venceu, de acordo com o km atual do veículo
export function verificarManutencao(manutencao, kmAtual) {
  if (!manutencao.intervaloKm) return manutencao

  const kmLimite = manutencao.kmReferencia + manutencao.intervaloKm

  return {
    ...manutencao,
    status: kmAtual >= kmLimite ? "pendente" : "ok"
  }
}

// Registra que a manutenção foi feita: o ciclo recomeça a partir do km informado
export function realizarManutencao(manutencao, { km, valor = null, data = new Date().toISOString() }) {
  if (!Number.isFinite(km) || km < 0) throw new Error("KM inválido")
  if (valor !== null && (!Number.isFinite(valor) || valor < 0)) throw new Error("Valor inválido")

  return {
    ...manutencao,
    kmReferencia: km,
    valor: valor ?? manutencao.valor,
    status: "ok",
    dataUltima: data
  }
}

// Monta um registro do histórico: cada vez que uma manutenção é feita fica guardado (km, valor e data),
// mesmo que depois o item seja refeito ou excluído
export function criarServico({ veiculoId, manutencaoId, tipo, km, valor = 0, data = new Date().toISOString() }) {
  if (!veiculoId) throw new Error("Escolha um veículo")
  if (!Number.isFinite(km) || km < 0) throw new Error("KM inválido")
  if (!Number.isFinite(valor) || valor < 0) throw new Error("Valor inválido")

  return { id: crypto.randomUUID(), veiculoId, manutencaoId, tipo, km, valor, data }
}
