import escapeCSS from '../../../../../helpers/escapeCSS'

function Value(owner, name, type, defaultAttachment, passes) {
  this.app = owner.app
  this.owner = owner
  this.name = name
  this.type = type
  this.passes = passes

  const oun = owner.uniformName
  this.uniformName = /^\d+$/.test(name) ? `${oun ? owner.uniformName+'[' : ''}${name}${oun ? ']' : ''}`
                                        : `${oun ? owner.uniformName+'.' : ''}${name}`
  this.id = owner.id+'-'+name+'-'+type
  this.className = 'App/Controls/Uniforms/instance/Value'

  this.el = document.createElement('div')
  this.el.id = this.id
  this.el.classList.add(this.className)
  this.el.innerHTML = `
    <input type="checkbox" form="${this.className}#${this.id}" id="${this.className}#${this.id}" class="${this.className+'-State'}">
    <label for="${this.className}#${this.id}" class="${this.className+'-Header'}">${name}</label>
    <div class="${this.className+'-Value'}"></div>
  `.trim().replace(/\n {4}/g, '\n')
  this.headerEl = this.el.querySelector(`.${escapeCSS(this.className)}-Header`)
  this.valueEl = this.el.querySelector(`.${escapeCSS(this.className)}-Value`)

  const attachments = this.app.values[type] || {}
  this.valueEl.innerHTML = Object.keys(attachments).length ? `
attach to: <select name="${this.id}-Attachment" class="${this.className}-Attachment">
  <option value="">None</option>${Object.keys(attachments).map(name => `
  <option value="${name}"${name === defaultAttachment ? ' selected' : ''}>${name}</option>`).join('')}
</select>`.trim() : `
<input type="hidden" name="${this.id}-Attachment" value="" class="${this.className}-Attachment">`.trim()

  this._attachmentChangeListener = (({detail: value}) => {
    this.value = value
    this.el.dispatchEvent(new CustomEvent('valueChangedThroughAttachment', {detail: this.value}))
  })
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
    const attachments = this.app.values[this.type]

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

    const detail = {name: this.uniformName, type: this.type, value, passes: this.passes}
    this.app.el.dispatchEvent(new CustomEvent('uniformChanged', {detail}))
  },

  get state() {
    return {attachment: this.attachment, value: this.attachment ? this.value : undefined}
  },
  set state(state) {
    this.attachment = state.attachment
    if (state.value !== undefined) this.value = state.value
  },

  get uniforms() {
    return [{name: this.name, type: this.type, value: this.value}]
  }
}

export default Value