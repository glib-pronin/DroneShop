document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.querySelector('form')
    if (form) {
        const blockBtn = form.querySelector('#block-btn')
        const firstLineBtn = form.querySelector('#first-line-btn')
        const secondLineBtn = form.querySelector('#second-line-btn')
        const bigTextBtn = form.querySelector('#big-text-btn')
        const textArea = form.querySelector('#edit-textarea')

        blockBtn.addEventListener('click', () => wrapSelection('div', 'section-statistic-block'))
        firstLineBtn.addEventListener('click', () => wrapSelection('span', 'section-statistic-main'))
        secondLineBtn.addEventListener('click', () => wrapSelection('span', 'section-statistic-subtext'))
        bigTextBtn.addEventListener('click', () => wrapSelection('span', 'section-statistic-big'))

        function wrapSelection(tag, className = ''){
            const startIndex = textArea.selectionStart 
            const endIndex = textArea.selectionEnd 
            if (startIndex === endIndex) return
            
            const selectedText = textArea.value.slice(startIndex, endIndex)
            const beforeSelected = textArea.value.slice(0, startIndex)
            const afterSelected = textArea.value.slice(endIndex)

            const clasAttr = className ? ` class="${className}"` : ''
            const wrap = `<${tag}${clasAttr}>${selectedText}</${tag}>`
            textArea.value = beforeSelected + wrap + afterSelected
        }
    } 
})