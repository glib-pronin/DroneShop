document.addEventListener('DOMContentLoaded', ()=>{
    const openFormBtn = document.getElementById('add-new-section')
    const sectionFormContainer = document.getElementById('add-section-container')
    const sectionForm = document.getElementById('add-section-form')
    const imageInput = sectionForm.elements["image"]
    const videoInput = sectionForm.elements["video"]
    const imageNameSpan = sectionForm.querySelector('#image-name')
    const videoNameSpan = sectionForm.querySelector('#video-name')
    const changeBtns = document.querySelectorAll('.change-section')
    const confirmContainer = document.getElementById('confirm-deleting')
    const resultContainer = document.getElementById('changing-result-container')

    openFormBtn.addEventListener('click', ()=>{
        sectionFormContainer.classList.add('show')
        sectionFormContainer.querySelector('.current-modal.btn-text').textContent = 'Додати секцію'
        sectionFormContainer.querySelector('.buttons.buttons-for-changing').classList.add('hide-element')
        sectionFormContainer.querySelector('.buttons.buttons-for-adding').classList.remove('hide-element')
        document.documentElement.classList.add('no-scroll')
        sectionForm.elements.sectionText.value = ''
        sectionForm.elements.position = 'center'
        imageNameSpan.textContent = 'Нічого не обрано'
        videoNameSpan.textContent = 'Нічого не обрано'
    })

    imageInput.addEventListener('change', ()=>handleFileChange(imageInput, imageNameSpan, videoInput, videoNameSpan))
    videoInput.addEventListener('change', ()=>handleFileChange(videoInput, videoNameSpan, imageInput, imageNameSpan))

    function handleFileChange(current, span, anotherFile, anotherSpan) {
        if (current.files.length > 0){
            span.textContent = truncate(current.files[0].name)
            anotherFile.value = ''
            anotherSpan.textContent = 'Нічого не обрано'
        } else {
            span.textContent = 'Нічого не обрано'
        }
    }

    function truncate(text) {
        let maxLength = 20
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
    }

    Array.from(changeBtns).forEach(btn=>{
        btn.addEventListener('click', ()=>openFormToChange(btn.dataset.sectionId))
    })

    sectionForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const formData = new FormData(sectionForm)
        formData.append("productId", sectionFormContainer.dataset.productId) 
        const resp = await fetch('/api/add_section', {
            method: 'POST',
            body: formData
        })
        const data = await resp.json()
        if (data.success) {
            sectionFormContainer.querySelector('.close-btn').click()
            addSectionToDOM(data.section)
            showResult('Додавання секції', 'Секція успішно додана!')
        }
    })

    function addSectionToDOM(section){
        const mainWrapper = document.createElement('div')
        mainWrapper.classList.add('section-wrapper')

        const innerWrapper = document.createElement('div')
        innerWrapper.classList.add('section', section.position)
        
        const textContainer = document.createElement('div')
        textContainer.classList.add('text-container')
        const title = document.createElement('h2')
        title.textContent = section.title
        const text = document.createElement('p')
        text.innerHTML = section.section_text.replaceAll('\n', '<br><br>')
        textContainer.append(title, text)

        const mediaContainer = document.createElement('div')
        mediaContainer.classList.add('media-container')

        fillMedia(section, mediaContainer)
        innerWrapper.append(textContainer, mediaContainer)

        const btnsContainer = document.createElement('div')
        btnsContainer.classList.add('section-btns-container')
        if (section.position === "center") {
            createStatisticBtn(btnsContainer, section.id)
        }
        const changeBtn = document.createElement('button')
        changeBtn.classList.add('change-section', 'cursor-pointer')
        changeBtn.textContent = 'ЗМІНИТИ СЕКЦІЮ'
        changeBtn.dataset.sectionId = section.id
        changeBtn.addEventListener('click', ()=>openFormToChange(section.id))
        btnsContainer.append(changeBtn)

        mainWrapper.append(innerWrapper, btnsContainer)
        openFormBtn.parentElement.insertBefore(mainWrapper, openFormBtn)
    }

    function createStatisticBtn(container, id) {
        const addStatisticBtn = document.createElement('button')
        addStatisticBtn.classList.add('add-statistic', 'cursor-pointer')
        addStatisticBtn.textContent = 'ДОДАТИ СТАТИСТИКУ'
        addStatisticBtn.dataset.sectionId = id
        container.prepend(addStatisticBtn)
    }

    function fillMedia(section, container){
        if (section.image_path) {
            const img = document.createElement('img')
            img.src = `/static_catalog/images/products/${section.image_path}?q=${Date.now()}`
            container.append(img)
        } else if (section.video_path) {
            const video = document.createElement('video')
            video.src = `/static_catalog/videos/${section.video_path}?q=${Date.now()}`
            video.controls = true
            container.append(video)
        }
    }

    async function getSection(sectionId) {
        const resp = await fetch(`/api/get_section/${sectionId}`)
        const data = await resp.json()
        if (data.success) return data.section
        return null
    }

    async function openFormToChange(sectionId) {
        const section = await getSection(sectionId)
        if (section) {
            sectionFormContainer.classList.add('show')
            sectionFormContainer.querySelector('.current-modal.btn-text').textContent = 'Змінити секцію'
            sectionFormContainer.querySelector('.buttons.buttons-for-changing').classList.remove('hide-element')
            sectionFormContainer.querySelector('.buttons.buttons-for-adding').classList.add('hide-element')
            document.documentElement.classList.add('no-scroll')
            sectionForm.elements.title.value = section.title
            sectionForm.elements.position.value = section.position
            sectionForm.elements.sectionText.value = section.section_text
            imageNameSpan.textContent = section.image_path ? truncate(section.image_path) : 'Нічого не обрано'
            videoNameSpan.textContent = section.video_path ? truncate(section.video_path) : 'Нічого не обрано'
            const deleteBtn = sectionFormContainer.querySelector('.buttons-for-changing .cancel-btn')
            deleteBtn.replaceWith(deleteBtn.cloneNode(true))
            sectionFormContainer.querySelector('.buttons-for-changing .cancel-btn').addEventListener('click', ()=>{
                sectionFormContainer.querySelector('.close-btn').click()
                handleDeleting(sectionId)
            })
            const updateBtn = sectionFormContainer.querySelector('.buttons-for-changing .submit-btn')
            updateBtn.replaceWith(updateBtn.cloneNode(true))
            sectionFormContainer.querySelector('.buttons-for-changing .submit-btn').addEventListener('click', ()=>handleUpdating(sectionId))
        }
    }

    async function handleDeleting(sectionId) {
        confirmContainer.classList.add('show')
        document.documentElement.classList.add('no-scroll')
        const confirmBtn = confirmContainer.querySelector('#confirm-deleting-btn')
        confirmBtn.replaceWith(confirmBtn.cloneNode(true))
        confirmContainer.querySelector('#confirm-deleting-btn').addEventListener('click', async ()=>{
            const res = await fetch('/api/deleteSection', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: sectionId})
            })
            const data = await res.json()
            if (data.success) {
                document.querySelector(`.change-section[data-section-id="${sectionId}"]`)?.closest('.section-wrapper').remove()
                confirmContainer.querySelector('.close-btn').click()
                showResult('Видалення секції', 'Секція успішно видалена!')
            }
        })
    } 

    async function handleUpdating(sectionId) {
        console.log('text');
        
        const formData = new FormData(sectionForm)
        formData.append("id", sectionId)
        const res = await fetch('/api/updateSection', {
            method: "POST",
            body: formData
        })
        const data = await res.json()
        if (data.success) {
            updateSectionInDOM(data.section)
            sectionFormContainer.querySelector('.close-btn').click()
            showResult('Оновлення секції', 'Секцію успішно оновлено!')
        }
    } 

    function updateSectionInDOM(section){
        const wrapper = document.querySelector(`.change-section[data-section-id="${section.id}"]`)?.closest('.section-wrapper')
        wrapper.querySelector('.text-container h2').textContent = section.title
        wrapper.querySelector('.text-container p').innerHTML = section.section_text.replaceAll('\n', '<br><br>')
        const sectionEl = wrapper.querySelector('.section')
        sectionEl.className = `section ${section.position}`
        wrapper.querySelector('.add-statistic')?.remove()
        if (section.position === "center") {
            createStatisticBtn(wrapper.querySelector('.section-btns-container'), section.id)
        }
        const mediaContainer = wrapper.querySelector('.media-container')
        mediaContainer.innerHTML = ''
        fillMedia(section, mediaContainer)
    }

    function showResult(headerText, bodyText) {
        resultContainer.classList.add('show')
        document.documentElement.classList.add('no-scroll')
        resultContainer.querySelector('.modal-header-text .current-modal.btn-text').textContent = headerText
        resultContainer.querySelector('.form-body #info-container').textContent = bodyText
        const btn = resultContainer.querySelector('.submit-btn')
        btn.replaceWith(btn.cloneNode(true))
        resultContainer.querySelector('.submit-btn').addEventListener('click', ()=>resultContainer.querySelector('.close-btn').click())
    }

})