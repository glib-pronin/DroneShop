document.addEventListener('DOMContentLoaded', ()=>{
    const itemsContainer = document.querySelector('.items-container')
    const cartContainer = document.getElementById('cart-container')
    const editOrderBtn = document.getElementById('edit-order-btn')
    const closeBtn = document.querySelector('.close-btn')
    const cancelBtn = document.getElementById('cancel-changes')
    const confirmChanges = document.getElementById('confirm-order-btn')
    const totalPriceLine = document.querySelector('.total-price-row .line-through')
    const savingsPriceLine = document.getElementById('savings-price')
    const finalPriceLine = document.querySelector('.final-price')
    
    const productsInfo = {}
    Array.from(itemsContainer.getElementsByClassName('item-container')).forEach(item=>{
        productsInfo[item.dataset.id] = {
            price: +item.dataset.price,
            discountedPrice: +item.dataset.discountedPrice
        }
    })
    function cancelChanges(){
        if (document.cookie.includes('oldList')) {
            const oldList = document.cookie.split('oldList=')[1].split('; ')[0]
            document.cookie = `productsId=${oldList}; path='/'`
            document.cookie = `oldList=; max-age=0; path='/'`
        }
        cartContainer.classList.remove('show')
        document.documentElement.classList.remove('no-scroll')
    }

    function checkCart(){
        if (!document.cookie.includes('productsId')) window.location.href = '/order'
        const productsId = document.cookie.split('productsId=')[1].split('; ')[0]
        if (!productsId) window.location.href = '/order'
    }

    function countIdInCart(id, cart) {
        let count = 0
        cart.forEach(i => {
            count = i === id ? count + 1 : count + 0
        })
        return count
    }

    cancelBtn.addEventListener('click', cancelChanges)
    closeBtn.addEventListener('click', cancelChanges)

    confirmChanges.addEventListener('click', ()=>{
        if (document.cookie.includes('oldList')) {
            document.cookie = `oldList=; max-age=0; path='/'`
        }
        cartContainer.classList.remove('show')
        document.documentElement.classList.remove('no-scroll')
        checkCart()
        const productsId = document.cookie.split('productsId=')[1].split('; ')[0].split('|')
        let totalPrice = 0
        let totalDiscountedPrice = 0
        for (let id in productsInfo) {
            const element = itemsContainer.querySelector(`.item-container[data-id="${id}"]`)
            if (!productsId.includes(id)){
                element.nextElementSibling?.remove()
                element.remove()
                delete productsInfo[id]
                const lastChild = itemsContainer.lastElementChild
                if (lastChild.classList.contains('line')) lastChild.remove()
            } else {
                const quantity = countIdInCart(id, productsId)
                element.querySelector(".quantity").textContent = quantity 
                totalPrice += productsInfo[id].price * quantity
                totalDiscountedPrice += productsInfo[id].discountedPrice * quantity
            }
        }
        console.log(totalPrice, totalDiscountedPrice);
        
        if (totalPrice === totalDiscountedPrice) {
            finalPriceLine.parentElement.querySelector('#text-for-changing').textContent = 'Загальна сума'
            finalPriceLine.textContent = `${totalPrice} $`
            finalPriceLine.classList.remove('red-color')
            totalPriceLine?.parentElement.classList.add('hide')
            savingsPriceLine?.parentElement.classList.add('hide')
        } else {
            totalPriceLine.textContent = `${totalPrice} $` 
            savingsPriceLine.textContent = `- ${totalPrice - totalDiscountedPrice} $`
            finalPriceLine.textContent = `${totalDiscountedPrice} $`
            
        }
    })

    editOrderBtn.addEventListener('click', ()=>{
        if (document.cookie.includes('productsId')) {
            const productsId = document.cookie.split('productsId=')[1].split('; ')[0]
            document.cookie = `oldList=${productsId}; path='/'`
        }
    })
})