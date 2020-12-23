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
  this.imageEl = this.el.querySelector(`.${escapeCSS(this.className)}-Preview`)
  this.imageEl.onload = () => this.el.dispatchEvent(new CustomEvent('imageChanged', {detail: this.imageEl}))

  this.fileEl.addEventListener('change', async e => {
    const reader = new FileReader()
    reader.readAsDataURL(this.fileEl.files[0])
    reader.onloadend = () => this.imageEl.src = reader.result
  })
}
ImageUpload.prototype = {
  get url() {
    return this.imageEl.src
  },
  set url(url) {
    this.imageEl.src = url
  }
}

export default ImageUpload