import { CorridaService } from "../services/corridaService.js"
import { VeiculoService } from "../services/veiculoService.js"
import { auth } from "../firebase.js"
import { somarValores, periodoDoMes, ganhoPorKm } from "../core/index.js"
import { esc, moeda, numero } from "../utils.js"

function irPara(pagina) {
  document.querySelector(`[data-page="${pagina}"]`)?.click()
}

export async function renderDashboard(container) {
  const { inicio, fim } = periodoDoMes()

  // Busca só as corridas do mês atual (menos leituras no Firestore)
  const [corridas, veiculos] = await Promise.all([
    CorridaService.listarPorPeriodo(inicio, fim),
    VeiculoService.listar()
  ])

  const ativo = veiculos.find(v => v.ativo)
  const totalMes = somarValores(corridas, "valor")
  const kmMes = somarValores(corridas, "distancia")
  const porKm = ganhoPorKm(totalMes, kmMes)

  const user = auth.currentUser
  const contato = user?.email || user?.phoneNumber || "Usuário"

  const aviso = ativo ? "" : `
    <div class="card">
      <p>Você ainda não tem um veículo ativo.</p>
      <button id="irVeiculos" class="btn-primary">Cadastrar veículo</button>
    </div>
  `

  container.innerHTML = `
  <div class="card destaque">
    <h3>Ganhos do Mês</h3>
    <h1>${moeda(totalMes)}</h1>
    <p class="muted">${corridas.length} corrida(s) · ${numero(kmMes)} km${porKm ? ` · ${moeda(porKm)}/km` : ""}</p>
  </div>

  ${aviso}

  <div class="grid-2">
    <div class="card">
      <p>Usuário</p>
      <strong>${esc(contato)}</strong>
    </div>

    <div class="card">
      <p>Veículo</p>
      <strong>${esc(ativo?.nome || "—")}</strong>
    </div>

    <div class="card">
      <p>Odômetro</p>
      <strong>${numero(ativo?.kmAtual)} km</strong>
    </div>

    <div class="card">
      <p>Média</p>
      <strong>${ativo?.mediaConsumo ? numero(ativo.mediaConsumo, 1) : "—"} km/L</strong>
    </div>
  </div>

  <div class="card">
    <button id="novaCorrida" class="btn-primary">
      Nova Corrida
    </button>
  </div>
  `

  container.querySelector("#novaCorrida").onclick = () => irPara("corridas")
  container.querySelector("#irVeiculos")?.addEventListener("click", () => irPara("veiculos"))
}
