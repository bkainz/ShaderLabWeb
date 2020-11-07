import escapeCSS from '../../../../../helpers/escapeCSS'
import algebra from '../../../../../helpers/algebra'

const {I, minus, normalize, cross} = algebra

function perspectiveProjection(fov, aspect, near, far) {
  const rad = fov * Math.PI/180
  const tan = Math.tan(Math.PI/2 - rad/2)
  const depth = far - near
  return [tan/aspect,   0,                 0,  0,
                   0, tan,                 0,  0,
                   0,   0, -(near+far)/depth, -1,
                   0,   0, -2*near*far/depth,  0]
}

function orthographicProjection(fov, aspect, near, far) {
  const width = fov*aspect
  const height = fov
  const depth = far - near
  return [2/width,        0,         0, 0,
                0, 2/height,         0, 0,
                0,         0, -2/depth, 0,
                0,         0,        0, 1]
}

function camera(from, to, up) {
  const ez = normalize(minus(from, to))
  const ex = normalize(cross(up, ez))
  const ey = cross(ez, ex)

  return [...ex, 0,
          ...ey, 0,
          ...ez, 0,
          ...from, 1]
}

function Camera(el, {className}) {
  this.el = el
  this.className = className
  this.app = el.closest('.App').__component__
  this.app.scene.camera = this

  this.positionEls = [this.el.querySelector(`.${escapeCSS(className)}-FieldInput.position\\.x`),
                      this.el.querySelector(`.${escapeCSS(className)}-FieldInput.position\\.y`),
                      this.el.querySelector(`.${escapeCSS(className)}-FieldInput.position\\.z`)]
  this.targetEls = [this.el.querySelector(`.${escapeCSS(className)}-FieldInput.target\\.x`),
                    this.el.querySelector(`.${escapeCSS(className)}-FieldInput.target\\.y`),
                    this.el.querySelector(`.${escapeCSS(className)}-FieldInput.target\\.z`)]
  this.nearClippingEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.near-clipping`)
  this.farClippingEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.far-clipping`)
  this.projectionEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.projection`)
  this.perspectiveFovEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.perspective-fov`)
  this.orthographicFovEl = this.el.querySelector(`.${escapeCSS(className)}-FieldInput.orthographic-fov`)
}

