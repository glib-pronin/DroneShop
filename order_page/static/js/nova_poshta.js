document.addEventListener('DOMContentLoaded', ()=>{
    const spanList = document.querySelectorAll('.help-find-city span')
    const inputParcelLocker = document.querySelector('#parcel_locker-city')
    const inputDepartment = document.querySelector('#department-city')
    inputDepartment.addEventListener('blur', () => getDepartments(inputDepartment.value, 'department'))
    inputParcelLocker.addEventListener('blur', () => getDepartments(inputParcelLocker.value, 'parcel_locker'))

    spanList.forEach(span => {
        span.addEventListener('click', ()=>{
            const error = span.parentElement.previousElementSibling
            const input = error.previousElementSibling
            error.classList.add('hide')
            input.value = span.textContent
            getDepartments(input.value, input.id.split('-')[0])
        })
    })   
    
    async function getDepartments(city_name, type) {
        const dataList = document.getElementById(type)
        if (city_name.trim() !== '') {
            res = await fetch('/api/departments', {
              method: "POST",
              headers: {"Content-Type": 'application/json'},
              body: JSON.stringify({ city_name, type }) 
            })
            data = await res.json()
            dataList.innerHTML = ''
            data.forEach(name => {
                const option = document.createElement('option')
                option.textContent = name
                dataList.append(option)
            })
        } else {
            dataList.innerHTML = ''
        }
    }
    
})