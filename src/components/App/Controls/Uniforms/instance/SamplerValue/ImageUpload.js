import escapeCSS from '../../../../../../helpers/escapeCSS'

function ImageUpload(samplerValue, target) {
  this.className = samplerValue.className+'/ImageUpload'
  this.el = document.createElement('div')
  this.el.classList.add(this.className, target)
  this.el.innerHTML = `
<label class="${this.className}-Browse">
  <input type="file" class="${this.className}-File">
  <img src="" class="${this.className}-Preview">
</label>
`.trim()
  this.fileEl = this.el.querySelector(`.${escapeCSS(this.className)}-File`)
  const previewEl = this.el.querySelector(`.${escapeCSS(this.className)}-Preview`)

  this.fileEl.addEventListener('change', async e => {
    URL.revokeObjectURL(previewEl.src)
    previewEl.src = URL.createObjectURL(this.file)
    this.el.dispatchEvent(new CustomEvent('valueChanged', {detail: await this.value}))
  })
}
ImageUpload.prototype = {
  get file() {
    return this.fileEl.files[0]
  },
  get value() {
    if (!this.file) return null
    const image = new Image()
    const loader = new Promise(resolve => {
      image.onload = function() {
        URL.revokeObjectURL(image.src)
        resolve(image)
      }
    })
    image.src = URL.createObjectURL(this.file)
    return loader
  }
}

export default ImageUpload