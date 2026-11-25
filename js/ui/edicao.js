import { esc } from "../utils.js"

// Monta o HTML de um campo do formulário de edição, conforme o tipo (number, text, date, select, checkbox)
function montarCampo(c) {
  if (c.tipo === "checkbox") {
    return `
      <label class="check-linha">
        <input type="checkbox" data-campo="${c.nome}" ${c.valor ? "checked" : ""} />
        <span>${esc(c.rotulo)}</span>
      </label>`
  }

  const entrada = c.tipo === "select"
    ? `<select data-campo="${c.nome}">${c.opcoes.map(o => `<option value="${esc(o)}"${o === c.valor ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`
    : `<input data-campo="${c.nome}" type="${c.tipo}" value="${esc(c.valor)}" ${c.atributos || ""} required />`

  return `<div class="form-group"><label>${esc(c.rotulo)}</label>${entrada}</div>`
}

// Troca o conteúdo do cartão por um formulário de edição.
// Salvar chama aoSalvar(valores), Excluir chama aoExcluir() (depois de perguntar) e Cancelar chama aoCancelar().
// Se algum deles der erro, a mensagem aparece no próprio formulário.
export function abrirEdicao(cartao, campos, { aoSalvar, aoExcluir, aoCancelar, textoExcluir }) {
  cartao.innerHTML = `
    <form class="form-edicao">
      ${campos.map(montarCampo).join("")}
      <div class="auth-error" role="alert"></div>
      <button type="submit" class="btn-primary">Salvar</button>
      <button type="button" class="btn-secondary" data-cancelar>Cancelar</button>
      <button type="button" class="btn-small btn-perigo" data-excluir>Excluir</button>
    </form>`

  const form = cartao.querySelector("form")
  const erro = form.querySelector(".auth-error")

  // Roda uma ação do formulário travando os botões e mostrando o erro, se houver
  const executar = async acao => {
    erro.innerText = ""
    form.querySelectorAll("button").forEach(b => (b.disabled = true))
    try {
      await acao()
    } catch (e) {
      erro.innerText = e.message || "Não foi possível concluir."
      form.querySelectorAll("button").forEach(b => (b.disabled = false))
    }
  }

  form.onsubmit = evento => {
    evento.preventDefault()
    const valores = {}
    campos.forEach(c => {
      const el = form.querySelector(`[data-campo="${c.nome}"]`)
      valores[c.nome] = c.tipo === "checkbox" ? el.checked
        : c.tipo === "number" ? (el.value === "" ? NaN : Number(el.value))
        : el.value
    })
    executar(() => aoSalvar(valores))
  }

  form.querySelector("[data-cancelar]").onclick = aoCancelar
  form.querySelector("[data-excluir]").onclick = () => {
    if (confirm(textoExcluir)) executar(aoExcluir)
  }
}
