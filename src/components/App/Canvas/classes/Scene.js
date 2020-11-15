import Pass from './Pass'
import geometryHelper from '../../../../helpers/geometry'

function Scene(canvas, passes) {
  this.canvas = canvas
  this.webGL = canvas.el.getContext('webgl')
  this.passByKey = {}
  for (const passKey in passes) this.passByKey[passKey] = new Pass(this, passKey, passes[passKey])
  this.passes = Object.values(this.passByKey)

  this.outputPass = new Pass(this, '__output__', {name: 'Output Pass'}, true)
  this.outputPass.updateShader({type: 'vertex', isLinked: true, source: `
attribute vec3 vertex_worldSpace;
attribute vec2 textureCoordinate_input;
varying vec2 uvs;

void main() {
  gl_Position = vec4(vertex_worldSpace, 1.0);
  uvs = textureCoordinate_input;
}`})
  this.outputPass.updateShader({type: 'fragment', isLinked: true, source: `
precision mediump float;
uniform sampler2D image;
varying vec2 uvs;

void main() {
  gl_FragColor = texture2D(image, uvs.st);
}`})
  this.outputPass.relink()
  this.outputPass.updateUniform('sampler2D', 'image', this.passes[this.passes.length-1].attachments.color)
  this.outputPass.updateGeometry(geometryHelper.quad)
}

Scene.prototype = {
  updateViewport(width, height) {
    this.webGL.viewport(0, 0, width, height)
    this.passes.forEach(pass => pass.updateViewport(width, height))
  },
  draw() {
    this.passes.forEach(pass => pass.draw())
    this.outputPass.draw()
  }
}

export default Scene