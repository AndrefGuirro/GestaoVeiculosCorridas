import { AbastecimentoService } from "../services/abastecimentoService.js"
import { VeiculoService } from "../services/veiculoService.js"
import { TIPOS_ABASTECIMENTO, somarValores, periodoDoMes } from "../core/index.js"
import { abrirEdicao } from "./edicao.js"
import { esc, moeda, numero, dataHora, mesAno, paraInputData, novaData } from "../utils.js"

function irPara(pagina) {
  document.querySelector(`[data-page="${pagina}"]`)?.click()
}

// Veículo flex aceita gasolina e etanol; os outros só o próprio combustível
function combustiveisDoVeiculo(veiculo) {
  return veiculo.combustivel === "Flex" ? TIPOS_ABASTECIMENTO : [veiculo.combustivel]
}

function painelNovo(ativo, aviso) {
  if (!ativo) {
    return `
      <div class="card">
        <p>Para registrar um abastecimento, cadastre e ative um veículo.</p>
        <button type="button" id="irVeiculos" class="btn-primary">Ir para Veículos</button>
      </div>
    `
  }

  const opcoes = combustiveisDoVeiculo(ativo)
    .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join("")

  return `
    <div class="card">
      <h3>Novo abastecimento</h3>
      <p class="muted">
        Veículo: ${esc(ativo.nome)}${ativo.mediaConsumo ? ` · média atual ${numero(ativo.mediaConsumo, 1)} km/L` : ""}
      </p>

      ${aviso ? `<div class="aviso-ok" role="status">${esc(aviso)}</div>` : ""}
      <div class="auth-error" id="combustivelErro" role="alert"></div>

      <form id="formAbastecimento">
        <div class="form-group">
          <label for="aKm">KM do odômetro</label>
          <input id="aKm" type="number" min="0" step="1" inputmode="numeric"
                 value="${ativo.kmAtual ?? 0}" required />
        </div>
        <div class="form-group">
          <label for="aCombustivel">Combustível</label>
          <select id="aCombustivel">${opcoes}</select>
        </div>
        <div class="form-group">
          <label for="aLitros">Litros</label>
          <input id="aLitros" type="number" min="0.01" step="0.01" inputmode="decimal" required />
        </div>
        <div class="form-group">
          <label for="aValor">Valor total (R$)</label>
          <input id="aValor" type="number" min="0.01" step="0.01" inputmode="decimal" required />
        </div>

        <label class="check-linha" for="aCheio">
          <input id="aCheio" type="checkbox" checked />
          <span>Enchi o tanque até o fim</span>
        </label>
        <p class="muted dica">
          Com dois abastecimentos de tanque cheio, o app calcula o consumo (km/L) do veículo.
        </p>

        <button type="submit" id="btnAbastecer" class="btn-primary">Salvar abastecimento</button>
      </form>
    </div>
  `
}

// Um abastecimento da lista, com a caneta discreta para editar ou excluir
function itemAbastecimento(a, veiculos) {
  const veiculo = veiculos.find(v => v.id === a.veiculoId)
  const porLitro = a.litros > 0 ? a.valor / a.litros : null

  return `
    <div class="card lista-item" data-id="${esc(a.id)}">
      <button type="button" class="btn-editar" data-editar aria-label="Editar" title="Editar">✎</button>
      <div>
        <strong class="valor-corrida">${moeda(a.valor)}</strong>
        <p class="muted">${dataHora(a.data)} · ${esc(veiculo?.nome || "Veículo removido")}</p>
        <p class="muted">
          ${numero(a.litros, 2)} L ${esc(a.combustivel)}${porLitro ? ` · ${moeda(porLitro)}/L` : ""}
          · ${numero(a.kmReferencia)} km${a.tanqueCheio ? " · tanque cheio" : ""}
        </p>
      </div>
    </div>
  `
}

