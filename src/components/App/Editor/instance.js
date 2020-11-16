function Editor(el, {props}) {
  this.el = el
  this.app = el.closest('.App').__component__
  this.app.editor = this
  this.props = props
  this.shaders = {} // Shaders register themselves in their constructor
}

Editor.prototype = {
  initialize() {
    this.el.addEventListener('submit', e => {this.updateShaders(); e.preventDefault()})
  },

  updateShaders() {
    Object.keys(this.shaders).forEach(pass => {
      const shaders = Object.values(this.shaders[pass]).map(shader => {
        return Object.assign(shader.state, {pass: shader.pass, type: shader.type, name: shader.name})
      })
      this.app.el.dispatchEvent(new CustomEvent('shadersChanged', {detail: {pass, shaders}}))
    })
  },

  get state() {
    const state = {}
    for (const pass in this.shaders) {
      state[pass] = {}
      for (const type in this.shaders[pass])
        state[pass][type] = this.shaders[pass][type].state
    }
    return state
  },

  set state(state) {
    for (const pass in this.shaders)
      for (const type in this.shaders[pass])
        this.shaders[pass][type].state = state[pass][type]
    this.updateShaders()
  }
}

export default Editor