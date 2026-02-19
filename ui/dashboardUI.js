import {CorridaService} from "../services/corridaService.js"
import {VeiculoService} from "../services/veiculoService.js"

export function renderDashboard(container){

  const corridas = CorridaService.listar()
  const veiculos = VeiculoService.listar()
  const ativo = veiculos.find(v=>v.ativo)

  const totalMes = corridas.reduce((s,c)=>s+c.valor,0)

  container.innerHTML = `
  
  <div class="card destaque">
    <h3>Ganhos do Mês</h3>
    <h1>R$ ${totalMes.toFixed(2)}</h1>
  </div>

  <div class="grid-2">
    <div class="card">
      <p>Odômetro</p>
      <strong>${ativo?.kmAtual || 0} km</strong>
    </div>

    <div class="card">
      <p>Média</p>
      <strong>${ativo?.consumo || 0} km/L</strong>
    </div>
  </div>

  <div class="card">
    <button id="novaCorrida" class="btn-primary">
      Nova Corrida
    </button>
  </div>
  
  `
}
