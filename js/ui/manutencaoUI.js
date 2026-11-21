import { ManutencaoService } from "../services/manutencaoService.js"
import { VeiculoService } from "../services/veiculoService.js"
import { kmRestantes, situacaoManutencao, somarValores, periodoDoMes } from "../core/index.js"
import { esc, moeda, numero, dataCurta, dataHora, mesAno } from "../utils.js"

const SUGESTOES = [
  "Troca de óleo",
  "Filtro de óleo",
  "Filtro de ar",
  "Pneus",
  "Pastilhas de freio",
  "Corrente / kit relação",
  "Velas",
  "Revisão geral"
]

const SITUACOES = {
  pendente: { texto: "Vencida", classe: "badge-pendente" },
  atencao: { texto: "Perto de vencer", classe: "badge-atencao" },
  ok: { texto: "Em dia", classe: "" },
  "sem-intervalo": { texto: "Sem intervalo", classe: "badge-neutro" }
}

function irPara(pagina) {
  document.querySelector(`[data-page="${pagina}"]`)?.click()
}

function textoRestante(restantes) {
  if (restantes === null) return "Sem intervalo definido"
  if (restantes === 0) return "Vence agora"
  if (restantes < 0) return `Vencida há ${numero(-restantes)} km`
  return `Faltam ${numero(restantes)} km`
}

function painelNovo(ativo, aviso) {
  if (!ativo) {
    return `
      <div class="card">
        <p>Para cadastrar manutenções, cadastre e ative um veículo.</p>
        <button type="button" id="irVeiculos" class="btn-primary">Ir para Veículos</button>
      </div>
    `
  }

  const sugestoes = SUGESTOES.map(s => `<option value="${esc(s)}"></option>`).join("")

  return `
    <div class="card">
      <h3>Nova manutenção</h3>
      <p class="muted">Veículo: ${esc(ativo.nome)} · ${numero(ativo.kmAtual)} km</p>

      ${aviso ? `<div class="aviso-ok" role="status">${esc(aviso)}</div>` : ""}
      <div class="auth-error" id="manutErro" role="alert"></div>

      <form id="formManutencao">
        <div class="form-group">
          <label for="mTipo">O que será controlado</label>
          <input id="mTipo" type="text" list="mSugestoes" maxlength="60"
                 placeholder="Ex.: Troca de óleo" autocomplete="off" required />
          <datalist id="mSugestoes">${sugestoes}</datalist>
        </div>
        <div class="form-group">
          <label for="mKm">Feita pela última vez aos (km)</label>
          <input id="mKm" type="number" min="0" step="1" inputmode="numeric"
                 value="${ativo.kmAtual ?? 0}" required />
        </div>
        <div class="form-group">
          <label for="mIntervalo">Repetir a cada (km)</label>
          <input id="mIntervalo" type="number" min="1" step="1" inputmode="numeric"
                 placeholder="Opcional. Ex.: 3000" />
        </div>
        <div class="form-group">
          <label for="mValor">Valor gasto (R$)</label>
          <input id="mValor" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Opcional" />
        </div>
        <button type="submit" id="btnManutencao" class="btn-primary">Salvar manutenção</button>
      </form>
    </div>
  `
}

function itemManutencao(m, kmAtual) {
  const situacao = situacaoManutencao(m, kmAtual)
  const { texto, classe } = SITUACOES[situacao]
  const restantes = kmRestantes(m, kmAtual)

  const proxima = m.intervaloKm
    ? ` · próxima aos ${numero(m.kmReferencia + m.intervaloKm)} km`
    : ""

  return `
    <div class="card card-manut" data-id="${esc(m.id)}">
      <div class="manut-topo">
        <strong>${esc(m.tipo)}</strong>
        <span class="badge ${classe}">${texto}</span>
      </div>
      <p class="muted">Feita aos ${numero(m.kmReferencia)} km${proxima}</p>
      <p class="restante restante-${situacao}">${textoRestante(restantes)}</p>
      <p class="muted">
        ${m.dataUltima ? `Registrada em ${dataCurta(m.dataUltima)}` : ""}${m.valor > 0 ? ` · gasto ${moeda(m.valor)}` : ""}
      </p>
      <div class="manut-acoes">
        <button type="button" class="btn-small" data-realizar>Marcar como realizada</button>
        <button type="button" class="btn-small btn-perigo" data-excluir>Excluir</button>
      </div>
    </div>
  `
}

// Uma linha do histórico: o que foi feito, quando, em que veículo, km e valor
function itemHistorico(servico, veiculos) {
  const veiculo = veiculos.find(v => v.id === servico.veiculoId)

  return `
    <div class="card lista-item">
      <div>
        <strong class="valor-corrida">${esc(servico.tipo)}</strong>
        <p class="muted">${dataHora(servico.data)} · ${esc(veiculo?.nome || "Veículo removido")}</p>
        <p class="muted">${numero(servico.km)} km · ${servico.valor > 0 ? moeda(servico.valor) : "sem valor"}</p>
      </div>
    </div>
  `
}

