import { CorridaService } from "../services/corridaService.js"
import { VeiculoService } from "../services/veiculoService.js"
import { somarValores, periodoDoMes, ganhoPorKm } from "../core/index.js"
import { esc, moeda, numero, dataHora, hora, mesAno } from "../utils.js"

function irPara(pagina) {
  document.querySelector(`[data-page="${pagina}"]`)?.click()
}

// Painel de cima: muda conforme a situação (sem veículo, sem corrida ou corrida em andamento)
function painelAcao(ativo, emAndamento, veiculos) {
  if (emAndamento) {
    const veiculo = veiculos.find(v => v.id === emAndamento.veiculoId)
    return `
      <div class="card card-andamento">
        <h3>Corrida em andamento</h3>
        <p class="muted">
          ${esc(veiculo?.nome || "Veículo")} · iniciada às ${hora(emAndamento.dataInicio)}
          · KM inicial ${numero(emAndamento.kmInicial)}
        </p>
        <div class="auth-error" id="corridaErro" role="alert"></div>

        <form id="formFinalizar">
          <div class="form-group">
            <label for="cKmFinal">KM final (odômetro)</label>
            <input id="cKmFinal" type="number" min="0" step="1" inputmode="numeric" required />
          </div>
          <div class="form-group">
            <label for="cValor">Valor recebido (R$)</label>
            <input id="cValor" type="number" min="0.01" step="0.01" inputmode="decimal" required />
          </div>
          <button type="submit" id="btnFinalizar" class="btn-primary">Finalizar corrida</button>
        </form>

        <button type="button" id="btnCancelar" class="btn-secondary">Cancelar corrida</button>
      </div>
    `
  }

  if (!ativo) {
    return `
      <div class="card">
        <p>Para iniciar uma corrida, cadastre e ative um veículo.</p>
        <button type="button" id="irVeiculos" class="btn-primary">Ir para Veículos</button>
      </div>
    `
  }

  return `
    <div class="card">
      <h3>Nova corrida</h3>
      <p class="muted">Veículo: ${esc(ativo.nome)}</p>
      <div class="auth-error" id="corridaErro" role="alert"></div>

      <form id="formIniciar">
        <div class="form-group">
          <label for="cKmInicial">KM inicial (odômetro)</label>
          <input id="cKmInicial" type="number" min="0" step="1" inputmode="numeric"
                 value="${ativo.kmAtual ?? 0}" required />
        </div>
        <button type="submit" id="btnIniciar" class="btn-primary">Iniciar corrida</button>
      </form>
    </div>
  `
}

function itemCorrida(corrida, veiculos) {
  const veiculo = veiculos.find(v => v.id === corrida.veiculoId)
  const porKm = ganhoPorKm(corrida.valor, corrida.distancia)

  return `
    <div class="card lista-item">
      <div>
        <strong class="valor-corrida">${moeda(corrida.valor)}</strong>
        <p class="muted">${dataHora(corrida.data)} · ${esc(veiculo?.nome || "Veículo removido")}</p>
        <p class="muted">${numero(corrida.distancia)} km · ${porKm ? `${moeda(porKm)}/km` : "—"}</p>
      </div>
    </div>
  `
}

export async function renderCorridas(container, referencia = new Date()) {
  const { inicio, fim } = periodoDoMes(referencia)

  // Lê só os veículos e as corridas do mês mostrado (economiza a cota gratuita do Firestore)
  const [veiculos, corridas] = await Promise.all([
    VeiculoService.listar(),
    CorridaService.listarPorPeriodo(inicio, fim)
  ])

  const ativo = veiculos.find(v => v.ativo)
  const emAndamento = CorridaService.obterAtiva()

  const agora = new Date()
  const ehMesAtual = referencia.getFullYear() === agora.getFullYear()
    && referencia.getMonth() === agora.getMonth()

  const ordenadas = [...corridas].sort((a, b) => b.data.localeCompare(a.data))
  const totalMes = somarValores(corridas, "valor")
  const kmMes = somarValores(corridas, "distancia")
  const porKmMes = ganhoPorKm(totalMes, kmMes)

  container.innerHTML = `
    ${painelAcao(ativo, emAndamento, veiculos)}

    <div class="card">
      <div class="mes-nav">
        <button type="button" id="mesAnterior" class="btn-small" aria-label="Mês anterior">‹</button>
        <strong>${esc(mesAno(referencia))}</strong>
        <button type="button" id="mesSeguinte" class="btn-small" aria-label="Próximo mês"
                ${ehMesAtual ? "disabled" : ""}>›</button>
      </div>

      <div class="resumo-mes">
        <div><strong>${moeda(totalMes)}</strong><span>Ganhos</span></div>
        <div><strong>${numero(kmMes)} km</strong><span>Rodados</span></div>
        <div><strong>${porKmMes ? moeda(porKmMes) : "—"}</strong><span>Por km</span></div>
      </div>
    </div>

    ${ordenadas.length === 0
      ? `<div class="card estado-vazio">Nenhuma corrida neste mês.</div>`
      : ordenadas.map(c => itemCorrida(c, veiculos)).join("")}
  `

  const recarregar = () => renderCorridas(container)
  const erro = () => container.querySelector("#corridaErro")

  container.querySelector("#irVeiculos")?.addEventListener("click", () => irPara("veiculos"))

  container.querySelector("#mesAnterior").onclick = () =>
    renderCorridas(container, new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1))

  container.querySelector("#mesSeguinte").onclick = () =>
    renderCorridas(container, new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1))

  const formIniciar = container.querySelector("#formIniciar")
  if (formIniciar) {
    formIniciar.onsubmit = async event => {
      event.preventDefault()
      const botao = container.querySelector("#btnIniciar")
      erro().innerText = ""
      botao.disabled = true

      try {
        const km = Number(container.querySelector("#cKmInicial").value)
        await CorridaService.iniciar(km)
        await recarregar()
      } catch (e) {
        erro().innerText = e.message || "Não foi possível iniciar a corrida."
        botao.disabled = false
      }
    }
  }

  const formFinalizar = container.querySelector("#formFinalizar")
  if (formFinalizar) {
    formFinalizar.onsubmit = async event => {
      event.preventDefault()
      const botao = container.querySelector("#btnFinalizar")
      erro().innerText = ""
      botao.disabled = true

      try {
        const kmFinal = Number(container.querySelector("#cKmFinal").value)
        const valor = Number(container.querySelector("#cValor").value)
        await CorridaService.finalizar(kmFinal, valor)
        await recarregar()
      } catch (e) {
        erro().innerText = e.message || "Não foi possível finalizar a corrida."
        botao.disabled = false
      }
    }

    container.querySelector("#btnCancelar").onclick = async () => {
      if (!confirm("Cancelar a corrida em andamento? Ela não será salva.")) return
      CorridaService.cancelar()
      await recarregar()
    }
  }
}
