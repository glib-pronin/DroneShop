document.addEventListener('DOMContentLoaded', ()=>{
    const blocks = document.querySelectorAll('.section-statistic-block')
    
    function syncWidth() {
        console.log('fhddg');
        
        blocks.forEach(block=>{
            const span = block.querySelector('span')
            block.style.width = span.offsetWidth + 'px'
        })
    }
    window.addEventListener('load', syncWidth);
    window.addEventListener('resize', syncWidth);
})