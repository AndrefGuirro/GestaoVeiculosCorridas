import {initDB} from "./storage.js"
import {renderDashboard} from "./ui/dashboardUI.js"

const app = document.getElementById("app")

const routes = {
  dashboard: renderDashboard,
  veiculos: () => app.innerHTML = "<div class='card'>Tela Veículos</div>",
  corridas: () => app.innerHTML = "<div class='card'>Tela Corridas</div>",
  manutencao: () => app.innerHTML = "<div class='card'>Tela Manutenção</div>",
  combustivel: () => app.innerHTML = "<div class='card'>Tela Combustível</div>"
}

document.querySelectorAll("[data-page]")
.forEach(btn=>{
  btn.onclick = () => navigate(btn.dataset.page)
})

const titles = {
  dashboard:"Início",
  veiculos:"Veículos",
  corridas:"Corridas",
  manutencao:"Manutenção",
  combustivel:"Combustível"
}

async function navigate(page){

  if(!routes[page]) return

  await routes[page](app)

  document.getElementById("page-title").innerText = titles[page]

  document.querySelectorAll("[data-page]")
    .forEach(btn=>{
      btn.classList.toggle("active", btn.dataset.page === page)
    })
}
initDB()
  .then(()=>{
    navigate("dashboard")
  })
  .catch(err=>{
    console.error(err)
  })
