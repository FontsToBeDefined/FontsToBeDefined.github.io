// https://stripe.com/docs/payments/accept-a-payment?ui=elements



var paymentForm = document.getElementById("payment-form")

var style = {
    base: {
        color: "#32325d",
        fontFamily: 'Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: window.getComputedStyle(paymentForm.querySelector("input[type=text]")).getPropertyValue('font-size'),
        fontWeight: "500",
        "::placeholder": {
            color: "#000"
        }
    },
    invalid: {
        fontFamily: 'Helvetica, sans-serif',
        color: "#fa755a",
        iconColor: "#fa755a",
    }
}


const createForm = () => {
    paymentForm.style = ""
    var stripe = Stripe('pk_test_FUHwSRjd5mUdrItdYBQUCFIY')
    var elements = stripe.elements()
    var card = elements.create("card", {style: style})
    card.mount("#card-element")
    card.on("change", function (event) {
        if (event.complete) {
            paymentForm.classList.remove("invalid")
        }
        else {
            paymentForm.classList.add("invalid")
        }
    })
    paymentForm.addEventListener("submit", function (event) {
        event.preventDefault()
        loading(true)
        const formData = new FormData(form)
        const paymentFormData = new FormData(paymentForm).entries()
        while (!(ent = paymentFormData.next()).done) {
            formData.append(ent.value[0], ent.value[1])
        }
        fetch(`./${filter_id}/secret`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(response => {
            const keys = Object.keys(response)
            if (keys.includes("error") | keys.length == 0) {
                throw new Error(response["error"] || "Unknown error")
            }
            return response
        })
        .then(response => {
            stripe.confirmCardPayment(response.client_secret, {payment_method: {card: card}})
            .then(function (result) {
                loading(false)
                if (result.error) {
                    showMessage(result.error.message, error=true)
                } else {
                    card.clear()
                    paymentForm.reset()
                    showMessage("Payment has been proceeded, thanks a lot! You will receive your font on the email you entered", error=false)
                }
            })
        })
        .catch(error => {
            showMessage(error.message, error=true)
            loading(false)
        })
    })
}

const buy = (el) => {
    let valid = true
    for(let i=0; i<inputs.length; i++) {
        const input = inputs[i]
        if (!input.checkValidity() && input.name != "preview_string"){
            input.reportValidity()
            valid = false
            break
        }
    }
    if (valid) {
        createForm()
    }
}


const showMessage = (errorMsgText, error=true) => {
    loading(false)
    const cardMessage = document.querySelector("#card-message")
    cardMessage.textContent = ""
    cardMessage.textContent = errorMsgText
    cardMessage.classList.add(["positive", "negative"][error ? 1 : 0])
    setTimeout(function() {
        cardMessage.textContent = ""
        cardMessage.className = ""
    }, 10000)
}
const loading = (isLoading) => {
    const submitButton = document.querySelector("#payment-form input[type=submit]")
    if (isLoading) {
        submitButton.parentNode.classList.add("loading")

    } else {
        submitButton.parentNode.classList.remove("loading")
        submitButton.parentNode.classList.add("not-valid")
    }
    }