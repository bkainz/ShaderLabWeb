import escapeCSS from '../../../componentHelpers/escapeCSS'

window.requireAvailable(() => require(['/assets/jszip.min.js'], JSZip => window.JSZip = JSZip))

function Controls(el, {className, ancestors}) {
  this.el = el
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
    downloadEl.style.display = 'none'
    this.el.appendChild(downloadEl)

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.save-json`).addEventListener('click', e => {
      const file = new Blob([JSON.stringify(this.app.state)], {type: 'text/json'})
      downloadEl.download = 'shaderlab.json'
      downloadEl.href = URL.createObjectURL(file)
      downloadEl.click()
      URL.revokeObjectURL(downloadEl.href)
    })

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.save-zip`).addEventListener('click', e => {
      const zip = new JSZip()
      zip.file('state.json', JSON.stringify(this.app.state))
      zip.generateAsync({type: 'blob'}).then(file => {
        downloadEl.download = 'shaderlab.zip'
        downloadEl.href = URL.createObjectURL(file)
        downloadEl.click()
        URL.revokeObjectURL(downloadEl.href)
      })
    })

    let onUpload = e => {}
    const uploadEl = document.createElement('input')
    uploadEl.type = 'file'
    uploadEl.style.display = 'none'
    uploadEl.addEventListener('change', e => onUpload(e))
    this.el.appendChild(uploadEl)

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.load-json`).addEventListener('click', e => {
      onUpload = e => {
        const reader = new FileReader()
        reader.readAsText(uploadEl.files[0])
        reader.onloadend = () => this.app.state = JSON.parse(reader.result)
      }
      uploadEl.accept = 'text/json'
      uploadEl.click()
    })

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.load-zip`).addEventListener('click', e => {
      onUpload = e => {
        JSZip.loadAsync(uploadEl.files[0])
             .then(zip => zip.file('state.json').async('text'))
             .then(json => this.app.state = JSON.parse(json))
      }
      uploadEl.accept = 'application/zip'
      uploadEl.click()
    })
  }
}

export default Controls