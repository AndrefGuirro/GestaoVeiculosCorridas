// Cálculos de relatório sobre listas (corridas, abastecimentos, manutenções)

export function somarValores(lista, campo) {
  return lista.reduce((total, item) => total + (item[campo] || 0), 0)
}

export function totalPorVeiculo(lista, veiculoId, campo) {
  return somarValores(
    lista.filter(item => item.veiculoId === veiculoId),
    campo
  )
}

export function filtrarPorPeriodo(lista, inicio, fim) {
  return lista.filter(item => {
    const data = new Date(item.data)
    return data >= inicio && data <= fim
  })
}

// Primeiro e último instante do mês de uma data (padrão: mês atual)
export function periodoDoMes(referencia = new Date()) {
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1, 0, 0, 0, 0)
  const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0, 23, 59, 59, 999)
  return { inicio, fim }
}