Camera.prototype = {
  initialize() {
    this.app.registerValue('Canvas Width', 'float')
    this.app.registerValue('Canvas Height', 'float')
    this.app.registerValue('Camera Position', 'vec3')
    this.app.registerValue('Camera Target', 'vec3')
    this.app.registerValue('Near Clipping Plane', 'float')
    this.app.registerValue('Far Clipping Plane', 'float')
    this.app.registerValue('Perspective Projection?', 'bool')
    this.app.registerValue('Orthographic Projection?', 'bool')
    this.app.registerValue('Perspective FOV', 'float')
    this.app.registerValue('Orthographic FOV', 'float')
    this.app.registerValue('View Matrix', 'mat4')
    this.app.registerValue('Projection Matrix', 'mat4')

    this.projection = this.projectionEl.value
    this.position = this.positionEls.map(el => el.value)
    this.target = this.targetEls.map(el => el.value)
    this.nearClipping = this.nearClippingEl.value
    this.farClipping = this.farClippingEl.value
    this.perspectiveFov = this.perspectiveFovEl.value
    this.orthographicFov = this.orthographicFovEl.value

    this.app.el.addEventListener('viewportChanged', ({detail: {width, height}}) => {
      this.width = width
      this.height = height
    })
    this.positionEls.map(el => el.addEventListener('input', e => this.position = this.positionEls.map(el => el.value)))
    this.targetEls.map(el => el.addEventListener('input', e => this.target = this.targetEls.map(el => el.value)))
    this.nearClippingEl.addEventListener('input', e => this.nearClipping = this.nearClippingEl.value)
    this.farClippingEl.addEventListener('input', e => this.farClipping = this.farClippingEl.value)
    this.projectionEl.addEventListener('change', e => this.projection = this.projectionEl.value)
    this.perspectiveFovEl.addEventListener('input', e => this.perspectiveFov = this.perspectiveFovEl.value)
    this.orthographicFovEl.addEventListener('input', e => this.orthographicFov = this.orthographicFovEl.value)

    const updateViewMatrix = () => {
      this.app.values.mat4['View Matrix'].value = I(camera(this.position, this.target, [0, 1, 0]))
    }
    this.app.values.vec3['Camera Position'].el.addEventListener('valueChanged', updateViewMatrix)
    this.app.values.vec3['Camera Target'].el.addEventListener('valueChanged', updateViewMatrix)
    updateViewMatrix()

    const updateProjectionMatrix = () => {
      const pMatrix = this.projection === 'Perspective' ? perspectiveProjection(this.perspectiveFov, this.width/this.height, this.nearClipping, this.farClipping)
                                                        : orthographicProjection(this.orthographicFov, this.width/this.height, this.nearClipping, this.farClipping)
      this.app.values.mat4['Projection Matrix'].value = pMatrix
    }
    this.app.values.float['Canvas Width'].el.addEventListener('valueChanged', updateProjectionMatrix)
    this.app.values.float['Canvas Height'].el.addEventListener('valueChanged', updateProjectionMatrix)
    this.app.values.float['Near Clipping Plane'].el.addEventListener('valueChanged', updateProjectionMatrix)
    this.app.values.float['Far Clipping Plane'].el.addEventListener('valueChanged', updateProjectionMatrix)
    this.app.values.float['Perspective FOV'].el.addEventListener('valueChanged', updateProjectionMatrix)
    this.app.values.float['Orthographic FOV'].el.addEventListener('valueChanged', updateProjectionMatrix)
    updateProjectionMatrix()
  },

  get position() {
    return this.app.values.vec3['Camera Position'].value
  },

  set position(position) {
    this.app.values.vec3['Camera Position'].value = position.map(value => Number(value))
  },

  get target() {
    return this.app.values.vec3['Camera Target'].value
  },

  set target(target) {
    this.app.values.vec3['Camera Target'].value = target.map(value => Number(value))
  },

  get width() {
    return this.app.values.float['Canvas Width'].value
  },

  set width(width) {
    this.app.values.float['Canvas Width'].value = Number(width)
  },

  get height() {
    return this.app.values.float['Canvas Height'].value
  },

  set height(height) {
    this.app.values.float['Canvas Height'].value = Number(height)
  },

  get nearClipping() {
    return this.app.values.float['Near Clipping Plane'].value
  },

  set nearClipping(nearClipping) {
    this.app.values.float['Near Clipping Plane'].value = Number(nearClipping)
  },

  get farClipping() {
    return this.app.values.float['Far Clipping Plane'].value
  },

  set farClipping(farClipping) {
    this.app.values.float['Far Clipping Plane'].value = Number(farClipping)
  },

  get projection() {
    return this.app.values.bool['Perspective Projection?'].value  ? 'Perspective'
         : this.app.values.bool['Orthographic Projection?'].value ? 'Orthographic'
         :                                                          null
  },

  set projection(projection) {
    this.app.values.bool['Perspective Projection?'].value = projection === 'Perspective'
    this.app.values.bool['Orthographic Projection?'].value = projection === 'Orthographic'
    this.el.querySelector(`.${escapeCSS(this.className)}-Field.perspective-fov`).style.display = projection === 'Perspective' ? '' : 'none'
    this.el.querySelector(`.${escapeCSS(this.className)}-Field.orthographic-fov`).style.display = projection === 'Orthographic' ? '' : 'none'
    this.width = this.width // just to update projection matrix
  },

  get perspectiveFov() {
    return this.app.values.float['Perspective FOV'].value
  },

  set perspectiveFov(perspectiveFov) {
    this.app.values.float['Perspective FOV'].value = Number(perspectiveFov)
  },

  get orthographicFov() {
    return this.app.values.float['Orthographic FOV'].value
  },

  set orthographicFov(orthographicFov) {
    this.app.values.float['Orthographic FOV'].value = Number(orthographicFov)
  }
}

export default Camera