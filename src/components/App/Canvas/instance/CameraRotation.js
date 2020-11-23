import camera from '../../../../helpers/camera'
import algebra from '../../../../helpers/algebra'
const {minus, plus, dot, cross, R, Mv} = algebra

const EVENTS = {
  start: ['mousedown'],
  update: ['mousemove'],
  end: ['mouseup', 'mouseleave']
}

function CameraRotation(canvas) {
  this.canvas = canvas

  this.start = CameraRotation.prototype.start.bind(this)
  this.update = CameraRotation.prototype.update.bind(this)
  this.end = CameraRotation.prototype.end.bind(this)

  EVENTS.start.forEach(event => this.canvas.el.addEventListener(event, this.start))

  this.radius = Math.min(this.canvas.el.clientWidth, this.canvas.el.clientHeight, 500)
  this.event = null
  this.startPosition = null
  this.startTarget = null
}

CameraRotation.prototype = {
  start(event) {
    if (event.button !== 0) return
    event.preventDefault()

    EVENTS.update.forEach(event => this.canvas.el.addEventListener(event, this.update))
    EVENTS.end.forEach(event => this.canvas.el.addEventListener(event, this.end))
    this.event = event
    this.startPosition = this.canvas.app.values.vec3['Camera Position'].value
    this.startTarget = this.canvas.app.values.vec3['Camera Target'].value
  },

  update(event) {
    event.preventDefault()

    const dx = +(event.clientX - this.event.clientX)
    const dy = -(event.clientY - this.event.clientY) // origin of html at top left, origin of webl at bottom left

    let targetToPosition = minus(this.startPosition, this.startTarget)
    if (dx || dy) {
      const phi = dx/this.radius * Math.PI
      const theta = dy/this.radius * Math.PI

      const startV = [0, 0, 1]
      const endV = [Math.sin(phi),
                    Math.sin(theta),
                    Math.cos(theta)*Math.cos(phi)]

      const axis = cross(startV, endV)
      const angle = Math.acos(dot(startV, endV)) * 180/Math.PI
      const cameraTransform = camera.camera(this.startPosition, this.startTarget, [0, 1, 0])
      const rotationMatrix = R(-angle, Mv(cameraTransform, axis))
      targetToPosition = Mv(rotationMatrix, targetToPosition)
    }

    this.canvas.app.values.vec3['Camera Position'].value = plus(this.startTarget, targetToPosition)
  },

  end(event) {
    event.preventDefault()

    EVENTS.update.forEach(event => this.canvas.el.removeEventListener(event, this.update))
    EVENTS.end.forEach(event => this.canvas.el.removeEventListener(event, this.end))
  }
}

export default CameraRotation