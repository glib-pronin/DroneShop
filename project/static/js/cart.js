document.addEventListener('DOMContentLoaded', ()=>{
    const openCart = document.getElementById('cart-btn')
    const openCartLink = document.getElementById('cart-btn-link')
    const cartProductsIndicator = openCart?.querySelector('.product-in-cart')
    const cartContainer = document.getElementById('cart-container')
    const productsContainer = document.querySelector('#products-container')
    const toCartBtns = document.querySelectorAll('.to-cart')
    const emptyCart = cartContainer.querySelector('#empty-cart')
    const makeOrderbtn = cartContainer.querySelector('#make-order-btn')
    const cartItemsContainer = cartContainer.querySelector('#cart-items-container')
    const totalPriceContainer = cartContainer.querySelector('#total-price')
    const editOrderBtn = document.getElementById('edit-order-btn')

    function changeIncrementionState(btn, activate){
        if (activate) {
            btn.classList.remove('disable-cart-item-action-btn')
            btn.classList.add('cursor-pointer')
        } else {
            btn.classList.add('disable-cart-item-action-btn')
            btn.classList.remove('cursor-pointer')
        }
    }

    function createCartItem(item) {
        const cartItem = document.createElement('div')
        cartItem.classList.add('cart-item')
        cartItem.id = `cart-item-${item.id}`

        const cartItemInfo = document.createElement('div')
        cartItemInfo.classList.add('cart-item-info')
        const cartItemImg = document.createElement('div')
        cartItemImg.classList.add('cart-item-img')
        const img = document.createElement('img')
        img.src = `/static_catalog/${item.image}`
        cartItemImg.append(img)
        const cartItemNamePrice = document.createElement('div')
        cartItemNamePrice.classList.add('cart-item-name-price')
        const itemName = document.createElement('p')
        itemName.classList.add('cart-item-name')
        itemName.textContent = item.name
        const itemPrice = document.createElement('p')
        if (item.price === item.discount){
            itemPrice.textContent = `${item.price} $`
        } else {
            const oldPrice = document.createElement('span')
            oldPrice.classList.add('cart-item-old-price')
            oldPrice.textContent = `${item.price} $`
            const discountedPrice = document.createElement('span')
            discountedPrice.classList.add('cart-item-discounted-price')
            discountedPrice.textContent = `${item.discount} $`
            itemPrice.append(oldPrice, discountedPrice)
        }
        itemPrice.classList.add('cart-item-price')
        cartItemNamePrice.append(itemName, itemPrice)
        cartItemInfo.append(cartItemImg, cartItemNamePrice)

        
        const cartItemAction = document.createElement('div')
        cartItemAction.classList.add('cart-item-action')
        const cartItemActionQuantity = document.createElement('div')
        cartItemActionQuantity.classList.add('cart-item-action-quantity')
        const minusBtn = document.createElement('div')
        minusBtn.classList.add('minus-btn')
        minusBtn.textContent = '-'
        minusBtn.classList.add('cart-item-action-btn')
        if (item.count > 1) {
            changeIncrementionState(minusBtn, true)
        } else {
            changeIncrementionState(minusBtn, false)
        }
        minusBtn.addEventListener('click', ()=>decrementQuantity(item.id))
        const spanQuantity = document.createElement('span')
        spanQuantity.classList.add('cart-item-quantity')
        spanQuantity.textContent = item.count
        const plusBtn = document.createElement('div')
        plusBtn.classList.add('cart-item-action-btn', 'cursor-pointer')
        plusBtn.textContent = '+'
        plusBtn.addEventListener('click', ()=>incrementQuantity(item.id))
        cartItemActionQuantity.append(minusBtn, spanQuantity, plusBtn)
        cartItemAction.append(cartItemActionQuantity)

        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.classList.add('cursor-pointer')
        svg.setAttribute('width', '24')
        svg.setAttribute('height', '24')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'none')
        const path1 = document.createElementNS(svgNS, 'path')
        path1.setAttribute('d', 'M8.25 8.25C8.44891 8.25 8.63968 8.32902 8.78033 8.46967C8.92098 8.61032 9 8.80109 9 9V18C9 18.1989 8.92098 18.3897 8.78033 18.5303C8.63968 18.671 8.44891 18.75 8.25 18.75C8.05109 18.75 7.86032 18.671 7.71967 18.5303C7.57902 18.3897 7.5 18.1989 7.5 18V9C7.5 8.80109 7.57902 8.61032 7.71967 8.46967C7.86032 8.32902 8.05109 8.25 8.25 8.25ZM12 8.25C12.1989 8.25 12.3897 8.32902 12.5303 8.46967C12.671 8.61032 12.75 8.80109 12.75 9V18C12.75 18.1989 12.671 18.3897 12.5303 18.5303C12.3897 18.671 12.1989 18.75 12 18.75C11.8011 18.75 11.6103 18.671 11.4697 18.5303C11.329 18.3897 11.25 18.1989 11.25 18V9C11.25 8.80109 11.329 8.61032 11.4697 8.46967C11.6103 8.32902 11.8011 8.25 12 8.25ZM16.5 9C16.5 8.80109 16.421 8.61032 16.2803 8.46967C16.1397 8.32902 15.9489 8.25 15.75 8.25C15.5511 8.25 15.3603 8.32902 15.2197 8.46967C15.079 8.61032 15 8.80109 15 9V18C15 18.1989 15.079 18.3897 15.2197 18.5303C15.3603 18.671 15.5511 18.75 15.75 18.75C15.9489 18.75 16.1397 18.671 16.2803 18.5303C16.421 18.3897 16.5 18.1989 16.5 18V9Z')
        path1.setAttribute('fill', '#0C122A')
        const path2 = document.createElementNS(svgNS, 'path')
        path2.setAttribute('d', 'M21.75 4.5C21.75 4.89782 21.592 5.27936 21.3107 5.56066C21.0294 5.84196 20.6478 6 20.25 6H19.5V19.5C19.5 20.2956 19.1839 21.0587 18.6213 21.6213C18.0587 22.1839 17.2956 22.5 16.5 22.5H7.5C6.70435 22.5 5.94129 22.1839 5.37868 21.6213C4.81607 21.0587 4.5 20.2956 4.5 19.5V6H3.75C3.35218 6 2.97064 5.84196 2.68934 5.56066C2.40804 5.27936 2.25 4.89782 2.25 4.5V3C2.25 2.60218 2.40804 2.22064 2.68934 1.93934C2.97064 1.65804 3.35218 1.5 3.75 1.5H9C9 1.10218 9.15804 0.720644 9.43934 0.43934C9.72064 0.158035 10.1022 0 10.5 0L13.5 0C13.8978 0 14.2794 0.158035 14.5607 0.43934C14.842 0.720644 15 1.10218 15 1.5H20.25C20.6478 1.5 21.0294 1.65804 21.3107 1.93934C21.592 2.22064 21.75 2.60218 21.75 3V4.5ZM6.177 6L6 6.0885V19.5C6 19.8978 6.15804 20.2794 6.43934 20.5607C6.72064 20.842 7.10218 21 7.5 21H16.5C16.8978 21 17.2794 20.842 17.5607 20.5607C17.842 20.2794 18 19.8978 18 19.5V6.0885L17.823 6H6.177ZM3.75 4.5V3H20.25V4.5H3.75Z')
        path2.setAttribute('fill-rule', 'evenodd')
        path2.setAttribute('clip-rule', 'evenodd')
        path2.setAttribute('fill', '#0C122A')
        svg.append(path1, path2)
        svg.addEventListener('click', ()=> removeCartItem(item.id))
        cartItemAction.append(svg)

        cartItem.append(cartItemInfo, cartItemAction)
        return cartItem
    }

    function updatePrices(priceWithoutDiscount, discountedPrice) {
        const totalPriceSpan = totalPriceContainer.querySelector('#total-price-span')
        const discountLine = totalPriceContainer.querySelector('#discount-line')
        const alternativePriceLine = totalPriceContainer.querySelector('#alternative-price-line')
        totalPriceSpan.textContent = `${priceWithoutDiscount} $`
        if (priceWithoutDiscount === discountedPrice){
            totalPriceSpan.classList.add('final-price')
            totalPriceSpan.classList.remove('cart-item-old-price')
            discountLine.classList.add('hide-element')
            alternativePriceLine.classList.add('hide-element')
            return
        }
        discountLine.classList.remove('hide-element')
        alternativePriceLine.classList.remove('hide-element')
        totalPriceSpan.classList.remove('final-price')
        totalPriceSpan.classList.add('cart-item-old-price')
        discountLine.querySelector('span').textContent = `- ${priceWithoutDiscount-discountedPrice} $`
        alternativePriceLine.querySelector('span').textContent  = `${discountedPrice} $`
    }

    async function decrementQuantity(itemId) {
        const cartItem = cartItemsContainer.querySelector(`#cart-item-${itemId}`)
        if (!cartItem) {
            return
        }
        const minusBtn = cartItem.querySelector('.minus-btn')
        const quantitySpan = cartItem.querySelector('.cart-item-quantity')
        if(parseInt(quantitySpan.textContent) <= 1){
            changeIncrementionState(minusBtn, false)
            return
        }
        let prevQuantity = parseInt(quantitySpan.textContent)
        if (!isNaN(prevQuantity)) {
            quantitySpan.textContent = prevQuantity-1
            changeIncrementionState(minusBtn, prevQuantity-1 > 1)
        }  
        try {
            const res = await fetch('/decrement_product_quantity', {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({ itemId })
            })
            const data = await res.json()
            if(data.cartIsEmpty){
                showEmptyCart()
                return
            }
            if(data.notContained){
                removeCartItem(itemId)
                return
            }
            quantitySpan.textContent = data.quantity
            changeIncrementionState(minusBtn, data.quantity > 1)
            updatePrices(data.price, data.discount)
        } catch(err){
            quantitySpan.textContent = prevQuantity
            changeIncrementionState(minusBtn, prevQuantity > 1)
        }
    }

    async function incrementQuantity(itemId) {
        const cartItem = cartItemsContainer.querySelector(`#cart-item-${itemId}`)
        if (!cartItem) {
            return
        }
        const minusBtn = cartItem.querySelector('.minus-btn')
        const quantitySpan = cartItem.querySelector('.cart-item-quantity')
        let prevQuantity = parseInt(quantitySpan.textContent)
        if (!isNaN(prevQuantity)) {
            quantitySpan.textContent = prevQuantity+1
            changeIncrementionState(minusBtn, true)
        }  
        try {
            const res = await fetch('/increment_product_quantity', {
                method: "POST",
                headers: {"Content-Type": 'application/json'},
                body: JSON.stringify({ itemId })
            })
            const data = await res.json()
            if(data.cartIsEmpty){
                showEmptyCart()
                return
            }
            if(data.notContained){
                removeCartItem(itemId)
                return
            }
            quantitySpan.textContent = data.quantity
            changeIncrementionState(minusBtn, data.quantity > 1)
            updatePrices(data.price, data.discount)
        } catch(err){
            quantitySpan.textContent = prevQuantity
            changeIncrementionState(minusBtn, prevQuantity > 1)
        }
    }

    async function removeCartItem(itemId){
        const cartItem = cartItemsContainer.querySelector(`#cart-item-${itemId}`)
        if (!cartItem) {
            return
        }
        const res = await fetch('/delete_product_from_cart', {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({ itemId })
        })
        const data = await res.json()
        cartItem.remove()
        showCartProductsNum()
        if (cartItemsContainer.children.length === 0){
            showEmptyCart()
            return
        }        
        updatePrices(data.price, data.discount)
        const children = Array.from(cartItemsContainer.children)
        children.forEach((child, i)=>{
            if (i+1 === children.length){
                child.classList.add('cart-item-without-line')
            }
        })
    }

    function showEmptyCart() {
        emptyCart.classList.remove('hide-element')
        makeOrderbtn?.classList.add('hide-element')
        cartItemsContainer.classList.add('hide-element')
        totalPriceContainer.classList.add('hide-element')
    }

    async function openCartModal(e){
        e.preventDefault()
        document.documentElement.classList.add('no-scroll')
        if (document.cookie.includes('productsId')){
            const res = await fetch('/get_cart')
            const data = await res.json()
            cartContainer.classList.add('show')
            if (data.list_product.length>0) {
                emptyCart.classList.add('hide-element')
                makeOrderbtn?.classList.remove('hide-element')
                cartItemsContainer.classList.remove('hide-element')
                totalPriceContainer.classList.remove('hide-element')
                cartItemsContainer.innerHTML = ''
                let p1 = 0
                let p2 = 0
                data.list_product.forEach((item, i) => {
                    const cartItem = createCartItem(item)
                    cartItemsContainer.append(cartItem)
                    p1 += item.price * item.count
                    p2 += item.discount * item.count
                    if (i+1 === data.list_product.length){
                        cartItem.classList.add('cart-item-without-line')
                    }
                })    
                updatePrices(p1, p2)
            } else {
                showEmptyCart()
            }
        } else {
            cartContainer.classList.add('show')
            showEmptyCart()
        }
    }

    openCart?.addEventListener('click', (e)=> openCartModal(e))
    openCartLink?.addEventListener('click', (e)=> openCartModal(e))
    editOrderBtn?.addEventListener('click', (e)=> openCartModal(e))

    function showCartProductsNum(needToReadCookie = true, cookiePart = null){
        if (openCart){ // функція не працюватиме на сторінці оформлення замовлення
            if (needToReadCookie){
                cookiePart = document.cookie.split('productsId=')[1]?.split('; ')[0]
            }
            if (!cookiePart){
                cartProductsIndicator.classList.add('hide-element')
                return
            }
            productsSet = new Set(cookiePart.split('|'))
            if (productsSet.size > 0){
                cartProductsIndicator.classList.remove('hide-element')
                cartProductsIndicator.textContent = productsSet.size
                if (productsSet.size >= 10 ){
                    cartProductsIndicator.textContent = '9+'
                }
            } else {
                cartProductsIndicator.classList.add('hide-element')
            }
        }
    }
    
    function addProductToCart(toCart, e){
        e.preventDefault()
        productId = toCart.id.split('-')[2]
        if (document.cookie.includes('productsId')) {
            productsId = document.cookie.split('productsId=')[1].split('; ')[0]
            console.log(productsId);
            document.cookie = `productsId=${productsId}|${productId}; path=/`
            showCartProductsNum(false, `${productsId}|${productId}`)
        } else {
            document.cookie = `productsId=${productId}; path=/`
            showCartProductsNum(false, productId)
        }
    }

    toCartBtns.forEach(btn => btn.addEventListener('click', (e)=>addProductToCart(btn, e)))

    if (productsContainer){
        productsContainer.addEventListener('click', (e)=>{
            const toCart = e.target.closest('.to-cart');
            if (!toCart) return; 
            e.preventDefault()
            addProductToCart(toCart, e)
        })
    }

    showCartProductsNum()
})