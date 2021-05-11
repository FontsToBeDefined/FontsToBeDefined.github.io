const filters = document.querySelectorAll(".filter")

const getY = (e) => {
    return (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}

let currentY

document.onmouseover = (e) => {
    currentY = getY(e)
    for (let i=0; i<filters.length;i++) {
        const filter = filters[i]
        filter.onmousemove()
    }
}

document.onmousemove = (e) => {
    currentY = getY(e)
}

for (let i=0; i<filters.length; ++i) {
    const filter = filters[i]
    const bBox = filter.getBoundingClientRect()
    const original = filter.querySelector("#originalFont")
    filter.onmousemove = () => {
        const reverseVal = (reverseRoll ? 0 : -100)
        let y = ((currentY - bBox.top) / bBox.height * 100)
        if (y > 95) {
            y = 100
        }
        if ( y < 5 ) {
            y = 0
        }
        y += reverseVal
        original.style.top = `${y}%`
        original.children[0].style.top = `${-y}%`
    }
}


