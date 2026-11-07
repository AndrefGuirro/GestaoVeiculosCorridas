// Modo claro / escuro. A primeira escolha vem do sistema do aparelho;
// depois que o usuário mexer na chave, a escolha dele fica salva neste aparelho.

const CHAVE = "tema"
const COR_DA_BARRA = { light: "#ffffff", dark: "#1a1d27" }

function lerSalvo() {
  try {
    const tema = localStorage.getItem(CHAVE)
    return tema === "dark" || tema === "light" ? tema : null
  } catch {
    return null
  }
}

function temaDoSistema() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function aplicar(tema, botao) {
  document.documentElement.dataset.theme = tema
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COR_DA_BARRA[tema])
  botao?.setAttribute("aria-checked", String(tema === "dark"))
}

export function iniciarTema(botao) {
  aplicar(document.documentElement.dataset.theme || lerSalvo() || temaDoSistema(), botao)

  botao.onclick = () => {
    const novo = document.documentElement.dataset.theme === "dark" ? "light" : "dark"
    aplicar(novo, botao)
    try {
      localStorage.setItem(CHAVE, novo)
    } catch {
      // sem armazenamento disponível: a escolha vale só até fechar o app
    }
  }

  // Sem escolha salva, acompanha o sistema quando ele mudar
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", evento => {
    if (!lerSalvo()) aplicar(evento.matches ? "dark" : "light", botao)
  })
}
