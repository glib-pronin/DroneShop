document.addEventListener('DOMContentLoaded', ()=>{
    const sendBtn = document.getElementById('make-order-btn')
    const userInfoInputs = document.querySelectorAll('.order-form input')
    const radioInputs = document.querySelectorAll('.choose-block-header > input[type="radio"]')    
    const deliveryErrorInput = document.getElementById('delivery-error')
    const paymentErrorInput = document.getElementById('payment-error')
    const commentTextarea = document.querySelector('textarea')
    const itemContainer = document.getElementById('single-product')    

    const requiredFields = ['second_name', 'first_name', 'phone_number', 'email']

    document.querySelectorAll('input').forEach(field => {
        if (field.name === "phone_number") {
            IMask(
                field,
                {
                    mask: '+{38} (000) 000-00-00'
                }
            )
        }
        field.addEventListener('input', ()=>{
            if (field.name === "email"){
                field.nextElementSibling?.classList.toggle('hide', /^[a-zA-Z0-9+_%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(field.value))
            } else {
                field.nextElementSibling?.classList.add('hide')
            }
        })
    })
    radioInputs.forEach(radio =>{
        radio.addEventListener('change', ()=> {
            radio.closest('.choose-container').previousElementSibling.querySelector('.error-msg').classList.add('hide')
            radio.closest('.choose-container').querySelectorAll('.error-msg').forEach(error => error.classList.add('hide'))
        })
    })

    sendBtn.addEventListener('click', async ()=>{
        let isValid = true
        const data = {}
        userInfoInputs.forEach(field =>  {
            data[field.name] = field.value
            if (!field.value.trim() && requiredFields.includes(field.name)) {
                field.nextElementSibling.classList.remove('hide')
                isValid = false
            }
        })
        data[commentTextarea.name] = commentTextarea.value

        const delivaryType = document.querySelector('input[name="delivery_type"]:checked')
        if (!delivaryType){
            deliveryErrorInput.classList.remove('hide')
            isValid = false
        } else {
            data[delivaryType.name] = delivaryType.value
            const block = delivaryType.closest('.choose-block')
            const city = block.querySelector('input[name="city"]')
            if (!city.value.trim()){
                city.nextElementSibling.classList.remove('hide')
                isValid = false
            } 
            data[city.name] = city.value
            const deliveryDestination = block.querySelector(`input[name="${delivaryType.value}"]`)
            const options = Array.from(block.querySelectorAll('option'))     
            if (!options.some(option => option.textContent === deliveryDestination.value)) {
                deliveryDestination.nextElementSibling.classList.remove('hide')
                isValid = false
            }        
            data[deliveryDestination.name] = deliveryDestination.value    
        }

        const payment = document.querySelector('input[name="payment_type"]:checked')
        if (!payment){
            paymentErrorInput.classList.remove('hide')
            isValid = false
        } else {
            data[payment.name] = payment.value
        }
        if (!isValid) return
        if (itemContainer) {
            data.product_id = itemContainer.dataset.id
            data.product_quantity = singleProductCount
        }
        const res = await fetch('/make_order', {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({data})
        })

        const res_data = await res.json()
        if (res_data.error){
            if (res_data.error === "missed_field" || res_data.error === "invalid_email" || res_data.error === "invalid_number"){
                if (res_data.name === "delivery_type") {
                    deliveryErrorInput.classList.remove('hide')
                } else if (res_data.name === "payment_type") {
                    paymentErrorInput.classList.remove('hide')

                } else if (res_data.name === "city") {
                    const input = document.querySelector(`#${document.querySelector('input[name="delivery_type"]:checked').value}-city`)
                    input.nextElementSibling.classList.remove('hide')
                } else {
                    const input = document.querySelector(`input[name="${res_data.name}"]`)
                    input.nextElementSibling.classList.remove('hide')
                }
            } else if (res_data.error === "invalid_id") {
                window.location.href = `/order?product_id=${res_data.id}`
            } else if (res_data.error === "empty_cart") {
                window.location.href = `/order`
            } else if (res_data.error === "need_to_authorize") {
                window.location.href = `/order`
            }
        } else{
            window.location.href = `/success`
        }
    })
})