// Service worker do Gestor de Veículos.
// Guarda os arquivos do app no aparelho para ele abrir rápido e até sem internet
// (os dados do Firestore continuam precisando de conexão).
//
// Quando mudar muita coisa no app, aumente a VERSAO para limpar o cache antigo.
const VERSAO = "v1"
const CACHE = `gestor-veiculos-${VERSAO}`

const ARQUIVOS = [
  "./",
  "index.html",
  "manifest.json",
  "css/variables.css",
  "css/styles.css",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "js/app.js",
  "js/firebase.js",
  "js/firebaseConfig.js",
  "js/storage.js",
  "js/state.js",
  "js/utils.js",
  "js/theme.js",
  "js/pwa.js",
  "js/core/index.js",
  "js/core/veiculo.js",
  "js/core/corrida.js",
  "js/core/manutencao.js",
  "js/core/abastecimento.js",
  "js/core/relatorio.js",
  "js/services/veiculoService.js",
  "js/services/corridaService.js",
  "js/services/manutencaoService.js",
  "js/services/abastecimentoService.js",
  "js/ui/authUI.js",
  "js/ui/dashboardUI.js",
  "js/ui/veiculosUI.js"
]

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(
        chaves
          .filter(chave => chave.startsWith("gestor-veiculos-") && chave !== CACHE)
          .map(chave => caches.delete(chave))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", event => {
  const pedido = event.request
  if (pedido.method !== "GET") return

  const url = new URL(pedido.url)

  // Arquivos do próprio app: tenta a internet primeiro (assim as atualizações chegam
  // logo) e usa o que está guardado se estiver sem conexão
  if (url.origin === self.location.origin) {
    event.respondWith(redePrimeiro(pedido))
    return
  }

  // Biblioteca do Firebase (versão fixa): pode vir direto do cache
  if (url.origin === "https://www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
    event.respondWith(cachePrimeiro(pedido))
  }

  // Qualquer outra coisa (Firestore, login) passa direto, sem interferência
})

async function redePrimeiro(pedido) {
  const cache = await caches.open(CACHE)
  try {
    const resposta = await fetch(pedido, { cache: "no-cache" })
    if (resposta.ok) cache.put(pedido, resposta.clone())
    return resposta
  } catch (erro) {
    const guardado = await cache.match(pedido, { ignoreSearch: true })
    if (guardado) return guardado

    if (pedido.mode === "navigate") {
      const inicio = await cache.match("index.html")
      if (inicio) return inicio
    }
    return Response.error()
  }
}

async function cachePrimeiro(pedido) {
  const cache = await caches.open(CACHE)
  const guardado = await cache.match(pedido)
  if (guardado) return guardado

  const resposta = await fetch(pedido)
  if (resposta.ok) cache.put(pedido, resposta.clone())
  return resposta
}
