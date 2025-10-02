document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('.nav')
    const menu = document.querySelector('.menu')
    const burger = document.querySelector('.burger-btn')
    const cross = document.querySelector('.cross-btn')

    burger.addEventListener('click', function(){
        nav.style.backdropFilter = 'none'
        menu.classList.toggle('popup-menu') 
        cross.classList.toggle('active') 
        this.classList.toggle('disable')
        nav.style.position = "relative"
    })

    cross.addEventListener('click', function(){
        nav.style.backdropFilter = 'blur(8px)'
        menu.classList.toggle('popup-menu') 
        burger.classList.toggle('disable') 
        this.classList.toggle('active')   
        nav.style.position = "fixed"
    })
})