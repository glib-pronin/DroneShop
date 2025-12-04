document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')
    const updateShipNumberContainer = document.getElementById('shipment-number-container')
    const updateShipNumberForm = document.getElementById('shipment-number-form')

    updateShipNumberForm.elements.shipmentNumber.addEventListener('input', (e)=>{
        e.target.value = e.target.value.replace(/\D/g, '')        
    })

    let submitHandler

    formRowsContainer.addEventListener('click', (e)=>{
        if (e.target.closest('.clickable-number')) {
            const shipmentNumberElement = e.target.closest('.clickable-number')
            updateShipNumberContainer.classList.add('show')
            document.documentElement.classList.add('no-scroll')
            updateShipNumberForm.elements.shipmentNumber.value = /^\d+$/.test(shipmentNumberElement.textContent) ? shipmentNumberElement.textContent : 0 
            if (submitHandler) updateShipNumberForm.removeEventListener('submit', submitHandler)
            submitHandler = async function(e) {
                e.preventDefault()
                let shipmentNumber = updateShipNumberForm.elements.shipmentNumber.value
                if (shipmentNumber.trim() === '0' || !shipmentNumber) shipmentNumber = 'Ще не визначений'
                const res = await fetch('/api/change_shipment_number', {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({order_id: shipmentNumberElement.dataset.orderId, shipment_number: shipmentNumber})
                })
                const data = await res.json()
                if (data.success) {
                    updateShipNumberContainer.querySelector('.close-btn').click()
                    shipmentNumberElement.textContent = data.shipmentNumber
                    const container = shipmentNumberElement.closest('.choose-block')
                    container.querySelector('.number-for-admin').textContent = data.shipmentNumber
                }
            }
            updateShipNumberForm.addEventListener('submit', submitHandler)
        }
    })
})