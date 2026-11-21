// Regras de negócio de veículos (não mexe em tela nem em banco de dados)

export const COMBUSTIVEIS = ["Gasolina", "Etanol", "Flex"]

export function criarVeiculo({
  id,
  nome,
  combustivel,
  mediaConsumo = null,
  kmAtual = 0
}) {
  const nomeLimpo = (nome || "").trim()
  if (!nomeLimpo) throw new Error("Nome do veículo é obrigatório")

  if (!COMBUSTIVEIS.includes(combustivel)) {
    throw new Error("Combustível inválido")
  }

  if (mediaConsumo !== null && !(mediaConsumo > 0)) {
    throw new Error("Média de consumo deve ser maior que zero")
  }

  if (!(kmAtual >= 0)) throw new Error("KM atual inválido")

  return {
    id: id ?? crypto.randomUUID(),
    nome: nomeLimpo,
    combustivel,
    mediaConsumo,
    kmAtual,
    ativo: false,
    criadoEm: new Date().toISOString()
  }
}

export function ativarVeiculo(veiculos, idVeiculo) {
  return veiculos.map(v => ({
    ...v,
    ativo: v.id === idVeiculo
  }))
}
