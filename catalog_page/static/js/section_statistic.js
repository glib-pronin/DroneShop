document.addEventListener('DOMContentLoaded', ()=>{
    const addStatisticBtns = document.querySelectorAll('.add-statistic')
    const updateStatisticBtns = document.querySelectorAll('.change-statistic')
    Array.from(addStatisticBtns).forEach(btn=>btn.addEventListener('click', ()=>openStaticticForm(btn.dataset.sectionId)))
    Array.from(updateStatisticBtns).forEach(btn=>btn.addEventListener('click', ()=>openStaticticFormToUpdate(btn.dataset.sectionId)))
})

let submitHandler;

function openStaticticForm(sectionId) {
    const container = document.getElementById('add-statistic-container')
    const form = container.querySelector('#add-statistic-form')
    container.classList.add('show')
    container.querySelector('.modal-header-text .current-modal').textContent = 'Додати статистику'
    container.querySelector('.buttons.buttons-for-changing').classList.add('hide-element')
    container.querySelector('.buttons.buttons-for-adding').classList.remove('hide-element')
    document.documentElement.classList.add('no-scroll')
    form.elements.statistic.value = ''
    if (submitHandler) form.removeEventListener('submit', submitHandler)
    submitHandler = async function(e) {
        e.preventDefault()
        const statistic = form.elements.statistic.value
        const res = await fetch('/api/add_statistic', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: sectionId, statistic: statistic})
        })
        const data = await res.json()
        if (data.success) {
            container.querySelector('.close-btn').click()
            addStatisticToSection(data.statistic, sectionId)
            showResult('Додавання статистики', 'Статистика успішно додана!')
        }
    }
    form.addEventListener('submit', submitHandler)
}

function addStatisticToSection(statistic, id) {
    const section = document.querySelector(`.change-section[data-section-id="${id}"]`)?.closest('.section-wrapper')
    section.querySelector('.add-statistic').remove()
    const statisticWrapper = document.createElement('div')
    statisticWrapper.classList.add('section-statistic-container')
    statisticWrapper.innerHTML = statistic
    const media = section.querySelector('.media-container')
    media.parentNode.insertBefore(statisticWrapper, media)
    const changeBtn = document.createElement('button')
    changeBtn.classList.add('cursor-pointer', 'change-statistic')
    changeBtn.textContent = 'ЗМІНИТИ СТАТИСТИКУ'
    changeBtn.dataset.sectionId = id
    changeBtn.addEventListener('click', ()=>openStaticticFormToUpdate(id))
    media.parentNode.insertBefore(changeBtn, media)
}

async function openStaticticFormToUpdate(sectionId) {
    const res = await fetch(`/api/get_statistic/${sectionId}`)
    const data = await res.json()
    if (!data.success) return
    const container = document.getElementById('add-statistic-container')
    const form = container.querySelector('#add-statistic-form')
    container.classList.add('show')
    container.querySelector('.modal-header-text .current-modal').textContent = 'Оновити статистику'
    container.querySelector('.buttons.buttons-for-changing').classList.remove('hide-element')
    container.querySelector('.buttons.buttons-for-adding').classList.add('hide-element')
    document.documentElement.classList.add('no-scroll')
    form.elements.statistic.value = data.statistic

    const deleteBtn = container.querySelector('.buttons-for-changing .cancel-btn')
    deleteBtn.replaceWith(deleteBtn.cloneNode(true))
    container.querySelector('.buttons-for-changing .cancel-btn').addEventListener('click', ()=>{
        container.querySelector('.close-btn').click()
        deleteStatistic(sectionId)
    })
    const updateBtn = container.querySelector('.buttons-for-changing .submit-btn')
    updateBtn.replaceWith(updateBtn.cloneNode(true))
    container.querySelector('.buttons-for-changing .submit-btn').addEventListener('click', ()=>updateStatistic(sectionId, form))    
}

async function updateStatistic(sectionId, form) {
    const res = await fetch('/api/update_statistic', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: sectionId, statistic: form.elements.statistic.value})
    })
    const data = await res.json()
    if (data.success) {
        form.parentNode.querySelector('.close-btn').click()
        const wrapper = document.querySelector(`.change-section[data-section-id="${sectionId}"]`)?.closest('.section-wrapper')
        wrapper.querySelector('.section-statistic-container').innerHTML = data.statistic
        showResult('Оновлення статистики', 'Статистика успішно оновлена!')
    }
}

async function deleteStatistic(sectionId) {
    const confirmContainer = document.getElementById('confirm-deleting')
    confirmContainer.classList.add('show')
    setupConfirmContainer('Видалення статистики', 'Ви впевнені, що хочете видалити статистику?')
    document.documentElement.classList.add('no-scroll')
    const confirmBtn = confirmContainer.querySelector('#confirm-deleting-btn')
    confirmBtn.replaceWith(confirmBtn.cloneNode(true))
    confirmContainer.querySelector('#confirm-deleting-btn').addEventListener('click', async ()=>{
        const res = await fetch('/api/delete_statistic', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: sectionId})
        })
        const data = await res.json()
        if (data.success) {
            confirmContainer.querySelector('.close-btn').click()
            const wrapper = document.querySelector(`.change-section[data-section-id="${sectionId}"]`)?.closest('.section-wrapper')
            wrapper.querySelector('.section-statistic-container').remove()
            wrapper.querySelector('.change-statistic').remove()
            createStatisticBtn(wrapper.querySelector('.section-btns-container'), sectionId)
        }
    })
}

function createStatisticBtn(container, id) {
    const addStatisticBtn = document.createElement('button')
    addStatisticBtn.classList.add('add-statistic', 'cursor-pointer')
    addStatisticBtn.textContent = 'ДОДАТИ СТАТИСТИКУ'
    addStatisticBtn.dataset.sectionId = id
    container.prepend(addStatisticBtn)
    addStatisticBtn.addEventListener('click', ()=>openStaticticForm(id))
}

function setupConfirmContainer(headerText, bodyText) {
    const confirmContainer = document.getElementById('confirm-deleting')
    confirmContainer.querySelector('.modal-header-text .current-modal').textContent = headerText
    confirmContainer.querySelector('.form-body #info-container').textContent = bodyText
}

function showResult(headerText, bodyText) {
    const resultContainer = document.getElementById('changing-result-container')
    resultContainer.classList.add('show')
    document.documentElement.classList.add('no-scroll')
    resultContainer.querySelector('.modal-header-text .current-modal.btn-text').textContent = headerText
    resultContainer.querySelector('.form-body #info-container').textContent = bodyText
    const btn = resultContainer.querySelector('.submit-btn')
    btn.replaceWith(btn.cloneNode(true))
    resultContainer.querySelector('.submit-btn').addEventListener('click', ()=>resultContainer.querySelector('.close-btn').click())
}