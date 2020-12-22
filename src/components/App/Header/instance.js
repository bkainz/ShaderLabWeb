import escapeCSS from '../../../helpers/escapeCSS'

function Header(el, {className, id}) {
  this.el = el
  this.className = className
  this.id = id
  this.app = el.closest('.components\\/App').__component__
  this.app.header = this
}

Header.prototype = {
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

export default Header