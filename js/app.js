import { auth, initFirebase, onAuthChange, signOutUser } from "./firebase.js"
import { renderDashboard } from "./ui/dashboardUI.js"
import { renderAuth } from "./ui/authUI.js"

const app = document.getElementById("app")
const nav = document.querySelector(".bottom-nav")
const logoutBtn = document.getElementById("logoutBtn")

const routes = {
  dashboard: renderDashboard,
  veiculos: () => app.innerHTML = "<div class='card'>Tela Veículos</div>",
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

  if (page === "login") {
    setNavVisible(false)
    document.getElementById("page-title").innerText = "Entrar"
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

