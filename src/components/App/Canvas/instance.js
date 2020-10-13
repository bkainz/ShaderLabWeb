function createShader(webGL, type, source) {
  let shader = webGL.createShader(webGL[type.toUpperCase()+'_SHADER'])
  webGL.shaderSource(shader, source)
  webGL.compileShader(shader)
  const message = webGL.getShaderInfoLog(shader) || 'Compilation successful'
  if (!webGL.getShaderParameter(shader, webGL.COMPILE_STATUS)) {
    webGL.deleteShader(shader)
    shader = null
  }
  return {shader, message}
}

function Stage(webGL, key) {
  this.webGL = webGL
  this.name = key[0].toUpperCase()+key.slice(1)+' Stage'
  this.program = this.webGL.createProgram()
  this.shaders = {}
}

Stage.prototype = {
  updateShader({type, source, linked}) {
    this.shaders[type] && this.webGL.detachShader(this.program, this.shaders[type])
    this.shaders[type] && this.webGL.deleteShader(this.shaders[type])
    this.shaders[type] = null

    let message
    if (linked) {
      ({shader: this.shaders[type], message} = createShader(this.webGL, type, source))
      this.shaders[type] && this.webGL.attachShader(this.program, this.shaders[type])
    } else {
      message = 'not linked'
    }

    return message
  },
  relink() {
    this.webGL.linkProgram(this.program)
    return this.webGL.getProgramInfoLog(this.program) || 'Linking successful'
  }
}

function Scene(webGL, shaders) {
  this.webGL = webGL
  this.stages = shaders.reduce((stages, shader) => {
                  stages[shader.stage] = stages[shader.stage] || new Stage(webGL, shader.stage)
                  stages[shader.stage].shaders[shader.type] = null
                  return stages
                }, {})
}

module.exports = function(el, {props}) {
  const appEl = el.closest('.App')
  const scene = new Scene(el.getContext('webgl'), props.shaders)

  appEl.addEventListener('shadersChanged', ({detail}) => {
    appEl.dispatchEvent(new CustomEvent('log', {detail: {scope: '<hr data-text="Compile & Link Shaders">', message: ''}}))
    detail.forEach(shader => {
      const message = scene.stages[shader.stage].updateShader(shader)
      const scope = shader.name
      appEl.dispatchEvent(new CustomEvent('log', {detail: {scope, message}}))
    })
    for (const stageKey in scene.stages) {
      const message = scene.stages[stageKey].relink()
      const scope = scene.stages[stageKey].name
      appEl.dispatchEvent(new CustomEvent('log', {detail: {scope, message}}))
    }
  })
}