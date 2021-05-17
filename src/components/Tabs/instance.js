import escapeCSS from '../../componentHelpers/escapeCSS'

function Tabs(el, {className, id}) {
  this.el = el
  this.className = className
  this.id = id

  this.tabsEl = this.el.querySelector(`.${escapeCSS(this.className)}-Tabs`)
  this.cardsEl = this.el.querySelector(`.${escapeCSS(this.className)}-Cards`)
}

Tabs.prototype = {
  focus(id) {
    const selector = typeof id === 'number' ? `:nth-child(${id+1})` : `[value="${id}"]`
    this.el.querySelector(`.${escapeCSS(this.className)}-State${selector}`).checked = true
  },

  add(id, label, content, atIndex) {
    const tabCount = this.el.querySelectorAll(`.${escapeCSS(this.className)}-State`).length
    atIndex = atIndex >= 0 && atIndex < tabCount ? atIndex : tabCount

    const stateEl = document.createElement('input')
    stateEl.type = 'radio'
    stateEl.form = this.id+'-State'
    stateEl.name = this.id+'-State-Tab'
    stateEl.className = this.className+'-State'
    stateEl.id = this.id+'-State-'+id
    stateEl.value = id
    this.el.insertBefore(stateEl, this.el.children[atIndex])

    const tabEl = document.createElement('li')
    tabEl.className = this.className+'-Tab'
    tabEl.id = this.id+'-Tab-'+id
    tabEl.innerHTML = `<label for=${this.id+'-State-'+id}>${label}</label>`
    this.tabsEl.insertBefore(tabEl, this.tabsEl.children[atIndex])

    const cardEl = document.createElement('li')
    cardEl.className = this.className+'-Card'
    cardEl.id = this.id+'-Card-'+id
    this.cardsEl.insertBefore(cardEl, this.cardsEl.children[atIndex])
    cardEl.appendChild(content)
  },

  remove(id) {
    this.el.querySelector(`#${escapeCSS(this.id)}-State-${escapeCSS(id)}`).remove()
    this.el.querySelector(`#${escapeCSS(this.id)}-Tab-${escapeCSS(id)}`).remove()
    this.el.querySelector(`#${escapeCSS(this.id)}-Card-${escapeCSS(id)}`).remove()
  },

  clear() {
    for (const stateEl of this.el.querySelectorAll(`.${escapeCSS(this.className)}-State`)) stateEl.remove()
    this.tabsEl.innerHTML = ''
    this.cardsEl.innerHTML = ''
  }
}

export default Tabs