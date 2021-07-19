import escapeCSS from '../../../componentHelpers/escapeCSS'

export default class {
  constructor (el, {className, props}) {
    this.el = el
    this.className = className
    this.props = props
  }

  initialize() {
    const editFormEl = this.el.querySelector(`.${escapeCSS(this.className)}-EditForm`)
    const nameInputEl = this.el.querySelector(`.${escapeCSS(this.className)}-NameValue`)
    nameInputEl.addEventListener('change', e => {
      editFormEl.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
    })
    const projectEl = this.el.querySelector(`.${escapeCSS(this.className)}-Project`).lastElementChild
    projectEl.addEventListener('stateChanged', e => {
      editFormEl.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))
    })

    const deleteFormEl = this.el.querySelector(`.${escapeCSS(this.className)}-DeleteForm`)
    deleteFormEl && deleteFormEl.addEventListener('submit', e => confirm('Irrevocably delete?') || e.preventDefault())
  }
}