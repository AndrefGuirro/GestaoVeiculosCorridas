// Regras de negócio de corridas

export function validarKm(kmInicial, kmFinal) {
  if (kmInicial == null || Number.isNaN(kmInicial)) throw new Error("KM inicial obrigatório")
  if (kmFinal == null || Number.isNaN(kmFinal)) throw new Error("KM final obrigatório")
  if (kmFinal <= kmInicial) throw new Error("KM final deve ser maior que o inicial")
}

export function calcularDistancia(kmInicial, kmFinal) {
  validarKm(kmInicial, kmFinal)
  return kmFinal - kmInicial
}

// Valor ganho por km rodado (null se não houver distância)
export function ganhoPorKm(valor, distancia) {
  return distancia > 0 ? valor / distancia : null
}

export function criarCorrida({
  id,
  veiculoId,
  kmInicial,
  kmFinal,
  valor,
  data = new Date().toISOString()
}) {
  if (!veiculoId) throw new Error("Escolha um veículo")

  const distancia = calcularDistancia(kmInicial, kmFinal)

  if (!(valor > 0)) throw new Error("Valor inválido")

  return {
    id: id ?? crypto.randomUUID(),
    veiculoId,
    kmInicial,
    kmFinal,
    distancia,
    valor,
    data
  }
}
