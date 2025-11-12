let singleProductCount = 1

document.addEventListener('DOMContentLoaded', ()=> {
    const singleProduct = document.getElementById('single-product')
    if (singleProduct) {
        const price = +singleProduct.dataset.price
        const discountedPrice = +singleProduct.dataset.discountedPrice
        const quantityField = singleProduct.querySelector('.quantity')  
        quantityField.textContent = singleProductCount      
        const minusBtn = singleProduct.querySelector('.minus')
        minusBtn.disabled = true        
        const plusBtn = singleProduct.querySelector('.plus')
        const totalPriceField = document.querySelector('.total-price-row .line-through')
        const discountField = document.querySelector('.total-price-row #savings-price')
        const finalPriceField = document.querySelector('.total-price-row .final-price')
        updatePrices()        

        function changeMinusBtn() {
            minusBtn.disabled = !(singleProductCount>1)
            minusBtn.classList.toggle('disable', !(singleProductCount>1))
            minusBtn.classList.toggle('cursor-pointer', (singleProductCount>1))
        }

        function updatePrices() {
            if (price === discountedPrice) {
                finalPriceField.textContent = singleProductCount*price
            } else  {
                totalPriceField.textContent = `${singleProductCount*price} $`
                discountField.textContent = `- ${singleProductCount*price - discountedPrice*singleProductCount} $`
                finalPriceField.textContent = `${singleProductCount*discountedPrice} $`
            }
        }
        
        minusBtn.addEventListener('click', ()=> {
            singleProductCount--
            quantityField.textContent = singleProductCount
            changeMinusBtn()
            updatePrices()
        })
        
        plusBtn.addEventListener('click', ()=> {
            singleProductCount++
            quantityField.textContent = singleProductCount
            changeMinusBtn()
            updatePrices()
        })
    }
})