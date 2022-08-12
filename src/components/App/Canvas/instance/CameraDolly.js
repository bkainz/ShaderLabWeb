import algebra from '../../../../componentHelpers/algebra'
const {minus, plus, times} = algebra

function CameraDolly(canvas) {
  this.canvas = canvas
  this.update = CameraDolly.prototype.update.bind(this)
  this.canvas.el.addEventListener('wheel', this.update)
}

CameraDolly.prototype = {
  update(event) {
    event.preventDefault()

    const startPosition = this.canvas.app.getValue('vec3', 'Camera Position')
    const target = this.canvas.app.getValue('vec3', 'Camera Target')
    const targetToPosition = minus(startPosition, target)
    const normalizationFactor = event.deltaMode == 0 ? 1000 : 30
    const dPosition = times(targetToPosition, event.deltaY / normalizationFactor)
    this.canvas.app.setValue('vec3', 'Camera Position', plus(target, plus(targetToPosition, dPosition)))
  }
}

export default CameraDolly