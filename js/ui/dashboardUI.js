import { CorridaService } from "../services/corridaService.js"
import { VeiculoService } from "../services/veiculoService.js"
import { ManutencaoService } from "../services/manutencaoService.js"
import { AbastecimentoService } from "../services/abastecimentoService.js"
import { somarValores, periodoDoMes, ganhoPorKm, situacaoManutencao, filtrarPorPeriodo } from "../core/index.js"
import { abrirSeletorVeiculo } from "./seletorVeiculo.js"
import { esc, moeda, numero } from "../utils.js"

// Vai para outra tela clicando no botão do menu de baixo
function irPara(pagina) {
  document.querySelector(`[data-page="${pagina}"]`)?.click()
}

// Monta o aviso de manutenção vencida ou perto de vencer do veículo ativo (vazio se estiver tudo em dia)
function montarAviso(veiculo, manutencoes) {
  const situacoes = manutencoes.map(m => situacaoManutencao(m, veiculo.kmAtual ?? 0))
  const vencidas = situacoes.filter(s => s === "pendente").length
  const proximas = situacoes.filter(s => s === "atencao").length
  if (!vencidas && !proximas) return ""

  const texto = vencidas > 0
    ? `${vencidas} manutenção(ões) vencida(s)${proximas > 0 ? ` e ${proximas} perto de vencer` : ""}`
    : `${proximas} manutenção(ões) perto de vencer`

  return `
    <div class="card alerta-manut${vencidas > 0 ? " vencida" : ""}" id="alertaManutencao">
      <strong>${texto}</strong>
      <p class="muted">${esc(veiculo.nome)}</p>
      <button type="button" id="verManutencao" class="btn-small">Ver manutenção</button>
    </div>
  `
}

// Desenha a tela Início: ganhos e gastos do mês do veículo ativo, cards e botões
export async function renderDashboard(container) {
  const { inicio, fim } = periodoDoMes()

  const [corridasMes, abastecimentosMes, veiculos] = await Promise.all([
    CorridaService.listarPorPeriodo(inicio, fim),
    AbastecimentoService.listarPorPeriodo(inicio, fim),
    VeiculoService.listar()
  ])

  const ativo = veiculos.find(v => v.ativo)

  // Só entram os lançamentos do veículo ativo
  const corridas = corridasMes.filter(c => c.veiculoId === ativo?.id)
  const abastecimentos = abastecimentosMes.filter(a => a.veiculoId === ativo?.id)

  // Manutenção: se a busca falhar, o Início continua funcionando e os gastos aparecem como "—"
  let manutencoes = []
  let falhou = false
  if (ativo) {
    try {
      manutencoes = await ManutencaoService.listarDoVeiculo(ativo.id)
    } catch (erro) {
      console.warn("Não foi possível buscar as manutenções", erro)
      falhou = true
    }
  }

  const ganhos = somarValores(corridas, "valor")
  const km = somarValores(corridas, "distancia")
  const porKm = ganhoPorKm(ganhos, km)

  const gastoCombustivel = somarValores(abastecimentos, "valor")
  const gastoManutencao = somarValores(filtrarPorPeriodo(manutencoes, inicio, fim, "dataUltima"), "valor")
  const gastos = gastoCombustivel + gastoManutencao

  const semVeiculo = ativo ? "" : `
    <div class="card">
      <p>Você ainda não tem um veículo ativo.</p>
      <button id="irVeiculos" class="btn-primary">Cadastrar veículo</button>
    </div>
  `

  container.innerHTML = `
  <div class="card destaque">
    <div class="destaque-colunas">
      <div>
        <h3>Ganhos do Mês</h3>
        <h1>${moeda(ganhos)}</h1>
        <p class="muted">${corridas.length} corrida(s) · ${numero(km)} km${porKm ? ` · ${moeda(porKm)}/km` : ""}</p>
      </div>
      <div>
        <h3>Gastos</h3>
        <h1>${falhou ? "—" : moeda(gastos)}</h1>
        <p class="muted">Combustível ${moeda(gastoCombustivel)}${falhou ? "" : ` · Manutenção ${moeda(gastoManutencao)}`}</p>
      </div>
    </div>
  </div>

  ${semVeiculo}

  ${ativo && !falhou ? montarAviso(ativo, manutencoes) : ""}

  <div class="grid-2">
    <div class="card">
      <span class="rotulo">Odômetro</span>
      <strong>${numero(ativo?.kmAtual)} km</strong>
    </div>

    <button type="button" class="card card-botao" id="trocarVeiculo">
      <span class="rotulo">Veículo ▾</span>
      <strong>${esc(ativo?.nome || "—")}</strong>
    </button>

    <button type="button" class="card card-botao btn-abastecer" id="abastecer">Abastecer</button>

    <div class="card">
      <span class="rotulo">Média</span>
      <strong>${ativo?.mediaConsumo ? numero(ativo.mediaConsumo, 1) : "—"} km/L</strong>
    </div>
  </div>

  <div class="card">
    <button id="novaCorrida" class="btn-primary">
      ${CorridaService.obterAtiva() ? "Continuar corrida em andamento" : "Nova Corrida"}
    </button>
  </div>
  `

  // Abre a lista de veículos; ao escolher, ativa o veículo e redesenha a tela com os valores dele
  container.querySelector("#trocarVeiculo").onclick = () =>
    abrirSeletorVeiculo(
      veiculos,
      async id => {
        await VeiculoService.ativar(id)
        await renderDashboard(container)
      },
      () => irPara("veiculos")
    )

  container.querySelector("#abastecer").onclick = () => irPara("combustivel")
  container.querySelector("#novaCorrida").onclick = () => irPara("corridas")
  container.querySelector("#irVeiculos")?.addEventListener("click", () => irPara("veiculos"))
  container.querySelector("#verManutencao")?.addEventListener("click", () => irPara("manutencao"))
}
