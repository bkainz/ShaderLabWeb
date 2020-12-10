import Value from './Value'
import ImageUpload from './SamplerValue/ImageUpload'

function SamplerValue(app, uniformName, name, type, pass) {
  Value.call(this, app, uniformName, name, type, pass)

  this.imagesEl = document.createElement('div')
  this.imagesEl.classList.add(this.className+'-SamplerImages')
  this.valueEl.appendChild(this.imagesEl)

  this.images = {...SamplerValue.DEFAULT_VALUES[type]}
  for (const target in this.images) {
    const imageEl = document.createElement('div')
    imageEl.classList.add(this.className+'-SamplerImage', target)
    this.imagesEl.appendChild(imageEl)

    const image = new ImageUpload(this, target)
    image.el.addEventListener('imageChanged', ({detail: imageValue}) => {
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
      this.value = this.app.getValue(this.type, attachment)
    } else {
      const value = {}
      await Promise.all(Object.keys(this.images).map(async target => {
        const image = await this.images[target].imageEl
        value[target] = image.getAttribute('src') ? image : undefined
      }))
      this.value = value
    }
  })
}
SamplerValue.prototype = Object.create(Value.prototype, Object.getOwnPropertyDescriptors({
  constructor: SamplerValue,

  get state() {
    if (this.attachment) {
      return {attachment: this.attachment}
    }
    else {
      const value = {}
      for (const target in this.images) value[target] = this.images[target].url
      return {value}
    }
  },
  set state(state) {
    this.attachment = state.attachment || ''
    if (state.value !== undefined) for (const target in this.images) this.images[target].url = state.value[target]
  }
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