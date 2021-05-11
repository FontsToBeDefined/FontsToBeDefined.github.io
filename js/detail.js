let 
    axesValues = {},
    formValues = {}
const 
    reverseRoll = true,
    previewStyle = document.getElementById("preview-style"),
    reader = new FileReader(),
    form = document.getElementById("font-form"),
    inputs = form.querySelectorAll("input:not([type=submit])"),
    fontUi = document.getElementById("font-ui"),
    submit = form.querySelector(".submit-input-wrapper"),
    preview = document.getElementById("newFonts")

const updatePreview = (el) => {
    el.parentNode.querySelector("input[type=number]").value = parseInt(el.value).toFixed()
    el.parentNode.dataset.current = el.value
    axesValues[el.dataset.tag] = parseFloat(el.value)
    let style = []
    const keys = Object.keys(axesValues)
    for (let i=0; i<keys.length; i++) {
        const key = keys[i]
        const value = axesValues[key]
        style.push(`"${key}" ${value}`)
    }
    preview.style.fontVariationSettings = style.join(", ")
}

const validateNumberInput = (el) => {
    if (parseInt(el.value)>parseInt(el.max)) {
        el.value=el.max
    }
    else if (parseInt(el.value)<parseInt(el.min)){
        el.value=el.min
    }
}
const updateSelf = (e) => {
    el = e.target || e
    if (el.required) {
        el.closest("*[class*=wrapper]").dataset.value = el.value
    }
    if (el.type=="range") {
        el.parentNode.dataset.current = parseInt(el.value).toFixed()
        el.parentNode.querySelector("input[type=number]").value = el.value
    }
    if (el.type=="number") {
        el.parentNode.querySelector("input[type=range]").value = el.value
    }
    if (el.type=="file") {
        let value
        if (el.files.length) {
            value = el.files[0].name
            el.closest("form").classList.add("file-set")
        }
        else {
            value = ""
        }

        el.parentNode.dataset.fileName = value 
        el.parentNode.parentNode.dataset.fileName = value 
    }
}

for (let i=0; i<inputs.length; i++) {
    inputs[i].oninput = updateSelf
    inputs[i].oninput(inputs[i])
}

form.oninput = () => {
    const keys = Object.keys(formValues)
    if (keys.length > 0) {
        const other_form = formToJson(form)
        let changed = false
        for(let i=0; i<keys.length; ++i) {
            const key = keys[i]
            if (formValues[key] !== other_form[key]) {
                changed = true
                break
            }
        }
        if (changed) {
            form.classList.remove("not-updated")
        }
        else {
            form.classList.add("not-updated")
        }
    }
}
form.oninput()

const formToJson = (form) => { 
    return Object.fromEntries(new FormData(form).entries())
}

const originalFontCSS = (url) => {
    return `
        <style>
        @font-face {
            font-family: originalFont;
            src: url(${url});
        }
        #originalFont {
            font-family: originalFont !important;
        }
        </style>
    ` 
}

const newFontCSS = (index, base64) => {
    return `
    <style>
        @font-face{
            font-family: "response-font-base64-${index}";
            src: url(data:application/x-font-woff;charset=utf-8;base64,${base64});
        }
        #newFonts>*:nth-child(${index}) {
            font-family: "response-font-base64-${index}";
        }
    </style>
    `
}

form.onsubmit = (e) => {
    e.preventDefault()
    submit.classList.add("loading")
    const formData = new FormData(form)
    fetch(`./${filter_id}`, {
        method: "POST",
        body: formData 
    })
    .then(response => response.json())
    .then(response => {
        if (response["error"] !== undefined) {
            throw new Error(response["error"])
        }
        return response
    })
    .then(result => {
        const url = URL.createObjectURL(form.querySelector("input[type=file]").files[0])
        const previewString = form.querySelector("input[name=preview_string]").value
        previewStyle.innerHTML = ""
        document.querySelector("#originalFont").children[0].innerHTML = previewString
        preview.innerHTML = originalFontCSS(url)
        var fonts = result["response_fonts_base64"]
        for (let index=0; index<fonts.length; ++index) {
            previewStyle.innerHTML += newFontCSS(index+1, fonts[index])
            const span = document.createElement("span")
            span.innerHTML = previewString
            preview.appendChild(span)              
        }
        const filter = document.querySelector(".filter")
        const filterParent = filter.parentNode
        filter.remove()
        filterParent.appendChild(filter)
        form.classList.add("not-updated")
        formValues = formToJson(form)
    })
    .catch(error => {
        console.error(error.message)
    })
    .finally(() => {
        submit.classList.remove("loading")
    })
}

let playingLoop
const play = (el) => {
    if (el.dataset.playing == "true") {
        el.dataset.playing = false
        el.classList.remove("pause")
        el.classList.add("play")
        clearInterval(playingLoop)
    }
    else {
        el.dataset.playing = true
        el.classList.add("pause")
        el.classList.remove("play")
        const input = el.parentNode.querySelector("input[type=range]")
        const range = input.max - input.min
        let directions = [+1, -1] 
        playingLoop = setInterval(function(){
            let value = parseFloat(input.value)
            if (value <= input.min || value >= input.max) {
                directions = directions.reverse()
            }
            ease = Math.sin((value/range)*Math.PI) ** 2
            input.value = value + (1+(5*ease)) * directions[0]
            input.oninput()
        }, 1000/40)
    }
}

// const buy = () => {
//     var response = fetch('/secret').then(function(response) {
//         return response.json()
//       }).then(function(responseJson) {
//         var clientSecret = responseJson.client_secret
//         console.log(clientSecret)
//       });
// }