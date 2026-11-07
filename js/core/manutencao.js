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
  if (valor < 0) throw new Error("Valor inválido")
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

// Diz se a manutenção já venceu, de acordo com o km atual do veículo
export function verificarManutencao(manutencao, kmAtual) {
  if (!manutencao.intervaloKm) return manutencao

  const kmLimite = manutencao.kmReferencia + manutencao.intervaloKm

  return {
    ...manutencao,
    status: kmAtual >= kmLimite ? "pendente" : "ok"
  }
}
