let currentPage = 1
const maxVisible = 7

    async function fetchProducts() {
        console.log('fetch');
        
        const selected = document.querySelector('.selected-criteria')
        const res = await fetch(`/api/products?page=${currentPage}&type=${selected.id}`)
        const data = await res.json()
        currentPage = data.currentPage
        console.log(data);
        
        renderProducts(data.products, data.isAdmin)
        renderPagination(data.totalPages, maxVisible, currentPage)
    }

document.addEventListener('DOMContentLoaded', ()=>{
    fetchProducts()
})