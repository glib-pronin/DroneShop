document.addEventListener('DOMContentLoaded', ()=>{
    const blocks = document.querySelectorAll('.section-statistic-block')
    
    function syncWidth() {
        blocks.forEach(block=>{
            const span = block.querySelector('span')
            block.style.width = span.offsetWidth + 'px'
        })
    }
    window.addEventListener('load', syncWidth);
    window.addEventListener('resize', syncWidth);
})