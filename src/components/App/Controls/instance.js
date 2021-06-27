import escapeCSS from '../../../componentHelpers/escapeCSS'

function Controls(el, {id, className, ancestors}) {
  this.el = el
  this.id = id
  this.className = className
  this.app = ancestors.find(ancestor => ancestor.className === 'components/App')
  this.app.controls = this
}

Controls.prototype = {
  get tabs() {
    return this.el.firstElementChild.__component__
  },

  initialize() {
    const downloadEl = document.createElement('a')
    downloadEl.download = 'shaderlab.json'
    downloadEl.style.display = 'none'
    this.el.appendChild(downloadEl)

    const saveButtonEl = this.el.querySelector(`#${escapeCSS(this.id)}-SaveButton`)
    saveButtonEl.addEventListener('click', e => {
      const file = new Blob([JSON.stringify(this.app.state)], {type: 'text/json'})
      downloadEl.href = URL.createObjectURL(file)
      downloadEl.click()
      URL.revokeObjectURL(downloadEl.href)
    })

    const uploadEl = document.createElement('input')
    uploadEl.type = 'file'
    uploadEl.accept = 'text/json'
    uploadEl.style.display = 'none'
    uploadEl.addEventListener('change', e => {
      const reader = new FileReader()
      reader.readAsText(uploadEl.files[0])
      reader.onloadend = () => this.app.state = JSON.parse(reader.result)
    })
    this.el.appendChild(uploadEl)

    const loadButtonEl = this.el.querySelector(`#${escapeCSS(this.id)}-LoadButton`)
    loadButtonEl.addEventListener('click', e => uploadEl.click())
  }
}

export default Controls