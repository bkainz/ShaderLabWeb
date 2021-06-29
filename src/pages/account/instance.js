import escapeCSS from '../../componentHelpers/escapeCSS'

export default class {
  constructor (el, {className, props}) {
    this.el = el
    this.className = className
    this.props = props
  }

  initialize() {
    const passwordInputEl = this.el.querySelector(`.${escapeCSS(this.className)}-Password`)
    this.el.querySelector(`.${escapeCSS(this.className)}-ShowPassword`).addEventListener('change', e => {
      passwordInputEl.type = e.target.checked ? 'text' : 'password'
    })
  }
}