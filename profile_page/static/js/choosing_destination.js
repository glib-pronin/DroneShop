document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')

    formRowsContainer.addEventListener('change', async (e)=>{
        if (e.target.name === 'delivery_type'){
            const destinationId = e.target.dataset.id
            const res = await fetch('/choose_destination', {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({ destinationId })
            })
            const data = await res.json()
            if (data.success){
                e.target.checked = True
            }
        }
    })
})