import escapeCSS from '../../../../componentHelpers/escapeCSS'

function Tabs(el, {className}) {
  this.el = el
  this.className = className
}

Tabs.prototype = {
  focus(id) {
    const selector = typeof id === 'number' ? `:nth-child(${id+1})` : `[value="${id}"]`
    this.el.querySelector(`.${escapeCSS(this.className)}-State${selector}`).checked = true
  }
}

export default Tabs