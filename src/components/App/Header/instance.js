import escapeCSS from '../../../helpers/escapeCSS'

function Header(el, {className, id}) {
  this.el = el
  this.className = className
  this.id = id
  this.app = el.closest('.components\\/App').__component__
  this.app.header = this
  this.saveButtonEl = this.el.querySelector(`#${escapeCSS(this.id)}-SaveButton`)
  this.loadButtonEl = this.el.querySelector(`#${escapeCSS(this.id)}-LoadButton`)

  this.downloadEl = document.createElement('a')
  this.downloadEl.download = 'shaderlab.json'
  this.downloadEl.style.display = 'none'
  this.el.appendChild(this.downloadEl)

  this.uploadEl = document.createElement('input')
  this.uploadEl.type = 'file'
  this.uploadEl.accept = 'text/json'
  this.uploadEl.style.display = 'none'
  this.el.appendChild(this.uploadEl)
}

Header.prototype = {
  initialize() {
    this.saveButtonEl.addEventListener('click', e => {
      const file = new Blob([JSON.stringify(this.app.state)], {type: 'text/json'})
      this.downloadEl.href = URL.createObjectURL(file)
      this.downloadEl.click()
      URL.revokeObjectURL(this.downloadEl.href)
    })

    this.loadButtonEl.addEventListener('click', e => this.uploadEl.click())

    this.uploadEl.addEventListener('change', e => {
      const reader = new FileReader()
      reader.readAsText(this.uploadEl.files[0])
      reader.onloadend = () => this.app.state = JSON.parse(reader.result)
    })
  }
}

export default Header