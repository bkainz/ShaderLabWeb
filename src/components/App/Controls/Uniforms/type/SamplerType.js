import Type from './Type'
import ImageUpload from './SamplerType/ImageUpload'

function SamplerType(uniforms, name, type, defaultAttachment) {
  Type.call(this, uniforms, name, type, defaultAttachment)
  this.className = uniforms.className+'/SamplerUniform'

  this.imagesEl = document.createElement('div')
  this.imagesEl.classList.add(this.className+'-Images')
  this.valueEl.appendChild(this.imagesEl)

  this.images = {...SamplerType.DEFAULT_VALUES[type]}
  for (const target in this.images) {
    const imageEl = document.createElement('div')
    imageEl.classList.add(this.className+'-Image', target)
    this.imagesEl.appendChild(imageEl)

    const image = new ImageUpload(uniforms.className, target)
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
      this.value = this.uniforms.app.values[this.type][attachment].value
    } else {
      const value = {}
      await Promise.all(Object.keys(this.images).map(async target => value[target] = await this.images[target].value))
      this.value = value
    }
  })
  this.el.dispatchEvent(new CustomEvent('attachmentChanged', {detail: this.attachment}))
}
SamplerType.prototype = Object.create(Type.prototype, Object.getOwnPropertyDescriptors({
  constructor: SamplerType
}))

SamplerType.DEFAULT_VALUES = {
  sampler2D: {TEXTURE_2D: null},
  samplerCube: {TEXTURE_CUBE_MAP_POSITIVE_X: null,
                TEXTURE_CUBE_MAP_NEGATIVE_X: null,
                TEXTURE_CUBE_MAP_POSITIVE_Y: null,
                TEXTURE_CUBE_MAP_NEGATIVE_Y: null,
                TEXTURE_CUBE_MAP_POSITIVE_Z: null,
                TEXTURE_CUBE_MAP_NEGATIVE_Z: null}
}

module.exports = SamplerType