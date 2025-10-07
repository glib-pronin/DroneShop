document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('.nav')
    const menu = document.querySelector('.menu')
    const burger = document.querySelector('.burger-btn')
    const cross = document.querySelector('.cross-btn')

    burger.addEventListener('click', function(){
        nav.style.backdropFilter = 'none'
        menu.classList.add('popup-menu') 
        cross.classList.add('active') 
        this.classList.add('disable')
        nav.style.position = "relative"
    })

    cross.addEventListener('click', function(){
        nav.style.backdropFilter = 'blur(8px)'
        menu.classList.remove('popup-menu') 
        burger.classList.remove('disable') 
        this.classList.remove('active')   
        nav.style.position = "fixed"
    })
})