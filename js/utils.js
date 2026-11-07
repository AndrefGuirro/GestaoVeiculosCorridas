export function uuid(){
  return crypto.randomUUID()
}

export function hoje(){
  return new Date().toISOString()
}

// Protege o HTML: use sempre que mostrar um texto digitado pelo usuário dentro de innerHTML
export function esc(texto){
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function moeda(valor){
  return (valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function numero(valor, casas = 0){
  return (valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas
  })
}
