$(document).ready(()=>{
    $('.filter-criteria').on('click', (e)=>{
        $('.filter-criteria').removeClass("selected-criteria")
        e.currentTarget.classList.add('selected-criteria')
        $.ajax({
            url: `/api/products?type=${e.currentTarget.id}`,
            type: 'get',
            success: (res)=>{
                currentPage = res.currentPage
                renderProducts(res.products, res.isAdmin)
                renderPagination(res.totalPages, maxVisible)
            }
        })
    })
})