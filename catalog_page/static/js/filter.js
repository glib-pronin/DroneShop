document.addEventListener('DOMContentLoaded', ()=>{
    const criteriaBtns = document.querySelectorAll('.filter-criteria')

    criteriaBtns.forEach(btn => {
        btn.addEventListener('click', (e)=>{
            e.preventDefault()
            criteriaBtns.forEach(b => b.classList.remove('selected-criteria'))
            btn.classList.add('selected-criteria')
        })
    })
})