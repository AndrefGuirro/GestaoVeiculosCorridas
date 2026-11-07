// Regras de negócio de abastecimentos

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
    tanqueCheio
  }
}

export function calcularMediaConsumo(kmPercorrido, litros) {
  if (!(litros > 0)) throw new Error("Litros inválidos")
  return kmPercorrido / litros
}