export async function renderCombustivel(container, referencia = new Date(), aviso = "") {
  const { inicio, fim } = periodoDoMes(referencia)

  // Lê só os veículos e os abastecimentos do mês mostrado (economiza a cota gratuita do Firestore)
  const [veiculos, abastecimentos] = await Promise.all([
    VeiculoService.listar(),
    AbastecimentoService.listarPorPeriodo(inicio, fim)
  ])

  const ativo = veiculos.find(v => v.ativo)

  const agora = new Date()
  const ehMesAtual = referencia.getFullYear() === agora.getFullYear()
    && referencia.getMonth() === agora.getMonth()

  const ordenados = [...abastecimentos].sort((a, b) => b.data.localeCompare(a.data))
  const gasto = somarValores(abastecimentos, "valor")
  const litros = somarValores(abastecimentos, "litros")

  container.innerHTML = `
    ${painelNovo(ativo, aviso)}

    <div class="card">
      <div class="mes-nav">
        <button type="button" id="mesAnterior" class="btn-small" aria-label="Mês anterior">‹</button>
        <strong>${esc(mesAno(referencia))}</strong>
        <button type="button" id="mesSeguinte" class="btn-small" aria-label="Próximo mês"
                ${ehMesAtual ? "disabled" : ""}>›</button>
      </div>

      <div class="resumo-mes">
        <div><strong>${moeda(gasto)}</strong><span>Gasto</span></div>
        <div><strong>${numero(litros, 1)} L</strong><span>Litros</span></div>
        <div><strong>${litros > 0 ? moeda(gasto / litros) : "—"}</strong><span>Por litro</span></div>
      </div>
    </div>

    ${ordenados.length === 0
      ? `<div class="card estado-vazio">Nenhum abastecimento neste mês.</div>`
      : ordenados.map(a => itemAbastecimento(a, veiculos)).join("")}
  `

  container.querySelector("#irVeiculos")?.addEventListener("click", () => irPara("veiculos"))

  container.querySelector("#mesAnterior").onclick = () =>
    renderCombustivel(container, new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1))

  container.querySelector("#mesSeguinte").onclick = () =>
    renderCombustivel(container, new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1))

  // Caneta do cartão: abre a edição do abastecimento (salvar, excluir ou cancelar)
  container.querySelectorAll(".lista-item[data-id]").forEach(cartao => {
    const abastecimento = ordenados.find(a => a.id === cartao.dataset.id)
    const veiculo = veiculos.find(v => v.id === abastecimento.veiculoId)
    const combustiveis = veiculo ? combustiveisDoVeiculo(veiculo) : TIPOS_ABASTECIMENTO
    const recarregar = () => renderCombustivel(container, referencia)

    cartao.querySelector("[data-editar]").onclick = () =>
      abrirEdicao(cartao, [
        { nome: "data", rotulo: "Data", tipo: "date", valor: paraInputData(abastecimento.data) },
        { nome: "kmReferencia", rotulo: "KM do odômetro", tipo: "number", valor: abastecimento.kmReferencia, atributos: 'min="0" step="1" inputmode="numeric"' },
        { nome: "combustivel", rotulo: "Combustível", tipo: "select", valor: abastecimento.combustivel, opcoes: [...new Set([...combustiveis, abastecimento.combustivel])] },
        { nome: "litros", rotulo: "Litros", tipo: "number", valor: abastecimento.litros, atributos: 'min="0.01" step="0.01" inputmode="decimal"' },
        { nome: "valor", rotulo: "Valor total (R$)", tipo: "number", valor: abastecimento.valor, atributos: 'min="0.01" step="0.01" inputmode="decimal"' },
        { nome: "tanqueCheio", rotulo: "Enchi o tanque até o fim", tipo: "checkbox", valor: abastecimento.tanqueCheio }
      ], {
        textoExcluir: "Excluir este abastecimento? Isso não pode ser desfeito.",
        aoCancelar: recarregar,
        aoSalvar: async valores => {
          await AbastecimentoService.editar(abastecimento, { ...valores, data: novaData(abastecimento.data, valores.data) })
          await recarregar()
        },
        aoExcluir: async () => {
          await AbastecimentoService.excluir(abastecimento)
          await recarregar()
        }
      })
  })

  const form = container.querySelector("#formAbastecimento")
  if (!form) return

  form.onsubmit = async event => {
    event.preventDefault()
    const erro = container.querySelector("#combustivelErro")
    const botao = container.querySelector("#btnAbastecer")
    erro.innerText = ""
    botao.disabled = true

    try {
      const { media } = await AbastecimentoService.criar({
        veiculoId: ativo.id,
        combustivel: container.querySelector("#aCombustivel").value,
        kmReferencia: container.querySelector("#aKm").value === ""
          ? NaN
          : Number(container.querySelector("#aKm").value),
        litros: Number(container.querySelector("#aLitros").value),
        valor: Number(container.querySelector("#aValor").value),
        tanqueCheio: container.querySelector("#aCheio").checked
      })

      await renderCombustivel(
        container,
        new Date(),
        media
          ? `Abastecimento salvo. Média atualizada: ${numero(media, 1)} km/L.`
          : "Abastecimento salvo."
      )
    } catch (e) {
      erro.innerText = e.message || "Não foi possível salvar o abastecimento."
      botao.disabled = false
    }
  }
}
