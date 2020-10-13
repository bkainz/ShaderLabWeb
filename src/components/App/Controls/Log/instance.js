function format(number, zeros) {
  return (zeros+number).slice(-zeros.length)
}

module.exports = function(el, {className}) {
  const appEl = el.closest('.App')
  appEl.addEventListener('log', e => {
    const itemEl = document.createElement('div')
    itemEl.classList.add(`${className}-Item`)

    const {scope, message} = e.detail
    const time = new Date()
    const timestamp = `${format(time.getHours(), '00')}:${format(time.getMinutes(), '00')}:${format(time.getSeconds(), '00')}.${format(time.getMilliseconds(), '000')}`

    itemEl.innerHTML = `<div class="${className}-Item-Time">`+timestamp+`</div>`+
                       `<div class="${className}-Item-Message">`+
                         `<div class="${className}-Item-Head">`+scope+`</div>`+
                         `<div class="${className}-Item-Body">`+message+`</div>`+
                       `</div>`
    el.appendChild(itemEl)
  })
}