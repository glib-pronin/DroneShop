document.addEventListener('DOMContentLoaded', ()=>{
    const productsContainer = document.getElementById('products-container')
    const pagination = document.getElementById('catalog-pagination')
    let currentPage = 1
    const maxVisible = 7

    function createSVG(width, height, viewBox, d, fillRule, clipRule, fill){
        const svgNS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(svgNS, 'svg')
        svg.setAttribute('width', width)
        svg.setAttribute('height', height)
        svg.setAttribute('viewBox', viewBox)
        svg.setAttribute('fill', 'none')
        const path = document.createElementNS(svgNS, 'path')
        if (fillRule) path.setAttribute('fill-rule', fillRule)
        if (clipRule) path.setAttribute('clip-rule', clipRule)
        path.setAttribute('d', d)
        path.setAttribute('fill', fill)
        svg.append(path)
        return svg
    }

    function renderProducts(products){
        productsContainer.querySelectorAll('.product').forEach(p=>p.remove())
        products.forEach(product=>{
            const productLink = document.createElement('a')
            productLink.classList.add('product')
            productLink.href = `/product/${product.id}`

            const imageContainer = document.createElement('div')
            imageContainer.classList.add('product-image-container')
            const img = document.createElement('img')
            img.src = `/static_catalog/${product.image}`
            imageContainer.append(img)

            const info = document.createElement('div')
            info.classList.add('product-info')
            const name = document.createElement('p')
            name.classList.add('product-name')
            name.textContent = product.name
            info.append(name)
            const price = document.createElement('p')
            if (product.discount === product.price){
                price.classList.add('product-price')
                price.textContent = `${product.price} $`
            } else {
                price.classList.add('product-price-discount')
                const oldPrice = document.createElement('span')
                oldPrice.classList.add('discount')
                oldPrice.textContent = `${product.price} $`
                const newPrice = document.createElement('span')
                newPrice.classList.add("product-price", "new-price")
                newPrice.textContent = `${product.discount} $`
                price.append(oldPrice, newPrice)
            }
            info.append(price)

            const toCart = document.createElement('div')
            toCart.classList.add('to-cart')
            toCart.id = `for-cart-${product.id}`

            const svg = createSVG(
                '25', '24', '0 0 25 24', 
                'M8.85216 3.46447C9.78985 2.52678 11.0616 2 12.3877 2C13.7138 2 14.9855 2.52678 15.9232 3.46447C16.8609 4.40215 17.3877 5.67392 17.3877 7V8H19.3877C19.9078 8 20.3411 8.39866 20.3842 8.91695L21.3842 20.917C21.4075 21.1956 21.3129 21.4713 21.1236 21.6771C20.9342 21.8829 20.6674 22 20.3877 22H4.3877C4.10805 22 3.84117 21.8829 3.65182 21.6771C3.46246 21.4713 3.36793 21.1956 3.39115 20.917L4.39115 8.91695C4.43434 8.39866 4.86761 8 5.3877 8H7.3877V7C7.3877 5.67392 7.91448 4.40215 8.85216 3.46447ZM7.3877 10V11C7.3877 11.5523 7.83541 12 8.3877 12C8.93998 12 9.3877 11.5523 9.3877 11V10H15.3877V11C15.3877 11.5523 15.8354 12 16.3877 12C16.94 12 17.3877 11.5523 17.3877 11V10H18.4676L19.3009 20H5.4745L6.30783 10H7.3877ZM15.3877 8H9.3877V7C9.3877 6.20435 9.70377 5.44129 10.2664 4.87868C10.829 4.31607 11.592 4 12.3877 4C13.1833 4 13.9464 4.31607 14.509 4.87868C15.0716 5.44129 15.3877 6.20435 15.3877 7V8Z', 
                'evenodd', "evenodd", '#0C122A'
            )
            toCart.append(svg)

            productLink.append(imageContainer, info, toCart)
            productsContainer.append(productLink)
        })
    }

    function getVisiblePages(totalPages){
        const pages = []
        if (totalPages <= maxVisible){
            for (let i = 1; i<=totalPages; i++) {
                pages.push(i)
            }
            return pages
        }
        pages.push(1)
        let start = Math.min(Math.max(2, currentPage-2), totalPages-5)
        let end = Math.max(Math.min(currentPage+2, totalPages-1), 6)
        if (start>2) pages.push('...')
        for (let i = start; i<=end; i++){
            pages.push(i)
        }
        if (end < totalPages-1) pages.push('...')
        pages.push(totalPages)
        return pages
    }

    function renderPagination(totalPages){
        if (totalPages === 1) {
            pagination.classList.add('hide-element')
            return
        }
        const pages = getVisiblePages(totalPages)
        pagination.classList.remove('hide-element')
        pagination.innerHTML = ''
        pages.forEach(p=>{
            const btn = document.createElement('button')
            btn.classList.add('pagination-btn', 'cursor-pointer')
            if (p === currentPage) btn.classList.add('selected-page')
            if (p === '...') {
                btn.disabled = true
                btn.classList.remove('cursor-pointer')
            } 
            btn.textContent = p
            btn.addEventListener('click', ()=>{
                currentPage = p
                fetchProducts()
            })
            pagination.append(btn)
        })
        const prevBtn = document.createElement('button')
        prevBtn.classList.add('pagination-btn', 'cursor-pointer')
        const prevSVG = createSVG('23', '22', '0 0 23 22', 'M6.31934 5.5H8.15267V16.5H6.31934V5.5ZM9.52767 11L17.3193 16.5V5.5L9.52767 11Z', null, null, '#0C122A')
        prevBtn.append(prevSVG)
        if (currentPage === 1){
            prevBtn.disabled = true
            prevBtn.classList.remove('cursor-pointer')
            prevBtn.classList.add('not-clickable')
        }
        prevBtn.addEventListener('click', ()=>{
            currentPage--
            fetchProducts()
        })
        pagination.prepend(prevBtn)

        const nextBtn = document.createElement('button')
        nextBtn.classList.add('pagination-btn', 'cursor-pointer')
        const nextSVG = createSVG('23', '22', '0 0 23 22', 'M6.31934 16.5L14.111 11L6.31934 5.5V16.5ZM15.486 5.5V16.5H17.3193V5.5H15.486Z', null, null, '#0C122A')
        nextBtn.append(nextSVG)
        if (currentPage === totalPages){
            nextBtn.disabled = true
            nextBtn.classList.remove('cursor-pointer')
            nextBtn.classList.add('not-clickable')
        }
        nextBtn.addEventListener('click', ()=>{
            currentPage++
            fetchProducts()
        })
        pagination.append(nextBtn)
}

    async function fetchProducts() {
        const res = await fetch(`/api/products?page=${currentPage}`)
        const data = await res.json()
        currentPage = data.currentPage
        renderProducts(data.products)
        renderPagination(data.totalPages)
    }

    fetchProducts()
})