// Componente "Pague um café ao Desenvolvedor" — arquivo independente, pode ser copiado para outros projetos.
//
// Como usar (uma linha):
//   import { montarCafe } from "./cafe.js"
//   montarCafe(document.getElementById("cafe"), { chave: "sua-chave-pix" })
//
// Ele cria sozinho o ícone da xícara dentro do elemento informado, o estilo e a janela com animação.
// Não depende de nenhum outro arquivo. Usa as variáveis de cor do site (--surface, --text, --muted, --primary)
// e, se elas não existirem, usa cores padrão.

const ESTILO = `
.cafe-botao{background:none;border:none;padding:4px;cursor:pointer;color:var(--muted,#6b7280);opacity:.8;display:inline-flex;align-items:center;line-height:0}
.cafe-botao:hover{opacity:1;color:var(--text,#1f2430)}
.cafe-botao svg{width:22px;height:22px}
.cafe-fundo{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:100;animation:cafe-surgir .25s ease}
.cafe-janela{position:relative;width:100%;max-width:340px;background:var(--surface,#fff);color:var(--text,#1f2430);border-radius:22px;padding:24px 20px 20px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.35);animation:cafe-subir .45s cubic-bezier(.2,1.3,.4,1)}
.cafe-janela h3{margin:6px 0 4px;font-size:20px}
.cafe-janela p{margin:0 0 14px;color:var(--muted,#6b7280);font-size:14px}
.cafe-fechar{position:absolute;top:8px;right:12px;background:none;border:none;font-size:26px;line-height:1;color:var(--muted,#6b7280);cursor:pointer}
.cafe-xicara{width:120px;height:120px;display:block;margin:0 auto;animation:cafe-balanco 3s ease-in-out infinite}
.cafe-vapor{fill:none;stroke:#9aa1b2;stroke-width:3;stroke-linecap:round;opacity:0;animation:cafe-vapor 2.6s ease-in-out infinite}
.cafe-vapor:nth-of-type(2){animation-delay:.8s}
.cafe-vapor:nth-of-type(3){animation-delay:1.6s}
.cafe-coracao{position:absolute;left:50%;top:30px;font-size:16px;opacity:0;animation:cafe-coracao 3.2s ease-in infinite}
.cafe-coracao:nth-of-type(2){animation-delay:1.1s;margin-left:-26px}
.cafe-coracao:nth-of-type(3){animation-delay:2.1s;margin-left:24px}
.cafe-chave{display:block;margin:0 auto 14px;padding:8px 12px;border-radius:10px;background:rgba(127,127,127,.12);font-weight:700;letter-spacing:.5px;user-select:all}
.cafe-copiar{width:100%;padding:13px;border:none;border-radius:12px;background:var(--primary,#2563eb);color:#fff;font:inherit;font-weight:700;cursor:pointer;transition:transform .15s,background .2s}
.cafe-copiar:active{transform:scale(.97)}
.cafe-copiar.copiado{background:#16a34a;animation:cafe-pulo .4s ease}
@keyframes cafe-surgir{from{opacity:0}to{opacity:1}}
@keyframes cafe-subir{from{opacity:0;transform:translateY(40px) scale(.85)}to{opacity:1;transform:none}}
@keyframes cafe-balanco{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) translateY(-3px)}}
@keyframes cafe-vapor{0%{opacity:0;transform:translateY(8px)}30%{opacity:.9}100%{opacity:0;transform:translateY(-16px)}}
@keyframes cafe-coracao{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-34px) scale(1.2)}}
@keyframes cafe-pulo{0%{transform:scale(.95)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.cafe-janela,.cafe-fundo,.cafe-xicara,.cafe-vapor,.cafe-coracao,.cafe-copiar.copiado{animation:none}.cafe-vapor{opacity:.6}}
`

// Ícone pequeno da barra: xícara com pires e fumaça (o ícone do botão e a xícara da janela usam o mesmo desenho)
const ICONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3c-1 1 1 2 0 3M12 3c-1 1 1 2 0 3M16 3c-1 1 1 2 0 3"/><path d="M5 10h12v4a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H16.5"/><path d="M4 21h15"/></svg>`

