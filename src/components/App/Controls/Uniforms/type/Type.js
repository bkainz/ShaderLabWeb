import escapeCSS from '../../../../../helpers/escapeCSS'

function Type(uniforms, name, type, defaultAttachment) {
  this.uniforms = uniforms
  this.name = name
  this.type = type
  this.passes = {}
  this.id = uniforms.id+'-'+this.key
  this.className = uniforms.className+'/Uniform'

  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.innerHTML = `
<div class="${this.className+'-Name'}">${this.name}</div>
<div class="${this.className+'-Value'}"></div>
`.trim()
  this.nameEl = this.el.querySelector(`.${escapeCSS(this.className)}-Name`)
  this.valueEl = this.el.querySelector(`.${escapeCSS(this.className)}-Value`)

  const attachments = uniforms.app.values[type] || {}
  this.valueEl.innerHTML = Object.keys(attachments).length ? `
attach to: <select name="${this.id}-Attachment" class="${this.className}-Attachment">
  <option value="">None</option>${Object.keys(attachments).map(name => `
  <option value="${name}"${name === defaultAttachment ? ' selected' : ''}>${name}</option>`).join('')}
</select>`.trim() : `
<input type="hidden" name="${this.id}-Attachment" value="" class="${this.className}-Attachment">`.trim()

  this._attachmentChangeListener = (({detail: value}) => this.value = value)
  this.attachmentEl = this.el.querySelector(`.${escapeCSS(this.className)}-Attachment`)
  this.attachmentEl.addEventListener('change', e => this.attachment = this.attachmentEl.value)
  this.el.addEventListener('attachmentChanged', ({detail: attachment}) => this.attachmentEl.value = attachment)
  this.attachment = this.attachmentEl.value
}

Type.prototype = {
  get key() {
    return this.name+'-'+this.type
  },

  get attachment() {
    return this._attachment
  },
  set attachment(attachment) {
    const attachments = this.uniforms.app.values[this.type]

    if (this._attachment) attachments[this._attachment].el.removeEventListener('valueChanged', this._attachmentChangeListener)
    this._attachment = attachment
    if (this._attachment) attachments[this._attachment].el.addEventListener('valueChanged', this._attachmentChangeListener)

    this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: attachment}))

    const defaultValue = this.constructor.DEFAULT_VALUES[this.type]
    this.value = attachment ? attachments[attachment].value
               : this.value ? this.value
               :              Array.isArray(defaultValue) ? [...defaultValue]
                                                          : {...defaultValue}
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))

    const detail = {name: this.name, type: this.type, value, passes: this.passes}
    this.uniforms.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  }
}

export default Type