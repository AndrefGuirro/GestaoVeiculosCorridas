import { VeiculoService } from "../services/veiculoService.js"
import { COMBUSTIVEIS } from "../core/index.js"
import { esc, numero } from "../utils.js"

export async function renderVeiculos(container) {
  const veiculos = await VeiculoService.listar()

  const opcoes = COMBUSTIVEIS
    .map(c => `<option value="${esc(c)}">${esc(c)}</option>`)
    .join("")

  const lista = veiculos.length === 0
    ? `<div class="card estado-vazio">Nenhum veículo cadastrado ainda.</div>`
    : veiculos.map(v => `
        <div class="card lista-item">
          <div>
            <strong>${esc(v.nome)}</strong>
            <p class="muted">
              ${esc(v.combustivel)} · ${numero(v.kmAtual)} km
              ${v.mediaConsumo ? ` · ${numero(v.mediaConsumo, 1)} km/L` : ""}
            </p>
          </div>
          ${v.ativo
            ? `<span class="badge">Ativo</span>`
            : `<button class="btn-small" data-ativar="${esc(v.id)}">Ativar</button>`}
        </div>
      `).join("")

  container.innerHTML = `
    <div class="card">
      <h3>Novo veículo</h3>
      <div class="auth-error" id="veiculoErro"></div>

      <form id="formVeiculo">
        <div class="form-group">
          <label for="vNome">Nome</label>
          <input id="vNome" type="text" placeholder="Ex.: Honda CG 160" required />
        </div>
        <div class="form-group">
          <label for="vCombustivel">Combustível</label>
          <select id="vCombustivel">${opcoes}</select>
        </div>
        <div class="form-group">
          <label for="vMedia">Média de consumo (km/L)</label>
          <input id="vMedia" type="number" step="0.1" min="0" inputmode="decimal" placeholder="Opcional" />
        </div>
        <div class="form-group">
          <label for="vKm">KM atual do odômetro</label>
          <input id="vKm" type="number" min="0" inputmode="numeric" value="0" />
        </div>
        <button type="submit" id="salvarVeiculo" class="btn-primary">Salvar veículo</button>
      </form>
    </div>

    ${lista}
  `

  const erro = container.querySelector("#veiculoErro")
  const salvar = container.querySelector("#salvarVeiculo")

  container.querySelector("#formVeiculo").onsubmit = async event => {
    event.preventDefault()
    erro.innerText = ""
    salvar.disabled = true

    const media = container.querySelector("#vMedia").value
    const km = container.querySelector("#vKm").value

    try {
      await VeiculoService.criar({
        nome: container.querySelector("#vNome").value,
        combustivel: container.querySelector("#vCombustivel").value,
        mediaConsumo: media === "" ? null : Number(media),
        kmAtual: km === "" ? 0 : Number(km)
      })
      await renderVeiculos(container)
    } catch (e) {
      erro.innerText = e.message || "Não foi possível salvar o veículo."
      salvar.disabled = false
    }
  }

  container.querySelectorAll("[data-ativar]").forEach(botao => {
    botao.onclick = async () => {
      botao.disabled = true
      try {
        await VeiculoService.ativar(botao.dataset.ativar)
        await renderVeiculos(container)
      } catch (e) {
        erro.innerText = "Não foi possível ativar o veículo."
        botao.disabled = false
      }
    }
  })
}
