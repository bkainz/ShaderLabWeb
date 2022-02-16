import algebra from '../../../../componentHelpers/algebra'
const {minus, plus, length, cross, I, R, Mv} = algebra

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

    const target = this.canvas.app.getValue('vec3', 'Camera Target')
    const position = this.canvas.app.getValue('vec3', 'Camera Position')
    const fov = this.canvas.app.getValue('float', 'Perspective FOV')
    
    let targetToPosition = minus(position, target)
    if (dClientX || dClientY) {

      if (event.shiftKey) {
        // translate target
        const viewMatrix = this.canvas.app.getValue('mat4', 'View Matrix')
        const cameraMatrix = I(viewMatrix)

        lookOffsetLength = length(targetToPosition)

        // Code from: https://github.com/chrismile/sgl/blob/master/src/Utils/SciVis/Navigation/TurntableNavigator.cpp
        let wPixel = this.canvas.size.width
        let hPixel = this.canvas.size.height
        let fovy = fov
        let fovx = wPixel / hPixel * fovy
        let wWorld = 2.0 * lookOffsetLength * Math.tan(fovx * 0.5)
        let hWorld = 2.0 * lookOffsetLength * Math.tan(fovy * 0.5)
        let shiftX = dClientX / wPixel * wWorld
        let shiftY = -dClientY / hPixel * hWorld

        let vectorRight = [cameraMatrix[0], cameraMatrix[1], cameraMatrix[2]]
        let vectorUp = [cameraMatrix[4], cameraMatrix[5], cameraMatrix[6]]
        let shiftVector = plus(
          [vectorRight[0] * shiftX, vectorRight[1] * shiftX, vectorRight[2] * shiftX],
          [vectorUp[0] * shiftY, vectorUp[1] * shiftY, vectorUp[2] * shiftY])

        let newTarget = plus(target, shiftVector)
        let newPosition = plus(newTarget, targetToPosition)

        this.canvas.app.setValue('vec3', 'Camera Position', newPosition)
        this.canvas.app.setValue('vec3', 'Camera Target', newTarget)
      } else {
        // rotate around target
        // do not rotate beyond the poles
        const dThetaMin = -Math.atan2(length([targetToPosition[0], targetToPosition[2]]), targetToPosition[1])/Math.PI * 180
        const dThetaMax = 180+dThetaMin

        const dPhi = dClientX/this.radius * 180
        const dTheta = Math.max(dThetaMin+0.01, Math.min(dClientY/this.radius * 180, dThetaMax-0.01))

        const Rt = R(-dTheta, cross(targetToPosition, [0, 1, 0]))
        const Rp = R(-dPhi, [0, 1, 0])

        targetToPosition = Mv(Rp, Mv(Rt, targetToPosition))

        this.canvas.app.setValue('vec3', 'Camera Position', plus(target, targetToPosition))
      }
    }
},

  end(event) {
    event.preventDefault()

    EVENTS.update.forEach(event => this.canvas.el.removeEventListener(event, this.update))
    EVENTS.end.forEach(event => this.canvas.el.removeEventListener(event, this.end))
  }
}

export default CameraRotation