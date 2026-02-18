import {renderDashboard} from "./ui/dashboardUI.js"

const app = document.getElementById("app")

const routes={
  dashboard: renderDashboard
}

document.querySelectorAll("[data-page]")
.forEach(btn=>{
  btn.onclick=()=>navigate(btn.dataset.page)
})

function navigate(page){

  routes[page](app)

}

navigate("dashboard")
