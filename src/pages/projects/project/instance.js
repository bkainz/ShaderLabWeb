import escapeCSS from '../../../componentHelpers/escapeCSS'

export default class {
  constructor (el, {className, props}) {
    this.el = el
    this.className = className
    this.props = props
  }

  initialize() {
    if (this.props.session.fields.user.id === this.props.user.id) {
      const editFormEl = this.el.querySelector(`.${escapeCSS(this.className)}-EditForm`)
      this.el.querySelector(`.${escapeCSS(this.className)}-NameValue`).addEventListener('change', e => {
        editFormEl.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
      })
      this.el.querySelector(`.${escapeCSS(this.className)}-Project`).lastElementChild.addEventListener('stateChanged', e => {
        editFormEl.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
      })
    }

    const deleteFormEl = this.el.querySelector(`.${escapeCSS(this.className)}-DeleteForm`)
    deleteFormEl && deleteFormEl.addEventListener('submit', e => confirm('Irrevocably delete?') || e.preventDefault())
  }
}