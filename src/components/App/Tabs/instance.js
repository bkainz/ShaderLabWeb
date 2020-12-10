import escapeCSS from '../../../helpers/escapeCSS'

function Tabs(el, {className}) {
  this.el = el
  this.className = className
}

Tabs.prototype = {
  focus(tab) {
    this.el.querySelector(`.${escapeCSS(this.className)}-State[value='${tab}']`).checked = true
  }
}

export default Tabs