document.addEventListener('DOMContentLoaded', ()=>{
    const formRowsContainer = document.querySelector('.form-rows-container')

    formRowsContainer.addEventListener('click', (e)=>{
        const target = e.target.closest('.open-body')
        if (target) {
            const blockBody = target.closest('.choose-block').querySelector('.choose-block-body')
            if (target.classList.contains('rotate')) {
                blockBody.querySelector('.truck').remove()
                target.classList.remove('rotate')
                blockBody.classList.add('hide-element')
            } else {
                    const svg = createTruckSVG(blockBody.dataset.status)
                    const container = blockBody.querySelector(`.step:nth-child(${blockBody.dataset.status})`)
                    container.append(svg)
                target.classList.add('rotate')
                blockBody.classList.remove('hide-element')
            }
        }
    })
})