import Scene from './classes/Scene'

function Canvas(el, {props}) {
  this.el = el
  this.props = props
  this.app = el.closest('.App').__component__
  this.app.canvas = this
  this.scene = new Scene(el.getContext('webgl'), props.passes)
}

Canvas.prototype = {
  async initialize() {
    const pass = this.scene.passByKey.base
    for (const bufferKey in pass.attachments) {
      this.app.registerValue(pass.name+' '+bufferKey, 'sampler2D')
      this.app.values.sampler2D[pass.name+' '+bufferKey].value = pass.attachments[bufferKey]
    }

    this.scene.passes.forEach(async pass => {
      const geometry = await this.app.scene.geometry.load(this.props.passes[pass.key].geometry)
      this.app.el.dispatchEvent(new CustomEvent('geometryChanged', {detail: {pass: pass.key, geometry}}))
    })
    this.scene.outputPass.updateGeometry(await this.app.scene.geometry.load('quad'))

    pass.config.depthTest = this.app.values.config['Depth Test'].value
    this.app.values.config['Depth Test'].el.addEventListener('valueChanged', ({detail: depthTest}) => {
      pass.config.depthTest = depthTest
    })

    pass.config.faceCull = this.app.values.config['Face Culling'].value
    this.app.values.config['Face Culling'].el.addEventListener('valueChanged', ({detail: faceCull}) => {
      pass.config.faceCull = faceCull
    })

    pass.config.frontFace = this.app.values.config['Front Face'].value
    this.app.values.config['Front Face'].el.addEventListener('valueChanged', ({detail: frontFace}) => {
      pass.config.frontFace = frontFace
    })
  },

  get size() {
    return {width: this.el.offsetWidth, height: this.el.offsetHeight}
  },

  updateShaders(shaders) {
    this.app.log.append('<hr data-text="Compile & Link Shaders">', '')
    shaders.forEach(shader => {
      const scope = shader.name
      const message = this.scene.passByKey[shader.pass].updateShader(shader)
      this.app.log.append(scope, message)
    })
    for (const passKey in this.scene.passByKey) {
      const scope = this.scene.passByKey[passKey].name
      const message = this.scene.passByKey[passKey].relink()
      this.app.log.append(scope, message)
    }
  },

  updateUniform(uniform) {
    for (const passKey in uniform.passes) {
      this.scene.passByKey[passKey].updateUniform(uniform.type, uniform.name, uniform.value)
    }
  },

  updateTextureUnits(pass, textureUnits) {
    this.scene.passByKey[pass].updateTextureUnits(textureUnits)
  },

  updateGeometry(pass, geometry) {
    const scope = `<hr data-text="Load ${this.scene.passByKey[pass].name} Geometry">`
    const message = geometry.path.split('/').pop()
    this.app.log.append(scope, message)
    this.scene.passByKey[pass].updateGeometry(geometry)
  },

  updateViewport(width, height) {
    this.el.width = width
    this.el.height = height
    this.scene.updateViewport(width, height)
  },

  render() {
    this.scene.draw()
  }
}

export default Canvas