// Desenho grande da janela: xícara colorida com vapor animado e corações subindo
const XICARA = `
<div style="position:relative">
  <svg class="cafe-xicara" viewBox="0 0 120 120" aria-hidden="true">
    <path class="cafe-vapor" d="M44 40c-6-6 6-10 0-18"/>
    <path class="cafe-vapor" d="M60 40c-6-6 6-10 0-18"/>
    <path class="cafe-vapor" d="M76 40c-6-6 6-10 0-18"/>
    <path d="M30 52h60v22a24 24 0 0 1-24 24h-12a24 24 0 0 1-24-24z" fill="#8b5a2b"/>
    <path d="M30 52h60v8H30z" fill="#6f4518"/>
    <path d="M90 58h6a11 11 0 0 1 0 22h-8" fill="none" stroke="#8b5a2b" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="60" cy="108" rx="40" ry="6" fill="#d9c3a3"/>
  </svg>
  <span class="cafe-coracao">❤️</span><span class="cafe-coracao">❤️</span><span class="cafe-coracao">❤️</span>
</div>`

// Copia o texto para a área de transferência (usa o método moderno e, se não der, o antigo)
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto)
  } catch {
    const campo = document.createElement("textarea")
    campo.value = texto
    campo.style.position = "fixed"
    campo.style.opacity = "0"
    document.body.appendChild(campo)
    campo.select()
    const deu = document.execCommand("copy")
    campo.remove()
    if (!deu) throw new Error("Não foi possível copiar")
  }
}

// Abre a janela "Pague um café": animação, chave e botão de copiar
function abrirJanela(chave) {
  const fundo = document.createElement("div")
  fundo.className = "cafe-fundo"
  fundo.innerHTML = `
    <div class="cafe-janela" role="dialog" aria-modal="true" aria-label="Pague um café ao Desenvolvedor">
      <button type="button" class="cafe-fechar" aria-label="Fechar">×</button>
      ${XICARA}
      <h3>Pague um café ao Desenvolvedor</h3>
      <p>Gostou do app? Qualquer valor ajuda a manter o projeto.</p>
      <span class="cafe-chave">${chave.replace(/[<>&]/g, "")}</span>
      <button type="button" class="cafe-copiar">Copiar chave Pix</button>
    </div>`

  // Fecha a janela e para de escutar o teclado
  const fechar = () => {
    fundo.remove()
    document.removeEventListener("keydown", aoApertarTecla)
  }
  const aoApertarTecla = evento => { if (evento.key === "Escape") fechar() }

  const botao = fundo.querySelector(".cafe-copiar")
  botao.onclick = async () => {
    try {
      await copiar(chave)
      botao.textContent = "Chave Copiada, obrigado"
      botao.classList.add("copiado")
    } catch {
      botao.textContent = "Não deu para copiar. Selecione a chave acima"
    }
  }

  fundo.onclick = evento => {
    if (evento.target === fundo || evento.target.closest(".cafe-fechar")) fechar()
  }
  document.addEventListener("keydown", aoApertarTecla)
  document.body.appendChild(fundo)
}

// Coloca o ícone da xícara dentro do elemento informado; ao clicar abre a janela com a chave Pix
export function montarCafe(elemento, { chave }) {
  if (!document.getElementById("cafe-estilo")) {
    const estilo = document.createElement("style")
    estilo.id = "cafe-estilo"
    estilo.textContent = ESTILO
    document.head.appendChild(estilo)
  }

  const botao = document.createElement("button")
  botao.type = "button"
  botao.className = "cafe-botao"
  botao.title = "Pague um café ao Desenvolvedor"
  botao.setAttribute("aria-label", "Pague um café ao Desenvolvedor")
  botao.innerHTML = ICONE
  botao.onclick = () => abrirJanela(chave)
  elemento.appendChild(botao)
}
