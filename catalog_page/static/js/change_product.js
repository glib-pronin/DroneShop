async function getProductInfo(productId) {
    const resp = await fetch(`/api/get_product/${productId}`)
    const data = await resp.json()
    if (data.success) return data.info
    return null
}

async function changeProductHandler(productId) {
    const product = await getProductInfo(productId)
    if (product) {
        const addProductContainer = document.getElementById('add-product-container')
        const addProductForm = document.getElementById('add-product-form')
        const fileInput = addProductForm.elements["image"]
        const fileNameSpan = addProductForm.querySelector('#file-name')
        const updateBtn = addProductContainer.querySelector('.buttons-for-changing .submit-btn')
        const deleteBtn = addProductContainer.querySelector('.buttons-for-changing .cancel-btn')
        const generalErrorcontainer = addProductContainer.querySelector('.general-mistake')

        addProductContainer.querySelector('.current-modal.btn-text').textContent = 'Редагувати товар'
        addProductContainer.querySelector('.buttons.buttons-for-changing').classList.remove('hide-element')
        addProductContainer.querySelector('.buttons.buttons-for-adding').classList.add('hide-element')   
        addProductContainer.classList.add('show')
        document.documentElement.classList.add('no-scroll')
        addProductForm.elements.name.value = product.name
        addProductForm.elements.price.value = product.price
        addProductForm.elements.discount.value = product.discount
        addProductForm.elements.type.value = product.type
        addProductForm.elements.summary.value = product.summary
        fileNameSpan.textContent = truncate(product.imageName)

        fileInput.addEventListener('change', ()=>{
            if (fileInput.files.length > 0){
                fileNameSpan.textContent = truncate(fileInput.files[0].name)
            } else {
                fileNameSpan.textContent = truncate(product.imageName)
            }
        })
        const closeBtn = addProductContainer.querySelector('.close-btn')
        deleteBtn.replaceWith(deleteBtn.cloneNode(true))
        addProductContainer.querySelector('.buttons-for-changing .cancel-btn').addEventListener('click', ()=>deleteProduct(productId, closeBtn))
        updateBtn.replaceWith(updateBtn.cloneNode(true))
        addProductContainer.querySelector('.buttons-for-changing .submit-btn').addEventListener('click', ()=>updateProduct(productId, new FormData(addProductForm), closeBtn, addProductForm, generalErrorcontainer))
    }
}

function deleteProduct(productId, closeBtn){
        closeBtn.click()
        confirmDeleting(productId)
}

async function confirmDeleting(productId) {
    const confirmationContainer = document.getElementById('confirm-product-deleting')
    confirmationContainer.classList.add('show')
    document.documentElement.classList.add('no-scroll')
    const deleteBtn = confirmationContainer.querySelector('#confirm-deleting-btn')
    deleteBtn.replaceWith(deleteBtn.cloneNode(true))
    confirmationContainer.querySelector('#confirm-deleting-btn').addEventListener('click', async ()=> {
        const res = await fetch('/api/deleteProduct', {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: productId})
        })
        const data = await res.json()
        if (data.success) {
            confirmationContainer.querySelector('.close-btn').click()
            fetchProducts()
            handleRsult('Видалення товару', 'Товар успішно видалено з каталогу')
        } else {
            if (data.error === "rights_error") {
                handleRsult('Видалення товару', 'Вам недостпна така дія')
            } else if (data.error === "incorrect_id") {
                handleRsult('Видалення товару', 'Сталася помилка під час виадлення')
            }
        }
    })
}

async function updateProduct(productId, formData, closeBtn, addProductForm, generalErrorcontainer) {
    console.log(productId);
    formData.append('id', productId)
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
    const res = await fetch('/api/updateProduct', {
        method: "POST",
        body: formData
    })
    const data = await res.json()
    if (data.success) {
        closeBtn.click()
        await fetchProducts()
        handleRsult('Оновлення товару', 'Інформацію про товар успішно оновлено')
        const img = document.querySelector(`a.product[href="/product/${productId}"] img`)
        if (img) {
            img.src = `/static_catalog/images/products/${productId}_${formData.get('name').replaceAll(" ", "_")}.png?v=${Date.now()}`
        }
    } else {
        if (data.error === "rights_error") {
            generalErrorcontainer.textContent = "Вам недоступна така дія"
        } else if (data.error === "incorrect_id") {
            generalErrorcontainer.textContent = "Сталася помилка під час оновлення"
        }
    }
}

function handleRsult(headerText, bodyText){
    const resultContainer = document.getElementById('product-changing-result-container')
    document.documentElement.classList.add('no-scroll')
    resultContainer.classList.add('show')
    resultContainer.querySelector('.modal-header-text .current-modal.btn-text').textContent = headerText
    resultContainer.querySelector('.form-body #info-container').textContent = bodyText
    const closeBtn = resultContainer.querySelector('.close-btn')
    const submitBtn = resultContainer.querySelector('.submit-btn')
    submitBtn.replaceWith(submitBtn.cloneNode(true))
    resultContainer.querySelector('.submit-btn').addEventListener('click', ()=>closeBtn.click())
}

function truncate(text) {
    let maxLength = 20
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}