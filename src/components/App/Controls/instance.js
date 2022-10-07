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
    return this.el.querySelector(`.${escapeCSS(this.className)}-Tabs`).firstElementChild.__component__
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

    const jsonInput = this.el.querySelector(`.${escapeCSS(this.className)}-Input.load-json`)

    jsonInput.addEventListener('change', e => {
        const reader = new FileReader()
        reader.readAsText(jsonInput.files[0])
        reader.onloadend = () => this.app.state = JSON.parse(reader.result)
    })

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.load-json`).addEventListener('click', e => {
      jsonInput.click()
    })

    const zipInput = this.el.querySelector(`.${escapeCSS(this.className)}-Input.load-zip`)

    zipInput.addEventListener('change', e => {
      JSZip.loadAsync(zipInput.files[0])
        .then(zip => zip.file('state.json').async('text'))
        .then(json => this.app.state = JSON.parse(json))
    })
    

    this.el.querySelector(`.${escapeCSS(this.className)}-Button.load-zip`).addEventListener('click', e => {
      zipInput.click()
    })
  }
}

export default Controls