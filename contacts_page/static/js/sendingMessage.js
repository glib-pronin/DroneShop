document.addEventListener('DOMContentLoaded', ()=>{
    const form  = document.querySelector('.contact-form')
    const sendBtn = form.querySelector('.send-btn')
    const successMessage = form.querySelector('.result-message.success')
    const errorMessage = form.querySelector('.result-message.error')

    for (const field of form.elements) {
        field.addEventListener('input', ()=>{
            if (field.value.trim() !== '') {
                field.nextElementSibling.classList.add('hide-element')
            }
        })
    }

    IMask(
        form.elements.phone_number,
        {
            mask: '+{38} (000) 000-00-00',
        }
    )
    const emailField = form.elements.email

    function checkEmail() {
         if (!/^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailField.value)) {
            const errorText = emailField.nextElementSibling
            errorText.textContent = "Введіть правильний формат електроної пошти"
            errorText.classList.remove('hide-element')
            return false
        }
        return true
    }

    function checkPhoneNumber() {
        const phoneField = form.elements.phone_number 
        if (!/^\+38\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(phoneField.value)) {
            const errorText = phoneField.nextElementSibling
            errorText.textContent = "Введіть правильний формат мобільного телефону"
            errorText.classList.remove('hide-element')
            return false
        }
        return true
    }

    emailField.addEventListener('input', checkEmail)

    function showResultMessage(message) {
        sendBtn.classList.add('hide-element')
        message.classList.remove('hide-element')
        setTimeout(()=>{
            sendBtn.classList.remove('hide-element')
            message.classList.add('hide-element')
        }, 5000)
    }

    form.addEventListener('submit', async (e)=>{
        let isValidData = true
        e.preventDefault()
        const data = {}
        for (const field of form.elements) {
            if (field === sendBtn) continue
            if (!field.value.trim()) {
                const errorText = field.nextElementSibling
                errorText.textContent = "Це поле обов'язкове"
                errorText.classList.remove('hide-element')
                isValidData = false
            } else {
                data[field.name] = field.value
            }
        }
        if (!checkEmail()) isValidData = false
        if (!checkPhoneNumber()) isValidData = false
        if (!isValidData) return
        const res = await fetch('/send_message', {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({ data })
        }) 
        const resData = await res.json()
        if (resData.success) {
            showResultMessage(successMessage)
        } else {
            const p = errorMessage.querySelector('p')
            p.textContent = resData.message === '429 error' ? 'Ви вичерпали ліміт повідомлень, спробуйте пізніше.' : 'Під час відправки сталася помилка, спробуйте пізніше.'
            showResultMessage(errorMessage)
        }
        form.reset()
    })
})