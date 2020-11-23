import escapeCSS from '../../../../../helpers/escapeCSS'

let instanceId = 0

function Value(app, uniformName, name, type, pass) {
  this.app = app
  this.name = name
  this.type = type
  this.pass = pass
  this.uniformName = uniformName

  this.className = 'App/Controls/Uniforms/instance/Value'
  this.id = `${this.className}#${instanceId += 1}`

  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.id = this.id
  this.el.innerHTML = `
    <input type="checkbox" form="${this.id}-Form" id="${this.id}-State" class="${this.className}-State">
    <label for="${this.id}-State" class="${this.className}-Header">${name}</label>
    <div class="${this.className}-Value"></div>
  `.trim().replace(/\n {4}/g, '\n')
  this.stateEl = this.el.querySelector(`.${escapeCSS(this.className)}-State`)
  this.headerEl = this.el.querySelector(`.${escapeCSS(this.className)}-Header`)
  this.valueEl = this.el.querySelector(`.${escapeCSS(this.className)}-Value`)

  const attachments = this.app.values[type.signature || type] || {}
  this.valueEl.innerHTML = Object.keys(attachments).length ? `
attach to: <select name="${this.id}-Attachment" class="${this.className}-Attachment">
  <option value="">None</option>${Object.keys(attachments).map(name => `
  <option value="${name}">${name}</option>`).join('')}
</select>`.trim() : `
<input type="hidden" name="${this.id}-Attachment" value="" class="${this.className}-Attachment">`.trim()

  this._attachmentChangeListener = ({detail: value}) => this.value = value
  this.attachmentEl = this.el.querySelector(`.${escapeCSS(this.className)}-Attachment`)
  this.attachmentEl.addEventListener('change', e => this.attachment = this.attachmentEl.value)
  this.el.addEventListener('attachmentChanged', ({detail: attachment}) => this.attachmentEl.value = attachment)
  this.attachment = this.attachmentEl.value
}

Value.prototype = {
  get attachment() {
    return this._attachment
  },
  set attachment(attachment) {
    const attachments = this.app.values[this.type.signature || this.type]

    if (this._attachment) attachments[this._attachment].el.removeEventListener('valueChanged', this._attachmentChangeListener)
    this._attachment = attachment
    if (this._attachment) attachments[this._attachment].el.addEventListener('valueChanged', this._attachmentChangeListener)

    this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: attachment}))

    const defaultValue = this.constructor.DEFAULT_VALUES[this.type]
    this._attachmentChangeListener({detail: attachment ? attachments[attachment].value
                                          : this.value ? this.value
                                          :              Array.isArray(defaultValue) ? [...defaultValue]
                                                                                     : {...defaultValue}})
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))

    const detail = {pass: this.pass, uniform: {name: this.uniformName, type: this.type, value}}
    this.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  },

  get state() {
    return this.attachment ? {attachment: this.attachment} : {value: this.value}
  },
  set state(state) {
    this.attachment = state.attachment || ''
    if (state.value !== undefined) this.value = state.value
  },

  get uniforms() {
    return [{name: this.name, type: this.type, value: this.value}]
  }
}

export default Value