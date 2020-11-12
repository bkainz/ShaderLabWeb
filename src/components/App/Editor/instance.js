function Editor(el, {props}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.editor = this
  this.props = props
  this.shaders = []
}

Editor.prototype = {
  initialize() {
    this.el.addEventListener('submit', e => {
      this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.shaders}))
      e.preventDefault()
    })
    this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: this.shaders}))
  }
}

export default Editor