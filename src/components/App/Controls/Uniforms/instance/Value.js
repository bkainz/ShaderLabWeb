import escapeCSS from '../../../../../componentHelpers/escapeCSS'

let instanceId = 0

function Value(app, uniformName, name, type, programmedMesh) {
  this.app = app
  this._name = name
  this.type = type
  this.programmedMesh = programmedMesh
  this.uniformName = uniformName

  this.className = app.className+'/Controls/Uniforms/instance/Value'
  this.id = `${this.className}#${instanceId += 1}`

  this.el = document.createElement('div')
  this.el.classList.add(this.className)
  this.el.id = this.id
  this.el.innerHTML = `
    <input type="checkbox" form="${this.id}-Form" id="${this.id}-State" class="${this.className}-State">
    <label for="${this.id}-State" class="${this.className}-Header">${this.name}</label>
    <div class="${this.className}-Body">
      <div class="${this.className}-Attachment"></div>
      <div class="${this.className}-Value"></div>
    </div>
  `.trim().replace(/\n {4}/g, '\n')
  this.stateEl = this.el.querySelector(`.${escapeCSS(this.className)}-State`)
  this.headerEl = this.el.querySelector(`.${escapeCSS(this.className)}-Header`)
  this.attachmentEl = this.el.querySelector(`.${escapeCSS(this.className)}-Attachment`)
  this.valueEl = this.el.querySelector(`.${escapeCSS(this.className)}-Value`)

  const typeSignature = this.type.signature || this.type
  const updateAttachmentList = attachments => {
    this.attachmentEl.classList[Object.keys(attachments).length ? 'remove' : 'add']('none')
    this.attachmentEl.innerHTML = Object.keys(attachments).length ? `
      attach to: <select class="${this.className}-AttachmentInput">
        <option value="">None</option>
        ${Object.keys(attachments).sort((a, b) => a.localeCompare(b, 'en', {sensitivity: 'base', numeric: true}))
                .map(name => `<option class="${this.className}-AttachmentOption" value="${name}">${name}</option>`).join('\n')}
      </select>`.trim() : `
      <input type="hidden" value="" class="${this.className}-AttachmentInput">`.trim()
    this.attachmentInputEl = this.attachmentEl.querySelector(`.${escapeCSS(this.className)}-AttachmentInput`)
    this.attachmentInputEl.addEventListener('change', e => this.attachment = this.attachmentInputEl.value)

    for (const name in this.attachmentListeners)
      for (const event in this.attachmentListeners[name])
        this.app.values[typeSignature][name].el.removeEventListener(event, this.attachmentListeners[name][event])

    this.attachmentListeners = {}

    Object.keys(attachments).forEach(name => {
      this.attachmentListeners[name] = {
        nameChanged: ({detail: newName}) => {
          const optionEl = this.attachmentEl.querySelector(`.${escapeCSS(this.className)}-AttachmentOption[value="${name}"]`)
          optionEl.value = newName
          optionEl.innerText = newName
          this.attachmentListeners[newName] = this.attachmentListeners[name]
          delete this.attachmentListeners[name]
          if (this.attachment === name) this._attachment = newName
          name = newName
        },

        removed: e => {
          this.attachmentEl.querySelector(`.${escapeCSS(this.className)}-AttachmentOption[value="${name}"]`).remove()
          for (const event in this.attachmentListeners[name])
            this.app.values[typeSignature][name].el.removeEventListener(event, this.attachmentListeners[name][event])
          delete this.attachmentListeners[name]
          if (this.attachment === name) {
            this.app.values[typeSignature][this.attachment].el.removeEventListener('valueChanged', this._attachmentChangeListener)
            this._attachment = ''
          }
        }
      }

      for (const event in this.attachmentListeners[name])
        this.app.values[typeSignature][name].el.addEventListener(event, this.attachmentListeners[name][event])
    })
  }
  this.app.onExpandedValueTypeList(typeSignature, attachments => {
    updateAttachmentList(attachments)
    this.attachmentInputEl.value = this.attachment
  })
  updateAttachmentList(this.app.values[typeSignature] || {})

  this._attachmentChangeListener = ({detail: value}) => this.value = value
  this.el.addEventListener('attachmentChanged', ({detail: attachment}) => this.attachmentInputEl.value = attachment)
  this.attachment = this.attachmentInputEl.value
}

Value.prototype = {
  get attachment() {
    return this._attachment
  },
  set attachment(attachment) {
    const attachments = this.app.values[this.type.signature || this.type]
    const attachmentMigrations = this.app.valueMigrations[this.type.signature || this.type]
    attachment = attachmentMigrations && attachmentMigrations[attachment] || attachment

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

  get name() {
    return this._name
  },

  set name(name) {
    this._name = name
    this.headerEl.innerText = name
  },

  get value() {
    return this._value
  },
  set value(value) {
    this._value = value
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: value}))
    this.app.announceStateChange()
    this.programmedMesh.updateUniform(this.type, this.uniformName, value)
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
  },

  destroy() {
    this.el.remove()

    const typeSignature = this.type.signature || this.type

    for (const name in this.attachmentListeners)
      for (const event in this.attachmentListeners[name])
        this.app.values[typeSignature][name].el.removeEventListener(event, this.attachmentListeners[name][event])

    this.attachmentListeners = {}

    if (this.attachment)
      this.app.values[typeSignature][this.attachment].el.removeEventListener('valueChanged', this._attachmentChangeListener)
  }
}

export default Value