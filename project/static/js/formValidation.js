function initPasswordValidation(passwordFieldId, confirmFieldId, diffPasswordFieldId, weakPasswordFieldId){
    const passwordField = document.getElementById(passwordFieldId)
    const confirmField = document.getElementById(confirmFieldId)
    const diffPasswordField = document.getElementById(diffPasswordFieldId)
    const weakPasswordField = document.getElementById(weakPasswordFieldId)

    function checkPasswords() {
        if (confirmField.value === '' || confirmField.value === passwordField.value ) {
        diffPasswordField.textContent = ''
        return
        }

        if (confirmField.value !== passwordField.value) {
        diffPasswordField.textContent = 'Паролі не збігаються'
        }
    }
    passwordField.addEventListener('input', checkPasswords)
    confirmField.addEventListener('input', checkPasswords)
    passwordField.addEventListener('input', function() {
        if(this.value.length<6){
        if(weakPasswordField.textContent !== 'Пароль повинен складатися мінімум з 6 символів') {
            weakPasswordField.textContent = 'Пароль повинен складатися мінімум з 6 символів'
        }
        }
        else {
        if (weakPasswordField.textContent !== ''){
            weakPasswordField.textContent = ''
        }
        }
    })
}

function initEmailValidation(emailFieldId, emailErrorFieldId){
    const emailField = document.getElementById(emailFieldId)
    const emailErrorField = document.getElementById(emailErrorFieldId)

    emailField.addEventListener('input', function() {
    if (emailErrorField.textContent != ''){
      emailErrorField.textContent = ''
    }
  })
}

function switchModal(from, to){
    from.classList.remove("show");
    to.classList.add("show");
    from.querySelector(".close-btn").click()
}