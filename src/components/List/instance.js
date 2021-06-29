import escapeCSS from '../../componentHelpers/escapeCSS'

export default class {
  constructor(el, {className, id, props}) {
    this.el = el
    this.className = className
    this.id = id
    this.props = props
  }

  initialize() {
    const filtersFormEl = this.el.querySelector(`.${escapeCSS(this.className)}-Filters`)
    filtersFormEl && filtersFormEl.addEventListener('change', e => {
      filtersFormEl.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
    })
  }
}