// Troca os botões do cartão por um pequeno formulário (km em que foi feita e valor gasto)
function abrirRealizacao(cartao, manutencao, ativo, recarregar) {
  const acoes = cartao.querySelector(".manut-acoes")

  acoes.innerHTML = `
    <form class="manut-form">
      <div class="form-group">
        <label>Feita aos (km)</label>
        <input class="rKm" type="number" min="0" step="1" inputmode="numeric" value="${ativo.kmAtual ?? 0}" required />
      </div>
      <div class="form-group">
        <label>Valor gasto (R$)</label>
        <input class="rValor" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Opcional" />
      </div>
      <div class="auth-error erro-item" role="alert"></div>
      <button type="submit" class="btn-primary">Confirmar</button>
      <button type="button" class="btn-secondary" data-voltar>Voltar</button>
    </form>
  `

  acoes.querySelector("[data-voltar]").onclick = () => recarregar()

  acoes.querySelector(".manut-form").onsubmit = async event => {
    event.preventDefault()
    const erro = acoes.querySelector(".erro-item")
    const botao = acoes.querySelector("button[type=submit]")
    erro.innerText = ""
    botao.disabled = true

    const kmTexto = acoes.querySelector(".rKm").value
    const valorTexto = acoes.querySelector(".rValor").value

    try {
      await ManutencaoService.marcarRealizada(manutencao, {
        km: kmTexto === "" ? NaN : Number(kmTexto),
        valor: valorTexto === "" ? null : Number(valorTexto)
      })
      await recarregar(`“${manutencao.tipo}” registrada como realizada.`)
    } catch (e) {
      erro.innerText = e.message || "Não foi possível registrar."
      botao.disabled = false
    }
  }
}

// Desenha a tela Manutenção: cadastro, itens do veículo ativo e histórico do mês de toda a frota
export async function renderManutencao(container, aviso = "", referencia = new Date()) {
  const { inicio, fim } = periodoDoMes(referencia)
  const [veiculos, historico] = await Promise.all([
    VeiculoService.listar(),
    ManutencaoService.listarHistoricoPorPeriodo(inicio, fim)
  ])
  const ativo = veiculos.find(v => v.ativo)

  const agora = new Date()
  const ehMesAtual = referencia.getFullYear() === agora.getFullYear()
    && referencia.getMonth() === agora.getMonth()
  const recentes = [...historico].sort((a, b) => b.data.localeCompare(a.data))

  // Só as manutenções do veículo ativo (leitura menor no Firestore)
  const manutencoes = ativo ? await ManutencaoService.listarDoVeiculo(ativo.id) : []
  const kmAtual = ativo?.kmAtual ?? 0

  // As mais urgentes primeiro; as sem intervalo ficam por último
  const ordenadas = [...manutencoes].sort((a, b) => {
    const ra = kmRestantes(a, kmAtual)
    const rb = kmRestantes(b, kmAtual)
    if (ra === null && rb === null) return a.tipo.localeCompare(b.tipo)
    if (ra === null) return 1
    if (rb === null) return -1
    return ra - rb
  })

  container.innerHTML = `
    ${painelNovo(ativo, aviso)}

    ${ativo ? (ordenadas.length === 0
      ? `<div class="card estado-vazio">Nenhuma manutenção cadastrada para este veículo.</div>`
      : ordenadas.map(m => itemManutencao(m, kmAtual)).join("")) : ""}

    <div class="card">
      <div class="mes-nav">
        <button type="button" id="mesAnterior" class="btn-small" aria-label="Mês anterior">‹</button>
        <strong>${esc(mesAno(referencia))}</strong>
        <button type="button" id="mesSeguinte" class="btn-small" aria-label="Próximo mês"
                ${ehMesAtual ? "disabled" : ""}>›</button>
      </div>
      <div class="resumo-mes">
        <div><strong>${moeda(somarValores(historico, "valor"))}</strong><span>Gasto</span></div>
        <div><strong>${historico.length}</strong><span>Serviços</span></div>
      </div>
    </div>

    ${recentes.length === 0
      ? `<div class="card estado-vazio">Nenhuma manutenção registrada neste mês.</div>`
      : recentes.map(h => itemHistorico(h, veiculos)).join("")}
  `

  container.querySelector("#mesAnterior").onclick = () =>
    renderManutencao(container, "", new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1))
  container.querySelector("#mesSeguinte").onclick = () =>
    renderManutencao(container, "", new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1))

  const recarregar = (mensagem = "") => renderManutencao(container, mensagem, mensagem ? new Date() : referencia)

  container.querySelector("#irVeiculos")?.addEventListener("click", () => irPara("veiculos"))

  const form = container.querySelector("#formManutencao")
  if (form) {
    form.onsubmit = async event => {
      event.preventDefault()
      const erro = container.querySelector("#manutErro")
      const botao = container.querySelector("#btnManutencao")
      erro.innerText = ""
      botao.disabled = true

      const kmTexto = container.querySelector("#mKm").value
      const intervaloTexto = container.querySelector("#mIntervalo").value
      const valorTexto = container.querySelector("#mValor").value

      try {
        await ManutencaoService.criar({
          veiculoId: ativo.id,
          tipo: container.querySelector("#mTipo").value,
          kmReferencia: kmTexto === "" ? NaN : Number(kmTexto),
          intervaloKm: intervaloTexto === "" ? null : Number(intervaloTexto),
          valor: valorTexto === "" ? 0 : Number(valorTexto)
        })
        await recarregar("Manutenção salva.")
      } catch (e) {
        erro.innerText = e.message || "Não foi possível salvar a manutenção."
        botao.disabled = false
      }
    }
  }

  container.querySelectorAll(".card-manut").forEach(cartao => {
    const manutencao = ordenadas.find(m => m.id === cartao.dataset.id)

    cartao.querySelector("[data-realizar]").onclick = () =>
      abrirRealizacao(cartao, manutencao, ativo, recarregar)

    cartao.querySelector("[data-excluir]").onclick = async () => {
      if (!confirm(`Excluir “${manutencao.tipo}”? Isso não pode ser desfeito.`)) return
      try {
        await ManutencaoService.excluir(manutencao.id)
        await recarregar()
      } catch (e) {
        alert("Não foi possível excluir. Tente novamente.")
      }
    }
  })
}
