document.addEventListener('DOMContentLoaded', ()=>{
    const openFormBtn = document.getElementById('add-new-product')
    const addProductContainer = document.getElementById('add-product-container')
    const addProductForm = document.getElementById('add-product-form')
    const fileInput = addProductForm.elements["image"]
    const fileNameSpan = addProductForm.querySelector('#file-name')
    const generalErrorcontainer = addProductContainer.querySelector('.general-mistake')

    openFormBtn.addEventListener('click', ()=>{
        addProductContainer.classList.add('show')
        addProductContainer.querySelector('.current-modal.btn-text').textContent = 'Додати товар'
        addProductContainer.querySelector('.buttons.buttons-for-changing').classList.add('hide-element')
        addProductContainer.querySelector('.buttons.buttons-for-adding').classList.remove('hide-element')
        document.documentElement.classList.add('no-scroll')
        Array.from(addProductForm.elements).forEach(el => {
            el.value = ""
        })
        addProductForm.elements.type.value = 'drone'
        fileNameSpan.textContent = 'Нічого не обрано'
    })

    fileInput.addEventListener('change', ()=>{
        if (fileInput.files.length > 0){
            fileNameSpan.textContent = fileInput.files[0].name
        } else {
            fileNameSpan.textContent = 'Нічого не обрано'
        }
    })

    addProductForm.elements.name.addEventListener('input', () => addProductForm.elements.name.nextElementSibling.textContent = '')

    addProductForm.elements.price.addEventListener('input', ()=>{
        let price = addProductForm.elements.price
        price.value = price.value.replace(/-/g, '')
        price.nextElementSibling.textContent = ''
    })

    addProductForm.elements.discount.addEventListener('input', ()=>{
        let discount = addProductForm.elements.discount
        discount.value = discount.value.replace(/-/g, '')
        if (+discount.value > 100) {
            discount.value = 100
        }
        discount.nextElementSibling.textContent = ''
    })

    addProductForm.addEventListener('submit', async (e)=>{
        e.preventDefault()
        const formData = new FormData(addProductForm)
        if (!formData.get("name").trim()) {
            addProductForm.elements.name.nextElementSibling.textContent = "Це поле обов'язкове" 
            return
        }
        if (!formData.get("price").trim()) {
            addProductForm.elements.price.nextElementSibling.textContent = "Це поле обов'язкове" 
            return
        }
        if (!formData.get("discount").trim()) {
            addProductForm.elements.discount.nextElementSibling.textContent = "Це поле обов'язкове" 
            return
        }
        const resp = await fetch('/catalog', {
            method: 'POST',
            body: formData
        })
        const data = await resp.json()
        if (data.success) {
            const closeBtn = addProductContainer.querySelector('.close-btn')
            closeBtn.click()
            fetchProducts()
            handleRsult('Додавання товару', 'Товар успішно додано до каталогу')
        } else {
            if (data.error === "rights_error") {
                generalErrorcontainer.textContent = "Вам недостпна така дія"
            } 
        }
    })
})