import {CorridaService} from "../services/corridaService.js"

export function renderDashboard(container){

  const corridas = CorridaService.listar()

  const total = corridas.reduce((s,c)=>s+c.valor,0)

  container.innerHTML=`
    <div class="card">
      <h2>Ganhos Totais</h2>
      <h1>R$ ${total.toFixed(2)}</h1>
    </div>
  `

}
