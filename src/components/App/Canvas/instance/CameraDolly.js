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

    const startPosition = this.canvas.app.getValue('vec3', 'Camera Position')
    const startTarget = this.canvas.app.getValue('vec3', 'Camera Target')
    const targetToPosition = minus(startPosition, startTarget)
    const distance = times(normalize(targetToPosition), event.deltaY)
    this.canvas.app.setValue('vec3', 'Camera Position', plus(startTarget, plus(targetToPosition, distance)))
  }
}

export default CameraDolly