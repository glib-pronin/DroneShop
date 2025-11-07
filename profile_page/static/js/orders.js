document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')
    const modalContainer = document.getElementById('confirm-order-canceling-container')
    const confirmationForm = document.getElementById('confirm-order-canceling-form')
    const closeBtn = confirmationForm.querySelector('.close-btn')
    let orderId = null
    let orderBlock = null

    confirmationForm.addEventListener('submit', async (e)=>{
        e.preventDefault()        
        const res = await fetch('/orders', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({orderId})
        })
        const data = await res.json()
        if (data.success) {
            orderBlock?.querySelector('.cancel-order-btn')?.remove()
            orderBlock?.querySelector('.progress-container')?.remove()
            const statusEl = orderBlock?.querySelector('.order-status-p')
            if (statusEl) statusEl.textContent = 'Скасовано'
            orderBlock?.querySelector('.circle-status')?.classList.add('canceled-circle')
        }
        orderId = null
        orderBlock = null
        closeBtn.click()
    })

    formRowsContainer.addEventListener('click', (e)=>{
        if (e.target.closest('.open-body')) {
            const target = e.target.closest('.open-body')
            const blockBody = target.closest('.choose-block').querySelector('.choose-block-body')
            if (target.classList.contains('rotate')) {
                blockBody.querySelector('.truck')?.remove()
                target.classList.remove('rotate')
                blockBody.classList.add('hide-element')
            } else {
                    const container = blockBody.querySelector(`.step:nth-child(${blockBody.dataset.status})`)
                    if (container) {
                        const svg = createTruckSVG(blockBody.dataset.status)
                        container.append(svg)
                    }
                target.classList.add('rotate')
                blockBody.classList.remove('hide-element')
            }
        } else if (e.target.closest('.copy_code')) {
            copyText(e.target.closest('.copy_code'))
        } else if (e.target.closest('.cancel-order-btn')) {
            const btn = e.target.closest('.cancel-order-btn')
            modalContainer.classList.add('show')
            document.documentElement.classList.add('no-scroll')
            orderId = btn.dataset.id
            orderBlock = btn.closest('.choose-block')
        }
    })

    async function copyText(copyBtn) {
        const textToCopy = copyBtn.previousElementSibling
        const successIcon = copyBtn.nextElementSibling
        console.log(successIcon);
        
        await navigator.clipboard.writeText(textToCopy.textContent)
        copyBtn.classList.add('hide-element')
        successIcon.classList.remove('hide-element')
        setTimeout(()=>{
            copyBtn.classList.remove('hide-element')
            successIcon.classList.add('hide-element')
        }, 3000)
    }

})