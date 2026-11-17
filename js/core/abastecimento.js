// Regras de negócio de abastecimentos

// Combustíveis que dá para colocar no tanque (o veículo "Flex" aceita os dois)
export const TIPOS_ABASTECIMENTO = ["Gasolina", "Etanol"]

export function criarAbastecimento({
  id,
  veiculoId,
  data = new Date().toISOString(),
  combustivel,
  kmReferencia,
  litros,
  valor,
  tanqueCheio = false
}) {
  if (!veiculoId) throw new Error("Escolha um veículo")
  if (!TIPOS_ABASTECIMENTO.includes(combustivel)) throw new Error("Combustível inválido")
  if (!Number.isFinite(kmReferencia) || kmReferencia < 0) throw new Error("KM do odômetro inválido")
  if (!(litros > 0)) throw new Error("Litros inválidos")
  if (!(valor > 0)) throw new Error("Valor inválido")

  return {
    id: id ?? crypto.randomUUID(),
    veiculoId,
    data,
    combustivel,
    kmReferencia,
    litros,
    valor,
    tanqueCheio: Boolean(tanqueCheio)
  }
}

export function calcularMediaConsumo(kmPercorrido, litros) {
  if (!(litros > 0)) throw new Error("Litros inválidos")
  return kmPercorrido / litros
}

// Consumo (km/L) pelo método do tanque cheio:
// entre os dois últimos abastecimentos de tanque cheio, divide os km rodados pelos litros
// colocados depois do primeiro (inclusive os abastecimentos parciais do meio).
// Devolve null se ainda não dá para calcular.
export function calcularMediaTanqueCheio(abastecimentos) {
  const ordenados = [...abastecimentos].sort(
    (a, b) => a.kmReferencia - b.kmReferencia || String(a.data).localeCompare(String(b.data))
  )

  const cheios = []
  ordenados.forEach((a, i) => { if (a.tanqueCheio) cheios.push(i) })
  if (cheios.length < 2) return null

  const ultimo = cheios[cheios.length - 1]
  const anterior = cheios[cheios.length - 2]

  const km = ordenados[ultimo].kmReferencia - ordenados[anterior].kmReferencia
  if (!(km > 0)) return null

  const litros = ordenados
    .slice(anterior + 1, ultimo + 1)
    .reduce((total, a) => total + (a.litros || 0), 0)
  if (!(litros > 0)) return null

  return km / litros
}
