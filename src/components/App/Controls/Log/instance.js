function format(number, zeros) {
  return (zeros+number).slice(-zeros.length)
}

function Log(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.components\\/App').__component__
  this.app.log = this
}

Log.prototype = {
  append(scope, message, error) {
    const itemEl = document.createElement('div')
    itemEl.classList.add(`${this.className}-Item`)
    const time = new Date()
    const timestamp = `${format(time.getHours(), '00')}:${format(time.getMinutes(), '00')}:${format(time.getSeconds(), '00')}.${format(time.getMilliseconds(), '000')}`

    itemEl.innerHTML = `<div class="${this.className}-Item-Time">`+timestamp+`</div>`+
                       `<div class="${this.className}-Item-Message">`+
                         `<div class="${this.className}-Item-Head">`+scope+`</div>`+
                         `<div class="${this.className}-Item-Body${error ? ' error' : ''}">`+message+`</div>`+
                       `</div>`
    this.el.appendChild(itemEl)
    this.el.scrollTop = this.el.scrollHeight

    error && this.app.controls.tabs.focus('log')
  }
}

export default Log