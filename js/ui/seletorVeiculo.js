import { esc, numero } from "../utils.js"

// Abre por cima da tela a lista dos veículos já cadastrados.
// Ao tocar em um veículo chama aoEscolher(id). Sem veículos, oferece ir para a tela Veículos (aoCadastrar).
// Fecha tocando em Fechar, fora da lista ou na tecla Esc.
export function abrirSeletorVeiculo(veiculos, aoEscolher, aoCadastrar) {
  const fundo = document.createElement("div")
  fundo.className = "folha-fundo"
  let ocupado = false

  const itens = veiculos.map(v => `
    <button type="button" class="folha-item${v.ativo ? " ativo" : ""}" data-id="${esc(v.id)}">
      <span><strong>${esc(v.nome)}</strong><small>${esc(v.combustivel)} · ${numero(v.kmAtual)} km</small></span>
      ${v.ativo ? `<span class="badge">Ativo</span>` : ""}
    </button>`).join("")

  fundo.innerHTML = `
    <div class="folha" role="dialog" aria-modal="true" aria-label="Escolher veículo">
      <h3>Escolher veículo</h3>
      <div class="auth-error" role="alert"></div>
      ${itens || `
        <p class="muted">Nenhum veículo cadastrado.</p>
        <button type="button" class="btn-primary" data-cadastrar>Cadastrar na tela Veículos</button>`}
      <button type="button" class="btn-secondary" data-fechar>Fechar</button>
    </div>`

  // Fecha a lista e para de escutar o teclado
  const fechar = () => {
    fundo.remove()
    document.removeEventListener("keydown", aoApertarTecla)
  }

  // Esc fecha a lista
  const aoApertarTecla = evento => {
    if (evento.key === "Escape") fechar()
  }

  // Trata o toque em qualquer ponto da lista: fechar, cadastrar ou escolher um veículo
  fundo.onclick = async evento => {
    if (evento.target === fundo || evento.target.closest("[data-fechar]")) return fechar()
    if (evento.target.closest("[data-cadastrar]")) {
      fechar()
      return aoCadastrar()
    }

    const item = evento.target.closest("[data-id]")
    if (!item || ocupado) return
    if (item.classList.contains("ativo")) return fechar()

    ocupado = true
    try {
      await aoEscolher(item.dataset.id)
      fechar()
    } catch (erro) {
      fundo.querySelector(".auth-error").innerText = "Não foi possível trocar o veículo."
      ocupado = false
    }
  }

  document.addEventListener("keydown", aoApertarTecla)
  document.body.appendChild(fundo)
}
