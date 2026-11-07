// Instalação do app no celular/computador (PWA)

let eventoInstalar = null

function jaInstalado() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true
}

// iPhone/iPad não têm o aviso automático de instalação: o usuário usa o menu Compartilhar
function ehIOS() {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}

export function iniciarPWA(botaoInstalar) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(erro => {
      console.warn("Service worker não registrado", erro)
    })
  }

  if (!botaoInstalar || jaInstalado()) return

  window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault()
    eventoInstalar = evento
    botaoInstalar.hidden = false
  })

  window.addEventListener("appinstalled", () => {
    eventoInstalar = null
    botaoInstalar.hidden = true
  })

  if (ehIOS()) botaoInstalar.hidden = false

  botaoInstalar.onclick = async () => {
    if (eventoInstalar) {
      eventoInstalar.prompt()
      await eventoInstalar.userChoice
      eventoInstalar = null
      botaoInstalar.hidden = true
    } else {
      alert("Para instalar: toque em Compartilhar e depois em “Adicionar à Tela de Início”.")
    }
  }
}
