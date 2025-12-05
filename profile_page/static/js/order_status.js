document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')
    
    formRowsContainer.addEventListener('click', async (e)=>{
        if (e.target.closest('.step-caption')) {
            const step = e.target.closest('.step-caption').parentNode
            const newStatusCode = step.dataset.statusCode
            const oldStatusCode = step.parentNode.dataset.selected
            if (oldStatusCode === newStatusCode) return
            const res = await fetch('/api/change_status_code', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({order_id: step.closest('.choose-block').dataset.orderId, status_code: newStatusCode})
            })
            const data = await res.json()
            if (data.success) {
                const progressContainer = step.closest('.progress-bar')
                progressContainer.className = `progress-bar selected-${newStatusCode}`
                progressContainer.querySelector(`.step:nth-child(${oldStatusCode})`).querySelector('.truck').remove()
                step.parentNode.dataset.selected = newStatusCode
                step.parentNode.className = `steps-container selected-${newStatusCode}`
                const svg = createTruckSVG(newStatusCode)
                step.append(svg)
                const mainContainer = step.closest('.choose-block')
                const rightBlock = mainContainer.querySelector('.right-block')
                if (newStatusCode === "5") {
                    mainContainer.querySelector('.circle-status').className = 'circle-status completed-circle'
                    rightBlock.querySelector('.cancel-order-btn').remove()
                } else {
                    mainContainer.querySelector('.circle-status').className = 'circle-status'
                    if (oldStatusCode === "5") {
                        const btn = document.createElement('button')
                        btn.classList.add('cursor-pointer', 'cancel-order-btn')
                        btn.type = "button"
                        btn.dataset.id = data.orderId
                        btn.textContent = 'СКАСУВАТИ'
                        rightBlock.append(btn)
                    } 
                }
                mainContainer.querySelector('.choose-block-body').dataset.status = newStatusCode
                mainContainer.querySelector('.order-status-p').textContent = data.statusMsg
            }
        }
    })
})