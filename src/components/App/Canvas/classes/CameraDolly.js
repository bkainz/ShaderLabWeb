import algebra from '../../../../helpers/algebra'
const {minus, plus, times, normalize} = algebra

function CameraDolly(canvas) {
  this.canvas = canvas
  this.update = CameraDolly.prototype.update.bind(this)
  this.canvas.el.addEventListener('wheel', this.update)
}

CameraDolly.prototype = {
  update(event) {
    event.preventDefault()

    const startPosition = this.canvas.app.values.vec3['Camera Position'].value
    const startTarget = this.canvas.app.values.vec3['Camera Target'].value
    const targetToPosition = minus(startPosition, startTarget)
    const distance = times(normalize(targetToPosition), event.deltaY)
    this.canvas.app.values.vec3['Camera Position'].value = plus(startTarget, plus(targetToPosition, distance))
  }
}

export default CameraDolly