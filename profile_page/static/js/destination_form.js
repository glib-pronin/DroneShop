document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')
    const blocks = document.querySelectorAll('.choose-block')
    const dataDestList = document.getElementById('destinations-list')
    const dataCityList = document.getElementById('cities-list')

    function onSpanInput(span){
        const input = span.parentElement.previousElementSibling
        input.value = span.textContent
        getDepartments(input.value)
    }

    function checkCity(city) {
        const options = Array.from(dataCityList.querySelectorAll('option'))     
        return options.some(option => option.textContent === city)
    }

    function checkDest(dest) {
        const options = Array.from(dataDestList.querySelectorAll('option'))     
        return options.some(option => option.textContent === dest)
    }

    formRowsContainer.addEventListener('click', (e)=>{
        if (e.target.classList.contains('help-find-span')){
            onSpanInput(e.target)
        }
    })

    formRowsContainer.addEventListener('focusout', (e)=>{
        if (e.target.name === 'city') {
            getDepartments(e.target.value)
        }
    })

    async function getDepartments(city_name, type='all') {
        if (city_name.trim() !== '') {
            const res = await fetch('/api/departments', {
              method: "POST",
              headers: {"Content-Type": 'application/json'},
              body: JSON.stringify({ city_name, type }) 
            })
            const data = await res.json()
            dataDestList.innerHTML = ''
            data.forEach(name => {
                const option = document.createElement('option')
                option.textContent = name
                dataDestList.append(option)
            })
        } else {
            dataDestList.innerHTML = ''
        }
    }

    function disableBtn(block) {
        const btn = block.querySelector('.save-changes-btn')
        btn.disabled = true
        btn.classList.add('not-allowed-to-submit')
        btn.classList.remove('allowed-to-submit')
    }

    blocks.forEach(block=>{
        const toggleBtn = block.querySelector('.toggle-body')
        const blockBody = block.querySelector('.choose-block-body')
        const inputs = block.querySelectorAll('input:not([type="radio"])')
        const saveBtn = block.querySelector('.save-changes-btn')
        block.initialData = {}
        
        function checkInputs(){
            let hasChanged = false
            let isCityValid = false
            let isDestValid = false
            hasChanged = Array.from(inputs).some(inp => inp.value !== block.initialData[inp.name])
            isCityValid = checkCity(inputs[0].value)
            isDestValid = checkDest(inputs[1].value)
            const canSave = hasChanged && isCityValid && isDestValid
            saveBtn.disabled = !canSave
            saveBtn.classList.toggle('allowed-to-submit', canSave)
            saveBtn.classList.toggle('not-allowed-to-submit', !canSave)
        }

        async function saveData() {
            const res = await fetch('/destinations', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: saveBtn.dataset.id, city: inputs[0].value, place: inputs[1].value})
            })
            const data = await res.json()
            if (data.success) {
                block.initialData.city = data.new_city
                block.initialData.destination = data.new_place
                disableBtn(block)
                block.querySelector('.choose-block-header-p').textContent = data.header
                block.querySelector('.error-msg').classList.add('hide-element')
            } else {
                block.querySelector('.error-msg').classList.remove('hide-element')
                disableBtn(block)
                inputs.forEach(input => input.value = block.initialData[input.name])
            }
        }

        toggleBtn.addEventListener('click', ()=>{
            const isOpen = blockBody.classList.contains('hide-element')

            blocks.forEach(b=>{
                b.querySelector('.choose-block-body').classList.add('hide-element')
                b.querySelectorAll('input:not([type="radio"])').forEach(input => {
                    input.removeEventListener('input', checkInputs)
                    if (b.initialData[input.name]) input.value = b.initialData[input.name]
                })
                b.querySelector('.save-changes-btn').removeEventListener('click', saveData)
                disableBtn(b)
                b.querySelector('.error-msg').classList.add('hide-element')
            })
            if (isOpen) {
                blockBody.classList.remove('hide-element')
                getDepartments(inputs[0].value)
                inputs.forEach(input => {
                    block.initialData[input.name] = input.value
                    input.addEventListener('input', checkInputs)
                })
                saveBtn.addEventListener('click', saveData)
            }
        })
    })      
})