import { signInWithEmail, registerWithEmail, sendPhoneVerification, confirmPhoneCode } from "../firebase.js"
import { saveUserProfile } from "../storage.js"

export async function renderAuth(container, onSuccess) {
  container.innerHTML = `
    <div class="card auth-card">
      <h2>Login ou Cadastro</h2>

      <div class="auth-error" id="authError"></div>

      <form id="emailLoginForm" class="auth-form">
        <p class="form-title">Entrar com e-mail</p>
        <div class="form-group">
          <label for="emailLogin">E-mail</label>
          <input id="emailLogin" type="email" placeholder="nome@exemplo.com" required />
        </div>
        <div class="form-group">
          <label for="passwordLogin">Senha</label>
          <input id="passwordLogin" type="password" placeholder="Senha" required />
        </div>
        <button type="submit" class="btn-primary">Entrar</button>
      </form>

      <form id="emailRegisterForm" class="auth-form">
        <p class="form-title">Cadastrar com e-mail</p>
        <div class="form-group">
          <label for="emailRegister">E-mail</label>
          <input id="emailRegister" type="email" placeholder="nome@exemplo.com" required />
        </div>
        <div class="form-group">
          <label for="passwordRegister">Senha</label>
          <input id="passwordRegister" type="password" placeholder="Senha" required />
        </div>
        <button type="submit" class="btn-secondary">Criar conta</button>
      </form>

      <form id="phoneLoginForm" class="auth-form">
        <p class="form-title">Entrar com telefone</p>
        <div class="form-group">
          <label for="phoneLogin">Telefone</label>
          <input id="phoneLogin" type="tel" placeholder="+5511999999999" required />
        </div>
        <button type="submit" class="btn-secondary">Enviar código</button>
      </form>

      <div id="phoneCodeSection" class="auth-form" style="display:none;">
        <div class="form-group">
          <label for="phoneCode">Código SMS</label>
          <input id="phoneCode" type="text" placeholder="000000" />
        </div>
        <button id="confirmPhoneCode" class="btn-primary">Confirmar código</button>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  `

  const authError = container.querySelector("#authError")
  let confirmationResult = null

  function showError(message) {
    authError.innerText = message
  }

  container.querySelector("#emailLoginForm").onsubmit = async event => {
    event.preventDefault()
    showError("")
    const email = container.querySelector("#emailLogin").value.trim()
    const password = container.querySelector("#passwordLogin").value.trim()

    try {
      const credential = await signInWithEmail(email, password)
      await saveUserProfile({
        email: credential.user.email,
        phoneNumber: credential.user.phoneNumber,
        lastLogin: new Date().toISOString()
      })
      onSuccess()
    } catch (error) {
      showError(error.message || "Falha no login")
    }
  }

  container.querySelector("#emailRegisterForm").onsubmit = async event => {
    event.preventDefault()
    showError("")
    const email = container.querySelector("#emailRegister").value.trim()
    const password = container.querySelector("#passwordRegister").value.trim()

    try {
      const credential = await registerWithEmail(email, password)
      await saveUserProfile({
        email: credential.user.email,
        phoneNumber: credential.user.phoneNumber,
        createdAt: new Date().toISOString()
      })
      onSuccess()
    } catch (error) {
      showError(error.message || "Falha no cadastro")
    }
  }

  container.querySelector("#phoneLoginForm").onsubmit = async event => {
    event.preventDefault()
    showError("")
    const phone = container.querySelector("#phoneLogin").value.trim()

    try {
      confirmationResult = await sendPhoneVerification(phone)
      container.querySelector("#phoneCodeSection").style.display = "block"
      showError("Código SMS enviado. Verifique seu telefone.")
    } catch (error) {
      showError(error.message || "Falha ao enviar código")
    }
  }

  container.querySelector("#confirmPhoneCode").onclick = async event => {
    event.preventDefault()
    showError("")
    const code = container.querySelector("#phoneCode").value.trim()

    if (!confirmationResult) {
      showError("Primeiro envie o código para o telefone")
      return
    }

    try {
      const credential = await confirmPhoneCode(confirmationResult, code)
      await saveUserProfile({
        email: credential.user.email,
        phoneNumber: credential.user.phoneNumber,
        lastLogin: new Date().toISOString()
      })
      onSuccess()
    } catch (error) {
      showError(error.message || "Falha ao confirmar código")
    }
  }
}
