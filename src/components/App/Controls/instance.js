function Controls(el) {
  this.el = el
  this.app = el.closest('.components\\/App').__component__
  this.app.controls = this
}

Controls.prototype = {
  get tabs() {
    return this.el.firstElementChild.__component__
  }
}

export default Controls