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
        emailIsValid = emailData === '' || /^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailData)

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

    IMask(
        form.elements["birth_date"],
        {
            mask: Date,
            // pattern: 'Y-`m-`d',
            min: new Date(1960, 0, 1),
            max: new Date(2026, 0, 1),
        }
    )
})