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

// "06/11, 22:35"
export function dataHora(iso){
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

// "06/11/2026"
export function dataCurta(iso){
  return new Date(iso).toLocaleDateString("pt-BR")
}

// "22:35"
export function hora(iso){
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

// "Novembro de 2026"
export function mesAno(data){
  const texto = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

// Data no formato do campo <input type="date"> ("2026-11-24"), no fuso do aparelho
export function paraInputData(iso){
  const d = new Date(iso)
  const dois = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
}

// Devolve a data original se o dia não mudou; se mudou, usa o novo dia ao meio-dia (evita virar o dia por fuso)
export function novaData(original, texto){
  if (texto === paraInputData(original)) return original
  const [ano, mes, dia] = String(texto).split("-").map(Number)
  const nova = new Date(ano, mes - 1, dia, 12)
  if (!ano || isNaN(nova)) throw new Error("Data inválida")
  return nova.toISOString()
}
