import { signInWithEmail, registerWithEmail, mensagemErroAuth } from "../firebase.js"
import { saveUserProfile } from "../storage.js"

export async function renderAuth(container, onSuccess) {
  let modoCadastro = false

  container.innerHTML = `
    <div class="login-screen">
      <div class="login-brand">
        <img class="brand-logo" src="icons/icon-192.png" alt="" width="76" height="76">
        <h1>Gestor de Veículos</h1>
        <p>Suas corridas, km e finanças em um só lugar</p>
      </div>

      <div class="card auth-card">
        <h2 id="authTitulo">Entrar</h2>
        <p class="muted" id="authSubtitulo">Acesse sua conta para continuar</p>

        <div class="auth-error" id="authError" role="alert"></div>

        <form id="authForm">
          <div class="form-group">
            <label for="authEmail">E-mail</label>
            <input id="authEmail" type="email" placeholder="nome@exemplo.com" autocomplete="email" required />
          </div>
          <div class="form-group">
            <label for="authSenha">Senha</label>
            <input id="authSenha" type="password" placeholder="Mínimo 6 caracteres" autocomplete="current-password" required />
          </div>
          <button type="submit" id="authEnviar" class="btn-primary">Entrar</button>
        </form>

        <button type="button" id="authAlternar" class="btn-secondary">Não tenho conta. Criar agora</button>
      </div>
    </div>
  `

  const titulo = container.querySelector("#authTitulo")
  const subtitulo = container.querySelector("#authSubtitulo")
  const erro = container.querySelector("#authError")
  const enviar = container.querySelector("#authEnviar")
  const alternar = container.querySelector("#authAlternar")
  const senha = container.querySelector("#authSenha")

  function mostrarModo() {
    titulo.innerText = modoCadastro ? "Criar conta" : "Entrar"
    subtitulo.innerText = modoCadastro ? "Cadastre-se para começar a usar" : "Acesse sua conta para continuar"
    enviar.innerText = modoCadastro ? "Criar conta" : "Entrar"
    alternar.innerText = modoCadastro ? "Já tenho conta. Entrar" : "Não tenho conta. Criar agora"
    senha.autocomplete = modoCadastro ? "new-password" : "current-password"
    erro.innerText = ""
  }

  alternar.onclick = () => {
    modoCadastro = !modoCadastro
    mostrarModo()
  }

  container.querySelector("#authForm").onsubmit = async event => {
    event.preventDefault()
    erro.innerText = ""
    enviar.disabled = true

    const email = container.querySelector("#authEmail").value.trim()
    const password = senha.value

    try {
      const credential = modoCadastro
        ? await registerWithEmail(email, password)
        : await signInWithEmail(email, password)

      // Guardar o perfil é só um extra: se falhar, o login continua valendo
      try {
        await saveUserProfile({
          email: credential.user.email,
          [modoCadastro ? "createdAt" : "lastLogin"]: new Date().toISOString()
        })
      } catch (e) {
        console.warn("Não foi possível salvar o perfil", e)
      }

      onSuccess()
    } catch (error) {
      erro.innerText = mensagemErroAuth(error)
    } finally {
      enviar.disabled = false
    }
  }
}
