import { auth, initFirebase, onAuthChange, signOutUser } from "./firebase.js"
import { renderDashboard } from "./ui/dashboardUI.js"
import { renderAuth } from "./ui/authUI.js"
import { renderVeiculos } from "./ui/veiculosUI.js"
import { iniciarTema } from "./theme.js"
import { iniciarPWA } from "./pwa.js"

const NOME_DO_APP = "Gestor de Veículos"

const container = document.querySelector(".app-container")
const app = document.getElementById("app")
const nav = document.querySelector(".bottom-nav")
const logoutBtn = document.getElementById("logoutBtn")

iniciarTema(document.getElementById("themeToggle"))
iniciarPWA(document.getElementById("installBtn"))

const routes = {
  dashboard: renderDashboard,
  veiculos: renderVeiculos,
  corridas: () => app.innerHTML = "<div class='card'>Tela Corridas</div>",
  manutencao: () => app.innerHTML = "<div class='card'>Tela Manutenção</div>",
  combustivel: () => app.innerHTML = "<div class='card'>Tela Combustível</div>"
}

document.querySelectorAll("[data-page]")
  .forEach(btn => {
    btn.onclick = () => navigate(btn.dataset.page)
  })

logoutBtn.onclick = async () => {
  try {
    await signOutUser()
  } catch (error) {
    console.error(error)
  }
}

const titles = {
  dashboard: "Início",
  veiculos: "Veículos",
  corridas: "Corridas",
  manutencao: "Manutenção",
  combustivel: "Combustível"
}

function setNavVisible(visible) {
  nav.style.display = visible ? "flex" : "none"
}

function updateLogoutVisibility() {
  logoutBtn.style.display = auth.currentUser ? "inline-flex" : "none"
}

async function navigate(page) {
  if (page !== "login" && !auth.currentUser) {
    return navigate("login")
  }

  container.classList.toggle("is-login", page === "login")

  if (page === "login") {
    setNavVisible(false)
    document.getElementById("page-title").innerText = NOME_DO_APP
    await renderAuth(app, () => navigate("dashboard"))
    return
  }

  if (!routes[page]) return

  setNavVisible(true)
  await routes[page](app)
  document.getElementById("page-title").innerText = titles[page]

  document.querySelectorAll("[data-page]")
    .forEach(btn => {
      btn.classList.toggle("active", btn.dataset.page === page)
    })
}

initFirebase()
  .then(() => {
    onAuthChange(user => {
      updateLogoutVisibility()
      if (user) {
        navigate("dashboard")
      } else {
        navigate("login")
      }
    })
  })
  .catch(err => {
    console.error(err)
  })
