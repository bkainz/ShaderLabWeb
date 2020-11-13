import Value from './Value'
import ImageUpload from './SamplerValue/ImageUpload'

function SamplerValue(app, uniformName, name, type, defaultAttachment, pass) {
  Value.call(this, app, uniformName, name, type, defaultAttachment, pass)

  this.imagesEl = document.createElement('div')
  this.imagesEl.classList.add(this.className+'-SamplerImages')
  this.valueEl.appendChild(this.imagesEl)

  this.images = {...SamplerValue.DEFAULT_VALUES[type]}
  for (const target in this.images) {
    const imageEl = document.createElement('div')
    imageEl.classList.add(this.className+'-SamplerImage', target)
    this.imagesEl.appendChild(imageEl)

    const image = new ImageUpload(this, target)
    image.el.addEventListener('valueChanged', ({detail: imageValue}) => {
      const value = this.value
      value[target] = imageValue
      this.value = value
    })
    imageEl.appendChild(image.el)

    this.images[target] = image
  }

  this.el.addEventListener('attachmentChanged', async ({detail: attachment}) => {
    this.imagesEl.style.display = attachment ? 'none' : ''

    if (attachment) {
      this.value = this.app.values[this.type][attachment].value
    } else {
      const value = {}
      await Promise.all(Object.keys(this.images).map(async target => value[target] = await this.images[target].value))
      this.value = value
    }
  })
  this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: this.attachment}))
}
SamplerValue.prototype = Object.create(Value.prototype, Object.getOwnPropertyDescriptors({
  constructor: SamplerValue
}))

SamplerValue.DEFAULT_VALUES = {
  sampler2D: {TEXTURE_2D: null},
  samplerCube: {TEXTURE_CUBE_MAP_POSITIVE_X: null,
                TEXTURE_CUBE_MAP_NEGATIVE_X: null,
                TEXTURE_CUBE_MAP_POSITIVE_Y: null,
                TEXTURE_CUBE_MAP_NEGATIVE_Y: null,
                TEXTURE_CUBE_MAP_POSITIVE_Z: null,
                TEXTURE_CUBE_MAP_NEGATIVE_Z: null}
}

export default SamplerValue