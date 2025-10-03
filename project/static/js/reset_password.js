document.addEventListener('DOMContentLoaded', ()=>{
    const enterEmailContainer = document.getElementById('enter-email-container')
    const enterCodeContainer = document.getElementById('enter-code-container')
    const resetPasswordContainer = document.getElementById('reset-password-container')
    const resultResettingContainer = document.getElementById('result-resetting-container')
    const enterEmailForm = document.getElementById('enter-email-form')
    const enterCodeForm = document.getElementById('enter-code-form')
    const resetPasswordForm = document.getElementById('reset-password-form')
    const emailError = enterEmailForm.querySelector('#not-existing-email-error')
    const codeError = enterCodeForm.querySelector('#invalid-code-error')
    const weakPasswordError = resetPasswordForm.querySelector('#reset-weak-password')
    const diffPasswordError = resetPasswordForm.querySelector('#reset-diff-password')
    const sessionError = resetPasswordForm.querySelector('#session-error')
    const emailSessionError = enterEmailForm.querySelector('#enter-email-error')
    const codeSessionError = enterCodeForm.querySelector('#enter-code-error')
    const digitInputs = document.querySelectorAll('.digit')

    initEmailValidation('reset-email', 'not-existing-email-error')
    enterEmailForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const email = enterEmailForm.elements["email"].value
        if (!email){
            emailError.textContent = 'Потрібно заповнити це поле'
            return
        }
        const res = await fetch('/send_code', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email })
        })
        const data = await res.json()
        if (data.success) {
            switchModal(enterEmailContainer, enterCodeContainer)
        }
        else if (data.error === 'invalid_credentials') {
            emailError.textContent = 'Немає користувача за такою електронною поштою'
        } else if (data.error === 'already_logged_in') {
            emailSessionError.textContent = 'Ви вже авторизовані'
        } else if (data.error === 'email_not_sent') {
            emailSessionError.textContent = 'Сталася помилка під час відправлення коду'
        }
        
    })
    
    digitInputs.forEach((digit, i)=>{
        digit.addEventListener('input', ()=>{
            digit.value = digit.value.replace(/\D/g, '')
            if (digit.value && i < digitInputs.length - 1) {
                digitInputs[i+1].focus()
            }
            const isAllFilled = Array.from(digitInputs).every(input => input.value !== '')
            if (isAllFilled){
                codeError.textContent = ''
            }
        })
        digit.addEventListener('keydown', (e)=>{
            if (e.key === "Backspace" && !digit.value && i > 0){
                digitInputs[i-1].focus()
            } else if (e.key === "ArrowLeft" && i > 0){
                digitInputs[i-1].focus()
            } else if (e.key === "ArrowRight" && i < digitInputs.length - 1){
                digitInputs[i+1].focus()
            } 
        })
    })

    enterCodeForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        let code = ''
        digitInputs.forEach(input => code += input.value)
        console.log(code);
        if (code.length < 6){
            codeError.textContent = 'Заповніть усі поля'
            return
        }
        const res = await fetch('/verify_code', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ code })
        })
        const data = await res.json()
        if (data.success){
            switchModal(enterCodeContainer, resetPasswordContainer)
        } else if (data.error === 'invalid_code') {
            codeError.textContent = 'Код не правильний'
        } else if (data.error === 'already_logged_in') {
            codeSessionError.textContent = 'Ви вже авторизовані'
        }
    })

    initPasswordValidation('reset-password', 'reset-confirm-password', 'reset-diff-password', 'reset-weak-password')
    resetPasswordForm.addEventListener('submit', async (e)=>{
        e.preventDefault()

        const password = resetPasswordForm.elements["password"].value
        const confirmPassword = resetPasswordForm.elements["confirm-password"].value
        if (confirmPassword === password && password.length>=6 ) {
      const res = await fetch('/reset_password', {
          method: "POST",
          headers: {"Content-Type": 'application/json'},
          body: JSON.stringify({ password, confirmPassword })
          })
      const data = await res.json()
      if (data.success){
          switchModal(resetPasswordForm, resultResettingContainer)
        } else {
         if (data.error === 'diff_password') {
            diffPasswordError.textContent = 'Паролі не збігаються'
          } else if (data.error === 'weak_password'){
            weakPasswordError.textContent = 'Пароль повинен складатися мінімум з 6 символів'
          } else if (data.error === 'no_session'){
            sessionError.textContent = 'Сесія не дійсне. Спробуйте ще раз'
          } else if (data.error === 'already_logged_in') {
            sessionError.textContent = 'Ви вже авторизовані'
        }
      }
    }
    })

    resultResettingContainer.querySelector('#result-resetting-form').addEventListener('submit', (e)=>{
        e.preventDefault()
        switchModal(resultResettingContainer, document.querySelector('#auth-container'))
    })
})


