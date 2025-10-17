document.addEventListener("DOMContentLoaded", function () {
  const authBtnSvg = document.getElementById("auth");
  const authContainer = document.getElementById("auth-container")
  const regisrtContainer = document.getElementById("registr-container")
  const resultContainer = document.getElementById("result-container")
  const resetPasswordContainer = document.getElementById("enter-email-container")
  const registerForm = document.getElementById('register-form')
  const authForm = document.getElementById('auth-form')
  const password = registerForm.elements["password"]
  const confirmPassword = registerForm.elements["confirm-password"]
  const email = registerForm.elements["email"]
  const passwordErrorDiff = registerForm.querySelector('#diff-password')
  const passwordErrorWeak = registerForm.querySelector('#weak-password')
  const emailError = registerForm.querySelector('#existing-email')
  const authError = authForm.querySelector('#auth-error')
  const registerError = registerForm.querySelector('#register-error')

  function fillResultContainer(title, text) {
    resultContainer.querySelector('#result-title').textContent = title
    resultContainer.querySelector('#info-container').textContent = text
  }

  if (authBtnSvg){
      authBtnSvg.addEventListener("click", function() {
        authContainer.classList.add("show");
        document.documentElement.classList.add('no-scroll')
      });
  }

  authContainer.querySelector('#registr-btn').addEventListener("click", function() {
    switchModal(authContainer, regisrtContainer)
  });

  regisrtContainer.querySelector('#auth-btn').addEventListener("click", function() {
    switchModal(regisrtContainer, authContainer)
  });
  
  regisrtContainer.querySelector('#link-to-auth').addEventListener('click', function(e) {
    e.preventDefault()    
    regisrtContainer.querySelector('#auth-btn').click()
  })

  authContainer.querySelector('#link-to-reset').addEventListener('click', function(e) {
    e.preventDefault()    
    switchModal(authContainer, resetPasswordContainer)
  })
  
  initPasswordValidation('registr-password', 'registr-confirm-password', 'diff-password', 'weak-password')
  initEmailValidation('registr-email', 'existing-email')

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault()
    const name = registerForm.elements["name"].value
    const email = registerForm.elements["email"].value
    
    if (confirmPassword.value === password.value && password.value.length>=6 && /^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      const res = await fetch('/register', {
          method: "POST",
          headers: {"Content-Type": 'application/json'},
          body: JSON.stringify({ name, email, password: password.value, confirmPassword: confirmPassword.value })
          })
      const data = await res.json()
      if (data.success){
          switchModal(regisrtContainer, resultContainer)
          fillResultContainer("Реєстрація", "Акаунт успішно створений")
        } else {
          if (data.error === 'existing_email'){
            emailError.textContent = 'Така електронна пошта вже існує'
          } else if (data.error === 'diff_password') {
            passwordErrorDiff.textContent = 'Паролі не збігаються'
          } else if (data.error === 'weak_password'){
            passwordErrorWeak.textContent = 'Пароль повинен складатися мінімум з 6 символів'
          } else if (data.error === 'already_logged_in') {
            registerError.textContent = 'Ви вже авторизовані'
          } else if (data.error === 'invalid_email') {
            emailError.textContent = 'Неправильний формат електронної пошти'
          }
        }
    }
  })
  
  authForm.addEventListener('submit', async function(e) {
    e.preventDefault()
    const email = authForm.elements["email"].value
    const password = authForm.elements["password"].value

    const res = await fetch('/login', {
      method: "POST",
      headers: {"Content-Type": 'application/json'},
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.success) {
      switchModal(authContainer, resultContainer)
      fillResultContainer("Авторизація", "Ви успішно авторизовані")
    } else {
      if (data.error === 'invalid_credentials'){
        authError.textContent = 'Неправильна електронна пошта або пароль'
      } else if (data.error === 'already_logged_in') {
        authError.textContent = 'Ви вже авторизовані'
      }
    }
  })

})