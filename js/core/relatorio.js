// Cálculos de relatório sobre listas (corridas, abastecimentos, manutenções)

// Soma o campo informado de todos os itens da lista
export function somarValores(lista, campo) {
  return lista.reduce((total, item) => total + (item[campo] || 0), 0)
}

// Soma o campo informado só dos itens de um veículo
export function totalPorVeiculo(lista, veiculoId, campo) {
  return somarValores(
    lista.filter(item => item.veiculoId === veiculoId),
    campo
  )
}

// Devolve só os itens cuja data cai dentro do período.
// campoData diz qual campo tem a data (corridas e abastecimentos usam "data", manutenção usa "dataUltima")
export function filtrarPorPeriodo(lista, inicio, fim, campoData = "data") {
  return lista.filter(item => {
    const data = new Date(item[campoData])
    return data >= inicio && data <= fim
  })
}

// Primeiro e último instante do mês de uma data (padrão: mês atual)
export function periodoDoMes(referencia = new Date()) {
  const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1, 0, 0, 0, 0)
  const fim = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0, 23, 59, 59, 999)
  return { inicio, fim }
}
