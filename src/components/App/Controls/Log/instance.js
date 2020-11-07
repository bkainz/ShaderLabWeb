function format(number, zeros) {
  return (zeros+number).slice(-zeros.length)
}

function Log(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.log = this
}

Log.prototype = {
  initialize() {
    // nothing to do
  },

  append(scope, message) {
    const itemEl = document.createElement('div')
    itemEl.classList.add(`${this.className}-Item`)
    const time = new Date()
    const timestamp = `${format(time.getHours(), '00')}:${format(time.getMinutes(), '00')}:${format(time.getSeconds(), '00')}.${format(time.getMilliseconds(), '000')}`

    itemEl.innerHTML = `<div class="${this.className}-Item-Time">`+timestamp+`</div>`+
                       `<div class="${this.className}-Item-Message">`+
                         `<div class="${this.className}-Item-Head">`+scope+`</div>`+
                         `<div class="${this.className}-Item-Body">`+message+`</div>`+
                       `</div>`
    this.el.appendChild(itemEl)
  }
}

export default Log