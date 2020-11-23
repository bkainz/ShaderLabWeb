import algebra from '../../../../helpers/algebra'
const {minus, plus, length, cross, R, Mv} = algebra

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
}

CameraRotation.prototype = {
  start(event) {
    if (event.button !== 0) return
    event.preventDefault()

    EVENTS.update.forEach(event => this.canvas.el.addEventListener(event, this.update))
    EVENTS.end.forEach(event => this.canvas.el.addEventListener(event, this.end))
    this.event = event
  },

  update(event) {
    event.preventDefault()

    const dClientX = +(event.clientX - this.event.clientX)
    const dClientY = -(event.clientY - this.event.clientY) // origin of html at top left, origin of webl at bottom left
    this.event = event

    const target = this.canvas.app.values.vec3['Camera Target'].value
    const position = this.canvas.app.values.vec3['Camera Position'].value

    let targetToPosition = minus(position, target)
    if (dClientX || dClientY) {
      // do not rotate beyond the poles
      const dThetaMin = -Math.atan2(length([targetToPosition[0], targetToPosition[2]]), targetToPosition[1])/Math.PI * 180
      const dThetaMax = 180+dThetaMin

      const dPhi = dClientX/this.radius * 180
      const dTheta = Math.max(dThetaMin+0.01, Math.min(dClientY/this.radius * 180, dThetaMax-0.01))

      const Rt = R(-dTheta, cross(targetToPosition, [0, 1, 0]))
      const Rp = R(-dPhi, [0, 1, 0])

      targetToPosition = Mv(Rp, Mv(Rt, targetToPosition))
    }

    this.canvas.app.values.vec3['Camera Position'].value = plus(target, targetToPosition)
  },

  end(event) {
    event.preventDefault()

    EVENTS.update.forEach(event => this.canvas.el.removeEventListener(event, this.update))
    EVENTS.end.forEach(event => this.canvas.el.removeEventListener(event, this.end))
  }
}

export default CameraRotation