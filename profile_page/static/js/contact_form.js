document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('contact-form')
    const saveBtn = form.querySelector('button')
    const inputs = form.querySelectorAll('input')
    const initialData = {}
    
    inputs.forEach(input => initialData[input.name] = input.value)
    
    function checkInputs() {
        let hasChanged = false
        let emailIsValid = false
        hasChanged = Array.from(inputs).some(inp => inp.value !== initialData[inp.name])
        const emailData = form.elements["email"].value
        emailIsValid =  /^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailData)

        saveBtn.disabled = !(hasChanged && emailIsValid)
        saveBtn.classList.toggle('allowed-to-submit', (hasChanged && emailIsValid))
        saveBtn.classList.toggle('not-allowed-to-submit', !(hasChanged && emailIsValid))
        form.querySelector('.error-msg').classList.toggle('hidden-error-msg', (emailIsValid))
    }

    inputs.forEach(input => input.addEventListener('input', checkInputs))

    IMask(
        form.elements["phone_number"],
        {
            mask: '+{38} (000) 000-00-00',
        }
    )
})